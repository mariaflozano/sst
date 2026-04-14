<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlanAnual extends Model
{
    protected $table = 'plan_anual';

    protected $fillable = [
        'empresa_id',
        'actividad',
        'estandar_referencia',
        'phva_etapa',
        'categoria',
        'fecha_inicio',
        'fecha_fin',
        'trimestre',
        'responsable',
        'cargo_responsable',
        'area',
        'presupuesto',
        'recurso_necesario',
        'indicador',
        'meta',
        'unidad_meta',
        'valor_inicial',
        'estado',
        'fecha_ejecucion_real',
        'observaciones',
        'resultado_indicador',
        'url_evidencia',
        'prioridad',
        'generado_diagnostico',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class);
    }
}
