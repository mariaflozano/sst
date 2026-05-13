<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmpresaEvaluacionAnio extends Model
{
    protected $table = 'empresa_evaluacion_anios';

    protected $fillable = [
        'empresa_id',
        'anio',
        'estado',
        'fecha_apertura',
        'fecha_cierre',
    ];

    public function calificaciones()
    {
        return $this->hasMany(EmpresaEvaluacion::class, 'empresa_id', 'empresa_id')
                    ->where('anio', $this->anio);
    }
}
