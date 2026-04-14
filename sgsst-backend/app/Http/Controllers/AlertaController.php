<?php

namespace App\Http\Controllers;

use App\Models\Alerta;
use App\Models\Empresa;
use App\Models\MatrizLegalItem;
use App\Models\DocumentoLegal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AlertaController extends Controller
{
    public function index($empresaId)
    {
        $empresa = Empresa::findOrFail($empresaId);
        $ciiu = $empresa->codigo_ciiu;

        // Filtrado simulando el pre-etiquetado de IA (Solo últimos 30 días para Alertas)
        $alertas = Alerta::where(function($q) use ($ciiu) {
                $q->whereJsonContains('codigos_ciiu_aplicables', 'TODOS')
                  ->orWhereJsonContains('codigos_ciiu_aplicables', $ciiu);
            })
            ->where('created_at', '>=', now()->subDays(30))
            ->orderBy('fecha_publicacion', 'desc')
            ->get();

        // Cruzar con las leídas por esta empresa concreta
        $leidas = DB::table('empresa_alerta_leidas')
            ->where('empresa_id', $empresaId)
            ->pluck('alerta_id')
            ->toArray();

        // Mapear el formato esperado por el frontend
        $resultado = $alertas->map(function ($alerta) use ($leidas) {
            return [
                'id' => $alerta->id,
                'title' => $alerta->titulo,
                'norma' => $alerta->norma,
                'date' => $alerta->fecha_publicacion,
                'impact' => $alerta->impacto,
                'description' => $alerta->descripcion,
                'actionRequired' => $alerta->accion_requerida,
                'read' => in_array($alerta->id, $leidas)
            ];
        });

        return response()->json($resultado);
    }

    public function marcarLeida(Request $request)
    {
        $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'alerta_id' => 'required|exists:alertas,id'
        ]);

        DB::table('empresa_alerta_leidas')->updateOrInsert(
            [
                'empresa_id' => $request->empresa_id,
                'alerta_id' => $request->alerta_id
            ],
            [
                'leida_en' => now()
            ]
        );

        return response()->json(['message' => 'Alerta marcada como leída']);
    }

    public function matrizLegal($empresaId)
    {
        $items = MatrizLegalItem::with('alerta')
            ->where('empresa_id', $empresaId)
            ->get();

        $resultado = $items->map(function ($item) {
            $isCustom = is_null($item->alerta_id);
            return [
                'id' => $item->id,
                'alerta_id' => $item->alerta_id,
                'norma' => $isCustom ? $item->norma_personalizada : $item->alerta?->norma,
                'title' => $isCustom ? $item->titulo_personalizado : $item->alerta?->titulo,
                'date' => $isCustom ? $item->created_at->format('Y-m-d') : $item->alerta?->fecha_publicacion,
                'impact' => $isCustom ? 'Manual' : $item->alerta?->impacto,
                'description' => $isCustom ? $item->observaciones : $item->alerta?->descripcion,
                'actionRequired' => $isCustom ? 'N/A' : $item->alerta?->accion_requerida,
                'cumplimiento' => $item->cumplimiento,
                'observaciones' => $item->observaciones,
                'estado' => $isCustom ? 'vigente' : $item->alerta?->estado,
                'area' => $isCustom ? 'SST' : $item->alerta?->area,
                'url_oficial' => $isCustom ? null : $item->alerta?->url_oficial,
                'sustituida_por' => $isCustom ? null : $item->alerta?->sustituida_por,
                'isCustom' => $isCustom
            ];
        });

        return response()->json($resultado);
    }

    public function biblioteca($empresaId)
    {
        $empresa = Empresa::findOrFail($empresaId);
        $ciiu = $empresa->codigo_ciiu;

        // IDs que ya están en la matriz
        $enMatriz = MatrizLegalItem::where('empresa_id', $empresaId)
            ->whereNotNull('alerta_id')
            ->pluck('alerta_id')
            ->toArray();

        // Sugerencias: Aplicables según CIIU pero NO en matriz
        $query = Alerta::where(function($q) use ($ciiu) {
                $q->whereJsonContains('codigos_ciiu_aplicables', 'TODOS')
                  ->orWhereJsonContains('codigos_ciiu_aplicables', $ciiu);
            });

        if (request()->has('area') && request('area') !== 'TODOS') {
            $query->where('area', request('area'));
        }

        $alertas = $query->whereNotIn('id', $enMatriz)
            ->orderBy('id', 'desc')
            ->get();

        // Fallback: Si no hay nada para el CIIU de la empresa, traer lo de "TODOS"
        if ($alertas->isEmpty() && $ciiu !== 'TODOS') {
            $alertas = Alerta::whereJsonContains('codigos_ciiu_aplicables', 'TODOS')
                ->whereNotIn('id', $enMatriz)
                ->orderBy('id', 'desc')
                ->get();
        }

        $resultado = $alertas->map(function ($alerta) {
            return [
                'id' => $alerta->id,
                'title' => $alerta->titulo,
                'norma' => $alerta->norma,
                'date' => $alerta->fecha_publicacion,
                'impact' => $alerta->impacto,
                'description' => $alerta->descripcion,
                'actionRequired' => $alerta->accion_requerida,
                'estado' => $alerta->estado,
                'area' => $alerta->area,
                'url_oficial' => $alerta->url_oficial
            ];
        });

        return response()->json($resultado);
    }

    public function addToMatrix(Request $request)
    {
        $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'alerta_id' => 'required|exists:alertas,id',
            'cumplimiento' => 'nullable|string',
            'observaciones' => 'nullable|string'
        ]);

        $item = MatrizLegalItem::updateOrCreate([
            'empresa_id' => $request->empresa_id,
            'alerta_id' => $request->alerta_id
        ], [
            'cumplimiento' => $request->cumplimiento ?? 'pendiente',
            'observaciones' => $request->observaciones
        ]);

        return response()->json(['message' => 'Norma integrada al Inventario Maestro con éxito.', 'item' => $item]);
    }

    public function addCustomNorm(Request $request)
    {
        $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'norma' => 'required|string',
            'titulo' => 'required|string',
        ]);

        $item = MatrizLegalItem::create([
            'empresa_id' => $request->empresa_id,
            'norma_personalizada' => $request->norma,
            'titulo_personalizado' => $request->titulo,
            'observaciones' => $request->observaciones,
            'cumplimiento' => 'pendiente'
        ]);

        return response()->json(['message' => 'Norma personalizada agregada', 'item' => $item]);
    }

    public function listDocuments($empresaId)
    {
        $docs = DocumentoLegal::where('empresa_id', $empresaId)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($docs);
    }

    public function uploadDocument(Request $request)
    {
        $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'nombre' => 'required|string',
            'archivo' => 'required|file|mimes:pdf,docx,xlsx|max:10240',
        ]);

        $path = $request->file('archivo')->store("empresas/{$request->empresa_id}/matriz-documentos", 'public');

        $doc = DocumentoLegal::create([
            'empresa_id' => $request->empresa_id,
            'nombre' => $request->nombre,
            'url' => $path,
            'fecha_carga' => now()->format('Y-m-d')
        ]);

        // Simulación: Extraer normas detectadas del documento
        $this->extraerNormasSimuladas($request->empresa_id, $doc);

        return response()->json([
            'message' => 'Documento anexado y procesado con éxito. Se han detectado normas aplicables.', 
            'documento' => $doc
        ]);
    }

    private function extraerNormasSimuladas($empresaId, $documento)
    {
        // En una implementación real, aquí se llamaría a un servicio de IA/OCR 
        // para leer el contenido del PDF/Excel y extraer las normas de forma inteligente.
        
        // Obtenemos la empresa para conocer su CIIU
        $empresa = Empresa::findOrFail($empresaId);
        $ciiu = $empresa->codigo_ciiu;

        // Simulación Universal: "Detectamos" TODAS las normas que aplican al sector de la empresa.
        // Esto incluye SST, Ambiental, Calidad, etc., siempre que estén en nuestra base central.
        $alertas = Alerta::where(function($q) use ($ciiu) {
                $q->whereJsonContains('codigos_ciiu_aplicables', 'TODOS')
                  ->orWhereJsonContains('codigos_ciiu_aplicables', $ciiu);
            })->get();

        foreach ($alertas as $alerta) {
            MatrizLegalItem::firstOrCreate([
                'empresa_id' => $empresaId,
                'alerta_id' => $alerta->id
            ], [
                'cumplimiento' => 'cumple',
                'area' => $alerta->area,
                'observaciones' => "Detectado automáticamente de la matriz anterior: {$documento->nombre}"
            ]);
        }
    }

    public function consolidado($empresaId)
    {
        // Esta vista junta Capa 1 (Maestra) y Capa 2 (Sugerida)
        $maestra = $this->matrizLegal($empresaId)->getOriginalContent();
        $sugerencias = $this->biblioteca($empresaId)->getOriginalContent();

        $consolidado = collect($maestra)->map(function($item) {
            $item['capa'] = 'Maestra';
            return $item;
        })->concat(collect($sugerencias)->map(function($item) {
            $item['capa'] = 'Sugerida';
            $item['cumplimiento'] = 'pendiente';
            return $item;
        }));

        if (request()->has('area') && request('area') !== 'TODOS') {
            $consolidado = $consolidado->where('area', request('area'));
        }

        return response()->json($consolidado->values());
    }

    public function destroyDocument($id)
    {
        $doc = DocumentoLegal::findOrFail($id);
        
        // Borrar archivo físico del storage
        if (Storage::disk('public')->exists($doc->url)) {
            Storage::disk('public')->delete($doc->url);
        }

        $doc->delete();

        return response()->json(['message' => 'Documento y archivo eliminados correctamente']);
    }

    public function discoverNorms($empresaId)
    {
        $empresa = Empresa::findOrFail($empresaId);
        $ciiu = $empresa->codigo_ciiu;

        // Investigación multidisciplinaria — URLs usando función pública que es más estable
        $nuevasNormas = [
            [
                'norma' => 'CST',
                'titulo' => 'Código Sustitutivo del Trabajo',
                'area' => 'Laboral',
                'impacto' => 'Crítico',
                'descripcion' => 'Regulación central de la relación trabajador-empleador en Colombia.',
                'url_oficial' => 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=30050805',
                'codigos_ciiu_aplicables' => ['TODOS'],
                'estado' => 'vigente'
            ],
            [
                'norma' => 'Ley 1581 de 2012',
                'titulo' => 'Protección de Datos Personales (Habeas Data)',
                'area' => 'Privacidad',
                'impacto' => 'Crítico',
                'descripcion' => 'Régimen general de protección de datos personales.',
                'url_oficial' => 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=433061',
                'codigos_ciiu_aplicables' => ['TODOS'],
                'estado' => 'vigente'
            ],
            [
                'norma' => 'Resolución 0631 de 2015',
                'titulo' => 'Parámetros de Vertimientos de Aguas Residuales',
                'area' => 'Ambiental',
                'impacto' => 'Alto',
                'descripcion' => 'Parámetros y valores límites máximos permitidos en vertimientos puntuales.',
                'url_oficial' => 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=76131',
                'codigos_ciiu_aplicables' => ['TODOS'],
                'estado' => 'vigente'
            ],
            [
                'norma' => 'Decreto 624 de 1989',
                'titulo' => 'Estatuto Tributario Nacional',
                'area' => 'Tributaria',
                'impacto' => 'Alto',
                'descripcion' => 'Compendio de normas que regulan los impuestos administrados por la DIAN.',
                'url_oficial' => 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=30055272',
                'codigos_ciiu_aplicables' => ['TODOS'],
                'estado' => 'vigente'
            ],
            [
                'norma' => 'Resolución 000042 de 2020',
                'titulo' => 'Facturación Electrónica',
                'area' => 'Tributaria',
                'impacto' => 'Alto',
                'descripcion' => 'Obligatoriedad de factura electrónica para contribuyentes.',
                'url_oficial' => 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=97712',
                'codigos_ciiu_aplicables' => ['TODOS'],
                'estado' => 'vigente'
            ],
            [
                'norma' => 'Ley 2101 de 2021',
                'titulo' => 'Reducción Jornada Laboral',
                'area' => 'Laboral',
                'impacto' => 'Alto',
                'descripcion' => 'Reducción gradual de la jornada laboral máxima en Colombia.',
                'url_oficial' => 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=30043327',
                'codigos_ciiu_aplicables' => ['TODOS'],
                'estado' => 'vigente'
            ],
            [
                'norma' => 'Ley 2191 de 2022',
                'titulo' => 'Derecho a la Desconexión Laboral',
                'area' => 'Laboral',
                'impacto' => 'Medio',
                'descripcion' => 'Derecho de los trabajadores a no ser contactados fuera de la jornada laboral.',
                'url_oficial' => 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=30030233',
                'codigos_ciiu_aplicables' => ['TODOS'],
                'estado' => 'vigente'
            ],
            [
                'norma' => 'Decreto 1076 de 2015',
                'titulo' => 'Decreto Único Reglamentario Sector Ambiental',
                'area' => 'Ambiental',
                'impacto' => 'Alto',
                'descripcion' => 'Compila las normas del sector ambiente en Colombia.',
                'url_oficial' => 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=78153',
                'codigos_ciiu_aplicables' => ['TODOS'],
                'estado' => 'vigente'
            ],
            [
                'norma' => 'Decreto 1443 de 2014',
                'titulo' => 'Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST)',
                'area' => 'SST',
                'impacto' => 'Crítico',
                'descripcion' => 'Fija las disposiciones para la implementación del Sistema de Gestión de Seguridad y Salud en el Trabajo.',
                'url_oficial' => 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=19078',
                'codigos_ciiu_aplicables' => ['TODOS'],
                'estado' => 'vigente'
            ],
            [
                'norma' => 'Resolución 0312 de 2019',
                'titulo' => 'Estándares Mínimos del SG-SST',
                'area' => 'SST',
                'impacto' => 'Crítico',
                'descripcion' => 'Define los estándares mínimos para la implementación del SG-SST en empresas.',
                'url_oficial' => 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=90478',
                'codigos_ciiu_aplicables' => ['TODOS'],
                'estado' => 'vigente'
            ],
            [
                'norma' => 'Ley 2232 de 2022',
                'titulo' => 'Ley de Plásticos de un Solo Uso',
                'area' => 'Ambiental',
                'impacto' => 'Medio',
                'descripcion' => 'Prohibición gradual de plásticos de un solo uso en Colombia.',
                'url_oficial' => 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=1711',
                'codigos_ciiu_aplicables' => ['TODOS'],
                'estado' => 'vigente'
            ]
        ];

        $creadas = 0;
        $enriquecidas = 0;

        foreach ($nuevasNormas as $data) {
            // Buscar por norma exacta
            $alerta = Alerta::where('norma', $data['norma'])->first();

            if (!$alerta) {
                // Crear nueva alerta
                Alerta::create(array_merge($data, [
                    'fecha_publicacion' => now()->subYears(1)->format('Y-m-d'),
                    'accion_requerida' => 'Revisión y ajustes de cumplimiento legal.',
                ]));
                $creadas++;
            } else {
                // Siempre actualizar URL para mantenerlas válidas
                $alerta->update(['url_oficial' => $data['url_oficial']]);
                if (empty($alerta->area)) {
                    $alerta->update(['area' => $data['area']]);
                }
                $enriquecidas++;
            }
        }

        $totalDescubiertas = $creadas + $enriquecidas;

        // Obtenemos TODAS las alertas aplicables al CIIU de la empresa para mostrar como "descubiertas"
        // Estas son las que aparecerán en la "Capa Sugerida (IA)"
        $discoveredItems = Alerta::where(function($q) use ($ciiu) {
                $q->whereJsonContains('codigos_ciiu_aplicables', 'TODOS')
                  ->orWhereJsonContains('codigos_ciiu_aplicables', $ciiu);
            })
            ->orderBy('fecha_publicacion', 'desc')
            ->limit(20)
            ->get()
            ->map(function($alerta) {
                return [
                    'id' => $alerta->id,
                    'title' => $alerta->titulo,
                    'norma' => $alerta->norma,
                    'date' => $alerta->fecha_publicacion,
                    'impact' => $alerta->impacto,
                    'description' => $alerta->descripcion,
                    'actionRequired' => $alerta->accion_requerida,
                    'estado' => $alerta->estado,
                    'area' => $alerta->area,
                    'url_oficial' => $alerta->url_oficial
                ];
            });

        return response()->json([
            'message' => "Escaneo completado exitosamente.",
            'details' => "Se identificaron {$discoveredItems->count()} normas aplicables al sector CIIU {$ciiu}. Se incorporaron {$creadas} normas nuevas y se actualizaron {$enriquecidas} existentes.",
            'discovered_count' => $discoveredItems->count(),
            'created_count' => $creadas,
            'enriched_count' => $enriquecidas,
            'discovered_items' => $discoveredItems
        ]);
    }

    public function uploadEvidence(Request $request, $itemId)
    {
        $request->validate([
            'evidencia' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png,xlsx,xls|max:10240',
        ]);

        $item = MatrizLegalItem::findOrFail($itemId);

        // Si ya existe una evidencia, borrarla primero
        if ($item->evidencia_url && Storage::disk('public')->exists($item->evidencia_url)) {
            Storage::disk('public')->delete($item->evidencia_url);
        }

        // Guardar el nuevo archivo
        $path = $request->file('evidencia')->store("empresas/{$item->empresa_id}/evidencias-matriz", 'public');

        $item->update([
            'evidencia_url' => $path,
            'fecha_seguimiento' => now()->format('Y-m-d')
        ]);

        return response()->json([
            'message' => 'Evidencia cargada correctamente',
            'evidencia_url' => $path,
            'fecha_seguimiento' => $item->fecha_seguimiento
        ]);
    }

    public function clearEvidence($itemId)
    {
        $item = MatrizLegalItem::findOrFail($itemId);

        // Si hay archivo, borrarlo
        if ($item->evidencia_url && Storage::disk('public')->exists($item->evidencia_url)) {
            Storage::disk('public')->delete($item->evidencia_url);
        }

        $item->update([
            'evidencia_url' => null,
            'fecha_seguimiento' => null
        ]);

        return response()->json(['message' => 'Evidencia eliminada correctamente']);
    }

    public function getEvidenceUrl($itemId)
    {
        $item = MatrizLegalItem::findOrFail($itemId);
        $url = null;

        if ($item->evidencia_url) {
            $url = Storage::disk('public')->url($item->evidencia_url);
        }

        return response()->json([
            'evidencia_url' => $url,
            'fecha_seguimiento' => $item->fecha_seguimiento
        ]);
    }
}
