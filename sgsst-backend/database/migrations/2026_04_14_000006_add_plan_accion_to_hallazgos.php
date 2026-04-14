<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('auditoria_hallazgos', function (Blueprint $table) {
            $table->text('plan_accion')->nullable()->after('estado');
            $table->string('responsable')->nullable()->after('plan_accion');
            $table->date('fecha_compromiso')->nullable()->after('responsable');
        });
    }

    public function down(): void
    {
        Schema::table('auditoria_hallazgos', function (Blueprint $table) {
            $table->dropColumn(['plan_accion', 'responsable', 'fecha_compromiso']);
        });
    }
};
