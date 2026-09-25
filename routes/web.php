<?php

use App\Http\Controllers\ControladorAgremiados;
use App\Http\Controllers\ControladorCatalogos;
use App\Http\Controllers\ControladorFinanzas;
use App\Http\Controllers\ControladorFomento;
use App\Http\Controllers\ControladorTrabajos;
use App\Models\CredencialSuspeg;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::redirect('/', '/agremiados');

// --- Padrón de agremiados ---
Route::get('/agremiados', [ControladorAgremiados::class, 'index'])->name('agremiados.index');
Route::get('/agremiados/registrar', [ControladorAgremiados::class, 'crear'])->name('agremiados.create');
Route::post('/agremiados', [ControladorAgremiados::class, 'store'])->name('agremiados.store');
Route::get('/agremiados/{agremiado}', [ControladorAgremiados::class, 'show'])->name('agremiados.show');
Route::put('/agremiados/{agremiado}', [ControladorAgremiados::class, 'update'])->name('agremiados.update');
Route::put('/agremiados/{agremiado}/estatus', [ControladorAgremiados::class, 'cambiarEstatus'])->name('agremiados.cambiarEstatus');

// --- CU-07 y CU-08: exportar ficha individual y reporte del padrón ---
Route::get('/agremiados/{agremiado}/ficha-pdf', [ControladorAgremiados::class, 'exportarFichaPdf'])->name('agremiados.fichaPdf');
Route::get('/agremiados-reporte', [ControladorAgremiados::class, 'generarReporte'])->name('agremiados.reporte');

// --- Documentos de afiliación ---
Route::post('/agremiados/{agremiado}/documentos', [ControladorAgremiados::class, 'subirDocumento'])->name('documentos.subir');
Route::delete('/documentos/{documento}', [ControladorAgremiados::class, 'eliminarDocumento'])->name('documentos.eliminar');

// --- Credencial SUSPEG ---
Route::post('/agremiados/{agremiado}/credencial', [ControladorAgremiados::class, 'solicitarCredencial'])->name('credenciales.solicitar');

Route::get('/credenciales/{credencial}', function (CredencialSuspeg $credencial) {
    return Inertia::render('Agremiados/Credencial', [
        'credencial' => $credencial->load('agremiado'),
    ]);
})->name('credenciales.show');

Route::post('/credenciales/{credencial}/documentos', [ControladorAgremiados::class, 'subirDocumentoCredencial'])->name('credenciales.subirDocumento');
Route::put('/credenciales/{credencial}/enviar', [ControladorAgremiados::class, 'enviarATribunal'])->name('credenciales.enviarATribunal');
Route::put('/credenciales/{credencial}/entrega', [ControladorAgremiados::class, 'confirmarEntrega'])->name('credenciales.confirmarEntrega');

// --- Catálogos: Secretarías/Organismos y Dependencias ---
// Ya NO se manejan como una página aparte: se agregan desde la ventana
// flotante (ver ModalCatalogo.jsx) dentro de Registrar y Detalle. Estas
// rutas siguen siendo las que reciben esos formularios.
// --- Catálogos: Secretarías/Organismos y Dependencias (CU-11) ---
Route::get('/catalogos', [ControladorCatalogos::class, 'index'])->name('catalogos.index');
Route::post('/catalogos/secretarias-organismos', [ControladorCatalogos::class, 'guardarSecretariaOrganismo'])->name('catalogos.secretariasOrganismos.guardar');
Route::delete('/catalogos/secretarias-organismos/{secretariaOrganismo}', [ControladorCatalogos::class, 'eliminarSecretariaOrganismo'])->name('catalogos.secretariasOrganismos.eliminar');
Route::post('/catalogos/dependencias', [ControladorCatalogos::class, 'guardarDependencia'])->name('catalogos.dependencias.guardar');
Route::delete('/catalogos/dependencias/{dependencia}', [ControladorCatalogos::class, 'eliminarDependencia'])->name('catalogos.dependencias.eliminar');

