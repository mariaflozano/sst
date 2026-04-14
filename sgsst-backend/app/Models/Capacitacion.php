<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Capacitacion extends Model
{
    use HasFactory;

    protected $table = 'capacitaciones';

    protected $fillable = [
        'empresa_id',
        'tema',
        'fuente',
        'tipo',
        'recomienda',
        'estado',
        'fecha_programada',
        'hora_programada',
        'fecha_ejecucion',
        'evidencia_url',
        'observaciones'
    ];

    /**
     * Relación con empresa
     */
    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }
}
