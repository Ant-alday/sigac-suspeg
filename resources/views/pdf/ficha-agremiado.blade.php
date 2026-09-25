<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <style>
        /* DomPDF no entiende Tailwind, así que aquí el CSS va normal y a mano. */
        body { font-family: sans-serif; font-size: 12px; color: #1F2937; }
        .encabezado { border-bottom: 3px solid #0F4C5C; padding-bottom: 10px; margin-bottom: 20px; }
        .encabezado h1 { color: #0A3540; font-size: 18px; margin: 0; }
        .encabezado p { color: #6B7280; font-size: 10px; margin: 2px 0 0; }
        .folio { float: right; text-align: right; font-size: 10px; color: #6B7280; }
        table.datos { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table.datos td { padding: 6px 8px; border-bottom: 1px solid #E5E7EB; vertical-align: top; }
        table.datos td.etiqueta { width: 35%; font-weight: bold; color: #6B7280; font-size: 10px; text-transform: uppercase; }
        .aviso { margin-top: 20px; font-size: 9px; color: #9CA3AF; font-style: italic; }
    </style>
</head>
<body>
    <div class="folio">
        Folio: {{ $folio }}<br>
        Generado: {{ $fechaGeneracion->format('d/m/Y H:i') }}
    </div>
    <div class="encabezado">
        <h1>Ficha del Agremiado — SUSPEG Sección 75</h1>
        <p>Sistema SIGAC · Secretaría de Organización</p>
    </div>

    <table class="datos">
        <tr><td class="etiqueta">No. de padrón</td><td>{{ $agremiado->no_padron }}</td></tr>
        <tr><td class="etiqueta">No. de empleado</td><td>{{ $agremiado->numero_empleado }}</td></tr>
        <tr><td class="etiqueta">Nombre completo</td><td>{{ $agremiado->nombre_completo }}</td></tr>
        <tr><td class="etiqueta">CURP</td><td>{{ $agremiado->curp }}</td></tr>
        <tr><td class="etiqueta">RFC</td><td>{{ $agremiado->rfc }}</td></tr>
        <tr><td class="etiqueta">Categoría</td><td>{{ $agremiado->categoria }}</td></tr>
        <tr><td class="etiqueta">Secretaría/Organismo</td><td>{{ $agremiado->dependencia->secretariaOrganismo->nombre }}</td></tr>
        <tr><td class="etiqueta">Dependencia</td><td>{{ $agremiado->dependencia->nombre }}</td></tr>
        <tr><td class="etiqueta">Domicilio</td><td>{{ $agremiado->domicilio }}, {{ $agremiado->ciudad_localidad_municipio }}</td></tr>
        <tr><td class="etiqueta">Teléfono</td><td>{{ $agremiado->telefono }}</td></tr>
        <tr><td class="etiqueta">Correo</td><td>{{ $agremiado->correo }}</td></tr>
        <tr><td class="etiqueta">Estado civil</td><td>{{ $agremiado->estado_civil }}</td></tr>
        <tr><td class="etiqueta">Estatus</td><td>{{ $agremiado->estatus }}</td></tr>
        <tr><td class="etiqueta">Fecha de afiliación</td><td>{{ $agremiado->fecha_afiliacion->format('d/m/Y') }}</td></tr>

        {{-- RF-10: el sueldo y la cuota solo se muestran si el rol lo autoriza --}}
        @if($puedeVerSueldo)
            <tr><td class="etiqueta">Sueldo base</td><td>${{ number_format($agremiado->sueldo_base, 2) }}</td></tr>
            <tr><td class="etiqueta">Cuota SUSPEG (2%)</td><td>${{ number_format($agremiado->cuota_suspeg, 2) }}</td></tr>
        @endif
    </table>

    <p class="aviso">Este documento es un respaldo generado por el sistema SIGAC y no sustituye al expediente físico de afiliación.</p>
</body>
</html>
