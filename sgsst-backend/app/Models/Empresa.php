<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    protected $table = 'empresas';

    protected $fillable = [
        'tenant_id',
        'nombre',
        'trabajadores',
        'nivel_riesgo',
        'codigo_ciiu',
        'cantidad_estandares',
        'clasificacion',
        'direccion',
        'ciudad',
        'telefono',
        'email',
        // ARL
        'arl_nombre',
        'arl_nit',
        'arl_telefono',
        'arl_direccion',
        // Representante Legal
        'rep_legal_nombre',
        'rep_legal_cedula',
        'rep_legal_cargo',
        'rep_legal_firma_url',
        // Branding
        'logo_url',
        'sitio_web',
    ];
}
