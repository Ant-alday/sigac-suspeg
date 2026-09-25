import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import Plantilla from '../Agremiados/Plantilla';

function Dato({ etiqueta, valor }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase">{etiqueta}</p>
      <p className="text-sm text-slate-800">{valor || '—'}</p>
    </div>
  );
}

export default function Detalle({ caso }) {
  const [mostrarCierre, setMostrarCierre] = useState(false);

  const formSeguimiento = useForm({ fecha: new Date().toISOString().slice(0, 10), nota: '' });
  const formCierre = useForm({ resultado: '', fecha_resolucion: new Date().toISOString().slice(0, 10) });

  function enviarSeguimiento(e) {
    e.preventDefault();
    formSeguimiento.post(`/trabajos/${caso.id}/seguimiento`, { onSuccess: () => formSeguimiento.reset('nota') });
  }

  function turnarAJuridico() {
    if (confirm('¿Turnar este caso a Asuntos Jurídicos?')) {
      router.put(`/trabajos/${caso.id}/turnar-juridico`);
    }
  }

  function enviarCierre(e) {
    e.preventDefault();
    formCierre.put(`/trabajos/${caso.id}/cerrar`, {
      onSuccess: () => setMostrarCierre(false),
    });
  }

  const yaResuelto = caso.estatus === 'Resuelto';

  return (
    <Plantilla tituloPagina={`Caso — ${caso.agremiado.nombre_completo}`} migaDePan="Inicio / Trabajos y Conflictos / Detalle" paginaActual="trabajos-listado">
      {/* --- Datos del caso --- */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-6">
        <h2 className="text-sm font-bold text-slate-400 uppercase mb-3">Datos del caso</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Dato etiqueta="Trabajador" valor={caso.agremiado.nombre_completo} />
          <Dato etiqueta="No. Empleado" valor={caso.agremiado.numero_empleado} />
          <Dato etiqueta="Tipo de caso" valor={caso.tipo_caso} />
          <Dato etiqueta="Escolaridad" valor={caso.escolaridad} />
          <Dato etiqueta="Fecha de registro" valor={caso.fecha_registro} />
          <Dato etiqueta="Estatus" valor={caso.estatus} />
        </div>
        <Dato etiqueta="Descripción" valor={caso.descripcion} />

        {yaResuelto && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-emerald-700 uppercase">Resuelto el {caso.fecha_resolucion}</p>
            <p className="text-sm text-emerald-800">{caso.resultado}</p>
          </div>
        )}

        {!yaResuelto && (
          <div className="flex gap-3 mt-4">
            {caso.estatus !== 'Turnado a Jurídico' && (
              <button onClick={turnarAJuridico} className="text-white text-sm font-semibold px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700">
                Turnar a Asuntos Jurídicos
              </button>
            )}
            <button onClick={() => setMostrarCierre(!mostrarCierre)} className="text-white text-sm font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700">
              Cerrar caso
            </button>
          </div>
        )}

        {mostrarCierre && !yaResuelto && (
          <form onSubmit={enviarCierre} className="bg-slate-50 rounded-lg p-4 mt-4 space-y-3">
            <textarea
              placeholder="Resultado del caso..."
              value={formCierre.data.resultado}
              onChange={(e) => formCierre.setData('resultado', e.target.value)}
              rows={3}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
            {formCierre.errors.resultado && <p className="text-red-600 text-xs">{formCierre.errors.resultado}</p>}
            <input
              type="date"
              value={formCierre.data.fecha_resolucion}
              onChange={(e) => formCierre.setData('fecha_resolucion', e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
            <button type="submit" disabled={formCierre.processing} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
              Confirmar cierre
            </button>
          </form>
        )}
      </div>

      {/* --- Historial de seguimientos --- */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h2 className="text-sm font-bold text-slate-400 uppercase mb-3">Historial de seguimientos</h2>

        {!yaResuelto && (
          <form onSubmit={enviarSeguimiento} className="flex gap-2 mb-4">
            <input
              type="date"
              value={formSeguimiento.data.fecha}
              onChange={(e) => formSeguimiento.setData('fecha', e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Nota del seguimiento..."
              value={formSeguimiento.data.nota}
              onChange={(e) => formSeguimiento.setData('nota', e.target.value)}
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
            <button type="submit" disabled={formSeguimiento.processing} className="bg-[#0F4C5C] text-white px-4 py-2 rounded-lg text-sm font-semibold">
              Agregar
            </button>
          </form>
        )}

        {caso.seguimientos.length === 0 && (
          <p className="text-sm text-slate-400">Sin seguimientos registrados todavía.</p>
        )}
        <ul className="space-y-2">
          {caso.seguimientos.map((s) => (
            <li key={s.id} className="border-l-2 border-[#0F4C5C] pl-3 text-sm">
              <span className="text-slate-400 text-xs">{s.fecha}</span>
              <p className="text-slate-700">{s.nota}</p>
            </li>
          ))}
        </ul>
      </div>
    </Plantilla>
  );
}
