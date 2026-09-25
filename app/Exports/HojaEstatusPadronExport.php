<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMapping;

class HojaEstatusPadronExport implements FromCollection, WithHeadings, WithTitle, WithMapping
{
    private Collection $agremiados;
    private string $estatus;
    private bool $puedeVerSueldo;

    public function __construct(Collection $agremiados, string $estatus, bool $puedeVerSueldo)
    {
        $this->agremiados = $agremiados;
        $this->estatus = $estatus;
        $this->puedeVerSueldo = $puedeVerSueldo;
    }

    // El nombre de la pestaña dentro del archivo de Excel
    public function title(): string
    {
        return $this->estatus;
    }

    public function collection(): Collection
    {
        // FA_001: si no hay agremiados en este estatus, en vez de dejar
        // la hoja vacía, mandamos una sola "fila" con la leyenda, para
        // que quede igual de claro que en el PDF.
        if ($this->agremiados->isEmpty()) {
            return collect([['__vacio' => true]]);
        }

        return $this->agremiados;
    }

    public function headings(): array
    {
        $columnas = ['No. Empleado', 'Nombre', 'Dependencia', 'Secretaría/Organismo'];
        if ($this->puedeVerSueldo) {
            $columnas[] = 'Sueldo Base';
        }

        return $columnas;
    }

    public function map($agremiado): array
    {
        if (isset($agremiado['__vacio'])) {
            return ['Sin agremiados en este estatus'];
        }

        $fila = [
            $agremiado->numero_empleado,
            $agremiado->nombre_completo,
            $agremiado->dependencia->nombre,
            $agremiado->dependencia->secretariaOrganismo->nombre,
        ];
        if ($this->puedeVerSueldo) {
            $fila[] = number_format((float) $agremiado->sueldo_base, 2);
        }

        return $fila;
    }
}
