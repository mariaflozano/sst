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
        Schema::create('capacitaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->string('tema');
            $table->string('fuente'); // Matriz, Base, Vulnerabilidad
            $table->string('tipo')->default('Interna'); // Interna, Externa
            $table->string('recomienda')->nullable();
            $table->enum('estado', ['Programado', 'En Proceso', 'Ejecutado', 'Vencido'])->default('Programado');
            $table->date('fecha_programada')->nullable();
            $table->time('hora_programada')->nullable();
            $table->date('fecha_ejecucion')->nullable();
            $table->text('evidencia_url')->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('capacitaciones');
    }
};
