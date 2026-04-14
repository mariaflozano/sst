<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Eliminar duplicados existentes antes de agregar el constraint único
        DB::statement('
            DELETE FROM empresa_alerta_leidas
            WHERE id NOT IN (
                SELECT MIN(id) FROM empresa_alerta_leidas
                GROUP BY empresa_id, alerta_id
            )
        ');

        Schema::table('empresa_alerta_leidas', function (Blueprint $table) {
            $table->unique(['empresa_id', 'alerta_id'], 'empresa_alerta_leidas_empresa_alerta_unique');
        });
    }

    public function down(): void
    {
        Schema::table('empresa_alerta_leidas', function (Blueprint $table) {
            $table->dropUnique('empresa_alerta_leidas_empresa_alerta_unique');
        });
    }
};
