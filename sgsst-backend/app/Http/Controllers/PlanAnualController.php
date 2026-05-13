<?php

namespace App\Http\Controllers;

use App\Models\PlanAnual;
use App\Models\EmpresaEvaluacion;
use App\Models\EmpresaEvaluacionAnio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PlanAnualController extends Controller
{
    public function index($empresaId)
    {
        $perPage = (int) request()->get('per_page', 50);
        $actividades = PlanAnual::where('empresa_id', $empresaId)
            ->orderBy('trimestre')
            ->orderBy('phva_etapa')
            ->paginate($perPage);

        return response()->json($actividades);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'actividad' => 'required|string|max:500',
            'estandar_referencia' => 'nullable|string|max:50',
            'phva_etapa' => 'required|string|in:Planear,Hacer,Verificar,Actuar',
            'categoria' => 'nullable|string|max:100',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'trimestre' => 'required|integer|min:1|max:4',
            'responsable' => 'required|string|max:255',
            'cargo_responsable' => 'nullable|string|max:100',
            'area' => 'nullable|string|max:100',
            'presupuesto' => 'nullable|numeric|min:0',
            'recurso_necesario' => 'nullable|string|max:255',
            'indicador' => 'nullable|string|max:500',
            'meta' => 'nullable|string|max:255',
            'unidad_meta' => 'nullable|string|max:50',
            'valor_inicial' => 'nullable|numeric',
            'estado' => 'nullable|string|in:Pendiente,En Proceso,Completada,Vencida',
            'observaciones' => 'nullable|string',
            'prioridad' => 'nullable|string|in:Alta,Media,Baja',
            'generado_diagnostico' => 'nullable|boolean',
        ]);

        $validated['estado'] = $validated['estado'] ?? 'Pendiente';
        $validated['prioridad'] = $validated['prioridad'] ?? 'Media';
        $validated['generado_diagnostico'] = $validated['generado_diagnostico'] ?? false;

        $actividad = PlanAnual::create($validated);

        return response()->json($actividad, 201);
    }

    public function update(Request $request, $id)
    {
        $actividad = PlanAnual::findOrFail($id);

        $validated = $request->validate([
            'actividad' => 'sometimes|required|string|max:500',
            'estandar_referencia' => 'nullable|string|max:50',
            'phva_etapa' => 'sometimes|required|string|in:Planear,Hacer,Verificar,Actuar',
            'categoria' => 'nullable|string|max:100',
            'fecha_inicio' => 'sometimes|required|date',
            'fecha_fin' => 'sometimes|required|date|after_or_equal:fecha_inicio',
            'trimestre' => 'sometimes|required|integer|min:1|max:4',
            'responsable' => 'sometimes|required|string|max:255',
            'cargo_responsable' => 'nullable|string|max:100',
            'area' => 'nullable|string|max:100',
            'presupuesto' => 'nullable|numeric|min:0',
            'recurso_necesario' => 'nullable|string|max:255',
            'indicador' => 'nullable|string|max:500',
            'meta' => 'nullable|string|max:255',
            'unidad_meta' => 'nullable|string|max:50',
            'valor_inicial' => 'nullable|numeric',
            'estado' => 'nullable|string|in:Pendiente,En Proceso,Completada,Vencida',
            'fecha_ejecucion_real' => 'nullable|date',
            'observaciones' => 'nullable|string',
            'resultado_indicador' => 'nullable|string',
            'prioridad' => 'nullable|string|in:Alta,Media,Baja',
        ]);

        $actividad->update($validated);

        return response()->json($actividad);
    }

    public function destroy($id)
    {
        $actividad = PlanAnual::findOrFail($id);

        if ($actividad->url_evidencia) {
            Storage::disk('public')->delete($actividad->url_evidencia);
        }

        $actividad->delete();

        return response()->json(['message' => 'Actividad eliminada']);
    }

    /**
     * Genera actividades del plan anual a partir de los estándares NO CUMPLE
     * del diagnóstico más reciente y cerrado. Valida que el diagnóstico tenga
     * vigencia de 1 año desde su fecha de cierre.
     */
    public function generateFromDiagnosis(Request $request)
    {
        $validated = $request->validate(['empresa_id' => 'required|exists:empresas,id']);
        $empresaId = $validated['empresa_id'];

        // Diagnóstico más reciente cerrado
        $anioRecord = EmpresaEvaluacionAnio::where('empresa_id', $empresaId)
            ->where('estado', 'cerrada')
            ->orderBy('anio', 'desc')
            ->first();

        if (!$anioRecord) {
            return response()->json([
                'message' => 'No existe un diagnóstico inicial completado. Debe realizar y cerrar la Evaluación Inicial antes de generar el Plan Anual.',
                'error' => 'sin_diagnostico',
            ], 422);
        }

        // Fecha de referencia: cierre del diagnóstico (o apertura si no tiene cierre)
        $fechaStr = $anioRecord->fecha_cierre ?: $anioRecord->fecha_apertura ?: "{$anioRecord->anio}-01-01";
        $fechaDiag = $this->parseStoredDate($fechaStr);
        $fechaVencimiento = $fechaDiag->copy()->addYear();

        if (Carbon::now()->gt($fechaVencimiento)) {
            return response()->json([
                'message' => "El diagnóstico del año {$anioRecord->anio} venció el {$fechaVencimiento->format('d/m/Y')}. Debe realizar un nuevo diagnóstico en la Evaluación Inicial.",
                'error' => 'diagnostico_vencido',
                'fecha_vencimiento' => $fechaVencimiento->format('d/m/Y'),
            ], 422);
        }

        // Estándares calificados como no_cumple en ese año
        $noCumplen = EmpresaEvaluacion::where('empresa_id', $empresaId)
            ->where('anio', $anioRecord->anio)
            ->where('calificacion', 'no_cumple')
            ->get();

        if ($noCumplen->isEmpty()) {
            return response()->json([
                'message' => "No hay estándares con calificación NO CUMPLE en el diagnóstico del año {$anioRecord->anio}.",
                'actividades' => [],
            ], 200);
        }

        // Cuatro trimestres relativos a la fecha del diagnóstico
        $totalDias = $fechaDiag->diffInDays($fechaVencimiento);
        $qDias = intdiv($totalDias, 4);
        $quarters = [
            1 => ['start' => $fechaDiag->format('Y-m-d'),                             'end' => $fechaDiag->copy()->addDays($qDias)->format('Y-m-d')],
            2 => ['start' => $fechaDiag->copy()->addDays($qDias + 1)->format('Y-m-d'), 'end' => $fechaDiag->copy()->addDays($qDias * 2)->format('Y-m-d')],
            3 => ['start' => $fechaDiag->copy()->addDays($qDias * 2 + 1)->format('Y-m-d'), 'end' => $fechaDiag->copy()->addDays($qDias * 3)->format('Y-m-d')],
            4 => ['start' => $fechaDiag->copy()->addDays($qDias * 3 + 1)->format('Y-m-d'), 'end' => $fechaVencimiento->format('Y-m-d')],
        ];

        $created = [];

        DB::transaction(function () use ($empresaId, $noCumplen, $quarters, &$created) {
            foreach ($noCumplen as $item) {
                $stdId = (int) $item->estandar_id;

                if ($stdId >= 1 && $stdId <= 24)       { $etapa = 'Planear'; $categoria = 'Planificación'; }
                elseif ($stdId >= 25 && $stdId <= 37)  { $etapa = 'Hacer';   $categoria = 'Salud Ocupacional'; }
                elseif ($stdId >= 38 && $stdId <= 46)  { $etapa = 'Hacer';   $categoria = 'Gestión de Riesgos'; }
                elseif ($stdId >= 47 && $stdId <= 48)  { $etapa = 'Hacer';   $categoria = 'Emergencias'; }
                elseif ($stdId >= 49 && $stdId <= 53)  { $etapa = 'Verificar'; $categoria = 'Auditoría'; }
                elseif ($stdId >= 54 && $stdId <= 60)  { $etapa = 'Actuar';  $categoria = 'Mejora Continua'; }
                else                                   { $etapa = 'Planear'; $categoria = 'Planificación'; }

                $trimestreIndex = (($stdId - 1) % 4) + 1;
                $estandarRef    = (string) $stdId;

                $existe = PlanAnual::where('empresa_id', $empresaId)
                    ->where('estandar_referencia', $estandarRef)
                    ->where('generado_diagnostico', true)
                    ->exists();

                if (!$existe) {
                    $created[] = PlanAnual::create([
                        'empresa_id'         => $empresaId,
                        'actividad'          => "Implementar estándar {$estandarRef} - " . $this->getEstandarNombre($stdId),
                        'estandar_referencia'=> $estandarRef,
                        'phva_etapa'         => $etapa,
                        'categoria'          => $categoria,
                        'fecha_inicio'       => $quarters[$trimestreIndex]['start'],
                        'fecha_fin'          => $quarters[$trimestreIndex]['end'],
                        'trimestre'          => $trimestreIndex,
                        'responsable'        => 'Responsable SST',
                        'cargo_responsable'  => 'Coordinador SST',
                        'area'               => 'Seguridad y Salud en el Trabajo',
                        'presupuesto'        => 0,
                        'recurso_necesario'  => 'Documentación, personal capacitado',
                        'indicador'          => "% de cumplimiento del estándar {$estandarRef}",
                        'meta'               => '100',
                        'unidad_meta'        => '%',
                        'valor_inicial'      => 0,
                        'estado'             => 'Pendiente',
                        'prioridad'          => 'Alta',
                        'generado_diagnostico' => true,
                    ]);
                }
            }
        });

        return response()->json([
            'message'     => "Se generaron " . count($created) . " actividades del diagnóstico {$anioRecord->anio} (válido hasta {$fechaVencimiento->format('d/m/Y')})",
            'actividades' => $created,
        ], 201);
    }

    /** Parsea fechas almacenadas como 'd/m/yyyy' (es-CO) o 'yyyy-mm-dd' (ISO). */
    private function parseStoredDate(string $dateStr): Carbon
    {
        if (preg_match('/^\d{4}-\d{2}-\d{2}/', $dateStr)) {
            return Carbon::parse($dateStr);
        }
        $parts = explode('/', $dateStr);
        if (count($parts) === 3) {
            return Carbon::createFromDate((int) $parts[2], (int) $parts[1], (int) $parts[0]);
        }
        return Carbon::now();
    }

    public function getEstandarNombre($id)
    {
        $nombres = [
            1 => 'Responsable del SG-SST',
            2 => 'Responsabilidades en el SG-SST',
            3 => 'Asignación de Recursos para el SG-SST',
            4 => 'Afiliación al Sistema General de Riesgos Laborales',
            5 => 'Pago de pensión trabajadores de alto riesgo',
            6 => 'Conformación COPASST',
            7 => 'Capacitación COPASST',
            8 => 'Conformación Comité de Convivencia',
            9 => 'Programa de capacitación anual',
            10 => 'Inducción y reinducción en SST',
            11 => 'Responsables de inducción y capacitación',
            12 => 'Política de Seguridad y Salud en el Trabajo',
            13 => 'Objetivos de SST',
            14 => 'Evaluación Inicial del SG-SST',
            15 => 'Plan Anual de Trabajo',
            16 => 'Archivo y retención documental',
            17 => 'Rendición de cuentas',
            18 => 'Matriz de Requisitos Legales',
            19 => 'Mecanismos de comunicación interna y externa',
            20 => 'Identificación y evaluación de adquisiciones',
            21 => 'Selección y evaluación de contratistas',
            22 => 'Gestión del cambio',
            23 => 'Plan de capacitación integral de emergencias',
            24 => 'Procedimiento de auditorías previas a adquisiciones',
            25 => 'Descripción Sociodemográfica y Diagnóstico de Salud',
            26 => 'Actividades de Promoción y Prevención',
            27 => 'Evaluaciones médicas ocupacionales',
            28 => 'Restricciones y recomendaciones médicas',
            29 => 'Reporte de Accidentes y Enfermedades Laborales',
            30 => 'Investigación de ATEL',
            31 => 'Registro y Análisis Estadístico ATEL',
            32 => 'Seguimiento de Ausentismo',
            33 => 'Frecuencia de accidentalidad',
            34 => 'Severidad de accidentalidad',
            35 => 'Proporción de accidentes mortales',
            36 => 'Prevalencia de enfermedad laboral',
            37 => 'Incidencia de enfermedad laboral',
            38 => 'Metodología de identificación de peligros (IPERC)',
            39 => 'Identificación de peligros con participación',
            40 => 'Identificación de sustancias carcinógenas',
            41 => 'Mediciones ambientales',
            42 => 'Medidas de prevención y control',
            43 => 'Aplicación de medidas por parte de trabajadores',
            44 => 'Inspecciones a instalaciones, máquinas y equipos',
            45 => 'Mantenimiento preventivo y correctivo',
            46 => 'Entrega de Elementos de Protección Personal (EPP)',
            47 => 'Plan de Prevención, Preparación y Respuesta ante Emergencias',
            48 => 'Conformación de Brigadas y simulacros',
            49 => 'Definición de Indicadores de estructura',
            50 => 'Definición de Indicadores de proceso y resultado',
            51 => 'Auditoría Anual del SG-SST',
            52 => 'Alcance y planeación de la auditoría',
            53 => 'Revisión por la Alta Dirección',
            54 => 'Definición de Acciones Preventivas y Correctivas',
            55 => 'Acciones de mejora conforme a evaluación inicial',
            56 => 'Acciones de mejora con base en investigaciones ATEL',
            57 => 'Acciones de mejora con base en auditorías externas',
            58 => 'Seguimiento al impacto de eficacia',
            59 => 'Revisión gerencial de acciones',
            60 => 'Consolidación del Plan de Mejoramiento Anual',
        ];

        // Sanitizar ID para búsqueda en array
        $cleanId = (int)preg_replace('/[^0-9]/', '', explode('.', (string)$id)[0]);
        return $nombres[$cleanId] ?? "Estándar {$id}";
    }

    public function uploadEvidence(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:plan_anual,id',
            'archivo' => 'required|file|mimes:pdf|max:10240',
        ]);

        $actividad = PlanAnual::findOrFail($request->id);
        $archivo = $request->file('archivo');

        // Eliminar archivo anterior si existe
        if ($actividad->url_evidencia) {
            Storage::disk('public')->delete($actividad->url_evidencia);
        }

        $path = $archivo->store("plan_anual/{$actividad->empresa_id}", 'public');

        $actividad->update([
            'url_evidencia' => $path,
            'fecha_ejecucion_real' => now()->format('Y-m-d'),
        ]);

        return response()->json($actividad);
    }

    public function resumen($empresaId)
    {
        $actividades = PlanAnual::where('empresa_id', $empresaId)->get();

        $total = $actividades->count();
        $pendientes = $actividades->where('estado', 'Pendiente')->count();
        $enProceso = $actividades->where('estado', 'En Proceso')->count();
        $completadas = $actividades->where('estado', 'Completada')->count();
        $vencidas = $actividades->where('estado', 'Vencida')->count();

        $presupuestoTotal = $actividades->sum('presupuesto');

        $porTrimestre = [];
        for ($i = 1; $i <= 4; $i++) {
            $trimestre = $actividades->where('trimestre', $i);
            $porTrimestre[$i] = [
                'total' => $trimestre->count(),
                'completadas' => $trimestre->where('estado', 'Completada')->count(),
                'presupuesto' => $trimestre->sum('presupuesto'),
            ];
        }

        $porEtapa = [
            'Planear' => $actividades->where('phva_etapa', 'Planear')->count(),
            'Hacer' => $actividades->where('phva_etapa', 'Hacer')->count(),
            'Verificar' => $actividades->where('phva_etapa', 'Verificar')->count(),
            'Actuar' => $actividades->where('phva_etapa', 'Actuar')->count(),
        ];

        $porPrioridad = [
            'Alta' => $actividades->where('prioridad', 'Alta')->count(),
            'Media' => $actividades->where('prioridad', 'Media')->count(),
            'Baja' => $actividades->where('prioridad', 'Baja')->count(),
        ];

        return response()->json([
            'total' => $total,
            'pendientes' => $pendientes,
            'en_proceso' => $enProceso,
            'completadas' => $completadas,
            'vencidas' => $vencidas,
            'presupuesto_total' => $presupuestoTotal,
            'por_trimestre' => $porTrimestre,
            'por_etapa' => $porEtapa,
            'por_prioridad' => $porPrioridad,
            'porcentaje_avance' => $total > 0 ? round(($completadas / $total) * 100) : 0,
        ]);
    }
}
