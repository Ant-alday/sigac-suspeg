<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

// CU-08: Generar Reporte del Padrón Completo, en formato Excel.
// Se arma como "una hoja de Excel por cada estatus" (En proceso, Activo,
// Baja, Base), igual que las secciones del PDF — así, sin importar qué
// formato se elija, el reporte se ve organizado de la misma forma.
class ReportePadronExport implements WithMultipleSheets
{
    private $agremiadosPorEstatus;
    private array $estatusPosibles;
    private bool $puedeVerSueldo;

    public function __construct($agremiadosPorEstatus, array $estatusPosibles, bool $puedeVerSueldo)
    {
        $this->agremiadosPorEstatus = $agremiadosPorEstatus;
        $this->estatusPosibles = $estatusPosibles;
        $this->puedeVerSueldo = $puedeVerSueldo;
    }

    public function sheets(): array
    {
        $hojas = [];
        foreach ($this->estatusPosibles as $estatus) {
            $hojas[] = new HojaEstatusPadronExport(
                $this->agremiadosPorEstatus->get($estatus, collect()),
                $estatus,
                $this->puedeVerSueldo
            );
        }

        return $hojas;
    }
}
