<!DOCTYPE html>
<html lang="es">

<head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SIGAC · SUSPEG Sección 75</title>

    {{-- 👇 ESTA ES LA LÍNEA QUE FALTABA (Debe ir siempre antes de @vite) 👇 --}}
    @viteReactRefresh

    {{-- Esta directiva de Vite inserta automáticamente el CSS y el JS
         compilados (o los sirve en vivo mientras trabajas con npm run dev). --}}
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>

<body class="antialiased">
    {{-- Aquí es donde React "monta" toda la aplicación --}}
    @inertia
</body>

</html>