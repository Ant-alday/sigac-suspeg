import { useState, useRef, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import Plantilla from '../Agremiados/Plantilla';

const ACENTOS = [
  { de: '#C2703D', a: '#D98A55', fondo: '#FDF3EC', texto: '#9C5228', icono: '☀️' },
  { de: '#5B8266', a: '#78A183', fondo: '#EEF4EF', texto: '#3F5D48', icono: '💧' },
  { de: '#4C7A96', a: '#6B9AB5', fondo: '#EBF3F7', texto: '#365A6E', icono: '🪣' },
  { de: '#B08A2E', a: '#CBA84E', fondo: '#FBF3E1', texto: '#8A6B1F', icono: '🥛' },
  { de: '#8C5C8C', a: '#A87BA8', fondo: '#F5EDF5', texto: '#6B446B', icono: '🧱' },
  { de: '#0F4C5C', a: '#2E7188', fondo: '#EAF2F3', texto: '#0A3540', icono: '🔧' },
];

// Una fila de insumo, que se puede editar en línea (nombre, precio,
// unidad) en vez de solo el precio como antes.
function FilaInsumo({ insumo, acento }) {
  const [editando, setEditando] = useState(false);
  const [datos, setDatos] = useState({ nombre: insumo.nombre, precio_actual: insumo.precio_actual, unidad_medida: insumo.unidad_medida });

  function guardar() {
    router.put(`/fomento-insumos/${insumo.id}`, datos, { onSuccess: () => setEditando(false) });
  }

  function eliminar() {
    if (confirm('¿Eliminar este insumo del catálogo?')) {
      router.delete(`/fomento-insumos/${insumo.id}`);
    }
  }

  if (editando) {
    return (
      <li className="flex items-center gap-2 px-3 py-2 text-sm bg-white">
        <input
          type="text"
          value={datos.nombre}
          onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
          className="flex-1 border border-slate-300 rounded px-2 py-1 text-sm"
        />
        <input
          type="number"
          step="0.01"
          value={datos.precio_actual}
          onChange={(e) => setDatos({ ...datos, precio_actual: e.target.value })}
          className="w-24 border border-slate-300 rounded px-2 py-1 text-sm"
        />
        <input
          type="text"
          value={datos.unidad_medida}
          onChange={(e) => setDatos({ ...datos, unidad_medida: e.target.value })}
          className="w-20 border border-slate-300 rounded px-2 py-1 text-sm"
        />
        <button onClick={guardar} className="text-emerald-600 text-xs font-semibold">Guardar</button>
        <button onClick={() => setEditando(false)} className="text-slate-400 text-xs font-semibold">Cancelar</button>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between px-3 py-2 text-sm">
      <span className="font-medium text-slate-700">{insumo.nombre}</span>
      <div className="flex items-center gap-3">
        <span className="font-semibold" style={{ color: acento.texto }}>
          ${Number(insumo.precio_actual).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </span>
        <button onClick={() => setEditando(true)} className="text-slate-400 text-xs font-semibold">Editar</button>
        <button onClick={eliminar} className="text-red-500 text-xs font-semibold">Eliminar</button>
      </div>
    </li>
  );
}

function TarjetaCategoria({ categoria, acento, abierta, onToggle }) {
  const [nuevoInsumo, setNuevoInsumo] = useState({ nombre: '', precio_actual: '', unidad_medida: 'Pieza' });

  function agregarInsumo(e) {
    e.preventDefault();
    router.post('/fomento-insumos', {
      nombre: nuevoInsumo.nombre,
      categoria_id: categoria.id,
      precio_actual: nuevoInsumo.precio_actual,
      unidad_medida: nuevoInsumo.unidad_medida,
    }, { onSuccess: () => setNuevoInsumo({ nombre: '', precio_actual: '', unidad_medida: 'Pieza' }) });
  }

  function eliminarCategoria() {
    if (confirm('¿Eliminar esta categoría completa? Solo se puede si no tiene insumos.')) {
      router.delete(`/fomento-categorias/${categoria.id}`);
    }
  }

  return (
    <div
      className="rounded-2xl overflow-hidden bg-white transition-all duration-200"
      style={{
        boxShadow: abierta ? `0 10px 25px -5px ${acento.de}40` : '0 1px 3px rgba(0,0,0,0.08)',
        border: `1px solid ${abierta ? acento.de : '#E5E7EB'}`,
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-5 text-left"
        style={{ background: `linear-gradient(135deg, ${acento.de}, ${acento.a})` }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl drop-shadow-sm">{acento.icono}</span>
          <div>
            <p className="font-bold text-base text-white">{categoria.nombre}</p>
            <p className="text-xs text-white/80">{categoria.insumos.length} insumo(s)</p>
          </div>
        </div>
        <span className="text-white text-xl font-light w-7 h-7 flex items-center justify-center rounded-full bg-white/20">
          {abierta ? '−' : '+'}
        </span>
      </button>

      {abierta && (
        <div className="p-4" style={{ backgroundColor: acento.fondo }}>
          <ul className="divide-y divide-black/5 mb-3 bg-white rounded-xl overflow-hidden">
            {categoria.insumos.map((i) => (
              <FilaInsumo key={i.id} insumo={i} acento={acento} />
            ))}
            {categoria.insumos.length === 0 && (
              <li className="text-sm text-slate-400 px-3 py-3">Todavía no hay insumos en esta categoría.</li>
            )}
          </ul>

          <form onSubmit={agregarInsumo} className="flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Nombre del insumo..."
              value={nuevoInsumo.nombre}
              onChange={(e) => setNuevoInsumo({ ...nuevoInsumo, nombre: e.target.value })}
              className="flex-1 min-w-[160px] border-0 rounded-lg px-3 py-1.5 text-sm shadow-sm"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Precio"
              value={nuevoInsumo.precio_actual}
              onChange={(e) => setNuevoInsumo({ ...nuevoInsumo, precio_actual: e.target.value })}
              className="w-28 border-0 rounded-lg px-3 py-1.5 text-sm shadow-sm"
            />
            <button
              type="submit"
              className="text-white text-sm font-semibold px-3 py-1.5 rounded-lg shadow-sm"
              style={{ background: `linear-gradient(135deg, ${acento.de}, ${acento.a})` }}
            >
              + Agregar
            </button>
          </form>

          <button onClick={eliminarCategoria} className="text-xs text-slate-400 hover:text-red-500 mt-3">
            Eliminar esta categoría
          </button>
        </div>
      )}
    </div>
  );
}

// Botón "+ Nueva categoría" que se transforma en un campo de texto al
// hacer clic (con el cursor ya puesto ahí), y vuelve a su forma
// original después de guardar — en vez de tener el formulario siempre
// abierto ocupando espacio.
function NuevaCategoria() {
  const [activo, setActivo] = useState(false);
  const [nombre, setNombre] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (activo) inputRef.current?.focus();
  }, [activo]);

  function guardar(e) {
    e.preventDefault();
    if (!nombre.trim()) return;
    router.post('/fomento-categorias', { nombre }, {
      onSuccess: () => { setNombre(''); setActivo(false); },
    });
  }

  if (!activo) {
    return (
      <button
        onClick={() => setActivo(true)}
        className="mb-6 bg-[#0F4C5C] text-white px-4 py-2 rounded-lg text-sm font-semibold"
      >
        + Nueva categoría
      </button>
    );
  }

  return (
    <form onSubmit={guardar} className="flex gap-2 mb-6 max-w-md">
      <input
        ref={inputRef}
        type="text"
        placeholder="Nombre de la categoría (ej. Estufas)..."
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && setActivo(false)}
        className="flex-1 border-2 border-[#0F4C5C] rounded-lg px-3 py-2 text-sm outline-none ring-2 ring-[#0F4C5C]/20"
      />
      <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
        Guardar
      </button>
      <button type="button" onClick={() => setActivo(false)} className="text-slate-400 text-sm px-2">
        Cancelar
      </button>
    </form>
  );
}

// CU-24: Gestionar Catálogo de Insumos, en tarjetas por categoría.
export default function Insumos({ categorias, errors }) {
  const [abiertas, setAbiertas] = useState({});

  function toggle(id) {
    setAbiertas((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <Plantilla tituloPagina="Catálogo de Insumos" migaDePan="Inicio / Fomento Habitacional / Insumos" paginaActual="fomento-insumos">
      <NuevaCategoria />
      {errors?.categoria && <p className="text-red-600 text-sm mb-4 bg-red-50 rounded-lg px-3 py-2">{errors.categoria}</p>}
      {errors?.insumo && <p className="text-red-600 text-sm mb-4 bg-red-50 rounded-lg px-3 py-2">{errors.insumo}</p>}

      <div className="grid grid-cols-2 gap-5">
        {categorias.map((cat, i) => (
          <TarjetaCategoria
            key={cat.id}
            categoria={cat}
            acento={ACENTOS[i % ACENTOS.length]}
            abierta={!!abiertas[cat.id]}
            onToggle={() => toggle(cat.id)}
          />
        ))}
      </div>
      {categorias.length === 0 && (
        <p className="text-sm text-slate-400">Todavía no hay categorías. Crea la primera arriba.</p>
      )}
    </Plantilla>
  );
}
