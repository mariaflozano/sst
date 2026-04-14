<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvestigacionAccion extends Model
{
    protected $table = 'investigacion_acciones';

    protected $fillable = [
        'investigacion_id',
        'tipo',
        'descripcion',
        'responsable',
        'fecha_ejecucion',
        'estado',
        'fecha_cierre_accion',
        'eficaz',
        'resultado_verificacion',
    ];

    protected $casts = [
        'fecha_ejecucion' => 'date',
        'fecha_cierre_accion' => 'date',
        'eficaz' => 'boolean',
    ];

    public function investigacion()
    {
        return $this->belongsTo(Investigacion::class, 'investigacion_id');
    }
}
