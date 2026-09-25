<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

// Este middleware es el "puente" entre Laravel e Inertia. Le dice a
// Inertia cuál es la plantilla HTML raíz (app.blade.php) y qué datos
// compartir en TODAS las páginas (por ejemplo, mensajes de confirmación).
class ManejarPeticionesInertia extends Middleware
{
    // El archivo Blade que envuelve a toda la aplicación de React.
    protected $rootView = 'app';

    // Datos que van a estar disponibles en TODAS las páginas de React,
    // sin tener que mandarlos uno por uno desde cada controlador.
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            // El mensaje de éxito que dejamos con ->with('mensaje', '...')
            // en el controlador, para mostrarlo como notificación.
            'mensaje' => fn() => $request->session()->get('mensaje'),

            // Estos dos los necesita ModalCatalogo.jsx: cuando se crea una
            // secretaría o una dependencia nueva desde el modal, el
            // controlador las deja aquí para que el modal las reciba de
            // vuelta y las seleccione automáticamente, sin que el usuario
            // tenga que buscarlas de nuevo en la lista.
            'secretariaCreada' => fn() => $request->session()->get('secretariaCreada'),
            'dependenciaCreada' => fn() => $request->session()->get('dependenciaCreada'),
        ]);
    }
}
