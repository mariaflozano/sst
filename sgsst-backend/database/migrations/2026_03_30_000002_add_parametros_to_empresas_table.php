<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            // ARL
            $table->string('arl_nombre')->nullable();
            $table->string('arl_nit')->nullable();
            $table->string('arl_telefono')->nullable();
            $table->string('arl_direccion')->nullable();

            // Representante Legal
            $table->string('rep_legal_nombre')->nullable();
            $table->string('rep_legal_cedula')->nullable();
            $table->string('rep_legal_cargo')->nullable();
            $table->string('rep_legal_firma_url')->nullable();

            // Branding
            $table->string('logo_url')->nullable();
            $table->string('sitio_web')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $table->dropColumn([
                'arl_nombre',
                'arl_nit',
                'arl_telefono',
                'arl_direccion',
                'rep_legal_nombre',
                'rep_legal_cedula',
                'rep_legal_cargo',
                'rep_legal_firma_url',
                'logo_url',
                'sitio_web',
            ]);
        });
    }
};
