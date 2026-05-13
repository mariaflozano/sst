<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Trabajador extends Model
{
    protected $table = 'trabajadores';

    protected $fillable = [
        'empresa_id',
        'documento',
        'nombre_completo',
        'cargo',
        'fecha_ingreso',
        'estado',
        'tipo_sangre',
        'contacto_emergencia_nombre',
        'contacto_emergencia_telefono',
        'auditor',
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    public function ausentismos()
    {
        return $this->hasMany(Ausentismo::class);
    }
}
