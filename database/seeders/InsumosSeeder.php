<?php

namespace Database\Seeders;

use App\Models\CategoriaInsumo;
use App\Models\Insumo;
use Illuminate\Database\Seeder;

// Carga las categorías (tarjetas) y los insumos reales de "Insumos
// Enero 2026". Si más adelante se crea una categoría nueva desde la
// pantalla, no hace falta tocar este seeder — es solo la carga inicial.
class InsumosSeeder extends Seeder
{
    public function run(): void
    {
        $porCategoria = [
            'Calentador Solar' => [
                ['nombre' => 'Calentador Solar 100 Lts / 8 Tubos', 'precio_actual' => 2260.00],
                ['nombre' => 'Calentador Solar 120 Lts / 10 Tubos', 'precio_actual' => 2510.00],
                ['nombre' => 'Calentador Solar 150 Lts / 12 Tubos', 'precio_actual' => 2805.00],
                ['nombre' => 'Calentador Solar 180 Lts / 15 Tubos', 'precio_actual' => 3190.00],
                ['nombre' => 'Calentador Solar 210 Lts / 18 Tubos', 'precio_actual' => 3675.00],
                ['nombre' => 'Calentador Solar 230 Lts / 20 Tubos', 'precio_actual' => 4465.00],
                ['nombre' => 'Calentador Solar 280 Lts / 24 Tubos', 'precio_actual' => 5370.00],
                ['nombre' => 'Calentador Solar 330 Lts / 30 Tubos', 'precio_actual' => 6550.00],
            ],
            'Kit de Instalación' => [
                ['nombre' => 'Kit de Instalación (18 pzas, material PPR)', 'precio_actual' => 440.00],
            ],
            'Tinaco' => [
                ['nombre' => 'Tinaco 2,500 Lts (Plus)', 'precio_actual' => 5079.00],
                ['nombre' => 'Tinaco 1,100 Lts (Plus)', 'precio_actual' => 2133.00],
                ['nombre' => 'Tinaco 800 Lts (Plus)', 'precio_actual' => 1980.00],
                ['nombre' => 'Tinaco 450 Lts (Plus)', 'precio_actual' => 1403.00],
                ['nombre' => 'Tinaco 1,100 Lts (Clásico)', 'precio_actual' => 1790.00],
                ['nombre' => 'Tinaco 800 Lts (Clásico)', 'precio_actual' => 1690.00],
                ['nombre' => 'Tamboplas 250 Lts (Negro)', 'precio_actual' => 916.00],
            ],
            'Sistema de Captación Pluvial' => [
                ['nombre' => 'Sistema de Captación Pluvial 10,000 Lts', 'precio_actual' => 64535.00],
            ],
            'Cisterna' => [
                ['nombre' => 'Cisterna 1,200 Lts', 'precio_actual' => 2647.00],
                ['nombre' => 'Cisterna 2,800 Lts', 'precio_actual' => 5756.00],
                ['nombre' => 'Cisterna 5,000 Lts', 'precio_actual' => 11169.00],
                ['nombre' => 'Cisterna 10,000 Lts', 'precio_actual' => 25714.00],
            ],
            'Leche' => [
                ['nombre' => 'Leche Semidescremada UHT (Caja 12 Lts)', 'precio_actual' => 204.00, 'unidad_medida' => 'Caja'],
                ['nombre' => 'Leche Semidescremada UHT (3 Cajas de 12 Lts)', 'precio_actual' => 612.00, 'unidad_medida' => 'Paquete'],
                ['nombre' => 'Fórmula Infacare 1a Etapa (Lata 400g)', 'precio_actual' => 82.00, 'unidad_medida' => 'Lata'],
                ['nombre' => 'Fórmula Infacare 2a Etapa (Lata 400g)', 'precio_actual' => 77.00, 'unidad_medida' => 'Lata'],
            ],
        ];

        foreach ($porCategoria as $nombreCategoria => $insumos) {
            $categoria = CategoriaInsumo::updateOrCreate(['nombre' => $nombreCategoria]);

            foreach ($insumos as $insumo) {
                Insumo::updateOrCreate(
                    ['nombre' => $insumo['nombre']],
                    [
                        'categoria_id' => $categoria->id,
                        'precio_actual' => $insumo['precio_actual'],
                        'unidad_medida' => $insumo['unidad_medida'] ?? 'Pieza',
                    ]
                );
            }
        }
    }
}
