import { useState } from 'react';
import { router } from '@inertiajs/react';
import Plantilla from '../Agremiados/Plantilla';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// CU-19: Verificar Cuota Mensual Reportada.
//
// Cruza datos del módulo de Organización (sueldo de cada agremiado
// Activo) con el módulo de Finanzas (el ingreso que ya se registró ese
// mes), para detectar si el monto reportado como "cuota mensual" en
// realidad coincide con lo que debería ser según la nómina de activos.
export default function VerificarCuota({ agremiados, totalCuotas, ingresoRegistrado, diferencia, mes, anio }) {
  const [mesSel, setMesSel] = useState(mes);
  const [anioSel, setAnioSel] = useState(anio);

  function consultar(nuevoMes, nuevoAnio) {
    router.get('/finanzas-verificar-cuota', { mes: nuevoMes, anio: nuevoAnio }, { preserveState: true });
  }

  // Un peso de tolerancia por redondeos; más que eso ya se considera
  // una diferencia real que vale la pena revisar.
  const coincide = Math.abs(diferencia) < 1;

  return (
    <Plantilla tituloPagina="Verificar Cuota Mensual" migaDePan="Inicio / Finanzas / Verificar Cuota" paginaActual="finanzas-verificar-cuota">
      <div className="flex gap-2 mb-4 items-center text-sm">
        <select
          value={mesSel}
          onChange={(e) => { setMesSel(e.target.value); consultar(e.target.value, anioSel); }}
          className="border border-slate-300 rounded-lg px-3 py-2"
        >
          {MESES.map((nombre, i) => <option key={i} value={i + 1}>{nombre}</option>)}
        </select>
        <input
          type="number"
          value={anioSel}
          onChange={(e) => { setAnioSel(e.target.value); consultar(mesSel, e.target.value); }}
          className="border border-slate-300 rounded-lg px-3 py-2 w-24"
        />
      </div>

      <div className={`rounded-lg p-4 mb-6 ${coincide ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
        <p className={`font-bold text-sm ${coincide ? 'text-emerald-700' : 'text-red-700'}`}>
          {coincide ? '✓ El ingreso registrado coincide con la suma de cuotas.' : '⚠ El ingreso registrado NO coincide con la suma de cuotas.'}
        </p>
        <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
          <div>
            <p className="text-slate-500 text-xs">Suma de cuotas (2% de {agremiados.length} agremiados activos)</p>
            <p className="font-bold">${totalCuotas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Ingreso registrado en Finanzas</p>
            <p className="font-bold">${ingresoRegistrado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Diferencia</p>
            <p className={`font-bold ${coincide ? 'text-emerald-700' : 'text-red-700'}`}>
              ${diferencia.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">No. Empleado</th>
              <th className="text-left px-4 py-2">Nombre</th>
              <th className="text-right px-4 py-2">Sueldo base</th>
              <th className="text-right px-4 py-2">Cuota SUSPEG (2%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {agremiados.map((a) => (
              <tr key={a.numero_empleado}>
                <td className="px-4 py-2">{a.numero_empleado}</td>
                <td className="px-4 py-2 font-semibold">{a.nombre_completo}</td>
                <td className="px-4 py-2 text-right">${a.sueldo_base.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-2 text-right">${a.cuota_suspeg.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
            {agremiados.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No hay agremiados en estatus Activo.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Plantilla>
  );
}
