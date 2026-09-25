<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ReporteInsumosExport implements FromArray, WithHeadings
{
    private Collection $resumen;

    public function __construct(Collection $resumen)
    {
        $this->resumen = $resumen;
    }

    public function headings(): array
    {
        return ['Insumo', 'Beneficiario', 'Cantidad'];
    }

    public function array(): array
    {
        $filas = [];
        foreach ($this->resumen as $nombreInsumo => $datos) {
            foreach ($datos['beneficiarios'] as $b) {
                $filas[] = [$nombreInsumo, $b['nombre'], $b['cantidad']];
            }
            $filas[] = ["TOTAL {$nombreInsumo}", '', $datos['total_cantidad']];
            $filas[] = ['', '', ''];
        }

        return $filas;
    }
}
