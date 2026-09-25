<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

// CU-05: Generar Informe Mensual y Anual, en formato Excel.
class InformeFinancieroExport implements FromArray, WithHeadings
{
    private Collection $egresosPorPartida;
    private float $ingresoTotal;
    private float $egresoTotal;
    private float $remanente;
    private string $etiquetaPeriodo;

    public function __construct(Collection $egresosPorPartida, float $ingresoTotal, float $egresoTotal, float $remanente, string $etiquetaPeriodo)
    {
        $this->egresosPorPartida = $egresosPorPartida;
        $this->ingresoTotal = $ingresoTotal;
        $this->egresoTotal = $egresoTotal;
        $this->remanente = $remanente;
        $this->etiquetaPeriodo = $etiquetaPeriodo;
    }

    public function headings(): array
    {
        return ["Informe Financiero — Periodo: {$this->etiquetaPeriodo}", ''];
    }

    public function array(): array
    {
        $filas = [];
        foreach ($this->egresosPorPartida as $nombrePartida => $total) {
            $filas[] = [$nombrePartida, number_format($total, 2, '.', '')];
        }
        if (empty($filas)) {
            $filas[] = ['Sin egresos registrados en este periodo', ''];
        }

        $filas[] = ['', ''];
        $filas[] = ['Ingreso total (cuota)', number_format($this->ingresoTotal, 2, '.', '')];
        $filas[] = ['Gasto total', number_format($this->egresoTotal, 2, '.', '')];
        $filas[] = ['Remanente', number_format($this->remanente, 2, '.', '')];

        return $filas;
    }
}
