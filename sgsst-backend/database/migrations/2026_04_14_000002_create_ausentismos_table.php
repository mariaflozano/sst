<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ausentismos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trabajador_id')->constrained('trabajadores')->onDelete('cascade');
            
            // Ficha de ausencia
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->integer('dias_incapacidad');
            
            // Tipificación Legal
            $table->enum('causa', [
                'Enfermedad Común',
                'Enfermedad Laboral',
                'Accidente de Trabajo',
                'Accidente Común',
                'Licencia Maternidad/Paternidad',
                'Licencia Luto',
                'Permiso Remunerado',
                'Permiso No Remunerado',
                'Inasistencia Injustificada'
            ]);
            
            $table->text('observaciones')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ausentismos');
    }
};
