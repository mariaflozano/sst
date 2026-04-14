<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auditorias', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('empresa_id');
            $table->string('codigo')->unique();
            $table->string('alcance');
            $table->string('auditor_nombre');
            $table->string('auditor_perfil');
            $table->date('fecha_programada');
            $table->date('fecha_realizacion')->nullable();
            $table->enum('estado', ['Programada', 'En Proceso', 'Realizada', 'Cancelada'])->default('Programada');
            $table->text('conclusiones_generales')->nullable();
            $table->timestamps();

            $table->index('empresa_id');
            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
        });

        Schema::create('auditoria_hallazgos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('auditoria_id');
            $table->enum('tipo_hallazgo', ['No Conformidad Mayor', 'No Conformidad Menor', 'Oportunidad de Mejora', 'Observación']);
            $table->string('requisito_incumplido')->nullable();
            $table->text('descripcion');
            $table->enum('estado', ['Abierto', 'En Plan de Acción', 'Cerrado'])->default('Abierto');
            $table->timestamps();

            $table->index('auditoria_id');
            $table->foreign('auditoria_id')->references('id')->on('auditorias')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auditoria_hallazgos');
        Schema::dropIfExists('auditorias');
    }
};
