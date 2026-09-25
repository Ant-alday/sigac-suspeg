import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Plantilla from '../Agremiados/Plantilla';

// Campo de texto reutilizable. Declarado FUERA del componente
// principal, como manda la regla del proyecto (si no, el input pierde
// el foco en cada tecla).
function Campo({ etiqueta, obligatorio, error, children }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-slate-700 mb-1">
        {etiqueta} {obligatorio && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}

// CU-02: Registrar Movimiento (Ingreso/Egreso).
// El campo "Partida" y el de "Comprobante" solo se muestran y se piden
// cuando el tipo elegido es "Egreso" — un Ingreso es la cuota mensual y
// no pertenece a ninguna partida (ver el porqué en las migraciones).
export default function Registrar({ partidas }) {
  const { data, setData, post, processing, errors } = useForm({
    tipo: 'Egreso',
    partida_id: '',
    concepto: '',
    importe: '',
    fecha_movimiento: new Date().toISOString().slice(0, 10),
    comprobante: null,
  });

  const esEgreso = data.tipo === 'Egreso';

  function enviar(e) {
    e.preventDefault();
    post('/finanzas', { forceFormData: true });
  }

  return (
    <Plantilla tituloPagina="Registrar Movimiento" migaDePan="Inicio / Finanzas / Registrar" paginaActual="finanzas-registrar">
      <form onSubmit={enviar} className="bg-white rounded-lg border border-slate-200 p-6 max-w-2xl">
        <Campo etiqueta="Tipo de movimiento" obligatorio error={errors.tipo}>
          <div className="flex gap-3">
            {['Ingreso', 'Egreso'].map((opcion) => (
              <label key={opcion} className={`flex-1 border rounded-lg px-4 py-2 text-sm text-center cursor-pointer ${
                data.tipo === opcion ? 'border-suspeg-teal bg-slate-50 font-semibold' : 'border-slate-300'
              }`}>
                <input
                  type="radio"
                  name="tipo"
                  value={opcion}
                  checked={data.tipo === opcion}
                  onChange={(e) => setData('tipo', e.target.value)}
                  className="hidden"
                />
                {opcion}
              </label>
            ))}
          </div>
          {!esEgreso && (
            <p className="text-xs text-slate-400 mt-1">
              El ingreso es la cuota mensual de la Sección; no se clasifica por partida.
            </p>
          )}
        </Campo>

        {/* Partida: solo aparece para Egreso */}
        {esEgreso && (
          <Campo etiqueta="Partida presupuestal" obligatorio error={errors.partida_id}>
            <select
              value={data.partida_id}
              onChange={(e) => setData('partida_id', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Selecciona una opción...</option>
              {partidas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} (disponible: ${Number(p.saldo_actual).toLocaleString('es-MX', { minimumFractionDigits: 2 })})
                </option>
              ))}
            </select>
          </Campo>
        )}

        <Campo etiqueta="Concepto" obligatorio error={errors.concepto}>
          <input
            type="text"
            value={data.concepto}
            onChange={(e) => setData('concepto', e.target.value)}
            maxLength={300}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </Campo>

        <div className="grid grid-cols-2 gap-4">
          <Campo etiqueta="Importe" obligatorio error={errors.importe}>
            <input
              type="number"
              step="0.01"
              value={data.importe}
              onChange={(e) => setData('importe', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </Campo>
          <Campo etiqueta="Fecha del movimiento" obligatorio error={errors.fecha_movimiento}>
            <input
              type="date"
              value={data.fecha_movimiento}
              onChange={(e) => setData('fecha_movimiento', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </Campo>
        </div>

        <Campo etiqueta="Comprobante" obligatorio={esEgreso} error={errors.comprobante}>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setData('comprobante', e.target.files[0])}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
          <p className="text-xs text-slate-400 mt-1">Formato permitido: PDF, JPG o PNG. Tamaño máximo: 5 MB.</p>
        </Campo>

        <button
          type="submit"
          disabled={processing}
          className="bg-suspeg-teal text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          Guardar movimiento
        </button>
      </form>
    </Plantilla>
  );
}
