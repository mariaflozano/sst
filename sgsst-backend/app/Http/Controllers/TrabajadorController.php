<?php

namespace App\Http\Controllers;

use App\Models\Trabajador;
use App\Models\Ausentismo;
use Illuminate\Http\Request;
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
        $validated = $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'documento' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('trabajadores')->where(function ($query) use ($request) {
                    return $query->where('empresa_id', $request->empresa_id);
                })
            ],
            'nombre_completo' => 'required|string|max:255',
            'cargo' => 'nullable|string|max:150',
            'fecha_ingreso' => 'nullable|date',
            'estado' => 'nullable|in:activo,inactivo',
            'tipo_sangre' => 'required|string|max:10',
            'contacto_emergencia_nombre' => 'required|string|max:255',
            'contacto_emergencia_telefono' => 'required|string|max:50',
        ]);

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
        if($tenantId && $trabajador->empresa_id != $tenantId) {
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
        ]);

        $trabajador->update($validated);

        return response()->json($trabajador->load('ausentismos'));
    }

    // Registrar Ausentismo
    public function storeAusentismo(Request $request, $trabajador_id)
    {
        $trabajador = Trabajador::findOrFail($trabajador_id);
        
        $tenantId = $request->attributes->get('tenant_id');
        if($tenantId && $trabajador->empresa_id != $tenantId) {
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
        if($tenantId && $ausentismo->trabajador->empresa_id != $tenantId) {
            abort(403);
        }

        $ausentismo->delete();

        return response()->json(['message' => 'Eliminado correcto']);
    }
}
