<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabla principal de investigaciones (una por accidente grave/mortal)
        Schema::create('investigaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('accidente_id')->constrained('accidentes')->onDelete('cascade');
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');

            // Estado y plazos
            $table->string('estado')->default('Pendiente'); // Pendiente, En Proceso, Cerrado
            $table->date('fecha_limite'); // 15 días según Resolución 1401
            $table->date('fecha_cierre')->nullable();
            $table->boolean('alerta_enviada')->default(false);

            // Equipo investigador
            $table->string('responsable_sst')->nullable();
            $table->string('jefe_inmediato_investigador')->nullable();
            $table->boolean('incluye_copasst')->default(false);
            $table->string('integrantes_copasst')->nullable(); // JSON array

            // Metodología usada
            $table->string('metodologia')->default('5 Porques'); // 5 Porques, Árbol de Causas, Ishikawa

            // Análisis del evento
            $table->text('secuencia_hechos')->nullable();
            $table->text('causas_inmediatas_actos')->nullable(); // JSON array
            $table->text('causas_inmediatas_condiciones')->nullable(); // JSON array
            $table->text('causas_basicas_personales')->nullable(); // JSON array
            $table->text('causas_basicas_trabajo')->nullable(); // JSON array

            // Consecuencias
            $table->string('tipo_lesion')->nullable();
            $table->string('parte_cuerpo')->nullable();
            $table->string('clasificacion_accidente')->nullable(); // Leve, Grave, Mortal

            // Información adicional
            $table->text('testigos')->nullable(); // JSON array {nombre, contacto, testimonio}
            $table->string('jefe_inmediato')->nullable();
            $table->boolean('reportado_arl')->default(false);
            $table->date('fecha_reporte_arl')->nullable();
            $table->string('numero_radicado_arl')->nullable();

            // Seguimiento
            $table->text('acciones_correctivas')->nullable(); // JSON array
            $table->text('acciones_preventivas')->nullable(); // JSON array

            // Verificación de eficacia
            $table->boolean('eficacia_verificada')->default(false);
            $table->date('fecha_verificacion_eficacia')->nullable();
            $table->text('observaciones_cierre')->nullable();

            $table->timestamps();
        });

        // Tabla para acciones (correctivas y preventivas)
        Schema::create('investigacion_acciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('investigacion_id')->constrained('investigaciones')->onDelete('cascade');
            $table->string('tipo'); // correctiva, preventiva
            $table->text('descripcion');
            $table->string('responsable')->nullable();
            $table->date('fecha_ejecucion')->nullable();
            $table->string('estado')->default('Abierta'); // Abierta, En Proceso, Cerrada, Verificada
            $table->date('fecha_cierre_accion')->nullable();
            $table->boolean('eficaz')->nullable(); // null=pendiente, true=eficaz, false=no eficaz
            $table->text('resultado_verificacion')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('investigacion_acciones');
        Schema::dropIfExists('investigaciones');
    }
};
