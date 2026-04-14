<?php

namespace Database\Seeders;

use App\Models\Sucursal;
use App\Models\Empresa;
use Illuminate\Database\Seeder;

class SucursalesSeeder extends Seeder
{
    public function run(): void
    {
        $empresas = Empresa::all();

        foreach ($empresas as $empresa) {
            // Sucursal principal
            Sucursal::create([
                'empresa_id' => $empresa->id,
                'nombre' => 'Sede Principal',
                'direccion' => 'Calle Principal #123',
                'ciudad' => 'Bogotá',
                'telefono' => '601-123-4567',
                'activo' => true,
            ]);

            // Sucursales adicionales de ejemplo
            Sucursal::create([
                'empresa_id' => $empresa->id,
                'nombre' => 'Sucursal Norte',
                'direccion' => 'Av. Libertador #456',
                'ciudad' => 'Bogotá',
                'telefono' => '601-765-4321',
                'activo' => true,
            ]);

            Sucursal::create([
                'empresa_id' => $empresa->id,
                'nombre' => 'Planta de Producción',
                'direccion' => 'Zona Industrial #789',
                'ciudad' => 'Medellín',
                'telefono' => '604-555-1234',
                'activo' => true,
            ]);
        }
    }
}
