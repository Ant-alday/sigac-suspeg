import { useState } from 'react';
import { useForm } from '@inertiajs/react';

// Ventana flotante para dar de alta una Secretaría/Organismo y, dentro
// de ella, una Dependencia — sin tener que salir de la pantalla donde
// se está registrando o editando al agremiado.
//
// Por qué es un flujo de 2 pasos: una Dependencia (área de adscripción)
// SIEMPRE pertenece a una Secretaría/Organismo (ej. "Delegación
// Administrativa" pertenece a "Secretaría de Finanzas y
// Administración"). Por eso primero se elige o se crea la secretaría,
// y hasta entonces se habilita el formulario para agregar la
// dependencia debajo de ella.
export default function ModalCatalogo({ secretariasOrganismos, onCerrar }) {
  // Si ya eligieron una secretaría existente, o si acaban de crear una
  // nueva, aquí se guarda su id — mientras esto sea null/vacío, el
  // formulario de "Dependencia" permanece deshabilitado.
  const [secretariaId, setSecretariaId] = useState('');

  const formSecretaria = useForm({ nombre: '' });
  const formDependencia = useForm({ nombre: '', secretaria_organismo_id: '' });

  function crearSecretaria(e) {
    e.preventDefault();
    formSecretaria.post('/catalogos/secretarias-organismos', {
      preserveScroll: true,
      onSuccess: (pagina) => {
        formSecretaria.reset();
        // El controlador regresa la secretaría recién creada en
        // "secretariaCreada" (ver ControladorCatalogos::guardarSecretariaOrganismo).
        const creada = pagina.props.secretariaCreada;
        if (creada) {
          setSecretariaId(String(creada.id));
          formDependencia.setData('secretaria_organismo_id', String(creada.id));
        }
      },
    });
  }

  function crearDependencia(e) {
    e.preventDefault();
    formDependencia.post('/catalogos/dependencias', {
      preserveScroll: true,
      onSuccess: () => formDependencia.setData('nombre', ''),
    });
  }

  function elegirSecretariaExistente(id) {
    setSecretariaId(id);
    formDependencia.setData('secretaria_organismo_id', id);
  }

  return (
    // El fondo oscuro semitransparente: al hacer clic afuera de la
    // tarjeta blanca, se cierra la ventana flotante.
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onCerrar}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()} // evita que un clic ADENTRO cierre la ventana
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Agregar Secretaría/Organismo y Dependencia</h2>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600 text-xl leading-none">
            ×
          </button>
        </div>

        {/* --- Paso 1: elegir o crear la Secretaría/Organismo --- */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            1. Secretaría / Organismo
          </label>
          <select
            value={secretariaId}
            onChange={(e) => elegirSecretariaExistente(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-2 bg-white"
          >
            <option value="">— Elegir una ya registrada —</option>
            {secretariasOrganismos.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>

          <p className="text-xs text-slate-400 mb-1">¿No existe todavía? Créala aquí:</p>
          <form onSubmit={crearSecretaria} className="flex gap-2">
            <input
              type="text"
              value={formSecretaria.data.nombre}
              onChange={(e) => formSecretaria.setData('nombre', e.target.value)}
              placeholder="Nombre de la secretaría/organismo..."
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={formSecretaria.processing}
              className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              Crear
            </button>
          </form>
          {formSecretaria.errors.nombre && (
            <p className="text-red-600 text-xs mt-1">{formSecretaria.errors.nombre}</p>
          )}
        </div>

        {/* --- Paso 2: agregar la Dependencia bajo la secretaría elegida --- */}
        <div className={secretariaId ? '' : 'opacity-40 pointer-events-none'}>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            2. Dependencia (área de adscripción)
          </label>
          {!secretariaId && (
            <p className="text-xs text-amber-600 mb-2">Primero elige o crea una secretaría/organismo arriba.</p>
          )}
          <form onSubmit={crearDependencia} className="flex gap-2">
            <input
              type="text"
              value={formDependencia.data.nombre}
              onChange={(e) => formDependencia.setData('nombre', e.target.value)}
              placeholder="Nombre de la dependencia..."
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={formDependencia.processing || !secretariaId}
              className="bg-suspeg-teal text-white px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              + Agregar
            </button>
          </form>
          {formDependencia.errors.nombre && (
            <p className="text-red-600 text-xs mt-1">{formDependencia.errors.nombre}</p>
          )}
        </div>

        <div className="mt-6 text-right">
          <button onClick={onCerrar} className="text-sm font-semibold text-slate-600">
            Listo, cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
