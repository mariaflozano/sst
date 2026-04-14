<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alertas', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->string('norma');
            $table->string('fecha_publicacion');
            $table->string('impacto'); // Critico, Alto, Medio, Bajo
            $table->text('descripcion');
            $table->text('accion_requerida');
            $table->json('codigos_ciiu_aplicables'); // Almacenará array de CIIUs como ['0510', '4111'] o ['TODOS']
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alertas');
    }
};
