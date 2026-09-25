<?php

namespace App\Http\Controllers;

use App\Models\Dependencia;
use App\Models\SecretariaOrganismo;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Controlador de catálogos: Secretarías/Organismos y Dependencias.
 *
 * IMPORTANTE sobre la relación entre ambos: una Dependencia (área de
 * adscripción) SIEMPRE pertenece a una Secretaría/Organismo. Ejemplo:
 * "Delegación Administrativa" (dependencia) pertenece a "Secretaría de
 * Finanzas y Administración" (secretaría). Por eso, para registrar una
 * dependencia, primero hay que decir a qué secretaría pertenece.
 *
 * Todavía sin seguridad (sin login, sin roles) — se agrega más adelante.
 */
class ControladorCatalogos extends Controller
{
    // CU-11: Gestionar Catálogo de Secretarías/Organismos y Dependencias.
    // Pantalla completa (panel dividido): trae TODAS las secretarías
    // junto con sus dependencias ya cargadas, para no tener que pedirle
    // al servidor las dependencias cada vez que se cambia de secretaría
    // seleccionada en el panel derecho — todo llega de una sola vez.
    public function index()
    {
        return Inertia::render('Catalogos/Gestionar', [
            'secretariasOrganismos' => SecretariaOrganismo::with('dependencias')
                ->orderBy('nombre')
                ->get(),
        ]);
    }
    public function guardarSecretariaOrganismo(Request $request)
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:150|unique:secretarias_organismos,nombre',
        ], [
            'required' => 'El nombre de la secretaría u organismo es obligatorio.',
            'unique' => 'Esa secretaría u organismo ya está registrado.',
            'max' => 'El nombre no debe tener más de :max caracteres.',
        ]);

        $secretaria = SecretariaOrganismo::create($datos);

        return back()->with('mensaje', 'Secretaría/organismo registrado correctamente.')
            ->with('secretariaCreada', $secretaria);
    }

    public function guardarDependencia(Request $request)
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:150',
            // Una dependencia SIEMPRE pertenece a una secretaría — por
            // eso este campo es obligatorio, a diferencia de antes.
            'secretaria_organismo_id' => 'required|exists:secretarias_organismos,id',
        ], [
            'required' => 'El campo :attribute es obligatorio.',
            'exists' => 'La secretaría/organismo elegida no es válida.',
            'max' => 'El nombre no debe tener más de :max caracteres.',
        ], [
            'nombre' => 'nombre de la dependencia',
            'secretaria_organismo_id' => 'secretaría/organismo',
        ]);

        // La combinación nombre + secretaría es la que debe ser única,
        // no el nombre solo (ver la migración crear_dependencias).
        $yaExiste = Dependencia::where('nombre', $datos['nombre'])
            ->where('secretaria_organismo_id', $datos['secretaria_organismo_id'])
            ->exists();

        if ($yaExiste) {
            return back()->withErrors(['nombre' => 'Esa dependencia ya está registrada bajo esa secretaría/organismo.']);
        }

        $dependencia = Dependencia::create($datos)->load('secretariaOrganismo');

        return back()->with('mensaje', 'Dependencia registrada correctamente.')
            ->with('dependenciaCreada', $dependencia);
    }

    public function eliminarDependencia(Dependencia $dependencia)
    {
        if ($dependencia->agremiados()->exists()) {
            return back()->withErrors([
                'dependencia' => 'No se puede eliminar: hay agremiados registrados con esta dependencia.',
            ]);
        }

        $dependencia->delete();

        return back()->with('mensaje', 'Dependencia eliminada.');
    }

    public function eliminarSecretariaOrganismo(SecretariaOrganismo $secretariaOrganismo)
    {
        // Tampoco se puede eliminar si ya tiene dependencias registradas
        // debajo de ella (sin importar si esas dependencias tienen o no
        // agremiados) — eliminar la secretaría dejaría a esas
        // dependencias "huérfanas".
        if ($secretariaOrganismo->dependencias()->exists()) {
            return back()->withErrors([
                'secretariaOrganismo' => 'No se puede eliminar: tiene dependencias registradas debajo de ella.',
            ]);
        }

        $secretariaOrganismo->delete();

        return back()->with('mensaje', 'Secretaría/organismo eliminado.');
    }
}
