<?php

namespace App\Http\Controllers;

use App\Models\PlanAnual;
use App\Models\EstandarProgreso;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

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
     * Genera actividades del plan anual a partir de los estándares NO CUMPLE del diagnóstico
     */
    public function generateFromDiagnosis(Request $request)
    {
        $validated = $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
        ]);

        $empresaId = $validated['empresa_id'];

        // Obtener estándares que NO están cumplidos (pendientes o no cumplidos)
        // Estados válidos: 'pendiente' o 'no_cumple' indican que falta implementar el estándar
        $noCumplen = EstandarProgreso::where('empresa_id', $empresaId)
            ->whereIn('estado', ['pendiente', 'no_cumple'])
            ->get();

        if ($noCumplen->isEmpty()) {
            return response()->json(['message' => 'No hay estándares con estado NO CUMPLE para generar actividades', 'actividades' => []], 200);
        }

        // Distribución por trimestre según el mes de creación del diagnóstico
        $year = now()->year;
        $quarters = [
            1 => ['start' => "$year-01-01", 'end' => "$year-03-31"],
            2 => ['start' => "$year-04-01", 'end' => "$year-06-30"],
            3 => ['start' => "$year-07-01", 'end' => "$year-09-30"],
            4 => ['start' => "$year-10-01", 'end' => "$year-12-31"],
        ];

        $categoriaMap = [
            'P' => 'Planificación',
            'CP' => 'Capacitación',
            'S' => 'Salud Ocupacional',
            'G' => 'Gestión de Riesgos',
            'E' => 'Emergencias',
            'A' => 'Auditoría',
            'M' => 'Mejora Continua',
        ];

        $etapaMap = [
            'P' => 'Planear',
            'H' => 'Hacer',
            'V' => 'Verificar',
            'A' => 'Actuar',
        ];

        $created = [];

        DB::transaction(function () use ($empresaId, $noCumplen, $quarters, $etapaMap, &$created) {
            foreach ($noCumplen as $item) {
                // Distribuir en trimestre según prioridad (primero 1 y 2)
                $trimestreIndex = ($item->estandar_id - 1) % 4 + 1;

                // Determinar etapa PHVA según el ID del estándar (Rangos 1-60)
                // Sanitizar ID: Eliminar puntos y espacios para obtener solo el primer número si es necesario
                $idRaw = (string)$item->estandar_id;
                $idInt = (int)preg_replace('/[^0-9]/', '', explode('.', $idRaw)[0]);

                if ($idInt >= 1 && $idInt <= 24) {
                    $etapa = 'Planear';
                    $categoria = 'Planificación';
                } elseif ($idInt >= 25 && $idInt <= 37) {
                    $etapa = 'Hacer';
                    $categoria = 'Salud Ocupacional';
                } elseif ($idInt >= 38 && $idInt <= 46) {
                    $etapa = 'Hacer';
                    $categoria = 'Gestión de Riesgos';
                } elseif ($idInt >= 47 && $idInt <= 48) {
                    $etapa = 'Hacer';
                    $categoria = 'Emergencias';
                } elseif ($idInt >= 49 && $idInt <= 53) {
                    $etapa = 'Verificar';
                    $categoria = 'Auditoría';
                } elseif ($idInt >= 54 && $idInt <= 60) {
                    $etapa = 'Actuar';
                    $categoria = 'Mejora Continua';
                } else {
                    // Inteligencia para IDs que ya traen prefijo o fuera de rango
                    $prefix = substr($item->estandar_id, 0, 1);
                    $etapa = $etapaMap[$prefix] ?? 'Planear';
                    $categoria = 'Planificación';
                }

                // Buscar nombre del estándar en los datos locales
                $estandarRef = "{$item->estandar_id}";
                $actividadNombre = "Implementar estándar {$estandarRef} - " . $this->getEstandarNombre($item->estandar_id);

                // Distribuir a lo largo del año
                $trimestre = $trimestreIndex;

                // Verificar si ya existe para evitar duplicados
                $existe = PlanAnual::where('empresa_id', $empresaId)
                    ->where('estandar_referencia', $estandarRef)
                    ->where('generado_diagnostico', true)
                    ->exists();

                if (!$existe) {
                    $actividad = PlanAnual::create([
                        'empresa_id' => $empresaId,
                        'actividad' => $actividadNombre,
                        'estandar_referencia' => $estandarRef,
                        'phva_etapa' => $etapa,
                        'categoria' => $categoria,
                        'fecha_inicio' => $quarters[$trimestre]['start'],
                        'fecha_fin' => $quarters[$trimestre]['end'],
                        'trimestre' => $trimestre,
                        'responsable' => 'Responsable SST',
                        'cargo_responsable' => 'Coordinador SST',
                        'area' => 'Seguridad y Salud en el Trabajo',
                        'presupuesto' => 0,
                        'recurso_necesario' => 'Documentación, personal capacitado',
                        'indicador' => "% de cumplimiento del estándar {$estandarRef}",
                        'meta' => '100',
                        'unidad_meta' => '%',
                        'valor_inicial' => 0,
                        'estado' => 'Pendiente',
                        'prioridad' => 'Alta',
                        'generado_diagnostico' => true,
                    ]);

                    $created[] = $actividad;
                }
            }
        });

        return response()->json([
            'message' => "Se generaron " . count($created) . " actividades a partir del diagnóstico",
            'actividades' => $created
        ], 201);
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
