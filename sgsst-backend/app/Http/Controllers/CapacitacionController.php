<?php

namespace App\Http\Controllers;

use App\Models\Capacitacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CapacitacionController extends Controller
{
    /**
     * Listar programa por empresa
     */
    public function index($empresaId)
    {
        $capacitaciones = Capacitacion::where('empresa_id', $empresaId)
            ->orderBy('fecha_programada', 'asc')
            ->get();

        return response()->json($capacitaciones);
    }

    /**
     * Guardar nueva capacitación
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'tema' => 'required|string|max:500',
            'fuente' => 'required|string',
            'tipo' => 'nullable|string',
            'recomienda' => 'nullable|string',
            'estado' => 'nullable|string',
            'fecha_programada' => 'nullable|date',
            'hora_programada' => 'nullable|string',
            'observaciones' => 'nullable|string'
        ]);

        $capacitacion = Capacitacion::create($validated);

        return response()->json($capacitacion, 201);
    }

    /**
     * Sincronización masiva (Wizard)
     */
    public function sync(Request $request)
    {
        $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'items' => 'required|array',
            'items.*.tema' => 'required|string',
            'items.*.fuente' => 'required|string',
        ]);

        $empresaId = $request->empresa_id;
        $creados = [];

        foreach ($request->items as $item) {
            $capacitacion = Capacitacion::create([
                'empresa_id' => $empresaId,
                'tema' => $item['tema'],
                'fuente' => $item['fuente'],
                'tipo' => $item['tipo'] ?? 'Interna',
                'recomienda' => $item['recomienda'] ?? 'SST',
                'estado' => 'Programado'
            ]);
            $creados[] = $capacitacion;
        }

        return response()->json([
            'message' => 'Programa sincronizado correctamente',
            'items' => $creados
        ], 201);
    }

    /**
     * Actualizar estado o fecha
     */
    public function update(Request $request, $id)
    {
        $capacitacion = Capacitacion::findOrFail($id);

        $validated = $request->validate([
            'fecha_programada' => 'nullable|date',
            'hora_programada' => 'nullable|string',
            'estado' => 'nullable|string|in:Programado,En Proceso,Ejecutado,Vencido',
            'fecha_ejecucion' => 'nullable|date',
            'observaciones' => 'nullable|string'
        ]);

        $capacitacion->update($validated);

        return response()->json($capacitacion);
    }

    /**
     * Subir evidencia en formato PDF
     */
    public function uploadEvidencia(Request $request, $id)
    {
        $request->validate([
            'archivo' => 'required|file|mimes:pdf|max:10240', // Max 10MB
        ]);

        $capacitacion = Capacitacion::findOrFail($id);
        $archivo = $request->file('archivo');

        // Eliminar anterior si existe
        if ($capacitacion->evidencia_url && Storage::disk('public')->exists($capacitacion->evidencia_url)) {
            Storage::disk('public')->delete($capacitacion->evidencia_url);
        }

        // Guardar nuevo
        $path = $archivo->store("capacitaciones/empresa_{$capacitacion->empresa_id}", 'public');

        $capacitacion->update([
            'evidencia_url' => $path,
            'estado' => 'Ejecutado',
            'fecha_ejecucion' => now()->format('Y-m-d')
        ]);

        return response()->json([
            'message' => 'Evidencia cargada correctamente',
            'capacitacion' => $capacitacion,
            'public_url' => asset('storage/' . $path)
        ]);
    }

    /**
     * Eliminar capacitación
     */
    public function destroy($id)
    {
        $capacitacion = Capacitacion::findOrFail($id);

        if ($capacitacion->evidencia_url && Storage::disk('public')->exists($capacitacion->evidencia_url)) {
            Storage::disk('public')->delete($capacitacion->evidencia_url);
        }

        $capacitacion->delete();

        return response()->json(['message' => 'Capacitación eliminada correctamente']);
    }
}
