<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alerta extends Model
{
    protected $table = 'alertas';

    protected $fillable = [
        'titulo',
        'norma',
        'fecha_publicacion',
        'impacto',
        'descripcion',
        'accion_requerida',
        'codigos_ciiu_aplicables',
        'estado',
        'sustituida_por',
        'area',
        'url_oficial',
    ];

    protected $casts = [
        'codigos_ciiu_aplicables' => 'array',
    ];
}
