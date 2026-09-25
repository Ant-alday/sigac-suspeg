<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; font-size: 11px; color: #1F2937; }
        .encabezado { border-bottom: 3px solid #0F4C5C; padding-bottom: 10px; margin-bottom: 20px; }
        .encabezado h1 { color: #0A3540; font-size: 18px; margin: 0; }
        .folio { float: right; text-align: right; font-size: 10px; color: #6B7280; }
        h2.grupo { background: #0F4C5C; color: white; padding: 6px 10px; font-size: 12px; margin-top: 18px; }
        table { width: 100%; border-collapse: collapse; }
        table th { background: #F1F5F9; text-align: left; padding: 5px 8px; font-size: 9px; text-transform: uppercase; color: #6B7280; }
        table td { padding: 5px 8px; border-bottom: 1px solid #E5E7EB; }
    </style>
</head>
<body>
    <div class="folio">Folio: {{ $folio }}<br>Generado: {{ $fechaGeneracion->format('d/m/Y H:i') }}</div>
    <div class="encabezado">
        <h1>Reporte de Beneficiarios por Insumo — Periodo: {{ $etiquetaPeriodo }}</h1>
    </div>

    @forelse($resumen as $nombreInsumo => $datos)
        <h2 class="grupo">{{ $nombreInsumo }} — Total: {{ $datos['total_cantidad'] }}</h2>
        <table>
            <tr><th>Beneficiario</th><th>Cantidad</th></tr>
            @foreach($datos['beneficiarios'] as $b)
                <tr><td>{{ $b['nombre'] }}</td><td>{{ $b['cantidad'] }}</td></tr>
            @endforeach
        </table>
    @empty
        <p style="color:#9CA3AF; font-style: italic;">Sin solicitudes registradas en este año.</p>
    @endforelse
</body>
</html>
