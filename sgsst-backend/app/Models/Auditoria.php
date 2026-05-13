<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Auditoria extends Model
{
    protected $fillable = [
        'empresa_id',
        'codigo',
        'proceso_audit',
        'alcance',
        'auditor_nombre',
        'auditor_perfil',
        'fecha_programada',
        'fecha_realizacion',
        'estado',
        'conclusiones_generales',
    ];

    protected $casts = [
        'fecha_programada' => 'date',
        'fecha_realizacion' => 'date',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class);
    }

    public function hallazgos_legales()
    {
        return $this->hasMany(AuditoriaHallazgo::class, 'auditoria_id')->with('tareas');
    }
}
