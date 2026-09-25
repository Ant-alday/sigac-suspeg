import { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import Plantilla from '../Agremiados/Plantilla';

function Dato({ etiqueta, valor }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase">{etiqueta}</p>
      <p className="text-sm text-slate-800">{valor}</p>
    </div>
  );
}

function Campo({ etiqueta, error, children }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-slate-700 mb-1">{etiqueta}</label>
      {children}
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}

// CU-03: Ver Detalle del Movimiento. CU-04: Editar Movimiento (edición
// en línea, en la misma tarjeta, igual que en Organización).
export default function Detalle({ movimiento }) {
  const [editando, setEditando] = useState(false);

  const { data, setData, put, processing, errors } = useForm({
    concepto: movimiento.concepto,
    importe: movimiento.importe,
    fecha_movimiento: movimiento.fecha_movimiento,
  });

  function guardar(e) {
    e.preventDefault();
    put(`/finanzas/${movimiento.id}`, { onSuccess: () => setEditando(false) });
  }

  return (
    <Plantilla tituloPagina="Detalle del Movimiento" migaDePan="Inicio / Finanzas / Detalle" paginaActual="finanzas-listado">
      <div className="bg-white rounded-lg border border-slate-200 p-6 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            movimiento.tipo === 'Ingreso' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {movimiento.tipo}
          </span>
          {!editando && (
            <button onClick={() => setEditando(true)} className="text-suspeg-teal text-sm font-semibold">
              Editar
            </button>
          )}
        </div>

        {!editando ? (
          <div className="grid grid-cols-2 gap-4">
            <Dato etiqueta="Concepto" valor={movimiento.concepto} />
            <Dato etiqueta="Importe" valor={`$${Number(movimiento.importe).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} />
            <Dato etiqueta="Partida" valor={movimiento.partida?.nombre ?? 'N/A (es un ingreso)'} />
            <Dato etiqueta="Fecha del movimiento" valor={movimiento.fecha_movimiento} />
            {movimiento.comprobante_ruta && (
              <div className="col-span-2">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Comprobante</p>
                <a href={`/storage/${movimiento.comprobante_ruta}`} target="_blank" className="text-suspeg-teal text-sm font-semibold">
                  Ver comprobante →
                </a>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={guardar}>
            <Campo etiqueta="Concepto" error={errors.concepto}>
              <input
                type="text"
                value={data.concepto}
                onChange={(e) => setData('concepto', e.target.value)}
                maxLength={300}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </Campo>
            <div className="grid grid-cols-2 gap-4">
              <Campo etiqueta="Importe" error={errors.importe}>
                <input
                  type="number"
                  step="0.01"
                  value={data.importe}
                  onChange={(e) => setData('importe', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </Campo>
              <Campo etiqueta="Fecha del movimiento" error={errors.fecha_movimiento}>
                <input
                  type="date"
                  value={data.fecha_movimiento}
                  onChange={(e) => setData('fecha_movimiento', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </Campo>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={processing} className="bg-suspeg-teal text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                Guardar cambios
              </button>
              <button type="button" onClick={() => setEditando(false)} className="text-slate-500 text-sm font-semibold px-4 py-2">
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      <Link href="/finanzas" className="inline-block mt-4 text-suspeg-teal text-sm font-semibold">← Volver al listado</Link>
    </Plantilla>
  );
}