// ============================================================
//  MÓDULO DE FINANZAS
// ============================================================


// --- Movimientos financieros (CU-12 a CU-16) ---
Route::get('/finanzas', [ControladorFinanzas::class, 'index'])->name('finanzas.index');
Route::get('/finanzas/registrar', [ControladorFinanzas::class, 'crear'])->name('finanzas.create');
Route::post('/finanzas', [ControladorFinanzas::class, 'store'])->name('finanzas.store');
Route::get('/finanzas/{movimiento}', [ControladorFinanzas::class, 'show'])->name('finanzas.show');
Route::put('/finanzas/{movimiento}', [ControladorFinanzas::class, 'update'])->name('finanzas.update');
Route::get('/finanzas-informe', [ControladorFinanzas::class, 'generarInforme'])->name('finanzas.informe');

// --- Bienes muebles (CU-17 y CU-18) ---
Route::get('/finanzas/bienes/listado', [ControladorFinanzas::class, 'bienesIndex'])->name('finanzas.bienes.index');
Route::get('/finanzas/bienes/registrar', [ControladorFinanzas::class, 'bienesCrear'])->name('finanzas.bienes.create');
Route::post('/finanzas/bienes', [ControladorFinanzas::class, 'bienesStore'])->name('finanzas.bienes.store');

// --- CU-19: Verificar Cuota Mensual Reportada ---
Route::get('/finanzas-verificar-cuota', [ControladorFinanzas::class, 'verificarCuota'])->name('finanzas.verificarCuota');

// ============================================================
//  MÓDULO DE FOMENTO HABITACIONAL
// ============================================================


// --- Integración con Organización: el botón "Solicitar beneficio" en
//     el propio Padrón de Beneficiarios lleva aquí (index() ahora
//     consulta directo a los agremiados, ya no hay una pantalla aparte) ---
Route::get('/fomento/desde-agremiado/{agremiado}', [ControladorFomento::class, 'crearDesdeAgremiado'])->name('fomento.desdeAgremiado');

// --- Padrón de beneficiarios y solicitudes (CU-20 a CU-23, CU-25) ---
Route::get('/fomento', [ControladorFomento::class, 'index'])->name('fomento.index');
Route::get('/fomento/registrar', [ControladorFomento::class, 'crear'])->name('fomento.create');
Route::post('/fomento', [ControladorFomento::class, 'store'])->name('fomento.store');
Route::get('/fomento/{beneficiario}', [ControladorFomento::class, 'show'])->name('fomento.show');
Route::delete('/fomento/{beneficiario}', [ControladorFomento::class, 'beneficiarioEliminar'])->name('fomento.eliminar');

Route::get('/fomento/{beneficiario}/solicitar', [ControladorFomento::class, 'crearSolicitud'])->name('fomento.solicitud.create');
Route::post('/fomento/{beneficiario}/solicitar', [ControladorFomento::class, 'storeSolicitud'])->name('fomento.solicitud.store');
Route::put('/fomento-solicitudes/{solicitud}/entrega', [ControladorFomento::class, 'marcarEntregada'])->name('fomento.solicitud.entrega');
Route::delete('/fomento-solicitudes/{solicitud}', [ControladorFomento::class, 'solicitudInsumoEliminar'])->name('fomento.solicitud.eliminar');

Route::post('/fomento/{beneficiario}/convenio', [ControladorFomento::class, 'storeConvenio'])->name('fomento.convenio.store');
Route::delete('/fomento-solicitudes-convenio/{solicitud}', [ControladorFomento::class, 'solicitudConvenioEliminar'])->name('fomento.convenio.eliminar');

