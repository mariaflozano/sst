<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plan_anual', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');

            // Identificación de actividad
            $table->string('actividad');
            $table->string('estandar_referencia')->nullable(); // ej: "2.4.1"
            $table->string('phva_etapa'); // Planear, Hacer, Verificar, Actuar
            $table->string('categoria')->nullable(); // Capacitación, Salud, IPERC, Emergencias, etc.

            // Planificación
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->integer('trimestre'); // 1, 2, 3 o 4

            // Responsabilidad
            $table->string('responsable');
            $table->string('cargo_responsable')->nullable();
            $table->string('area')->nullable();

            // Recursos y presupuesto
            $table->decimal('presupuesto', 12, 2)->nullable();
            $table->string('recurso_necesario')->nullable();

            // Indicadores
            $table->string('indicador')->nullable();
            $table->string('meta')->nullable();
            $table->string('unidad_meta')->nullable(); // %, #, días, etc.
            $table->decimal('valor_inicial', 10, 2)->nullable();

            // Seguimiento
            $table->string('estado')->default('Pendiente'); // Pendiente, En Proceso, Completada, Vencida
            $table->date('fecha_ejecucion_real')->nullable();
            $table->text('observaciones')->nullable();
            $table->text('resultado_indicador')->nullable();

            // Evidencia
            $table->string('url_evidencia')->nullable();

            // Prioridad y origen
            $table->string('prioridad')->default('Media'); // Alta, Media, Baja
            $table->boolean('generado_diagnostico')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_anual');
    }
};
