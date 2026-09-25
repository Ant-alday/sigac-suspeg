import { useForm } from '@inertiajs/react';
import Plantilla from '../Agremiados/Plantilla';

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

// CU-07: Registrar Bien Mueble.
// "Responsable" queda opcional a propósito: en el inventario real, la
// mayoría de los bienes todavía no tienen quién los tenga asignados.
export default function BienesRegistrar() {
  const { data, setData, post, processing, errors } = useForm({
    concepto: '',
    marca: '',
    modelo: '',
    clave: '',
    estatus: 'Activo',
    responsable: '',
  });

  function enviar(e) {
    e.preventDefault();
    post('/finanzas/bienes');
  }

  return (
    <Plantilla tituloPagina="Registrar Bien Mueble" migaDePan="Inicio / Finanzas / Bienes / Registrar" paginaActual="finanzas-bienes-registrar">
      <form onSubmit={enviar} className="bg-white rounded-lg border border-slate-200 p-6 max-w-2xl">
        <Campo etiqueta="Concepto (nombre del bien)" obligatorio error={errors.concepto}>
          <input
            type="text"
            value={data.concepto}
            onChange={(e) => setData('concepto', e.target.value)}
            placeholder="Ej. Ventilador, Impresora, Escritorio..."
            maxLength={150}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </Campo>

        <div className="grid grid-cols-2 gap-4">
          <Campo etiqueta="Marca" error={errors.marca}>
            <input
              type="text"
              value={data.marca}
              onChange={(e) => setData('marca', e.target.value)}
              maxLength={100}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </Campo>
          <Campo etiqueta="Modelo" error={errors.modelo}>
            <input
              type="text"
              value={data.modelo}
              onChange={(e) => setData('modelo', e.target.value)}
              maxLength={100}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </Campo>
        </div>

        <Campo etiqueta="Clave de control" obligatorio error={errors.clave}>
          <input
            type="text"
            value={data.clave}
            onChange={(e) => setData('clave', e.target.value)}
            placeholder="Ej. 20000221"
            maxLength={20}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </Campo>

        <Campo etiqueta="Estatus" obligatorio error={errors.estatus}>
          <select
            value={data.estatus}
            onChange={(e) => setData('estatus', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="Activo">Activo</option>
            <option value="En reparación">En reparación</option>
            <option value="Dado de baja">Dado de baja</option>
          </select>
        </Campo>

        <Campo etiqueta="Responsable" error={errors.responsable}>
          <input
            type="text"
            value={data.responsable}
            onChange={(e) => setData('responsable', e.target.value)}
            placeholder="Opcional — déjalo vacío si todavía no se asigna"
            maxLength={150}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </Campo>

        <button
          type="submit"
          disabled={processing}
          className="bg-suspeg-teal text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          Guardar bien mueble
        </button>
      </form>
    </Plantilla>
  );
}
