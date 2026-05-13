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
        'fecha_limite_cierre',
    ];

    public function auditoria()
    {
        return $this->belongsTo(Auditoria::class);
    }

    public function tareas()
    {
        return $this->hasMany(TareaHallazgo::class, 'hallazgo_id')->orderBy('created_at');
    }
}
