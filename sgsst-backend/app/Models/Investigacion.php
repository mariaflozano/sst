<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Investigacion extends Model
{
    protected $table = 'investigaciones';

    protected $fillable = [
        'accidente_id',
        'empresa_id',
        'estado',
        'fecha_limite',
        'fecha_cierre',
        'alerta_enviada',
        'responsable_sst',
        'jefe_inmediato_investigador',
        'incluye_copasst',
        'integrantes_copasst',
        'metodologia',
        'secuencia_hechos',
        'causas_inmediatas_actos',
        'causas_inmediatas_condiciones',
        'causas_basicas_personales',
        'causas_basicas_trabajo',
        'tipo_lesion',
        'parte_cuerpo',
        'clasificacion_accidente',
        'testigos',
        'jefe_inmediato',
        'reportado_arl',
        'fecha_reporte_arl',
        'numero_radicado_arl',
        'acciones_correctivas',
        'acciones_preventivas',
        'eficacia_verificada',
        'fecha_verificacion_eficacia',
        'observaciones_cierre',
    ];

    protected $casts = [
        'fecha_limite' => 'date',
        'fecha_cierre' => 'date',
        'fecha_reporte_arl' => 'date',
        'fecha_verificacion_eficacia' => 'date',
        'alerta_enviada' => 'boolean',
        'incluye_copasst' => 'boolean',
        'eficacia_verificada' => 'boolean',
        'integrantes_copasst' => 'array',
        'testigos' => 'array',
        'causas_inmediatas_actos' => 'array',
        'causas_inmediatas_condiciones' => 'array',
        'causas_basicas_personales' => 'array',
        'causas_basicas_trabajo' => 'array',
    ];

    public function accidente()
    {
        return $this->belongsTo(Accidente::class);
    }

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    public function acciones()
    {
        return $this->hasMany(InvestigacionAccion::class, 'investigacion_id');
    }

    public function accionesCorrectivas()
    {
        return $this->acciones()->where('tipo', 'correctiva');
    }

    public function accionesPreventivas()
    {
        return $this->acciones()->where('tipo', 'preventiva');
    }

    // Días restantes para cerrar la investigación
    public function getDiasRestantesAttribute()
    {
        if ($this->fecha_cierre) return 0;
        return now()->diffInDays($this->fecha_limite, false);
    }

    // Verificar si está vencido
    public function getVencidoAttribute()
    {
        return $this->diasRestantes < 0 && !$this->fecha_cierre;
    }
}
