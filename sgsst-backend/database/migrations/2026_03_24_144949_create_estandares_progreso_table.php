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
        Schema::create('estandares_progreso', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->integer('estandar_id'); // ID único del estándar en el frontend
            $table->string('estado')->default('pendiente'); // pendiente, cumplido
            $table->string('fecha_registro')->nullable();
            $table->string('url_evidencia')->nullable();
            $table->timestamps();
            
            // Un estándar solo puede tener un registro por empresa
            $table->unique(['empresa_id', 'estandar_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estandares_progreso');
    }
};
