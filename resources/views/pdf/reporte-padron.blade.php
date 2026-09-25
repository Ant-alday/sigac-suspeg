<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; font-size: 11px; color: #1F2937; }
        .encabezado { border-bottom: 3px solid #0F4C5C; padding-bottom: 10px; margin-bottom: 20px; }
        .encabezado h1 { color: #0A3540; font-size: 18px; margin: 0; }
        .folio { float: right; text-align: right; font-size: 10px; color: #6B7280; }
        h2.grupo { background: #0F4C5C; color: white; padding: 6px 10px; font-size: 12px; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; }
        table th { background: #F1F5F9; text-align: left; padding: 5px 8px; font-size: 9px; text-transform: uppercase; color: #6B7280; }
        table td { padding: 5px 8px; border-bottom: 1px solid #E5E7EB; }
        .vacio { padding: 10px; color: #9CA3AF; font-style: italic; }
    </style>
</head>
<body>
    <div class="folio">
        Folio: {{ $folio }}<br>
        Generado: {{ $fechaGeneracion->format('d/m/Y H:i') }}
    </div>
    <div class="encabezado">
        <h1>Reporte del Padrón Completo — SUSPEG Sección 75</h1>
    </div>

    {{-- FA_001: si un grupo de estatus no tiene agremiados, se muestra
         la leyenda en vez de una tabla vacía. --}}
    @foreach($estatusPosibles as $estatus)
        <h2 class="grupo">{{ $estatus }} ({{ $agremiadosPorEstatus->get($estatus, collect())->count() }})</h2>

        @if($agremiadosPorEstatus->get($estatus, collect())->isEmpty())
            <p class="vacio">Sin agremiados en este estatus</p>
        @else
            <table>
                <tr>
                    <th>No. empleado</th>
                    <th>Nombre</th>
                    <th>Dependencia</th>
                    <th>Secretaría/Organismo</th>
                    @if($puedeVerSueldo)<th>Sueldo base</th>@endif
                </tr>
                @foreach($agremiadosPorEstatus->get($estatus) as $agremiado)
                    <tr>
                        <td>{{ $agremiado->numero_empleado }}</td>
                        <td>{{ $agremiado->nombre_completo }}</td>
                        <td>{{ $agremiado->dependencia->nombre }}</td>
                        <td>{{ $agremiado->dependencia->secretariaOrganismo->nombre }}</td>
                        @if($puedeVerSueldo)<td>${{ number_format($agremiado->sueldo_base, 2) }}</td>@endif
                    </tr>
                @endforeach
            </table>
        @endif
    @endforeach
</body>
</html>
