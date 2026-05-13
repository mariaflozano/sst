<?php

namespace App\Http\Controllers;

use App\Models\Auditoria;
use App\Models\AuditoriaHallazgo;
use App\Models\TareaHallazgo;
use Illuminate\Http\Request;

class AuditoriaController extends Controller
{
    public function index($empresa_id)
    {
        $auditorias = Auditoria::with('hallazgos_legales')
            ->where('empresa_id', $empresa_id)
            ->orderBy('fecha_programada', 'desc')
            ->get();

        return response()->json($auditorias);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'empresa_id'       => 'required|exists:empresas,id',
            'proceso_audit'    => 'nullable|string|max:255',
            'alcance'          => 'required|string|max:5000',
            'auditor_nombre'   => 'required|string|max:150',
            'auditor_perfil'   => 'nullable|string|max:100',
            'fecha_programada' => 'required|date',
        ]);

        $validated['estado'] = 'Programada';
        $validated['codigo'] = 'AUD-PENDING';

        $auditoria = Auditoria::create($validated);

        $auditoria->update([
            'codigo' => 'AUD-' . date('Y') . '-' . str_pad($auditoria->id, 3, '0', STR_PAD_LEFT),
        ]);

        return response()->json($auditoria->load('hallazgos_legales'), 201);
    }

    public function show($id)
    {
        $auditoria = Auditoria::with('hallazgos_legales')->findOrFail($id);
        return response()->json($auditoria);
    }

    public function update(Request $request, $id)
    {
        $auditoria = Auditoria::findOrFail($id);

        $validated = $request->validate([
            'alcance'                => 'sometimes|required|string|max:255',
            'auditor_nombre'         => 'sometimes|required|string|max:150',
            'auditor_perfil'         => 'nullable|string|max:100',
            'fecha_programada'       => 'sometimes|required|date',
            'fecha_realizacion'      => 'nullable|date',
            'estado'                 => 'nullable|string|max:50',
            'conclusiones_generales' => 'nullable|string',
        ]);

        $auditoria->update($validated);

        return response()->json($auditoria->fresh('hallazgos_legales'));
    }

    public function destroy($id)
    {
        $auditoria = Auditoria::findOrFail($id);
        $auditoria->delete();

        return response()->json(['message' => 'Auditoría eliminada correctamente']);
    }

    public function storeHallazgo(Request $request, $auditoria_id)
    {
        $auditoria = Auditoria::findOrFail($auditoria_id);

        $validated = $request->validate([
            'tipo_hallazgo'        => 'required|string',
            'descripcion'          => 'required|string',
            'requisito_incumplido' => 'nullable|string',
            'fecha_limite_cierre'  => 'nullable|date',
        ]);

        $validated['auditoria_id'] = $auditoria->id;
        $validated['estado']       = 'Abierto';

        $hallazgo = AuditoriaHallazgo::create($validated);

        if ($auditoria->estado === 'Programada') {
            $auditoria->update(['estado' => 'En Proceso']);
        }

        return response()->json($hallazgo->load('tareas'), 201);
    }

    public function updateHallazgo(Request $request, $id)
    {
        $hallazgo = AuditoriaHallazgo::findOrFail($id);

        $validated = $request->validate([
            'estado'              => 'sometimes|in:Abierto,En Plan de Acción,Cerrado',
            'fecha_limite_cierre' => 'nullable|date',
        ]);

        $hallazgo->update($validated);

        return response()->json($hallazgo->load('tareas'));
    }

    public function destroyHallazgo($id)
    {
        $hallazgo = AuditoriaHallazgo::findOrFail($id);
        $hallazgo->delete();

        return response()->json(['message' => 'Hallazgo eliminado correctamente']);
    }

    public function storeTarea(Request $request, $hallazgo_id)
    {
        $hallazgo = AuditoriaHallazgo::findOrFail($hallazgo_id);

        $validated = $request->validate([
            'actividad'   => 'required|string',
            'tipo_phva'   => 'nullable|in:P,H,V,A',
            'responsable' => 'nullable|array',
            'fecha_inicio'=> 'nullable|date',
            'fecha_fin'   => 'nullable|date',
        ]);

        $validated['hallazgo_id'] = $hallazgo->id;
        $validated['estado']      = 'Abierto';

        $tarea = TareaHallazgo::create($validated);

        return response()->json($tarea, 201);
    }

    public function updateTarea(Request $request, $id)
    {
        $tarea = TareaHallazgo::findOrFail($id);

        $validated = $request->validate([
            'actividad'   => 'sometimes|required|string',
            'tipo_phva'   => 'nullable|in:P,H,V,A',
            'responsable' => 'nullable|array',
            'fecha_inicio'=> 'nullable|date',
            'fecha_fin'   => 'nullable|date',
            'estado'      => 'sometimes|in:Abierto,En Plan de Acción,Cerrado,Verificado',
        ]);

        $tarea->update($validated);

        return response()->json($tarea);
    }

    public function destroyTarea($id)
    {
        $tarea = TareaHallazgo::findOrFail($id);
        $tarea->delete();

        return response()->json(['message' => 'Tarea eliminada correctamente']);
    }

    public function cerrar(Request $request, $id)
    {
        $auditoria = Auditoria::findOrFail($id);

        $validated = $request->validate([
            'conclusiones_generales' => 'nullable|string',
        ]);

        $auditoria->update([
            'estado'                 => 'Realizada',
            'fecha_realizacion'      => now()->toDateString(),
            'conclusiones_generales' => $validated['conclusiones_generales'] ?? null,
        ]);

        return response()->json($auditoria->fresh('hallazgos_legales'));
    }
}
