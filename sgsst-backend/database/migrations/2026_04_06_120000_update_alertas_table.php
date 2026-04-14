<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alertas', function (Blueprint $table) {
            $table->string('estado')->default('vigente'); // vigente, derogada
            $table->unsignedBigInteger('sustituida_por')->nullable(); // ID de la norma que la deroga
            
            $table->foreign('sustituida_por')->references('id')->on('alertas')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('alertas', function (Blueprint $table) {
            $table->dropForeign(['sustituida_por']);
            $table->dropColumn(['estado', 'sustituida_por']);
        });
    }
};
