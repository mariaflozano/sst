<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trabajadores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            
            // Datos Laborales Básicos
            $table->string('documento')->nullable(); // Cédula
            $table->string('nombre_completo');
            $table->string('cargo')->nullable();
            $table->date('fecha_ingreso')->nullable();
            $table->enum('estado', ['activo', 'inactivo'])->default('activo');

            // Ficha de Emergencias (NUEVA PRERROGATIVA)
            $table->string('tipo_sangre', 10)->nullable();
            $table->string('contacto_emergencia_nombre')->nullable();
            $table->string('contacto_emergencia_telefono')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trabajadores');
    }
};
