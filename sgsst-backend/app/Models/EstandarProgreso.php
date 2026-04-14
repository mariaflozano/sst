<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EstandarProgreso extends Model
{
    protected $table = 'estandares_progreso';

    protected $fillable = [
        'empresa_id',
        'estandar_id',
        'estado',
        'fecha_registro',
        'url_evidencia',
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }
}
