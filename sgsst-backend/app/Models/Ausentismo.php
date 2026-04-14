<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ausentismo extends Model
{
    protected $table = 'ausentismos';

    protected $fillable = [
        'trabajador_id',
        'fecha_inicio',
        'fecha_fin',
        'dias_incapacidad',
        'causa',
        'diagnostico',
        'observaciones',
    ];

    // Automatically convert to carbon dates if needed
    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
    ];

    public function trabajador()
    {
        return $this->belongsTo(Trabajador::class);
    }
}
