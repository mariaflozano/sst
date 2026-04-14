<?php

namespace App\Http\Controllers;

use App\Models\Auditoria;
use App\Models\AuditoriaHallazgo;
use Illuminate\Http\Request;

class AuditoriaController extends Controller
{
    // Listar auditorías de la empresa
    public function index($empresa_id)
    {
        $auditorias = Auditoria::with('hallazgos_legales')
            ->where('empresa_id', $empresa_id)
            ->orderBy('fecha_programada', 'desc')
            ->get();

        return response()->json($auditorias);
    }

    // Crear nueva auditoría
    public function store(Request $request)
    {
        $validated = $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'tipo' => 'required|in:interna,externa,proveedores',
            'objeto' => 'required|string|max:255',
            'fecha_programada' => 'required|date',
            'auditor_lider' => 'required|string|max:150',
            'equipo_auditor' => 'nullable|string|max:255',
            'estado' => 'nullable|in:programada,en_progreso,cerrada,cancelada',
        ]);

        $auditoria = Auditoria::create($validated);

        return response()->json($auditoria->load('hallazgos_legales'), 201);
    }

    // Ver una auditoría
    public function show($id)
    {
        $auditoria = Auditoria::with('hallazgos_legales')->findOrFail($id);
        return response()->json($auditoria);
    }

    // Actualizar auditoría
    public function update(Request $request, $id)
    {
        $auditoria = Auditoria::findOrFail($id);
        
        $tenantId = $request->attributes->get('tenant_id');
        if($tenantId && $auditoria->empresa_id != $tenantId) {
            abort(403);
        }

        $validated = $request->validate([
            'tipo' => 'sometimes|required|in:interna,externa,proveedores',
            'objeto' => 'sometimes|required|string|max:255',
            'fecha_programada' => 'sometimes|required|date',
            'fecha_realizada' => 'nullable|date',
            'auditor_lider' => 'sometimes|required|string|max:150',
            'equipo_auditor' => 'nullable|string|max:255',
            'estado' => 'nullable|in:programada,en_progreso,cerrada,cancelada',
            'resultado' => 'nullable|in:cumple,no_cumple,observaciones,nc_mayores',
            'conclusiones' => 'nullable|string',
            'recomendaciones' => 'nullable|string',
        ]);

        $auditoria->update($validated);

        return response()->json($auditoria->fresh('hallazgos_legales'));
    }

    // Eliminar auditoría
    public function destroy(Request $request, $id)
    {
        $auditoria = Auditoria::findOrFail($id);
        $tenantId = $request->attributes->get('tenant_id');
        if($tenantId && $auditoria->empresa_id != $tenantId) {
            abort(403);
        }
        $auditoria->delete();

        return response()->json(['message' => 'Auditoría eliminada correctamente']);
    }

    // Añadir Hallazgo
    public function storeHallazgo(Request $request, $auditoria_id)
    {
        $auditoria = Auditoria::findOrFail($auditoria_id);

        $tenantId = $request->attributes->get('tenant_id');
        if($tenantId && $auditoria->empresa_id != $tenantId) {
            abort(403);
        }

        $validated = $request->validate([
            'tipo_hallazgo' => 'required|string',
            'descripcion' => 'required|string',
            'requisito_incumplido' => 'nullable|string'
        ]);

        $validated['auditoria_id'] = $auditoria->id;
        $validated['estado'] = 'Abierto';

        $hallazgo = AuditoriaHallazgo::create($validated);

        return response()->json($hallazgo, 201);
    }

    // Actualizar Hallazgo (Añadir Plan de Acción)
    public function updateHallazgo(Request $request, $id)
    {
        $hallazgo = AuditoriaHallazgo::with('auditoria')->findOrFail($id);
        
        $tenantId = $request->attributes->get('tenant_id');
        if($tenantId && $hallazgo->auditoria->empresa_id != $tenantId) {
            abort(403);
        }

        $validated = $request->validate([
            'estado' => 'sometimes|in:Abierto,En Plan de Acción,Cerrado',
            'plan_accion' => 'nullable|string',
            'responsable' => 'nullable|string',
            'fecha_compromiso' => 'nullable|date',
        ]);

        $hallazgo->update($validated);

        return response()->json($hallazgo);
    }

    // Eliminar Hallazgo
    public function destroyHallazgo(Request $request, $id)
    {
        $hallazgo = AuditoriaHallazgo::with('auditoria')->findOrFail($id);
        
        $tenantId = $request->attributes->get('tenant_id');
        if($tenantId && $hallazgo->auditoria->empresa_id != $tenantId) {
            abort(403);
        }

        $hallazgo->delete();

        return response()->json(['message' => 'Hallazgo eliminado correcto']);
    }

    // Cerrar auditoría con resultados
    public function cerrar(Request $request, $id)
    {
        $auditoria = Auditoria::findOrFail($id);

        $tenantId = $request->attributes->get('tenant_id');
        if($tenantId && $auditoria->empresa_id != $tenantId) {
            abort(403);
        }

        $validated = $request->validate([
            'resultado' => 'required|in:cumple,no_cumple,observaciones,nc_mayores',
            'conclusiones' => 'nullable|string',
            'recomendaciones' => 'nullable|string',
        ]);

        $auditoria->update([
            'estado' => 'cerrada',
            'fecha_realizada' => now()->toDateString(),
            ...$validated,
        ]);

        return response()->json($auditoria->fresh('hallazgos_legales'));
    }
}
