import { useForm } from '@inertiajs/react';
import Plantilla from '../Agremiados/Plantilla';

// CU-22: Solicitar Insumos.
// Una sola solicitud puede traer varios insumos a la vez. Además,
// puede ser para un FAMILIAR del beneficiario (no para él mismo) — al
// marcar la casilla, aparecen los campos de nombre y parentesco.
export default function RegistrarSolicitud({ beneficiario, categorias }) {
  const { data, setData, post, processing, errors } = useForm({
    fecha_solicitud: new Date().toISOString().slice(0, 10),
    tipo_pago: 'Efectivo',
    es_para_familiar: false,
    nombre_familiar: '',
    parentesco: '',
    observaciones: '',
    items: [{ insumo_id: '', cantidad: 1 }],
  });

  // Aplana las categorías con sus insumos en <optgroup>, para que el
  // select se vea organizado por categoría en vez de una lista plana.
  function actualizarItem(i, campo, valor) {
    const nuevos = [...data.items];
    nuevos[i][campo] = valor;
    setData('items', nuevos);
  }

  function agregarItem() {
    setData('items', [...data.items, { insumo_id: '', cantidad: 1 }]);
  }

  function quitarItem(i) {
    setData('items', data.items.filter((_, idx) => idx !== i));
  }

  function enviar(e) {
    e.preventDefault();
    post(`/fomento/${beneficiario.id}/solicitar`);
  }

  return (
    <Plantilla tituloPagina={`Nueva solicitud — ${beneficiario.nombre}`} migaDePan="Inicio / Fomento Habitacional / Solicitar" paginaActual="fomento-listado">
      <form onSubmit={enviar} className="bg-white rounded-lg border border-slate-200 p-6 max-w-3xl">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha de solicitud *</label>
          <input type="date" value={data.fecha_solicitud} onChange={(e) => setData('fecha_solicitud', e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo de pago *</label>
          <div className="flex gap-3">
            {['Efectivo', 'Transferencia'].map((opcion) => (
              <label key={opcion} className={`flex-1 border rounded-lg px-4 py-2 text-sm text-center cursor-pointer ${
                data.tipo_pago === opcion ? 'border-[#C2703D] bg-[#FDF3EC] font-semibold text-[#9C5228]' : 'border-slate-300'
              }`}>
                <input type="radio" name="tipo_pago" value={opcion} checked={data.tipo_pago === opcion} onChange={(e) => setData('tipo_pago', e.target.value)} className="hidden" />
                {opcion}
              </label>
            ))}
          </div>
          {errors.tipo_pago && <p className="text-red-600 text-xs mt-1">{errors.tipo_pago}</p>}
        </div>

        {/* Casilla "Es para un familiar" */}
        <div className="mb-4 bg-[#FDF3EC] border border-[#C2703D]/30 rounded-lg p-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#9C5228] cursor-pointer">
            <input
              type="checkbox"
              checked={data.es_para_familiar}
              onChange={(e) => setData('es_para_familiar', e.target.checked)}
              className="w-4 h-4"
            />
            Es para un familiar (no para el beneficiario directamente)
          </label>

          {data.es_para_familiar && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <input
                  type="text"
                  placeholder="Nombre del familiar"
                  value={data.nombre_familiar}
                  onChange={(e) => setData('nombre_familiar', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
                {errors.nombre_familiar && <p className="text-red-600 text-xs mt-1">{errors.nombre_familiar}</p>}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Parentesco (ej. Hija)"
                  value={data.parentesco}
                  onChange={(e) => setData('parentesco', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
                {errors.parentesco && <p className="text-red-600 text-xs mt-1">{errors.parentesco}</p>}
              </div>
            </div>
          )}
        </div>

        <p className="text-sm font-semibold text-slate-700 mb-2">Insumos solicitados *</p>
        {data.items.map((item, i) => (
          <div key={i} className="flex gap-2 mb-2 items-start">
            <select
              value={item.insumo_id}
              onChange={(e) => actualizarItem(i, 'insumo_id', e.target.value)}
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Selecciona un insumo...</option>
              {categorias.map((cat) => (
                <optgroup key={cat.id} label={cat.nombre}>
                  {cat.insumos.map((ins) => (
                    <option key={ins.id} value={ins.id}>{ins.nombre} (${Number(ins.precio_actual).toLocaleString('es-MX', { minimumFractionDigits: 2 })})</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={item.cantidad}
              onChange={(e) => actualizarItem(i, 'cantidad', e.target.value)}
              className="w-24 border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
            {data.items.length > 1 && (
              <button type="button" onClick={() => quitarItem(i)} className="text-red-500 text-xs font-semibold px-2">Quitar</button>
            )}
          </div>
        ))}
        {errors['items'] && <p className="text-red-600 text-xs mb-2">{errors['items']}</p>}
        <button type="button" onClick={agregarItem} className="text-[#0F4C5C] text-sm font-semibold mb-4">
          + Agregar otro insumo
        </button>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Observaciones</label>
          <input
            type="text"
            placeholder="Ej. Nuevo ingreso, Ya está registrada..."
            value={data.observaciones}
            onChange={(e) => setData('observaciones', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <button type="submit" disabled={processing} className="text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 bg-[#C2703D] hover:bg-[#A85D30]">
          Guardar solicitud
        </button>
      </form>
    </Plantilla>
  );
}
