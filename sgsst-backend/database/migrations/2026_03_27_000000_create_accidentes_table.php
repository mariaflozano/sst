<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accidentes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->unsignedBigInteger('sucursal_id')->nullable();

            // Datos del trabajador
            $table->string('nombre_trabajador');
            $table->string('documento_identidad');
            $table->string('cargo');
            $table->string('area')->nullable();
            $table->string('tipo_contrato')->nullable();
            $table->string('antiguedad')->nullable();

            // Datos del accidente
            $table->date('fecha_evento');
            $table->string('hora_evento')->nullable();
            $table->date('fecha_reporte')->nullable();
            $table->string('lugar_exacto')->nullable();
            $table->string('tipo_accidente')->nullable();
            $table->string('tipo_evento'); // Incidente, Accidente Leve, Accidente Grave, Mortal, Enfermedad Laboral
            $table->text('descripcion');

            // Consecuencias
            $table->string('tipo_lesion')->nullable();
            $table->string('parte_cuerpo')->nullable();
            $table->string('clasificacion_accidente')->nullable();
            $table->integer('dias_incapacidad')->default(0);

            // Info adicional
            $table->json('testigos')->nullable();
            $table->string('jefe_inmediato')->nullable();
            $table->boolean('reportado_arl')->default(false);
            $table->date('fecha_reporte_arl')->nullable();
            $table->string('numero_radicado_arl')->nullable();

            // Estado
            $table->string('estado')->default('Reportado'); // Reportado, Investigacion, Cerrado
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accidentes');
    }
};
