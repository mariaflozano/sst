<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('empresa_matriz_legal', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->foreignId('alerta_id')->nullable()->constrained('alertas')->onDelete('set null');
            
            // Para normas personalizadas que no estén en la biblioteca
            $table->string('norma_personalizada')->nullable();
            $table->string('titulo_personalizado')->nullable();
            
            $table->string('cumplimiento')->default('pendiente'); // cumple, no_cumple, no_aplica, pendiente
            $table->text('observaciones')->nullable();
            $table->string('evidencia_url')->nullable();
            $table->string('fecha_seguimiento')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empresa_matriz_legal');
    }
};
