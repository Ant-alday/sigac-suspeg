import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import Plantilla from './Plantilla';

// CU-01: Consultar y Buscar Agremiados.
// Muestra la tabla del padrón, con un buscador y un filtro por estatus.
export default function Listado({ agremiados, filtros }) {
  const [buscar, setBuscar] = useState(filtros?.buscar || '');
  const [estatus, setEstatus] = useState(filtros?.estatus || '');
  // CU-08: en qué formato se quiere el reporte del padrón completo.
  const [formatoReporte, setFormatoReporte] = useState('pdf');

  // Cada vez que el usuario escribe o cambia el filtro, le pedimos al
  // servidor la lista actualizada (sin recargar toda la página, gracias a Inertia).
  function buscarAgremiados(nuevaBusqueda, nuevoEstatus) {
    router.get(
      '/agremiados',
      { buscar: nuevaBusqueda, estatus: nuevoEstatus },
      { preserveState: true, replace: true }
    );
  }

  const coloresEstatus = {
    Activo: 'bg-emerald-50 text-emerald-700',
    'En proceso': 'bg-amber-50 text-amber-700',
    Baja: 'bg-red-50 text-red-700',
    Base: 'bg-blue-50 text-blue-700',
  };

  return (
    <Plantilla tituloPagina="Padrón de Agremiados" migaDePan="Inicio / Padrón y Organización" paginaActual="listado">
      {/* --- Buscador y filtro --- */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={buscar}
          onChange={(e) => {
            setBuscar(e.target.value);
            buscarAgremiados(e.target.value, estatus);
          }}
          placeholder="Buscar por nombre, número de empleado, CURP o RFC..."
          className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm"
        />
        <select
          value={estatus}
          onChange={(e) => {
            setEstatus(e.target.value);
            buscarAgremiados(buscar, e.target.value);
          }}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos los estatus</option>
          <option value="Activo">Activo</option>
          <option value="En proceso">En proceso</option>
          <option value="Baja">Baja</option>
          <option value="Base">Base</option>
        </select>
        <Link
          href="/agremiados/registrar"
          className="bg-[#0F4C5C] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap"
        >
          + Registrar agremiado
        </Link>
      </div>

      {/* --- CU-08: Generar Reporte del Padrón Completo --- */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <span className="text-slate-500">Reporte del padrón completo:</span>
        <select
          value={formatoReporte}
          onChange={(e) => setFormatoReporte(e.target.value)}
          className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
        >
          <option value="pdf">PDF</option>
          <option value="excel">Excel</option>
        </select>
        {/* Enlace normal, igual que la ficha individual: el navegador
            descarga el archivo solo, sin código extra de nuestra parte. */}
        <a
          href={`/agremiados-reporte?formato=${formatoReporte}`}
          className="text-suspeg-teal font-semibold"
        >
          Generar reporte →
        </a>
      </div>

      {/* --- Tabla de resultados --- */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">No. empleado</th>
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">Dependencia</th>
              <th className="text-left px-4 py-3">Estatus</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {agremiados.data.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-slate-400 py-8">
                  No se encontraron agremiados.
                </td>
              </tr>
            )}
            {agremiados.data.map((agremiado) => (
              <tr key={agremiado.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-500">{agremiado.numero_empleado}</td>
                <td className="px-4 py-3 font-semibold text-slate-800">{agremiado.nombre_completo}</td>
                <td className="px-4 py-3 text-slate-500">{agremiado.dependencia?.nombre}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${coloresEstatus[agremiado.estatus]}`}>
                    {agremiado.estatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/agremiados/${agremiado.id}`} className="text-[#0F4C5C] font-semibold">
                    Ver detalle →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Plantilla>
  );
}
