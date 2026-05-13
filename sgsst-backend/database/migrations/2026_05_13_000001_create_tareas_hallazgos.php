<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Remove plan columns from hallazgos, add fecha_limite_cierre
        Schema::table('auditoria_hallazgos', function (Blueprint $table) {
            $table->date('fecha_limite_cierre')->nullable()->after('estado');
        });

        // Drop old plan columns (added by migration 000006)
        if (Schema::hasColumn('auditoria_hallazgos', 'plan_accion')) {
            Schema::table('auditoria_hallazgos', function (Blueprint $table) {
                $table->dropColumn(['plan_accion', 'responsable', 'fecha_compromiso']);
            });
        }

        // New tasks table
        Schema::create('tareas_hallazgos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('hallazgo_id');
            $table->text('actividad');
            $table->string('responsable')->nullable();
            $table->date('fecha_compromiso')->nullable();
            $table->enum('estado', ['Abierto', 'En Plan de Acción', 'Cerrado', 'Verificado'])->default('Abierto');
            $table->timestamps();

            $table->index('hallazgo_id');
            $table->foreign('hallazgo_id')->references('id')->on('auditoria_hallazgos')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tareas_hallazgos');

        Schema::table('auditoria_hallazgos', function (Blueprint $table) {
            $table->dropColumn('fecha_limite_cierre');
            $table->text('plan_accion')->nullable();
            $table->string('responsable')->nullable();
            $table->date('fecha_compromiso')->nullable();
        });
    }
};
