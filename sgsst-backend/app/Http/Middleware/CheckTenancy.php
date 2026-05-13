<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckTenancy
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        \Log::info("CheckTenancy: Iniciando para " . $request->path());

        // 1. Omitir validación de tenancy en rutas de "descubrimiento" o creación
        // mi-empresa se identifica por query param ?tenant_id=...
        if (($request->is('api/empresas') && $request->isMethod('POST')) || $request->is('api/mi-empresa')) {
            \Log::info("CheckTenancy: Omitiendo para ruta de descubrimiento/creación: " . $request->path());
            return $next($request);
        }

        // Lookup de empresa por tenant_id durante el login (aún no hay X-Company-ID)
        if ($request->is('api/mi-empresa') && $request->isMethod('GET')) {
            return $next($request);
        }

        // Ver evidencia PDF — se abre en pestaña nueva (sin headers), el controller valida empresa_id por query param
        if ($request->is('api/evidencia/ver') && $request->isMethod('GET')) {
            return $next($request);
        }

        // Permitir OPTIONS (CORS preflight)
        if ($request->isMethod('OPTIONS')) {
            return $next($request);
        }

        $companyId = $request->header('X-Company-ID');
        \Log::info("CheckTenancy: X-Company-ID = " . ($companyId ?? 'null'));

        // 2. Bloquear si no hay ID de compañía
        if (!$companyId) {
            return response()->json([
                'error' => 'Falta el encabezado de contexto empresarial (X-Company-ID)',
                'code'  => 'MISSING_TENANT_ID'
            ], 403);
        }

        // 3. Verificar si la ruta provee el ID de la empresa en la URL (/api/empresas/{id}/algo)
        $routeEmpresaId = null;
        if ($request->segment(2) === 'empresas' && is_numeric($request->segment(3))) {
            $routeEmpresaId = $request->segment(3);
        }

        if ($routeEmpresaId && $routeEmpresaId != $companyId) {
            return response()->json([
                'error' => 'Invasión de Privacidad Detectada: Permiso denegado para consultar los datos de esta empresa.',
                'code'  => 'TENANCY_VIOLATION'
            ], 403);
        }

        // Validar también si el body contiene `empresa_id` e interceptarlo
        $bodyEmpresaId = $request->input('empresa_id');
        if ($bodyEmpresaId && $bodyEmpresaId != $companyId) {
            return response()->json([
                'error' => 'Invasión de Privacidad (Cuerpo del mensaje alterado)',
                'code'  => 'TENANCY_VIOLATION_BODY'
            ], 403);
        }

        // 4. Agregar de forma segura el tenant ID al request para su uso global si se requiere
        $request->attributes->set('tenant_id', $companyId);

        return $next($request);
    }
}
