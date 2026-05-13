<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TareaHallazgo extends Model
{
    protected $table = 'tareas_hallazgos';

    protected $fillable = [
        'hallazgo_id',
        'actividad',
        'tipo_phva',
        'responsable',
        'fecha_inicio',
        'fecha_fin',
        'estado',
    ];

    protected $casts = [
        'responsable' => 'array',
    ];

    public function hallazgo()
    {
        return $this->belongsTo(AuditoriaHallazgo::class, 'hallazgo_id');
    }
}
