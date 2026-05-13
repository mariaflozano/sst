<?php

namespace App\Http\Controllers;

use App\Models\EmpresaEvaluacion;
use App\Models\EmpresaEvaluacionAnio;
use Illuminate\Http\Request;

class EvaluacionController extends Controller
{
    /**
     * Devuelve todos los años con sus calificaciones para una empresa.
     * Estructura: { anio: { estado, fecha_apertura, fecha_cierre, calificaciones: { estandar_id: calificacion } } }
     */
    public function index($empresa_id)
    {
        $anios = EmpresaEvaluacionAnio::where('empresa_id', $empresa_id)
            ->orderBy('anio', 'desc')
            ->get();

        $calificaciones = EmpresaEvaluacion::where('empresa_id', $empresa_id)
            ->get()
            ->groupBy('anio');

        $result = [];
        foreach ($anios as $anio) {
            $cals = $calificaciones->get($anio->anio, collect());
            $result[$anio->anio] = [
                'estado'         => $anio->estado,
                'fecha_apertura' => $anio->fecha_apertura,
                'fecha_cierre'   => $anio->fecha_cierre,
                'calificaciones' => $cals->pluck('calificacion', 'estandar_id'),
            ];
        }

        return response()->json($result);
    }

    /**
     * Guarda o actualiza la calificación de un estándar en un año.
     */
    public function calificar(Request $request)
    {
        $validated = $request->validate([
            'empresa_id'  => 'required|exists:empresas,id',
            'anio'        => 'required|integer|min:2000|max:2100',
            'estandar_id' => 'required|integer',
            'calificacion'=> 'required|in:cumple,no_cumple,no_aplica',
        ]);

        EmpresaEvaluacion::updateOrCreate(
            [
                'empresa_id'  => $validated['empresa_id'],
                'anio'        => $validated['anio'],
                'estandar_id' => $validated['estandar_id'],
            ],
            ['calificacion' => $validated['calificacion']]
        );

        return response()->json(['ok' => true]);
    }

    /**
     * Crea o actualiza el estado de un año de evaluación.
     */
    public function gestionarAnio(Request $request)
    {
        $validated = $request->validate([
            'empresa_id'    => 'required|exists:empresas,id',
            'anio'          => 'required|integer|min:2000|max:2100',
            'estado'        => 'required|in:abierta,cerrada',
            'fecha_apertura'=> 'nullable|string',
            'fecha_cierre'  => 'nullable|string',
        ]);

        $anio = EmpresaEvaluacionAnio::updateOrCreate(
            [
                'empresa_id' => $validated['empresa_id'],
                'anio'       => $validated['anio'],
            ],
            [
                'estado'         => $validated['estado'],
                'fecha_apertura' => $validated['fecha_apertura'] ?? null,
                'fecha_cierre'   => $validated['fecha_cierre'] ?? null,
            ]
        );

        return response()->json($anio);
    }

    /**
     * Guarda todas las calificaciones de un año en lote (usado al cerrar evaluación).
     */
    public function bulkCalificar(Request $request)
    {
        $request->validate([
            'empresa_id'     => 'required|exists:empresas,id',
            'anio'           => 'required|integer',
            'calificaciones' => 'required|array',
        ]);

        $empresaId = $request->empresa_id;
        $anio      = $request->anio;

        foreach ($request->calificaciones as $estandarId => $calificacion) {
            if (!in_array($calificacion, ['cumple', 'no_cumple', 'no_aplica'])) continue;

            EmpresaEvaluacion::updateOrCreate(
                ['empresa_id' => $empresaId, 'anio' => $anio, 'estandar_id' => (int) $estandarId],
                ['calificacion' => $calificacion]
            );
        }

        return response()->json(['ok' => true]);
    }
}
