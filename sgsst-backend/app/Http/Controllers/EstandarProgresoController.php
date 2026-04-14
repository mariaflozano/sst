<?php

namespace App\Http\Controllers;

use App\Models\EstandarProgreso;
use App\Models\Empresa;
use App\Models\Accidente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EstandarProgresoController extends Controller
{
    public function index($empresaId)
    {
        $progreso = EstandarProgreso::where('empresa_id', $empresaId)->get();
        return response()->json($progreso);
    }

    public function getDashboardStats($empresaId)
    {
        $empresa = Empresa::findOrFail($empresaId);
        
        $total = $empresa->cantidad_estandares ?: 60; // Fallback a 60 si no tiene
        
        $cumplidos = EstandarProgreso::where('empresa_id', $empresaId)
            ->where('estado', 'cumplido')
            ->count();
            
        $porcentaje = $total > 0 ? round(($cumplidos / $total) * 100) : 0;
        $documentosPendientes = $total - $cumplidos;
        
        // Obtener historial de accidentes de los últimos 6 meses para la gráfica
        $seisMesesAtras = now()->subMonths(5)->startOfMonth();
        $accidentes = Accidente::where('empresa_id', $empresaId)
            ->where('fecha_evento', '>=', $seisMesesAtras)
            ->get();

        $dataMes = [];
        for ($i = 5; $i >= 0; $i--) {
            $mes = now()->subMonths($i);
            $mesNombre = ucfirst($mes->translatedFormat('M-y')); 
            
            // Contar cuántos cayeron en este mes
            $conteoMes = $accidentes->filter(function($acc) use ($mes) {
                return \Carbon\Carbon::parse($acc->fecha_evento)->format('Y-m') === $mes->format('Y-m');
            })->count();

            $dataMes[] = [
                'name' => $mesNombre,
                'uv' => $conteoMes
            ];
        }

        return response()->json([
            'porcentaje_cumplimiento' => $porcentaje,
            'cumplidos' => $cumplidos,
            'pendientes' => $documentosPendientes,
            'total_requeridos' => $total,
            'grafica_accidentes' => $dataMes
        ]);
    }


    public function updateOrCreate(Request $request)
    {
        $validated = $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'estandar_id' => 'required|integer',
            'estado' => 'required|string',
            'fecha_registro' => 'nullable|string',
            'url_evidencia' => 'nullable|string',
        ]);

        $progreso = EstandarProgreso::updateOrCreate(
            [
                'empresa_id' => $validated['empresa_id'],
                'estandar_id' => $validated['estandar_id'],
            ],
            $validated
        );

        return response()->json($progreso);
    }

    public function uploadEvidence(Request $request)
    {
        $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'estandar_id' => 'required|integer',
            'archivo' => 'required|file|mimes:pdf|max:10240', // Máx 10MB, Solo PDF
        ]);

        $empresaId = $request->empresa_id;
        $estandarId = $request->estandar_id;
        $archivo = $request->file('archivo');

        // Guardar archivo en disco público
        $path = $archivo->store("evidencias/{$empresaId}", 'public');

        // Actualizar progreso — guardar ruta relativa para operaciones de archivo
        $progreso = EstandarProgreso::updateOrCreate(
            ['empresa_id' => $empresaId, 'estandar_id' => $estandarId],
            [
                'estado' => 'cumplido',
                'fecha_registro' => now()->format('d/m/Y'),
                'url_evidencia' => $path
            ]
        );

        return response()->json($progreso);
    }

    public function deleteEvidence(Request $request)
    {
        $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'estandar_id' => 'required|integer',
        ]);

        $progreso = EstandarProgreso::where('empresa_id', $request->empresa_id)
                                    ->where('estandar_id', $request->estandar_id)
                                    ->first();

        if ($progreso && $progreso->url_evidencia) {
            // Eliminar archivo físico usando la ruta relativa almacenada
            Storage::disk('public')->delete($progreso->url_evidencia);

            $progreso->update([
                'estado' => 'pendiente',
                'url_evidencia' => null,
                'fecha_registro' => null
            ]);
        }

        return response()->json(['message' => 'Evidencia eliminada']);
    }

    public function viewEvidence(Request $request)
    {
        $relativePath = $request->query('path');
        $empresaId = $request->query('empresa_id');

        if (!$relativePath) {
            return response()->json(['error' => 'Parámetro path es requerido'], 400);
        }

        // Prevenir path traversal (e.g. ../../../etc/passwd)
        if (str_contains($relativePath, '..') || str_starts_with($relativePath, '/')) {
            return response()->json(['error' => 'Ruta inválida'], 400);
        }

        // Verificar que el archivo existe
        if (!Storage::disk('public')->exists($relativePath)) {
            return response()->json(['error' => 'Archivo no encontrado'], 404);
        }

        // Si se proporciona empresa_id, verificar que el path pertenece a esa empresa
        if ($empresaId) {
            $pathSegments = explode('/', $relativePath);
            // Path formato: evidencias/{empresaId}/... o plan_anual/{empresaId}/...
            $isValidPath = (isset($pathSegments[1]) && (int)$pathSegments[1] === (int)$empresaId)
                || (isset($pathSegments[2]) && (int)$pathSegments[2] === (int)$empresaId);

            if (!$isValidPath) {
                return response()->json(['error' => 'No autorizado'], 403);
            }
        }

        $fullPath = storage_path("app/public/{$relativePath}");
        $extension = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));

        $mimeTypes = [
            'pdf'  => 'application/pdf',
            'png'  => 'image/png',
            'jpg'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif'  => 'image/gif',
            'webp' => 'image/webp',
            'mp4'  => 'video/mp4',
        ];
        $mime = $mimeTypes[$extension] ?? 'application/octet-stream';

        return response()->file($fullPath, [
            'Content-Type'        => $mime,
            'Content-Disposition' => 'inline; filename="' . basename($fullPath) . '"',
        ]);
    }
}
