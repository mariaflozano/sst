<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Metadatos por año de evaluación (estado, fechas)
        Schema::create('empresa_evaluacion_anios', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('empresa_id');
            $table->unsignedSmallInteger('anio');
            $table->enum('estado', ['abierta', 'cerrada'])->default('abierta');
            $table->string('fecha_apertura')->nullable();
            $table->string('fecha_cierre')->nullable();
            $table->timestamps();

            $table->unique(['empresa_id', 'anio']);
            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
        });

        // Calificaciones individuales por estándar / año
        Schema::create('empresa_evaluaciones', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('empresa_id');
            $table->unsignedSmallInteger('anio');
            $table->unsignedSmallInteger('estandar_id');
            $table->enum('calificacion', ['cumple', 'no_cumple', 'no_aplica']);
            $table->timestamps();

            $table->unique(['empresa_id', 'anio', 'estandar_id']);
            $table->index(['empresa_id', 'anio']);
            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empresa_evaluaciones');
        Schema::dropIfExists('empresa_evaluacion_anios');
    }
};
