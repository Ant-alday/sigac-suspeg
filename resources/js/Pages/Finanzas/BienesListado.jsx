import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import Plantilla from '../Agremiados/Plantilla';

const coloresEstatus = {
  Activo: 'bg-emerald-50 text-emerald-700',
  'En reparación': 'bg-amber-50 text-amber-700',
  'Dado de baja': 'bg-red-50 text-red-700',
};

// CU-06: Consultar Inventario de Bienes Muebles.
export default function BienesListado({ bienes, filtros }) {
  const [buscar, setBuscar] = useState(filtros?.buscar || '');

  function buscarBienes(valor) {
    router.get('/finanzas/bienes/listado', { buscar: valor }, { preserveState: true, replace: true });
  }

  return (
    <Plantilla tituloPagina="Inventario de Bienes Muebles" migaDePan="Inicio / Finanzas / Bienes" paginaActual="finanzas-bienes">
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={buscar}
          onChange={(e) => { setBuscar(e.target.value); buscarBienes(e.target.value); }}
          placeholder="Buscar por concepto o clave..."
          className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm"
        />
        <Link
          href="/finanzas/bienes/registrar"
          className="bg-[#0F4C5C] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap"
        >
          + Registrar bien mueble
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Clave</th>
              <th className="text-left px-4 py-2">Concepto</th>
              <th className="text-left px-4 py-2">Marca / Modelo</th>
              <th className="text-left px-4 py-2">Responsable</th>
              <th className="text-left px-4 py-2">Estatus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bienes.data.map((bien) => (
              <tr key={bien.id}>
                <td className="px-4 py-2 font-mono text-xs">{bien.clave}</td>
                <td className="px-4 py-2 font-semibold">{bien.concepto}</td>
                <td className="px-4 py-2 text-slate-500">{[bien.marca, bien.modelo].filter(Boolean).join(' / ') || '—'}</td>
                <td className="px-4 py-2 text-slate-500">{bien.responsable || 'Sin asignar'}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${coloresEstatus[bien.estatus]}`}>
                    {bien.estatus}
                  </span>
                </td>
              </tr>
            ))}
            {bienes.data.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Sin bienes registrados todavía.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Plantilla>
  );
}
