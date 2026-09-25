import { useState } from 'react';
import { router } from '@inertiajs/react';
import Plantilla from '../Agremiados/Plantilla';

// CU-20: Consultar Padrón de Beneficiarios.
//
// IMPORTANTE: en la práctica, todo beneficiario real es un agremiado —
// por eso esta pantalla ya no lista una tabla "beneficiarios" aparte;
// lista directamente el padrón de agremiados de Organización (solo
// lectura), con el botón "Solicitar beneficio" en cada fila. Al
// oprimirlo, se autocompleta todo (nombre, domicilio, CURP, celular) y
// se abre de una vez el formulario de la solicitud.
export default function Listado({ agremiados, filtros }) {
  const [buscar, setBuscar] = useState(filtros?.buscar || '');
  const [periodoReporte, setPeriodoReporte] = useState('mensual');
  const [mesReporte, setMesReporte] = useState(new Date().getMonth() + 1);
  const [anioReporte, setAnioReporte] = useState(new Date().getFullYear());

  function urlReporte(formato) {
    const params = new URLSearchParams({ periodo: periodoReporte, anio: anioReporte, formato });
    if (periodoReporte === 'mensual') params.set('mes', mesReporte);
    return `/fomento-reporte?${params.toString()}`;
  }

  function buscarAgremiados(valor) {
    router.get('/fomento', { buscar: valor }, { preserveState: true, replace: true });
  }

  return (
    <Plantilla tituloPagina="Padrón de Beneficiarios" migaDePan="Inicio / Fomento Habitacional" paginaActual="fomento-listado">
      <p className="text-sm text-slate-500 mb-4">
        Todo agremiado activo puede recibir un beneficio. Busca su nombre y oprime "Solicitar beneficio" — sus datos se autocompletan.
      </p>
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={buscar}
          onChange={(e) => { setBuscar(e.target.value); buscarAgremiados(e.target.value); }}
          placeholder="Buscar por nombre o CURP..."
          className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm"
        />
      </div>

      {/* CU-26: Generar Reporte de Beneficiarios por Insumo (mensual o anual) */}
      <div className="flex items-center gap-2 mb-4 text-sm flex-wrap">
        <span className="text-slate-500">Reporte por insumo:</span>
        <select value={periodoReporte} onChange={(e) => setPeriodoReporte(e.target.value)} className="border border-slate-300 rounded-lg px-2 py-1">
          <option value="mensual">Mensual</option>
          <option value="anual">Anual</option>
        </select>
        {periodoReporte === 'mensual' && (
          <select value={mesReporte} onChange={(e) => setMesReporte(e.target.value)} className="border border-slate-300 rounded-lg px-2 py-1">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
            ))}
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
              <th className="text-left px-4 py-2">Nombre</th>
              <th className="text-left px-4 py-2">Domicilio</th>
              <th className="text-left px-4 py-2">Municipio</th>
              <th className="text-left px-4 py-2">Celular</th>
              <th className="text-left px-4 py-2">Beneficios</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {agremiados.data.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-2 font-semibold">{a.nombre_completo}</td>
                <td className="px-4 py-2 text-slate-500">{a.domicilio || '—'}</td>
                <td className="px-4 py-2 text-slate-500">{a.ciudad_localidad_municipio || '—'}</td>
                <td className="px-4 py-2 text-slate-500">{a.telefono || '—'}</td>
                <td className="px-4 py-2">
                  {a.total_solicitudes > 0 ? (
                    <a href={`/fomento/${a.beneficiario_id}`} className="text-[#0F4C5C] font-semibold text-xs bg-[#EAF2F3] px-2 py-1 rounded-full">
                      {a.total_solicitudes} solicitud(es) →
                    </a>
                  ) : (
                    <span className="text-slate-400 text-xs">Ninguno todavía</span>
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  <a
                    href={`/fomento/desde-agremiado/${a.id}`}
                    className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#C2703D] hover:bg-[#A85D30] whitespace-nowrap"
                  >
                    Solicitar beneficio
                  </a>
                </td>
              </tr>
            ))}
            {agremiados.data.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Sin agremiados activos que coincidan.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Plantilla>
  );
}
