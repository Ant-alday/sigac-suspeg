import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import Plantilla from '../Agremiados/Plantilla';

const COLOR_ESTATUS = {
  'En trámite': 'bg-amber-50 text-amber-700',
  'En seguimiento': 'bg-blue-50 text-blue-700',
  'Turnado a Jurídico': 'bg-purple-50 text-purple-700',
  'Resuelto': 'bg-emerald-50 text-emerald-700',
};

export default function Listado({ casos, filtros }) {
  const [buscar, setBuscar] = useState(filtros?.buscar || '');
  const [periodoReporte, setPeriodoReporte] = useState('mensual');
  const [mesReporte, setMesReporte] = useState(new Date().getMonth() + 1);
  const [anioReporte, setAnioReporte] = useState(new Date().getFullYear());

  function actualizarFiltro(campo, valor) {
    router.get('/trabajos', { ...filtros, [campo]: valor }, { preserveState: true, replace: true });
  }

  function urlReporte(formato) {
    const params = new URLSearchParams({ periodo: periodoReporte, anio: anioReporte, formato });
    if (periodoReporte === 'mensual') params.set('mes', mesReporte);
    return `/trabajos-reporte?${params.toString()}`;
  }

  return (
    <Plantilla tituloPagina="Casos Laborales" migaDePan="Inicio / Trabajos y Conflictos" paginaActual="trabajos-listado">
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={buscar}
          onChange={(e) => { setBuscar(e.target.value); actualizarFiltro('buscar', e.target.value); }}
          placeholder="Buscar por nombre del trabajador..."
          className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm"
        />
        <select value={filtros?.tipo_caso || ''} onChange={(e) => actualizarFiltro('tipo_caso', e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Todos los tipos</option>
          <option>Despido Injustificado</option>
          <option>Conflicto Individual</option>
          <option>Conflicto Colectivo</option>
          <option>Demanda por Despido</option>
          <option>Otro</option>
        </select>
        <select value={filtros?.estatus || ''} onChange={(e) => actualizarFiltro('estatus', e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Todos los estatus</option>
          <option>En trámite</option>
          <option>En seguimiento</option>
          <option>Turnado a Jurídico</option>
          <option>Resuelto</option>
        </select>
        <Link href="/trabajos/registrar" className="bg-[#0F4C5C] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
          + Registrar caso
        </Link>
      </div>

      {/* CU-34: Generar Reporte de Casos Laborales */}
      <div className="flex items-center gap-2 mb-4 text-sm flex-wrap">
        <span className="text-slate-500">Reporte:</span>
        <select value={periodoReporte} onChange={(e) => setPeriodoReporte(e.target.value)} className="border border-slate-300 rounded-lg px-2 py-1">
          <option value="mensual">Mensual</option>
          <option value="anual">Anual</option>
        </select>
        {periodoReporte === 'mensual' && (
          <select value={mesReporte} onChange={(e) => setMesReporte(e.target.value)} className="border border-slate-300 rounded-lg px-2 py-1">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
          </select>
        )}
        <input type="number" value={anioReporte} onChange={(e) => setAnioReporte(e.target.value)} className="border border-slate-300 rounded-lg px-2 py-1 w-24" />
        <a href={urlReporte('pdf')} className="text-suspeg-teal font-semibold">PDF →</a>
        <a href={urlReporte('excel')} className="text-suspeg-teal font-semibold">Excel →</a>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Trabajador</th>
              <th className="text-left px-4 py-2">Tipo de caso</th>
              <th className="text-left px-4 py-2">Fecha</th>
              <th className="text-left px-4 py-2">Estatus</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {casos.data.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-2 font-semibold">{c.agremiado.nombre_completo}</td>
                <td className="px-4 py-2 text-slate-500">{c.tipo_caso}</td>
                <td className="px-4 py-2 text-slate-500">{c.fecha_registro}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${COLOR_ESTATUS[c.estatus]}`}>{c.estatus}</span>
                </td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/trabajos/${c.id}`} className="text-suspeg-teal font-semibold">Ver detalle →</Link>
                </td>
              </tr>
            ))}
            {casos.data.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Sin casos registrados todavía.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Plantilla>
  );
}
