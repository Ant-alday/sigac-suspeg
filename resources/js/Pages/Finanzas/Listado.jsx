import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import Plantilla from '../Agremiados/Plantilla';

// CU-01: Consultar Movimientos y Saldo por Partida.
// Muestra una tarjeta por cada una de las 9 partidas (con su saldo
// disponible) y, debajo, la tabla de movimientos con filtro.
export default function Listado({ partidas, movimientos, filtros, resumenMes }) {
  const [tipo, setTipo] = useState(filtros?.tipo || '');
  const [partidaId, setPartidaId] = useState(filtros?.partida_id || '');
  const [periodo, setPeriodo] = useState('mensual');
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [formato, setFormato] = useState('pdf');

  function verMes(nuevoMes, nuevoAnio) {
    router.get('/finanzas', { mes: nuevoMes, anio: nuevoAnio }, { preserveState: true });
  }

  function filtrar(nuevoTipo, nuevaPartida) {
    router.get('/finanzas', { tipo: nuevoTipo, partida_id: nuevaPartida }, { preserveState: true, replace: true });
  }

  // CU-05: arma la URL de descarga del informe con los parámetros
  // elegidos. Es un <a> normal, así que el navegador se encarga solo
  // de la descarga.
  const urlInforme = `/finanzas-informe?periodo=${periodo}&mes=${mes}&anio=${anio}&formato=${formato}`;

  return (
    <Plantilla tituloPagina="Movimientos y Saldos" migaDePan="Inicio / Finanzas" paginaActual="finanzas-listado">
      {/* --- Resumen del mes: Ingreso vs. Gasto vs. Remanente, igual
          que el informe real. Si el remanente es negativo, se muestra
          en rojo — es un AVISO, no bloquea nada. --- */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-500">Resumen del mes</h2>
          <div className="flex gap-2 text-sm">
            <select
              value={resumenMes.mes}
              onChange={(e) => verMes(e.target.value, resumenMes.anio)}
              className="border border-slate-300 rounded-lg px-2 py-1"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
            <input
              type="number"
              value={resumenMes.anio}
              onChange={(e) => verMes(resumenMes.mes, e.target.value)}
              className="border border-slate-300 rounded-lg px-2 py-1 w-24"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 border border-slate-200 rounded-lg overflow-hidden text-sm">
          <div className="p-3 border-r border-slate-200">
            <p className="text-xs text-slate-400 uppercase font-semibold">Ingreso</p>
            <p className="font-bold text-slate-800">${resumenMes.ingreso.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-3 border-r border-slate-200">
            <p className="text-xs text-slate-400 uppercase font-semibold">Gasto</p>
            <p className="font-bold text-slate-800">${resumenMes.gasto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className={`p-3 ${resumenMes.remanente < 0 ? 'bg-red-500' : ''}`}>
            <p className={`text-xs uppercase font-semibold ${resumenMes.remanente < 0 ? 'text-red-100' : 'text-slate-400'}`}>Remanente</p>
            <p className={`font-bold ${resumenMes.remanente < 0 ? 'text-white' : 'text-slate-800'}`}>
              ${resumenMes.remanente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        {resumenMes.remanente < 0 && (
          <p className="text-xs text-red-600 mt-2">
            ⚠ El gasto de este mes superó al ingreso. Esto no bloquea nada, es solo un aviso — así funciona el control real.
          </p>
        )}
      </div>

      {/* --- Tarjetas de saldo, una por partida (de referencia; ya no
          bloquean nada, ver el resumen mensual de arriba) --- */}
      <p className="text-xs text-slate-400 mb-2">Saldo de referencia por partida (no bloquea el registro, es solo informativo):</p>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {partidas.map((partida) => {
          const porcentaje = partida.monto_asignado > 0
            ? (partida.saldo_actual / partida.monto_asignado) * 100
            : 100;
          const bajo = porcentaje < 20;
          return (
            <div key={partida.id} className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-500 mb-1">{partida.nombre}</p>
              <p className={`text-lg font-bold ${bajo ? 'text-red-600' : 'text-suspeg-teal'}`}>
                ${Number(partida.saldo_actual).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-400">
                de ${Number(partida.monto_asignado).toLocaleString('es-MX', { minimumFractionDigits: 2 })} asignado
              </p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                <div
                  className={`h-1.5 rounded-full ${bajo ? 'bg-red-500' : 'bg-suspeg-teal'}`}
                  style={{ width: `${Math.max(0, Math.min(100, porcentaje))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* --- CU-05: Generar Informe Mensual y Anual --- */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6 flex items-center gap-2 flex-wrap text-sm">
        <span className="font-semibold text-slate-600">Generar informe:</span>
        <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="border border-slate-300 rounded-lg px-2 py-1.5">
          <option value="mensual">Mensual</option>
          <option value="anual">Anual</option>
        </select>
        {periodo === 'mensual' && (
          <select value={mes} onChange={(e) => setMes(e.target.value)} className="border border-slate-300 rounded-lg px-2 py-1.5">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
            ))}
          </select>
        )}
        <input
          type="number"
          value={anio}
          onChange={(e) => setAnio(e.target.value)}
          className="border border-slate-300 rounded-lg px-2 py-1.5 w-24"
        />
        <select value={formato} onChange={(e) => setFormato(e.target.value)} className="border border-slate-300 rounded-lg px-2 py-1.5">
          <option value="pdf">PDF</option>
          <option value="excel">Excel</option>
        </select>
        <a href={urlInforme} className="text-suspeg-teal font-semibold">Generar →</a>
      </div>

      {/* --- Filtros y botón de registrar --- */}
      <div className="flex gap-3 mb-4">
        <select
          value={tipo}
          onChange={(e) => { setTipo(e.target.value); filtrar(e.target.value, partidaId); }}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos los tipos</option>
          <option value="Ingreso">Ingreso</option>
          <option value="Egreso">Egreso</option>
        </select>
        <select
          value={partidaId}
          onChange={(e) => { setPartidaId(e.target.value); filtrar(tipo, e.target.value); }}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm flex-1"
        >
          <option value="">Todas las partidas</option>
          {partidas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <Link
          href="/finanzas/registrar"
          className="bg-[#0F4C5C] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap"
        >
          + Registrar movimiento
        </Link>
      </div>

      {/* --- Tabla de movimientos --- */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Fecha</th>
              <th className="text-left px-4 py-2">Tipo</th>
              <th className="text-left px-4 py-2">Concepto</th>
              <th className="text-left px-4 py-2">Partida</th>
              <th className="text-right px-4 py-2">Importe</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {movimientos.data.map((mov) => (
              <tr key={mov.id}>
                <td className="px-4 py-2">{mov.fecha_movimiento}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    mov.tipo === 'Ingreso' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {mov.tipo}
                  </span>
                </td>
                <td className="px-4 py-2">{mov.concepto}</td>
                <td className="px-4 py-2 text-slate-500">{mov.partida?.nombre ?? '—'}</td>
                <td className="px-4 py-2 text-right font-semibold">${Number(mov.importe).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/finanzas/${mov.id}`} className="text-suspeg-teal font-semibold">Ver detalle →</Link>
                </td>
              </tr>
            ))}
            {movimientos.data.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Sin movimientos registrados todavía.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Plantilla>
  );
}
