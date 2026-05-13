<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('accidentes', function (Blueprint $table) {
            // Eliminamos la restricción de llave foránea si existe
            // Usamos un try-catch o verificamos manualmente si el nombre es el estándar de Laravel
            try {
                $table->dropForeign(['sucursal_id']);
            } catch (\Exception $e) {
                // Si no existe con el nombre estándar, intentamos con el nombre del SQL
                try {
                    $table->dropForeign('accidentes_sucursal_id_foreign');
                } catch (\Exception $e2) {
                    // Ignorar si no se puede eliminar
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('accidentes', function (Blueprint $table) {
            $table->foreign('sucursal_id')->references('id')->on('sucursales')->onDelete('set null');
        });
    }
};
