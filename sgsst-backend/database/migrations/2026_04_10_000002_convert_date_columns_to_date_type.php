<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Convertir fecha_carga de string a date en empresa_documentos_legales
        DB::statement("ALTER TABLE empresa_documentos_legales MODIFY COLUMN fecha_carga DATE");

        // Convertir fecha_seguimiento de string a date en empresa_matriz_legal
        DB::statement("ALTER TABLE empresa_matriz_legal MODIFY COLUMN fecha_seguimiento DATE");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE empresa_documentos_legales MODIFY COLUMN fecha_carga VARCHAR(255)");
        DB::statement("ALTER TABLE empresa_matriz_legal MODIFY COLUMN fecha_seguimiento VARCHAR(255)");
    }
};
