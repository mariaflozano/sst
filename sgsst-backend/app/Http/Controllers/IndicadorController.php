<?php

namespace App\Http\Controllers;

use App\Models\Accidente;
use App\Models\Ausentismo;
use App\Models\Trabajador;
use App\Models\Empresa;
use Illuminate\Http\Request;
use Carbon\Carbon;

class IndicadorController extends Controller
{
    public function obtenerIndicadores(Request $request, $id)
    {
        $empresa = Empresa::findOrFail($id);

        $anio = $request->query('anio', date('Y'));
        
        // 1. Población Trabajadora Promedio
        // En una empresa real se sacarían promedios, aquí sumaremos los activos como base.
        $numeroTrabajadores = Trabajador::where('empresa_id', $id)
                                          ->where('estado', 'activo')
                                          ->count();
        // Fallback si no usan el módulo de trabajadores aún
        if ($numeroTrabajadores == 0) {
            $numeroTrabajadores = $empresa->trabajadores ?? 1; // evitar divisiones por cero
        }

        $constanteIndice = 240000; // Constante K para cálculos de minería/industria normal, otros usan 200,000. 

        // 2. Frecuencia de Accidentalidad
        // Fórmula Res 0312: (Número de AT en el mes o año / Número de trabajadores en el mes) * 100
        $accidentesAnio = Accidente::where('empresa_id', $id)
                                    ->whereYear('fecha_incidente', $anio)
                                    ->count();
        $frecuencia = $numeroTrabajadores > 0 ? round(($accidentesAnio / $numeroTrabajadores) * 100, 2) : 0;

        // 3. Severidad de Accidentalidad
        // Días de incapacidad por accidentes de trabajo
        $diasPerdidosAT = Ausentismo::whereHas('trabajador', function($q) use ($id){
                                        $q->where('empresa_id', $id);
                                    })
                                    ->where('causa', 'Accidente de Trabajo')
                                    ->whereYear('fecha_inicio', $anio)
                                    ->sum('dias_incapacidad');
                                    
        $severidad = $numeroTrabajadores > 0 ? round(($diasPerdidosAT / $numeroTrabajadores) * 100, 2) : 0;

        // 4. Proporción de Accidentes Mortales
        $accidentesMortales = Accidente::where('empresa_id', $id)
                                       ->whereYear('fecha_incidente', $anio)
                                       ->where('tipo_lesion', 'like', '%muerte%') // Básico
                                       ->count();
        
        $proporcionMortales = $accidentesAnio > 0 ? round(($accidentesMortales / $accidentesAnio) * 100, 2) : 0;

        // 5. Ausentismo por Causa Médica
        // (Número de días de ausencia médica por todas las causas en el mes/año / Número de días de trabajo programados) * 100
        $diasAusenciaTotales = Ausentismo::whereHas('trabajador', function($q) use ($id){
                                            $q->where('empresa_id', $id);
                                        })
                                        ->whereIn('causa', ['Enfermedad Común', 'Enfermedad Laboral', 'Accidente de Trabajo'])
                                        ->whereYear('fecha_inicio', $anio)
                                        ->sum('dias_incapacidad');
        
        $diasProgramados = $numeroTrabajadores * 240; // Aproximación 240 días hábiles al año
        $ausentismo = $diasProgramados > 0 ? round(($diasAusenciaTotales / $diasProgramados) * 100, 2) : 0;

        $meses = [];
        for ($i = 1; $i <= 12; $i++) {
            $meses[] = [
                'name' => Carbon::create()->month($i)->translatedFormat('M'),
                'accidentes' => Accidente::where('empresa_id', $id)->whereMonth('fecha_incidente', $i)->whereYear('fecha_incidente', $anio)->count(),
                'incapacidades' => Ausentismo::whereHas('trabajador', function($q) use ($id){
                                            $q->where('empresa_id', $id);
                                        })->whereMonth('fecha_inicio', $i)->whereYear('fecha_inicio', $anio)->sum('dias_incapacidad')
            ];
        }

        return response()->json([
            'frecuencia' => $frecuencia,
            'severidad' => $severidad,
            'mortales' => $proporcionMortales,
            'ausentismo' => $ausentismo,
            'total_accidentes' => $accidentesAnio,
            'total_dias_perdidos' => $diasAusenciaTotales,
            'grafica_mensual' => $meses
        ]);
    }
}
