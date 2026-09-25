<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #1F2937; }
        .encabezado { border-bottom: 3px solid #0F4C5C; padding-bottom: 10px; margin-bottom: 20px; }
        .encabezado h1 { color: #0A3540; font-size: 18px; margin: 0; }
        .folio { float: right; text-align: right; font-size: 10px; color: #6B7280; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table th { background: #F1F5F9; text-align: left; padding: 6px 8px; font-size: 9px; text-transform: uppercase; color: #6B7280; }
        table td { padding: 6px 8px; border-bottom: 1px solid #E5E7EB; }
        .resumen { margin-top: 20px; width: 50%; margin-left: auto; }
        .resumen td { padding: 5px 8px; }
        .resumen .etiqueta { font-weight: bold; color: #6B7280; }
        .remanente-positivo { color: #059669; font-weight: bold; }
        .remanente-negativo { color: #DC2626; font-weight: bold; }
    </style>
</head>
<body>
    <div class="folio">
        Folio: {{ $folio }}<br>
        Generado: {{ $fechaGeneracion->format('d/m/Y H:i') }}
    </div>
    <div class="encabezado">
        <h1>Informe Financiero — SUSPEG Sección 75</h1>
        <p>Periodo: {{ $etiquetaPeriodo }}</p>
    </div>

    <table>
        <tr><th>Partida</th><th>Egresos del periodo</th></tr>
        @forelse($egresosPorPartida as $nombrePartida => $total)
            <tr><td>{{ $nombrePartida }}</td><td>${{ number_format($total, 2) }}</td></tr>
        @empty
            <tr><td colspan="2" style="color:#9CA3AF; font-style: italic;">Sin egresos registrados en este periodo</td></tr>
        @endforelse
    </table>

    <table class="resumen">
        <tr><td class="etiqueta">Ingreso total (cuota)</td><td>${{ number_format($ingresoTotal, 2) }}</td></tr>
        <tr><td class="etiqueta">Gasto total</td><td>${{ number_format($egresoTotal, 2) }}</td></tr>
        <tr>
            <td class="etiqueta">Remanente</td>
            <td class="{{ $remanente >= 0 ? 'remanente-positivo' : 'remanente-negativo' }}">
                ${{ number_format($remanente, 2) }}
            </td>
        </tr>
    </table>
</body>
</html>
