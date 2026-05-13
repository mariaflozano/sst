<?php

namespace App\Http\Controllers;

use App\Models\Investigacion;
use App\Models\InvestigacionAccion;
use App\Models\Accidente;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class InvestigacionController extends Controller
{
    // Listar investigaciones de una empresa
    public function index($empresaId)
    {
        $investigaciones = Investigacion::with(['accidente', 'acciones'])
            ->where('empresa_id', $empresaId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($investigaciones);
    }

    // Obtener una investigación específica
    public function show($id)
    {
        $investigacion = Investigacion::with(['accidente', 'acciones', 'empresa'])
            ->findOrFail($id);

        return response()->json($investigacion);
    }

    // Crear investigación para un accidente
    public function store(Request $request)
    {
        $validated = $request->validate([
            'accidente_id' => 'required|exists:accidentes,id',
            'empresa_id' => 'required|exists:empresas,id',
        ]);

        return DB::transaction(function () use ($validated) {
            // Verificar que el accidente existe y no tiene investigación
            $accidente = Accidente::findOrFail($validated['accidente_id']);
            if ($accidente->investigacion) {
                return response()->json(['error' => 'Este accidente ya tiene una investigación'], 422);
            }

            // Calcular fecha límite (15 días según Res 1401)
            $fechaLimite = Carbon::now()->addDays(15);

            $investigacion = Investigacion::create([
                'accidente_id' => $validated['accidente_id'],
                'empresa_id' => $validated['empresa_id'],
                'estado' => 'Pendiente',
                'fecha_limite' => $fechaLimite,
                // Copiar datos base del accidente
                'tipo_lesion' => $accidente->tipo_lesion,
                'parte_cuerpo' => $accidente->parte_cuerpo,
                'clasificacion_accidente' => $accidente->clasificacion_accidente,
                'testigos' => $accidente->testigos,
                'jefe_inmediato' => $accidente->jefe_inmediato,
                'reportado_arl' => $accidente->reportado_arl,
                'fecha_reporte_arl' => $accidente->fecha_reporte_arl,
                'numero_radicado_arl' => $accidente->numero_radicado_arl,
            ]);

            // Actualizar estado del accidente
            $accidente->update(['estado' => 'Investigacion']);

            return response()->json($investigacion->load('accidente'), 201);
        });
    }

    // Actualizar investigación (equipo investigador, análisis, etc)
    public function update(Request $request, $id)
    {
        $investigacion = Investigacion::findOrFail($id);

        $validated = $request->validate([
            'responsable_sst' => 'nullable|string',
            'jefe_inmediato_investigador' => 'nullable|string',
            'incluye_copasst' => 'nullable|boolean',
            'integrantes_copasst' => 'nullable|array',
            'metodologia' => 'nullable|string|in:5 Porqués,Árbol de Causas,Ishikawa',
            'secuencia_hechos' => 'nullable|string',
            'causas_inmediatas_actos' => 'nullable|array',
            'causas_inmediatas_condiciones' => 'nullable|array',
            'causas_basicas_personales' => 'nullable|array',
            'causas_basicas_trabajo' => 'nullable|array',
            'tipo_lesion' => 'nullable|string',
            'parte_cuerpo' => 'nullable|string',
            'clasificacion_accidente' => 'nullable|string',
            'testigos' => 'nullable|array',
            'jefe_inmediato' => 'nullable|string',
            'reportado_arl' => 'nullable|boolean',
            'fecha_reporte_arl' => 'nullable|date',
            'numero_radicado_arl' => 'nullable|string',
            'acciones_correctivas' => 'nullable|array',
            'acciones_preventivas' => 'nullable|array',
            'estado' => 'nullable|string|in:Pendiente,En Proceso,Cerrado',
        ]);

        $investigacion->update($validated);

        return response()->json($investigacion->load('accidente', 'acciones'));
    }

    // Agregar/actualizar acciones (correctivas o preventivas)
    public function agregarAccion(Request $request, $id)
    {
        $investigacion = Investigacion::findOrFail($id);

        $validated = $request->validate([
            'tipo' => 'required|in:correctiva,preventiva',
            'descripcion' => 'required|string',
            'responsable' => 'nullable|string',
            'fecha_ejecucion' => 'nullable|date',
        ]);

        $accion = InvestigacionAccion::create([
            'investigacion_id' => $investigacion->id,
            'tipo' => $validated['tipo'],
            'descripcion' => $validated['descripcion'],
            'responsable' => $validated['responsable'] ?? null,
            'fecha_ejecucion' => $validated['fecha_ejecucion'] ?? null,
            'estado' => 'Abierta',
        ]);

        return response()->json($accion, 201);
    }

    // Actualizar estado de una acción
    public function updateAccion(Request $request, $id, $accionId)
    {
        $accion = InvestigacionAccion::where('investigacion_id', $id)
            ->findOrFail($accionId);

        $validated = $request->validate([
            'estado' => 'nullable|string|in:Abierta,En Proceso,Cerrada,Verificada',
            'fecha_ejecucion' => 'nullable|date',
            'responsable' => 'nullable|string',
            'fecha_cierre_accion' => 'nullable|date',
            'eficaz' => 'nullable|boolean',
            'resultado_verificacion' => 'nullable|string',
        ]);

        $accion->update($validated);

        return response()->json($accion);
    }

    // Cerrar investigación
    public function cerrar(Request $request, $id)
    {
        $investigacion = Investigacion::findOrFail($id);

        $validated = $request->validate([
            'observaciones_cierre' => 'nullable|string',
            'eficacia_verificada' => 'nullable|boolean',
        ]);

        $investigacion->update([
            'estado' => 'Cerrado',
            'fecha_cierre' => Carbon::now(),
            'observaciones_cierre' => $validated['observaciones_cierre'] ?? null,
            'eficacia_verificada' => $validated['eficacia_verificada'] ?? false,
            'fecha_verificacion_eficacia' => $validated['eficacia_verificada'] ? Carbon::now() : null,
        ]);

        // Actualizar estado del accidente
        $investigacion->accidente->update(['estado' => 'Cerrado']);

        return response()->json($investigacion->load('accidente', 'acciones'));
    }

    // Obtener alertas (investigaciones próximas a vencer o vencidas)
    public function alertas($empresaId)
    {
        $hoy = Carbon::now();
        $tresDias = Carbon::now()->addDays(3);

        $investigaciones = Investigacion::with('accidente')
            ->where('empresa_id', $empresaId)
            ->where('estado', '!=', 'Cerrado')
            ->get();

        $alertas = [];

        foreach ($investigaciones as $inv) {
            $diasRestantes = $hoy->diffInDays($inv->fecha_limite, false);

            if ($diasRestantes < 0) {
                $alertas[] = [
                    'tipo' => 'VENCIDO',
                    'investigacion_id' => $inv->id,
                    'accidente_id' => $inv->accidente_id,
                    'trabajador' => $inv->accidente->nombre_trabajador,
                    'fecha_accidente' => $inv->accidente->fecha_evento,
                    'fecha_limite' => $inv->fecha_limite->format('Y-m-d'),
                    'dias_vencido' => abs($diasRestantes),
                    'mensaje' => 'La investigación está vencida. Debe cerrarse inmediatamente.',
                ];
            } elseif ($diasRestantes <= 3) {
                $alertas[] = [
                    'tipo' => 'POR VENCER',
                    'investigacion_id' => $inv->id,
                    'accidente_id' => $inv->accidente_id,
                    'trabajador' => $inv->accidente->nombre_trabajador,
                    'fecha_accidente' => $inv->accidente->fecha_evento,
                    'fecha_limite' => $inv->fecha_limite->format('Y-m-d'),
                    'dias_restantes' => $diasRestantes,
                    'mensaje' => "Quedan {$diasRestantes} día(s) para cerrar la investigación.",
                ];
            }
        }

        return response()->json($alertas);
    }

    // Eliminar una acción
    public function eliminarAccion($id, $accionId)
    {
        $accion = InvestigacionAccion::where('investigacion_id', $id)
            ->findOrFail($accionId);

        $accion->delete();

        return response()->json(['message' => 'Acción eliminada']);
    }
}
