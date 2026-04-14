<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $table->string('codigo_invitacion', 12)
                ->nullable()
                ->unique()
                ->after('sitio_web');

            $table->boolean('activo')
                ->default(true)
                ->after('codigo_invitacion');
        });
    }

    public function down(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $table->dropColumn(['codigo_invitacion', 'activo']);
        });
    }
};
