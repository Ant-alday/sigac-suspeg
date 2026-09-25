import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import Plantilla from '../Agremiados/Plantilla';
import BuscadorAgremiado from './BuscadorAgremiado';

export default function Permisos({ permisos, filtros }) {
  const [buscar, setBuscar] = useState(filtros?.buscar || '');
  const { data, setData, post, processing, errors, reset } = useForm({
    agremiado_id: '', agremiado_obj: null, tipo_permiso: 'Día Económico',
    fecha_inicio: new Date().toISOString().slice(0, 10), fecha_fin: '',
    dias_solicitados: 1, motivo: '',
  });

  function elegirAgremiado(agremiado) {
    setData({ ...data, agremiado_id: agremiado?.id || '', agremiado_obj: agremiado });
  }

  function enviar(e) {
    e.preventDefault();
    post('/trabajos-permisos', { onSuccess: () => reset() });
  }

  function buscarPermisos(valor) {
    router.get('/trabajos-permisos', { buscar: valor }, { preserveState: true, replace: true });
  }

  return (
    <Plantilla tituloPagina="Solicitudes de Permiso" migaDePan="Inicio / Trabajos y Conflictos / Permisos" paginaActual="trabajos-permisos">
      <form onSubmit={enviar} className="bg-white rounded-lg border border-slate-200 p-5 mb-6 space-y-3 max-w-2xl">
        <BuscadorAgremiado onSeleccionar={elegirAgremiado} seleccionado={data.agremiado_obj} />
        {errors.agremiado_id && <p className="text-red-600 text-xs">{errors.agremiado_id}</p>}

        <div className="flex gap-3">
          <select value={data.tipo_permiso} onChange={(e) => setData('tipo_permiso', e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm flex-1">
            <option>Día Económico</option>
            <option>Licencia sin Goce de Sueldo</option>
          </select>
          <input type="date" value={data.fecha_inicio} onChange={(e) => setData('fecha_inicio', e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          {data.tipo_permiso === 'Licencia sin Goce de Sueldo' && (
            <input type="date" placeholder="Fecha fin" value={data.fecha_fin} onChange={(e) => setData('fecha_fin', e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          )}
          <input type="number" min="1" value={data.dias_solicitados} onChange={(e) => setData('dias_solicitados', e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-24" title="Días solicitados" />
        </div>

        <input type="text" placeholder="Motivo (opcional)" value={data.motivo} onChange={(e) => setData('motivo', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />

        <button type="submit" disabled={processing || !data.agremiado_id} className="bg-[#0F4C5C] text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
          Registrar permiso
        </button>
      </form>

      <input
        type="text"
        value={buscar}
        onChange={(e) => { setBuscar(e.target.value); buscarPermisos(e.target.value); }}
        placeholder="Buscar por nombre del agremiado..."
        className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm mb-4"
      />

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Agremiado</th>
              <th className="text-left px-4 py-2">Tipo</th>
              <th className="text-left px-4 py-2">Fecha</th>
              <th className="text-left px-4 py-2">Días</th>
              <th className="text-left px-4 py-2">Motivo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {permisos.data.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2 font-semibold">{p.agremiado.nombre_completo}</td>
                <td className="px-4 py-2 text-slate-500">{p.tipo_permiso}</td>
                <td className="px-4 py-2 text-slate-500">{p.fecha_inicio}{p.fecha_fin ? ` — ${p.fecha_fin}` : ''}</td>
                <td className="px-4 py-2 text-slate-500">{p.dias_solicitados}</td>
                <td className="px-4 py-2 text-slate-500">{p.motivo || '—'}</td>
              </tr>
            ))}
            {permisos.data.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Sin permisos registrados todavía.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Plantilla>
  );
}
