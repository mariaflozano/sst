<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Alerta;
use App\Models\MatrizLegalItem;
use App\Models\Empresa;

class MatrizSimuladaSeeder extends Seeder
{
    public function run(): void
    {
        $empresa = Empresa::first();
        if (!$empresa) return;

        // Buscar algunas normas clave para simular que son las de la matriz legada
        $normasClave = Alerta::whereIn('norma', [
            'Resolución 0312 de 2019',
            'Decreto 1072 de 2015',
            'Ley 1562 de 2012',
            'Resolución 1401 de 2007',
            'Resolución 4272 de 2021'
        ])->get();

        foreach ($normasClave as $alerta) {
            MatrizLegalItem::firstOrCreate([
                'empresa_id' => $empresa->id,
                'alerta_id' => $alerta->id
            ], [
                'cumplimiento' => rand(0, 1) ? 'cumple' : 'pendiente',
                'observaciones' => 'Sincronizado automáticamente desde el anexo detectado.'
            ]);
        }

        // Agregar una norma personalizada total manual para variedad
        MatrizLegalItem::firstOrCreate([
            'empresa_id' => $empresa->id,
            'norma_personalizada' => 'Acuerdo Municipal 001',
            'titulo_personalizado' => 'Regulación Local de Uso de Suelo SST'
        ], [
            'cumplimiento' => 'no_cumple',
            'observaciones' => 'Norma específica de la alcaldía local.'
        ]);
    }
}
