<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ReporteCasosExport implements FromArray, WithHeadings
{
    private Collection $resumen;

    public function __construct(Collection $resumen)
    {
        $this->resumen = $resumen;
    }

    public function headings(): array
    {
        return ['Tipo de caso', 'Trabajador', 'Estatus'];
    }

    public function array(): array
    {
        $filas = [];
        foreach ($this->resumen as $tipoCaso => $datos) {
            foreach ($datos['casos'] as $c) {
                $filas[] = [$tipoCaso, $c['trabajador'], $c['estatus']];
            }
            $filas[] = ["TOTAL {$tipoCaso}", '', $datos['total']];
            $filas[] = ['', '', ''];
        }

        return $filas;
    }
}
