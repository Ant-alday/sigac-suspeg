import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import Plantilla from '../Agremiados/Plantilla';
import BuscadorAgremiado from './BuscadorAgremiado';

function AsignarPlaza({ plaza }) {
  const [abierto, setAbierto] = useState(false);
  const [agremiado, setAgremiado] = useState(null);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));

  function confirmar() {
    router.put(`/trabajos-plazas/${plaza.id}/asignar`, {
      asignado_a_id: agremiado.id,
      fecha_asignacion: fecha,
    }, { onSuccess: () => setAbierto(false) });
  }

  if (plaza.estatus === 'Asignada') {
    return <span className="text-emerald-600 text-xs font-semibold">Asignada a {plaza.asignado_a?.nombre_completo}</span>;
  }

  if (!abierto) {
    return <button onClick={() => setAbierto(true)} className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#0F4C5C]">Asignar por escalafón</button>;
  }

  return (
    <div className="bg-slate-50 rounded-lg p-3 space-y-2 w-72">
      <BuscadorAgremiado onSeleccionar={setAgremiado} seleccionado={agremiado} placeholder="Buscar quién recibe la plaza..." />
      <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="border border-slate-300 rounded-lg px-2 py-1 text-xs w-full" />
      <div className="flex gap-2">
        <button onClick={confirmar} disabled={!agremiado} className="text-emerald-600 text-xs font-semibold disabled:opacity-40">Confirmar</button>
        <button onClick={() => setAbierto(false)} className="text-slate-400 text-xs">Cancelar</button>
      </div>
    </div>
  );
}

export default function Plazas({ plazas, filtros }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    agremiado_jubilado_id: '', agremiado_obj: null, no_plaza: '', dependencia: '', tipo_plaza: 'Base', fecha_vacante: new Date().toISOString().slice(0, 10),
  });

  function elegirAgremiado(agremiado) {
    setData({ ...data, agremiado_jubilado_id: agremiado?.id || '', agremiado_obj: agremiado });
  }

  function enviar(e) {
    e.preventDefault();
    post('/trabajos-plazas', { onSuccess: () => reset() });
  }

  function filtrar(estatus) {
    router.get('/trabajos-plazas', { estatus }, { preserveState: true, replace: true });
  }

  return (
    <Plantilla tituloPagina="Plazas Vacantes" migaDePan="Inicio / Trabajos y Conflictos / Plazas" paginaActual="trabajos-plazas">
      <form onSubmit={enviar} className="bg-white rounded-lg border border-slate-200 p-5 mb-6 space-y-3 max-w-2xl">
        <p className="text-xs font-semibold text-slate-500 uppercase">Agremiado que se jubila</p>
        <BuscadorAgremiado onSeleccionar={elegirAgremiado} seleccionado={data.agremiado_obj} />
        {errors.agremiado_jubilado_id && <p className="text-red-600 text-xs">{errors.agremiado_jubilado_id}</p>}

        <div className="flex gap-3">
          <input type="text" placeholder="No. de plaza" value={data.no_plaza} onChange={(e) => setData('no_plaza', e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm flex-1" />
          <input type="text" placeholder="Dependencia" value={data.dependencia} onChange={(e) => setData('dependencia', e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm flex-1" />
          <select value={data.tipo_plaza} onChange={(e) => setData('tipo_plaza', e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option>Base</option>
            <option>Confianza</option>
            <option>Eventual</option>
            <option>Supernumeraria</option>
          </select>
          <input type="date" value={data.fecha_vacante} onChange={(e) => setData('fecha_vacante', e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </div>

        <button type="submit" disabled={processing || !data.agremiado_jubilado_id} className="bg-[#0F4C5C] text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
          Registrar plaza vacante
        </button>
      </form>

      <div className="flex gap-2 mb-4 text-sm">
        <button onClick={() => filtrar('')} className={`px-3 py-1 rounded-full ${!filtros?.estatus ? 'bg-[#0F4C5C] text-white' : 'bg-slate-100 text-slate-600'}`}>Todas</button>
        <button onClick={() => filtrar('Vacante')} className={`px-3 py-1 rounded-full ${filtros?.estatus === 'Vacante' ? 'bg-[#0F4C5C] text-white' : 'bg-slate-100 text-slate-600'}`}>Vacantes</button>
        <button onClick={() => filtrar('Asignada')} className={`px-3 py-1 rounded-full ${filtros?.estatus === 'Asignada' ? 'bg-[#0F4C5C] text-white' : 'bg-slate-100 text-slate-600'}`}>Asignadas</button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">No. Plaza</th>
              <th className="text-left px-4 py-2">Se jubiló</th>
              <th className="text-left px-4 py-2">Tipo</th>
              <th className="text-left px-4 py-2">Dependencia</th>
              <th className="text-left px-4 py-2">Estatus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {plazas.data.map((pl) => (
              <tr key={pl.id}>
                <td className="px-4 py-2 font-semibold">{pl.no_plaza}</td>
                <td className="px-4 py-2 text-slate-500">{pl.agremiado_jubilado.nombre_completo}</td>
                <td className="px-4 py-2 text-slate-500">{pl.tipo_plaza}</td>
                <td className="px-4 py-2 text-slate-500">{pl.dependencia || '—'}</td>
                <td className="px-4 py-2"><AsignarPlaza plaza={pl} /></td>
              </tr>
            ))}
            {plazas.data.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Sin plazas registradas todavía.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Plantilla>
  );
}
