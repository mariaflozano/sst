<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Accidente extends Model
{
    protected $table = 'accidentes';

    protected $fillable = [
        'empresa_id',
        'sucursal_id',
        'fecha_evento',
        'tipo_evento',
        'nombre_trabajador',
        'documento_identidad',
        'cargo',
        'area',
        'tipo_contrato',
        'antiguedad',
        'descripcion',
        'estado',
        'dias_incapacidad',
        // Datos del accidente
        'hora_evento',
        'fecha_reporte',
        'lugar_exacto',
        'tipo_accidente',
        // Consecuencias
        'tipo_lesion',
        'parte_cuerpo',
        'clasificacion_accidente',
        // Info adicional
        'testigos',
        'jefe_inmediato',
        'reportado_arl',
        'fecha_reporte_arl',
        'numero_radicado_arl',
    ];

    protected $casts = [
        'testigos' => 'array',
        'reportado_arl' => 'boolean',
        'fecha_evento' => 'date',
        'fecha_reporte' => 'date',
        'fecha_reporte_arl' => 'date',
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    public function sucursal()
    {
        return $this->belongsTo(Sucursal::class);
    }

    public function investigacion()
    {
        return $this->hasOne(Investigacion::class);
    }
}
