<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentoLegal extends Model
{
    protected $table = 'empresa_documentos_legales';

    protected $fillable = [
        'empresa_id',
        'nombre',
        'url',
        'fecha_carga',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class);
    }
}
