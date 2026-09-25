import { useState, useEffect, useRef } from 'react';

// Autocompletar de agremiados: escribe 2+ letras y busca por nombre o
// número de empleado. Se usa en Registrar Caso, Permisos y Plazas para
// no tener que cargar el padrón completo de agremiados de una vez.
export default function BuscadorAgremiado({ onSeleccionar, seleccionado, placeholder = 'Buscar agremiado por nombre o número...' }) {
  const [texto, setTexto] = useState('');
  const [resultados, setResultados] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (texto.length < 2) { setResultados([]); return; }
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetch(`/trabajos-buscar-agremiados?q=${encodeURIComponent(texto)}`)
        .then((r) => r.json())
        .then((data) => { setResultados(data); setAbierto(true); });
    }, 250);
    return () => clearTimeout(timeoutRef.current);
  }, [texto]);

  function elegir(agremiado) {
    onSeleccionar(agremiado);
    setTexto('');
    setAbierto(false);
  }

  if (seleccionado) {
    return (
      <div className="flex items-center justify-between border border-emerald-300 bg-emerald-50 rounded-lg px-3 py-2 text-sm">
        <span className="font-semibold text-emerald-800">{seleccionado.nombre_completo} ({seleccionado.numero_empleado})</span>
        <button type="button" onClick={() => onSeleccionar(null)} className="text-emerald-700 text-xs font-semibold">Cambiar</button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onFocus={() => resultados.length > 0 && setAbierto(true)}
        placeholder={placeholder}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
      />
      {abierto && resultados.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-56 overflow-y-auto">
          {resultados.map((a) => (
            <li
              key={a.id}
              onClick={() => elegir(a)}
              className="px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer"
            >
              <span className="font-semibold">{a.nombre_completo}</span>
              <span className="text-slate-400 ml-2">{a.numero_empleado}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
