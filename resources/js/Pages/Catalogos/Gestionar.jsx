import { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import Plantilla from '../Agremiados/Plantilla';

// CU-11: Gestionar Catálogo de Secretarías/Organismos y Dependencias.
//
// Panel dividido (maestro-detalle): a la izquierda la lista de
// secretarías, a la derecha las dependencias de la que esté
// seleccionada. Es el mismo patrón que usan paneles de administración
// como Gmail o Notion para relaciones "padre - varios hijos".
export default function Gestionar({ secretariasOrganismos, errors }) {
  // Cuál secretaría está seleccionada en el panel izquierdo. Si hay al
  // menos una, empezamos mostrando la primera; si el catálogo está
  // vacío, no hay nada que seleccionar todavía.
  const [seleccionadaId, setSeleccionadaId] = useState(secretariasOrganismos[0]?.id ?? null);

  const secretariaSeleccionada = secretariasOrganismos.find((s) => s.id === seleccionadaId);

  const formNuevaSecretaria = useForm({ nombre: '' });
  const formNuevaDependencia = useForm({ nombre: '', secretaria_organismo_id: '' });

  // Mantiene el formulario de "nueva dependencia" siempre apuntando a la
  // secretaría que está seleccionada en el panel izquierdo. Antes esto
  // se intentaba hacer de otras 2 formas que fallaron: una pasando
  // "data" a post() (Inertia la ignora ahí) y otra encadenando
  // .transform().post() (no es seguro si transform() no regresa el
  // formulario para encadenar). Con useEffect, cada vez que cambia
  // seleccionadaId, el formulario queda actualizado de inmediato, así
  // que al momento de oprimir "+ Agregar" el dato ya está listo.
  useEffect(() => {
    formNuevaDependencia.setData('secretaria_organismo_id', seleccionadaId ?? '');
  }, [seleccionadaId]);

  function crearSecretaria(e) {
    e.preventDefault();
    formNuevaSecretaria.post('/catalogos/secretarias-organismos', {
      preserveScroll: true,
      onSuccess: (pagina) => {
        formNuevaSecretaria.reset();
        const creada = pagina.props.secretariaCreada;
        if (creada) setSeleccionadaId(creada.id); // la deja seleccionada de una vez
      },
    });
  }

  function eliminarSecretaria(id) {
    if (confirm('¿Eliminar esta secretaría/organismo? Solo se puede si no tiene dependencias.')) {
      router.delete(`/catalogos/secretarias-organismos/${id}`, {
        onSuccess: () => {
          if (seleccionadaId === id) setSeleccionadaId(null);
        },
      });
    }
  }

  function crearDependencia(e) {
    e.preventDefault();
    // Ya no hace falta inyectar secretaria_organismo_id aquí: el
    // useEffect de arriba lo mantiene sincronizado todo el tiempo con
    // la secretaría seleccionada, así que form.data ya lo trae listo.
    formNuevaDependencia.post('/catalogos/dependencias', {
      preserveScroll: true,
      onSuccess: () => formNuevaDependencia.setData('nombre', ''),
    });
  }

  function eliminarDependencia(id) {
    if (confirm('¿Eliminar esta dependencia? Solo se puede si no tiene agremiados registrados.')) {
      router.delete(`/catalogos/dependencias/${id}`);
    }
  }

  return (
    <Plantilla
      tituloPagina="Gestionar Secretarías / Organismos"
      migaDePan="Inicio / Catálogos"
      paginaActual="catalogos"
    >
      <div className="grid grid-cols-[320px_1fr] gap-0 bg-white rounded-lg border border-slate-200 overflow-hidden min-h-[420px]">
        {/* ============ PANEL IZQUIERDO: lista de secretarías ============ */}
        <div className="border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-400 uppercase mb-2">Secretarías / Organismos</h2>
            <form onSubmit={crearSecretaria} className="flex gap-1">
              <input
                type="text"
                value={formNuevaSecretaria.data.nombre}
                onChange={(e) => formNuevaSecretaria.setData('nombre', e.target.value)}
                placeholder="Nueva secretaría..."
                className="flex-1 border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
              />
              <button
                type="submit"
                disabled={formNuevaSecretaria.processing}
                className="bg-suspeg-teal text-white px-2.5 rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                +
              </button>
            </form>
            {formNuevaSecretaria.errors.nombre && (
              <p className="text-red-600 text-xs mt-1">{formNuevaSecretaria.errors.nombre}</p>
            )}
          </div>

          {/* La lista misma: cada fila es clicleable para seleccionarla */}
          <ul className="flex-1 overflow-y-auto">
            {secretariasOrganismos.length === 0 && (
              <li className="p-4 text-sm text-slate-400">Todavía no hay ninguna registrada.</li>
            )}
            {secretariasOrganismos.map((secretaria) => (
              <li key={secretaria.id}>
                <button
                  onClick={() => setSeleccionadaId(secretaria.id)}
                  className={`w-full text-left px-4 py-3 text-sm border-l-4 flex items-center justify-between group ${
                    seleccionadaId === secretaria.id
                      ? 'border-suspeg-teal bg-slate-50 font-semibold text-slate-800'
                      : 'border-transparent text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{secretaria.nombre}</span>
                  <span className="text-xs text-slate-400">{secretaria.dependencias.length}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ============ PANEL DERECHO: dependencias de la seleccionada ============ */}
        <div className="p-6">
          {!secretariaSeleccionada ? (
            <p className="text-sm text-slate-400">
              {secretariasOrganismos.length === 0
                ? 'Registra tu primera secretaría/organismo en el panel de la izquierda.'
                : 'Selecciona una secretaría/organismo de la izquierda para ver sus dependencias.'}
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold text-slate-800">{secretariaSeleccionada.nombre}</h2>
                <button
                  onClick={() => eliminarSecretaria(secretariaSeleccionada.id)}
                  className="text-red-500 text-xs font-semibold"
                >
                  Eliminar esta secretaría
                </button>
              </div>
              {errors?.secretariaOrganismo && (
                <p className="text-red-600 text-xs bg-red-50 rounded-lg px-3 py-2 mb-3">{errors.secretariaOrganismo}</p>
              )}

              <p className="text-xs font-bold text-slate-400 uppercase mt-5 mb-2">
                Dependencias ({secretariaSeleccionada.dependencias.length})
              </p>

              {/* Agregar una dependencia nueva bajo esta secretaría */}
              <form onSubmit={crearDependencia} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={formNuevaDependencia.data.nombre}
                  onChange={(e) => formNuevaDependencia.setData('nombre', e.target.value)}
                  placeholder="Nombre de la nueva dependencia..."
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={formNuevaDependencia.processing}
                  className="bg-suspeg-teal text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                >
                  + Agregar
                </button>
              </form>
              {formNuevaDependencia.errors.nombre && (
                <p className="text-red-600 text-xs -mt-3 mb-3">{formNuevaDependencia.errors.nombre}</p>
              )}
              {formNuevaDependencia.errors.secretaria_organismo_id && (
                <p className="text-red-600 text-xs -mt-3 mb-3">{formNuevaDependencia.errors.secretaria_organismo_id}</p>
              )}

              <ul className="divide-y divide-slate-100 border border-slate-100 rounded-lg">
                {secretariaSeleccionada.dependencias.length === 0 && (
                  <li className="p-3 text-sm text-slate-400">Esta secretaría todavía no tiene dependencias.</li>
                )}
                {secretariaSeleccionada.dependencias.map((dependencia) => (
                  <li key={dependencia.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span>{dependencia.nombre}</span>
                    <button
                      onClick={() => eliminarDependencia(dependencia.id)}
                      className="text-red-500 text-xs font-semibold"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
              {errors?.dependencia && (
                <p className="text-red-600 text-xs bg-red-50 rounded-lg px-3 py-2 mt-3">{errors.dependencia}</p>
              )}
            </>
          )}
        </div>
      </div>
    </Plantilla>
  );
}
