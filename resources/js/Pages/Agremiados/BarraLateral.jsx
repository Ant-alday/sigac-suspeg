import { useState } from 'react';
import { Link } from '@inertiajs/react';

// Barra lateral con Bootstrap Icons (solo la librería de íconos, no el
// framework CSS completo — así no choca nada con Tailwind). Cada
// secretaría tiene su propio color e ícono en un círculo, y cada
// enlace lleva su propio ícono también, con una animación de apertura
// suave (CSS Grid) y un acomodo escalonado al desplegarse.
const GRUPOS = [
  {
    clave: 'organizacion',
    titulo: 'Sec. de Organización',
    icono: 'bi-building-fill',
    acento: '#0F4C5C',
    fondoSuave: '#EAF2F3',
    enlaces: [
      { texto: 'Consultar agremiados', icono: 'bi-people-fill', ruta: '/agremiados', clave: 'listado' },
      { texto: 'Registrar agremiado', icono: 'bi-person-plus-fill', ruta: '/agremiados/registrar', clave: 'registrar' },
      { texto: 'Secretarías / Dependencias', icono: 'bi-diagram-3-fill', ruta: '/catalogos', clave: 'catalogos' },
    ],
  },
  {
    clave: 'finanzas',
    titulo: 'Sec. de Finanzas',
    icono: 'bi-cash-coin',
    acento: '#0F4C5C',
    fondoSuave: '#EAF2F3',
    enlaces: [
      { texto: 'Movimientos y saldos', icono: 'bi-graph-up-arrow', ruta: '/finanzas', clave: 'finanzas-listado' },
      { texto: 'Registrar movimiento', icono: 'bi-plus-circle-fill', ruta: '/finanzas/registrar', clave: 'finanzas-registrar' },
      { texto: 'Verificar cuota mensual', icono: 'bi-check2-circle', ruta: '/finanzas-verificar-cuota', clave: 'finanzas-verificar-cuota' },
      { texto: 'Inventario de bienes muebles', icono: 'bi-box-seam-fill', ruta: '/finanzas/bienes/listado', clave: 'finanzas-bienes' },
      { texto: 'Registrar bien mueble', icono: 'bi-plus-square-fill', ruta: '/finanzas/bienes/registrar', clave: 'finanzas-bienes-registrar' },
    ],
  },
  {
    clave: 'fomento',
    titulo: 'Sec. de Fomento Habitacional',
    icono: 'bi-house-heart-fill',
    acento: '#C2703D',
    fondoSuave: '#FDF3EC',
    enlaces: [
      { texto: 'Padrón de beneficiarios', icono: 'bi-people-fill', ruta: '/fomento', clave: 'fomento-listado' },
      { texto: 'Catálogo de insumos', icono: 'bi-grid-3x3-gap-fill', ruta: '/fomento-insumos', clave: 'fomento-insumos' },
      { texto: 'Convenios de descuento', icono: 'bi-file-earmark-text-fill', ruta: '/fomento-convenios', clave: 'fomento-convenios' },
      { texto: 'Registrar beneficiario manual', icono: 'bi-person-plus-fill', ruta: '/fomento/registrar', clave: 'fomento-registrar' },
    ],
  },
  {
    clave: 'trabajos',
    titulo: 'Sec. de Trabajos y Conflictos',
    icono: 'bi-hammer',
    acento: '#8C5C8C',
    fondoSuave: '#F5EDF5',
    enlaces: [
      { texto: 'Casos laborales', icono: 'bi-briefcase-fill', ruta: '/trabajos', clave: 'trabajos-listado' },
      { texto: 'Registrar caso', icono: 'bi-file-earmark-plus-fill', ruta: '/trabajos/registrar', clave: 'trabajos-registrar' },
      { texto: 'Solicitudes de permiso', icono: 'bi-calendar2-check-fill', ruta: '/trabajos-permisos', clave: 'trabajos-permisos' },
      { texto: 'Plazas vacantes', icono: 'bi-person-badge-fill', ruta: '/trabajos-plazas', clave: 'trabajos-plazas' },
    ],
  },
];

function GrupoAcordeon({ grupo, desplegado, onToggle, paginaActual }) {
  return (
    <div className="mb-1.5 px-3">
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
          desplegado ? 'text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
        }`}
        style={desplegado ? { backgroundColor: grupo.acento } : undefined}
      >
        {/* Ícono en su propio círculo, para que resalte más */}
        <span
          className="w-8 h-8 rounded-full grid place-items-center text-base shrink-0 transition-colors duration-200"
          style={{
            backgroundColor: desplegado ? 'rgba(255,255,255,0.22)' : grupo.fondoSuave,
            color: desplegado ? 'white' : grupo.acento,
          }}
        >
          <i className={`bi ${grupo.icono}`}></i>
        </span>
        <span className="flex-1 text-left">{grupo.titulo}</span>
        <i
          className="bi bi-chevron-right text-xs transition-transform duration-300 ease-out"
          style={{ transform: desplegado ? 'rotate(90deg)' : 'rotate(0deg)' }}
        ></i>
      </button>

      {/* Animación de altura suave con CSS Grid */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: desplegado ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <ul className="mt-1.5 space-y-0.5 pl-3 pb-1 border-l-2 ml-4" style={{ borderColor: grupo.fondoSuave }}>
            {grupo.enlaces.map((enlace, i) => {
              const activo = paginaActual === enlace.clave;
              return (
                <li
                  key={enlace.clave}
                  className="transition-all duration-200"
                  style={{
                    transitionDelay: desplegado ? `${i * 30}ms` : '0ms',
                    opacity: desplegado ? 1 : 0,
                    transform: desplegado ? 'translateX(0)' : 'translateX(-8px)',
                  }}
                >
                  <Link
                    href={enlace.ruta}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                      activo ? 'text-white font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-0.5'
                    }`}
                    style={activo ? { backgroundColor: grupo.acento } : undefined}
                  >
                    <i className={`bi ${enlace.icono} text-sm`} style={!activo ? { color: grupo.acento } : undefined}></i>
                    <span>{enlace.texto}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function BarraLateral({ abierta, paginaActual }) {
  const grupoDeLaPaginaActual = GRUPOS.find((g) => g.enlaces.some((e) => e.clave === paginaActual))?.clave;
  const [grupoAbierto, setGrupoAbierto] = useState(grupoDeLaPaginaActual ?? 'organizacion');

  return (
    <aside
      className={`bg-white border-r border-slate-200 shrink-0 overflow-hidden transition-all duration-300 ease-out ${
        abierta ? 'w-72' : 'w-0'
      }`}
    >
      <nav className="w-72 py-4">
        {GRUPOS.map((grupo) => (
          <GrupoAcordeon
            key={grupo.clave}
            grupo={grupo}
            desplegado={grupoAbierto === grupo.clave}
            onToggle={() => setGrupoAbierto(grupoAbierto === grupo.clave ? null : grupo.clave)}
            paginaActual={paginaActual}
          />
        ))}
      </nav>
    </aside>
  );
}
