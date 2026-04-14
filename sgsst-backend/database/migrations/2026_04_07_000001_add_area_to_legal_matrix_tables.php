<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('alertas', function (Blueprint $table) {
            if (!Schema::hasColumn('alertas', 'area')) {
                $table->string('area')->default('SST')->after('norma');
            }
        });

        Schema::table('empresa_matriz_legal', function (Blueprint $table) {
            if (!Schema::hasColumn('empresa_matriz_legal', 'area')) {
                $table->string('area')->nullable()->after('alerta_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('alertas', function (Blueprint $table) {
            $table->dropColumn('area');
        });

        Schema::table('empresa_matriz_legal', function (Blueprint $table) {
            $table->dropColumn('area');
        });
    }
};
