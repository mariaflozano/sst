<?php

namespace App\Http\Controllers;

use App\Models\Ausentismo;
use App\Models\Trabajador;
use Illuminate\Http\Request;

class AusentismoController extends Controller
{
    // Listar todos los ausentismos de una empresa
    public function index(Request $request, $empresa_id)
    {
        $ausentismos = Ausentismo::whereHas('trabajador', function ($query) use ($empresa_id) {
            $query->where('empresa_id', $empresa_id);
        })
        ->with('trabajador:id,nombre_completo,documento')
        ->orderBy('fecha_inicio', 'desc')
        ->get();

        return response()->json($ausentismos);
    }

    // Registrar un nuevo ausentismo
    public function store(Request $request)
    {
        $validated = $request->validate([
            'trabajador_id' => 'required|exists:trabajadores,id',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'dias_incapacidad' => 'required|integer|min:1',
            'causa' => 'required|string',
            'diagnostico' => 'nullable|string|max:255',
            'observaciones' => 'nullable|string',
        ]);

        // Validar que el trabajador pertenezca a la empresa (tenant) si es necesario
        $trabajador = Trabajador::findOrFail($validated['trabajador_id']);
        $tenantId = $request->attributes->get('tenant_id');
        if ($tenantId && $trabajador->empresa_id != $tenantId) {
            abort(403, 'Acción no autorizada');
        }

        $ausentismo = Ausentismo::create($validated);

        return response()->json($ausentismo->load('trabajador:id,nombre_completo,documento'), 201);
    }

    // Actualizar un ausentismo
    public function update(Request $request, $id)
    {
        $ausentismo = Ausentismo::with('trabajador')->findOrFail($id);

        $tenantId = $request->attributes->get('tenant_id');
        if ($tenantId && $ausentismo->trabajador->empresa_id != $tenantId) {
            abort(403, 'Acción no autorizada');
        }

        $validated = $request->validate([
            'trabajador_id' => 'sometimes|required|exists:trabajadores,id',
            'fecha_inicio' => 'sometimes|required|date',
            'fecha_fin' => 'sometimes|required|date|after_or_equal:fecha_inicio',
            'dias_incapacidad' => 'sometimes|required|integer|min:1',
            'causa' => 'sometimes|required|string',
            'diagnostico' => 'nullable|string|max:255',
            'observaciones' => 'nullable|string',
        ]);

        $ausentismo->update($validated);

        return response()->json($ausentismo->load('trabajador:id,nombre_completo,documento'));
    }

    // Eliminar un ausentismo
    public function destroy(Request $request, $id)
    {
        $ausentismo = Ausentismo::with('trabajador')->findOrFail($id);

        $tenantId = $request->attributes->get('tenant_id');
        if ($tenantId && $ausentismo->trabajador->empresa_id != $tenantId) {
            abort(403, 'Acción no autorizada');
        }

        $ausentismo->delete();

        return response()->json(['message' => 'Ausentismo eliminado correctamente']);
    }
}