// --- Catálogo de insumos, en tarjetas por categoría (CU-24) ---
Route::get('/fomento-insumos', [ControladorFomento::class, 'insumosIndex'])->name('fomento.insumos.index');
Route::post('/fomento-insumos', [ControladorFomento::class, 'insumosStore'])->name('fomento.insumos.store');
Route::put('/fomento-insumos/{insumo}', [ControladorFomento::class, 'insumosActualizar'])->name('fomento.insumos.actualizar');
Route::delete('/fomento-insumos/{insumo}', [ControladorFomento::class, 'insumosEliminar'])->name('fomento.insumos.eliminar');

Route::post('/fomento-categorias', [ControladorFomento::class, 'categoriasStore'])->name('fomento.categorias.store');
Route::delete('/fomento-categorias/{categoria}', [ControladorFomento::class, 'categoriasEliminar'])->name('fomento.categorias.eliminar');

// --- Catálogo de convenios de descuento ---
Route::get('/fomento-convenios', [ControladorFomento::class, 'conveniosIndex'])->name('fomento.convenios.index');
Route::get('/fomento-convenios/{convenio}', [ControladorFomento::class, 'convenioDetalle'])->name('fomento.convenios.detalle');
Route::post('/fomento-convenios', [ControladorFomento::class, 'conveniosStore'])->name('fomento.convenios.store');
Route::post('/fomento-convenios/{convenio}/documento', [ControladorFomento::class, 'conveniosSubirDocumento'])->name('fomento.convenios.documento');
Route::delete('/fomento-convenios/{convenio}', [ControladorFomento::class, 'conveniosEliminar'])->name('fomento.convenios.eliminar');

// --- Reporte (CU-26) ---
Route::get('/fomento-reporte', [ControladorFomento::class, 'generarReporte'])->name('fomento.reporte');

// ============================================================
//  MÓDULO DE TRABAJOS Y CONFLICTOS
// ============================================================


// --- Casos laborales (CU-28 a CU-30) ---
Route::get('/trabajos', [ControladorTrabajos::class, 'index'])->name('trabajos.index');
Route::get('/trabajos/registrar', [ControladorTrabajos::class, 'crear'])->name('trabajos.create');
Route::post('/trabajos', [ControladorTrabajos::class, 'store'])->name('trabajos.store');
Route::get('/trabajos/{caso}', [ControladorTrabajos::class, 'show'])->name('trabajos.show');
Route::post('/trabajos/{caso}/seguimiento', [ControladorTrabajos::class, 'agregarSeguimiento'])->name('trabajos.seguimiento');
Route::put('/trabajos/{caso}/turnar-juridico', [ControladorTrabajos::class, 'turnarAJuridico'])->name('trabajos.turnarJuridico');
Route::put('/trabajos/{caso}/cerrar', [ControladorTrabajos::class, 'cerrarCaso'])->name('trabajos.cerrar');

// --- Búsqueda en vivo de agremiados (para los selectores) ---
Route::get('/trabajos-buscar-agremiados', [ControladorTrabajos::class, 'buscarAgremiados'])->name('trabajos.buscarAgremiados');

// --- Solicitudes de permiso (CU-31) ---
Route::get('/trabajos-permisos', [ControladorTrabajos::class, 'permisosIndex'])->name('trabajos.permisos.index');
Route::post('/trabajos-permisos', [ControladorTrabajos::class, 'permisosStore'])->name('trabajos.permisos.store');

// --- Plazas vacantes (CU-32 y CU-33) ---
Route::get('/trabajos-plazas', [ControladorTrabajos::class, 'plazasIndex'])->name('trabajos.plazas.index');
Route::post('/trabajos-plazas', [ControladorTrabajos::class, 'plazasStore'])->name('trabajos.plazas.store');
Route::put('/trabajos-plazas/{plaza}/asignar', [ControladorTrabajos::class, 'asignarPlaza'])->name('trabajos.plazas.asignar');

// --- Reporte (CU-34) ---
Route::get('/trabajos-reporte', [ControladorTrabajos::class, 'generarReporte'])->name('trabajos.reporte');
