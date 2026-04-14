<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $table->string('direccion')->nullable()->after('nombre');
            $table->string('ciudad')->nullable()->after('direccion');
            $table->string('telefono')->nullable()->after('ciudad');
            $table->string('email')->nullable()->after('telefono');
        });
    }

    public function down(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $table->dropColumn(['direccion', 'ciudad', 'telefono', 'email']);
        });
    }
};
