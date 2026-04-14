<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditoriaHallazgo extends Model
{
    protected $table = 'auditoria_hallazgos';

    protected $fillable = [
        'auditoria_id',
        'tipo_hallazgo',
        'descripcion',
        'requisito_incumplido',
        'estado',
        'plan_accion',
        'responsable',
        'fecha_compromiso',
    ];

    public function auditoria()
    {
        return $this->belongsTo(Auditoria::class);
    }
}
