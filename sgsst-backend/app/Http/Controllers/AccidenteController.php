<?php

namespace App\Http\Controllers;

use App\Models\Accidente;
use App\Models\Sucursal;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AccidenteController extends Controller
{
    public function index($empresaId)
    {
        $accidentes = Accidente::with(['sucursal', 'investigacion'])
            ->where('empresa_id', $empresaId)
            ->orderBy('fecha_evento', 'desc')
            ->get();

        return response()->json($accidentes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'sucursal_id' => 'nullable|exists:sucursales,id',

            // Datos del trabajador (obligatorios)
            'nombre_trabajador' => 'required|string',
            'documento_identidad' => 'required|string',
            'cargo' => 'required|string',
            'area' => 'nullable|string',
            'tipo_contrato' => 'nullable|string',
            'antiguedad' => 'nullable|string',

            // Datos del accidente
            'fecha_evento' => 'required|date',
            'hora_evento' => 'nullable|string',
            'fecha_reporte' => 'nullable|date',
            'lugar_exacto' => 'nullable|string',
            'tipo_accidente' => 'nullable|string',
            'tipo_evento' => 'required|string', // Incidente, Accidente Leve, Accidente Grave, Mortal, Enfermedad Laboral

            // Descripción
            'descripcion' => 'required|string',

            // Consecuencias
            'tipo_lesion' => 'nullable|string',
            'parte_cuerpo' => 'nullable|string',
            'clasificacion_accidente' => 'nullable|string',
            'dias_incapacidad' => 'nullable|integer',

            // Info adicional
            'testigos' => 'nullable|array',
            'jefe_inmediato' => 'nullable|string',
            'reportado_arl' => 'nullable|boolean',
            'fecha_reporte_arl' => 'nullable|date',
            'numero_radicado_arl' => 'nullable|string',
        ]);

        $accidente = Accidente::create([
            'empresa_id' => $validated['empresa_id'],
            'sucursal_id' => $validated['sucursal_id'] ?? null,
            'nombre_trabajador' => $validated['nombre_trabajador'],
            'documento_identidad' => $validated['documento_identidad'],
            'cargo' => $validated['cargo'],
            'area' => $validated['area'] ?? null,
            'tipo_contrato' => $validated['tipo_contrato'] ?? null,
            'antiguedad' => $validated['antiguedad'] ?? null,
            'fecha_evento' => $validated['fecha_evento'],
            'hora_evento' => $validated['hora_evento'] ?? null,
            'fecha_reporte' => $validated['fecha_reporte'] ?? Carbon::now(),
            'lugar_exacto' => $validated['lugar_exacto'] ?? null,
            'tipo_accidente' => $validated['tipo_accidente'] ?? null,
            'tipo_evento' => $validated['tipo_evento'],
            'descripcion' => $validated['descripcion'],
            'tipo_lesion' => $validated['tipo_lesion'] ?? null,
            'parte_cuerpo' => $validated['parte_cuerpo'] ?? null,
            'clasificacion_accidente' => $validated['clasificacion_accidente'] ?? null,
            'dias_incapacidad' => $validated['dias_incapacidad'] ?? 0,
            'testigos' => $validated['testigos'] ?? null,
            'jefe_inmediato' => $validated['jefe_inmediato'] ?? null,
            'reportado_arl' => $validated['reportado_arl'] ?? false,
            'fecha_reporte_arl' => $validated['fecha_reporte_arl'] ?? null,
            'numero_radicado_arl' => $validated['numero_radicado_arl'] ?? null,
            'estado' => 'Reportado'
        ]);

        return response()->json($accidente->load('sucursal'), 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'estado' => 'required|string|in:Reportado,Investigacion,Cerrado'
        ]);

        $accidente = Accidente::findOrFail($id);
        $accidente->estado = $request->estado;
        $accidente->save();

        return response()->json($accidente);
    }

    public function sucursales($empresaId)
    {
        $sucursales = Sucursal::where('empresa_id', $empresaId)
            ->where('activo', true)
            ->orderBy('nombre')
            ->get();

        return response()->json($sucursales);
    }

    public function sync(Request $request)
    {
        $request->validate([
            'accidentes' => 'required|array',
            'accidentes.*.empresa_id' => 'required|exists:empresas,id',
            'accidentes.*.nombre_trabajador' => 'required|string',
            'accidentes.*.documento_identidad' => 'required|string',
            'accidentes.*.fecha_evento' => 'required|date',
            'accidentes.*.tipo_evento' => 'required|string',
            'accidentes.*.descripcion' => 'required|string',
        ]);

        // Validar que todos los accidentes pertenezcan a la misma empresa
        $empresaIds = array_unique(array_column($request->accidentes, 'empresa_id'));
        if (count($empresaIds) > 1) {
            return response()->json([
                'error' => 'No se pueden sincronizar accidentes de múltiples empresas en una sola petición.',
            ], 422);
        }

        $empresaId = $empresaIds[0];

        $created = [];

        DB::transaction(function () use ($request, &$created) {
            foreach ($request->accidentes as $accidenteData) {
                $created[] = Accidente::create([
                    'empresa_id' => $empresaId,
                    'sucursal_id' => $accidenteData['sucursal_id'] ?? null,
                    'nombre_trabajador' => $accidenteData['nombre_trabajador'],
                    'documento_identidad' => $accidenteData['documento_identidad'],
                    'cargo' => $accidenteData['cargo'] ?? null,
                    'area' => $accidenteData['area'] ?? null,
                    'tipo_contrato' => $accidenteData['tipo_contrato'] ?? null,
                    'antiguedad' => $accidenteData['antiguedad'] ?? null,
                    'fecha_evento' => $accidenteData['fecha_evento'],
                    'hora_evento' => $accidenteData['hora_evento'] ?? null,
                    'fecha_reporte' => $accidenteData['fecha_reporte'] ?? Carbon::now(),
                    'lugar_exacto' => $accidenteData['lugar_exacto'] ?? null,
                    'tipo_accidente' => $accidenteData['tipo_accidente'] ?? null,
                    'tipo_evento' => $accidenteData['tipo_evento'],
                    'descripcion' => $accidenteData['descripcion'],
                    'dias_incapacidad' => $accidenteData['dias_incapacidad'] ?? 0,
                    'testigos' => $accidenteData['testigos'] ?? null,
                    'jefe_inmediato' => $accidenteData['jefe_inmediato'] ?? null,
                    'reportado_arl' => $accidenteData['reportado_arl'] ?? false,
                    'fecha_reporte_arl' => $accidenteData['fecha_reporte_arl'] ?? null,
                    'numero_radicado_arl' => $accidenteData['numero_radicado_arl'] ?? null,
                    'estado' => 'Reportado'
                ]);
            }
        });

        return response()->json(['message' => 'Sincronizados correctamente', 'count' => count($created)], 201);
    }
}
