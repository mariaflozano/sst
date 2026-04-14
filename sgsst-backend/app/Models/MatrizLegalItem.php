<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatrizLegalItem extends Model
{
    protected $table = 'empresa_matriz_legal';

    protected $fillable = [
        'empresa_id',
        'alerta_id',
        'norma_personalizada',
        'titulo_personalizado',
        'cumplimiento',
        'observaciones',
        'evidencia_url',
        'fecha_seguimiento',
        'area',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class);
    }

    public function alerta(): BelongsTo
    {
        return $this->belongsTo(Alerta::class, 'alerta_id');
    }
}
