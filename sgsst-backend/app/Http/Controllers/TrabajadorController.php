<?php

namespace App\Http\Controllers;

use App\Models\Trabajador;
use App\Models\Ausentismo;
use App\Models\Empresa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class TrabajadorController extends Controller
{
    // Listar trabajadores de la empresa con sus ausentismos
    public function index($empresa_id)
    {
        $trabajadores = Trabajador::with('ausentismos')
            ->where('empresa_id', $empresa_id)
            ->orderBy('nombre_completo', 'asc')
            ->get();

        return response()->json($trabajadores);
    }

    // Crear un nuevo trabajador
    public function store(Request $request)
    {
        // Priorizar el tenant_id de la sesión, luego el atributo del request, luego el header
        $tenantId = session('tenant_id') ?? $request->attributes->get('tenant_id') ?? $request->header('X-Company-ID');

        if (!$tenantId) {
            return response()->json([
                'error' => 'No se pudo identificar la empresa (ID no encontrado en sesión o cabeceras)',
                'code' => 'TENANT_NOT_FOUND'
            ], 422);
        }

        // Buscar la empresa asociada (tolerante a ID numérico o UUID tenant_id)
        $empresa = Empresa::where('tenant_id', $tenantId)
            ->orWhere('id', $tenantId)
            ->first();

        if (!$empresa) {
            return response()->json([
                'error' => 'No se encontró una empresa asociada a su cuenta'
            ], 422);
        }

        $validated = $request->validate([
            'documento' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('trabajadores')->where(function ($query) use ($empresa) {
                    return $query->where('empresa_id', $empresa->id);
                })
            ],
            'nombre_completo' => 'required|string|max:255',
            'cargo' => 'nullable|string|max:150',
            'fecha_ingreso' => 'nullable|date',
            'estado' => 'nullable|in:activo,inactivo',
            'tipo_sangre' => 'required|string|max:10',
            'contacto_emergencia_nombre' => 'required|string|max:255',
            'contacto_emergencia_telefono' => 'required|string|max:50',
            'auditor' => 'required|boolean',
        ]);

        $validated['empresa_id'] = $empresa->id;

        if (empty($validated['estado'])) {
            $validated['estado'] = 'activo';
        }

        $trabajador = Trabajador::create($validated);
        // Devolvemos el registro completo con su array vacío listado para el frontend
        return response()->json($trabajador->load('ausentismos'), 201);
    }

    // Actualizar trabajador
    public function update(Request $request, $id)
    {
        $trabajador = Trabajador::findOrFail($id);

        // Bloqueo manual de seguridad por si el frontend envió otra id (Multi-tenancy backup)
        $tenantId = $request->attributes->get('tenant_id');
        if ($tenantId && $trabajador->empresa_id != $tenantId) {
            abort(403, 'Invasión de Privacidad (Cruce de inquilinos)');
        }

        $validated = $request->validate([
            'documento' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('trabajadores')->where(function ($query) use ($trabajador) {
                    return $query->where('empresa_id', $trabajador->empresa_id);
                })->ignore($trabajador->id)
            ],
            'nombre_completo' => 'sometimes|required|string|max:255',
            'cargo' => 'nullable|string|max:150',
            'fecha_ingreso' => 'nullable|date',
            'estado' => 'nullable|in:activo,inactivo',
            'tipo_sangre' => 'required|string|max:10',
            'contacto_emergencia_nombre' => 'required|string|max:255',
            'contacto_emergencia_telefono' => 'required|string|max:50',
            'auditor' => 'required|boolean',
        ]);

        $trabajador->update($validated);

        return response()->json($trabajador->load('ausentismos'));
    }

    // Inactivar trabajador (soft delete)
    public function destroy($id)
    {
        $trabajador = Trabajador::findOrFail($id);
        $trabajador->estado = 'inactivo';
        $trabajador->save();

        return response()->json(['message' => 'Trabajador inactivado correctamente']);
    }

    // Registrar Ausentismo
    public function storeAusentismo(Request $request, $trabajador_id)
    {
        $trabajador = Trabajador::findOrFail($trabajador_id);

        $tenantId = $request->attributes->get('tenant_id');
        if ($tenantId && $trabajador->empresa_id != $tenantId) {
            abort(403);
        }

        $validated = $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'dias_incapacidad' => 'required|integer|min:1',
            'causa' => 'required|string',
            'diagnostico' => 'nullable|string|max:255',
            'observaciones' => 'nullable|string',
        ]);

        $validated['trabajador_id'] = $trabajador->id;

        $ausentismo = Ausentismo::create($validated);

        return response()->json($ausentismo, 201);
    }

    // Eliminar Ausentismo erróneo
    public function destroyAusentismo(Request $request, $id)
    {
        $ausentismo = Ausentismo::with('trabajador')->findOrFail($id);

        $tenantId = $request->attributes->get('tenant_id');
        if ($tenantId && $ausentismo->trabajador->empresa_id != $tenantId) {
            abort(403);
        }

        $ausentismo->delete();

        return response()->json(['message' => 'Eliminado correcto']);
    }
}
