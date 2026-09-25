<?php

namespace Database\Seeders;

use App\Models\PartidaPresupuestal;
use Illuminate\Database\Seeder;

// Carga las 9 partidas presupuestales oficiales de la Sección, con el
// monto mensual asignado a cada una, tomado directamente del informe
// financiero real (enero 2025). saldo_actual arranca igual al monto
// asignado, porque al inicio del periodo todavía no se ha gastado nada.
//
// Para correrlo: php artisan db:seed --class=PartidasPresupuestalesSeeder
class PartidasPresupuestalesSeeder extends Seeder
{
    public function run(): void
    {
        $partidas = [
            ['nombre' => 'Servicios de Arrendamiento', 'monto_asignado' => 12000.00],
            ['nombre' => 'Servicio de Teléfono, Internet y Luz', 'monto_asignado' => 399.00],
            ['nombre' => 'Servicio de Asesoría Jurídica', 'monto_asignado' => 6000.00],
            ['nombre' => 'Viáticos', 'monto_asignado' => 14126.36],
            ['nombre' => 'Gastos de Orden Social y Cultural', 'monto_asignado' => 25900.00],
            ['nombre' => 'Papelería y Material de Limpieza', 'monto_asignado' => 3256.00],
            ['nombre' => 'Materiales, Útiles y Equipos Menores de Oficina', 'monto_asignado' => 0.00],
            ['nombre' => 'Refacciones y Accesorios Menores de Equipo de Transporte', 'monto_asignado' => 0.00],
            ['nombre' => 'Contingencias', 'monto_asignado' => 29000.00],
        ];

        foreach ($partidas as $partida) {
            PartidaPresupuestal::updateOrCreate(
                ['nombre' => $partida['nombre']],
                [
                    'monto_asignado' => $partida['monto_asignado'],
                    'saldo_actual' => $partida['monto_asignado'],
                ]
            );
        }
    }
}
