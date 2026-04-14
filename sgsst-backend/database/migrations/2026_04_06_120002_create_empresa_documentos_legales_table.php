<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('empresa_documentos_legales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->string('nombre'); // ej: 'Matriz Inicial 2023'
            $table->string('url'); // archivo PDF/Excel
            $table->string('fecha_carga')->default(now()->format('Y-m-d'));
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empresa_documentos_legales');
    }
};
