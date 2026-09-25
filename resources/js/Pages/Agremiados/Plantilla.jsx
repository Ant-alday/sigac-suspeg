import { useState } from 'react';
import { Link } from '@inertiajs/react';
import BarraLateral from './BarraLateral';

// Plantilla (layout) que envuelve todas las pantallas: barra superior,
// barra lateral colapsable, encabezado y pie de página.
export default function Plantilla({ tituloPagina, migaDePan, paginaActual, children }) {
  // Controla si la barra lateral se ve o está escondida.
  // Empieza abierta (true) por defecto.
  const [barraAbierta, setBarraAbierta] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* --- Barra de navegación superior --- */}
      <header className="bg-suspeg-teal-oscuro text-white">
        <div className="px-4 h-14 flex items-center gap-4">
          {/* Botón para esconder/mostrar la barra lateral */}
          <button
            onClick={() => setBarraAbierta(!barraAbierta)}
            className="p-2 rounded hover:bg-white/10"
            title={barraAbierta ? 'Ocultar menú' : 'Mostrar menú'}
          >
            {/* Ícono simple de "hamburguesa" hecho con 3 líneas */}
            <span className="block w-5 h-0.5 bg-white mb-1"></span>
            <span className="block w-5 h-0.5 bg-white mb-1"></span>
            <span className="block w-5 h-0.5 bg-white"></span>
          </button>

          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-suspeg-dorado text-suspeg-teal-oscuro font-bold text-sm grid place-items-center">
              S
            </span>
            <span className="font-semibold">SIGAC · SUSPEG Sección 75</span>
          </div>

          <div className="flex-1"></div>

          {/* Sin login todavía, así que aquí no mostramos un usuario real */}
          <span className="text-sm text-slate-300">Secretaría de Organización</span>
        </div>
      </header>

      {/* --- Cuerpo: barra lateral + contenido --- */}
      <div className="flex flex-1">
        <BarraLateral abierta={barraAbierta} paginaActual={paginaActual} />

        <div className="flex-1 flex flex-col min-w-0">
          {/* --- Encabezado de la página --- */}
          <div className="bg-white border-b border-slate-200">
            <div className="px-6 py-4">
              {migaDePan && <p className="text-xs text-slate-500 mb-1">{migaDePan}</p>}
              <h1 className="text-2xl font-bold text-slate-800">{tituloPagina}</h1>
            </div>
          </div>

          {/* --- Contenido de cada pantalla --- */}
          <main className="px-6 py-6 flex-1 w-full">{children}</main>

          {/* --- Pie de página --- */}
          <footer className="bg-slate-100 border-t border-slate-200">
            <div className="px-6 h-12 flex items-center justify-between text-xs text-slate-500">
              <span>© 2026 SUSPEG Sección 75 — Sistema SIGAC v1.0</span>
              <span>Ayuda · Aviso de privacidad · Soporte técnico</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
