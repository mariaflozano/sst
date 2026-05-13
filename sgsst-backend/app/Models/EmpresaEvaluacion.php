<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmpresaEvaluacion extends Model
{
    protected $table = 'empresa_evaluaciones';

    protected $fillable = [
        'empresa_id',
        'anio',
        'estandar_id',
        'calificacion',
    ];
}
