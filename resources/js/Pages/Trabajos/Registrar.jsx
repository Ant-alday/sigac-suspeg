import { useForm } from '@inertiajs/react';
import Plantilla from '../Agremiados/Plantilla';
import BuscadorAgremiado from './BuscadorAgremiado';

export default function Registrar() {
  const { data, setData, post, processing, errors } = useForm({
    agremiado_id: '',
    agremiado_obj: null, // solo para mostrar en pantalla, no se envía
    escolaridad: '',
    tipo_caso: '',
    descripcion: '',
    fecha_registro: new Date().toISOString().slice(0, 10),
  });

  function elegirAgremiado(agremiado) {
    setData({ ...data, agremiado_id: agremiado?.id || '', agremiado_obj: agremiado });
  }

  function enviar(e) {
    e.preventDefault();
    post('/trabajos');
  }

  return (
    <Plantilla tituloPagina="Registrar Caso Laboral" migaDePan="Inicio / Trabajos y Conflictos / Registrar" paginaActual="trabajos-registrar">
      <form onSubmit={enviar} className="bg-white rounded-lg border border-slate-200 p-6 max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Trabajador *</label>
          <BuscadorAgremiado onSeleccionar={elegirAgremiado} seleccionado={data.agremiado_obj} />
          {errors.agremiado_id && <p className="text-red-600 text-xs mt-1">{errors.agremiado_id}</p>}
          <p className="text-xs text-slate-400 mt-1">Sus datos (dependencia, edad, estado civil, hijos) se toman de su expediente en Organización.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Escolaridad (opcional)</label>
          <input type="text" value={data.escolaridad} onChange={(e) => setData('escolaridad', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo de caso *</label>
          <select value={data.tipo_caso} onChange={(e) => setData('tipo_caso', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Selecciona...</option>
            <option>Despido Injustificado</option>
            <option>Conflicto Individual</option>
            <option>Conflicto Colectivo</option>
            <option>Demanda por Despido</option>
            <option>Otro</option>
          </select>
          {errors.tipo_caso && <p className="text-red-600 text-xs mt-1">{errors.tipo_caso}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción de la situación *</label>
          <textarea value={data.descripcion} onChange={(e) => setData('descripcion', e.target.value)} rows={4} maxLength={500} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          {errors.descripcion && <p className="text-red-600 text-xs mt-1">{errors.descripcion}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha *</label>
          <input type="date" value={data.fecha_registro} onChange={(e) => setData('fecha_registro', e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </div>

        <button type="submit" disabled={processing || !data.agremiado_id} className="bg-[#0F4C5C] text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50">
          Guardar caso
        </button>
      </form>
    </Plantilla>
  );
}
