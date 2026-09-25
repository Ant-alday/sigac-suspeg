import { useForm, router, Link } from '@inertiajs/react';
import Plantilla from '../Agremiados/Plantilla';

// Catálogo de Convenios de Descuento (ej. CIEX). A diferencia de los
// insumos, aquí también se sube el documento firmado del convenio,
// para poder consultarlo y descargarlo después.
export default function Convenios({ convenios, errors }) {
  const { data, setData, post, processing, reset } = useForm({ nombre: '', institucion: '', documento: null });

  function agregar(e) {
    e.preventDefault();
    post('/fomento-convenios', { forceFormData: true, onSuccess: () => reset() });
  }

  function eliminar(id) {
    if (confirm('¿Eliminar este convenio? Solo se puede si no tiene solicitudes registradas.')) {
      router.delete(`/fomento-convenios/${id}`);
    }
  }

  return (
    <Plantilla tituloPagina="Convenios de Descuento" migaDePan="Inicio / Fomento Habitacional / Convenios" paginaActual="fomento-convenios">
      <form onSubmit={agregar} className="bg-white rounded-lg border border-slate-200 p-4 mb-6 flex gap-2 items-end flex-wrap">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Nombre del convenio</label>
          <input
            type="text"
            placeholder="Ej. Centro de Idiomas Extranjeros (CIEX)"
            value={data.nombre}
            onChange={(e) => setData('nombre', e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-72"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Institución (opcional)</label>
          <input
            type="text"
            value={data.institucion}
            onChange={(e) => setData('institucion', e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-56"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Documento del convenio (opcional)</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setData('documento', e.target.files[0])}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-64"
          />
        </div>
        <button type="submit" disabled={processing} className="text-white px-4 py-2 rounded-lg text-sm font-semibold bg-[#8C5C8C] hover:bg-[#764C76]">
          + Agregar convenio
        </button>
      </form>
      {errors?.convenio && <p className="text-red-600 text-sm mb-4 bg-red-50 rounded-lg px-3 py-2">{errors.convenio}</p>}

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Convenio</th>
              <th className="text-left px-4 py-2">Institución</th>
              <th className="text-left px-4 py-2">Documento</th>
              <th className="text-left px-4 py-2">Solicitudes</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {convenios.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-2 font-semibold">{c.nombre}</td>
                <td className="px-4 py-2 text-slate-500">{c.institucion || '—'}</td>
                <td className="px-4 py-2">
                  {c.documento_ruta ? (
                    <span className="text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">✓ Subido</span>
                  ) : (
                    <span className="text-slate-400 text-xs">Sin documento</span>
                  )}
                </td>
                <td className="px-4 py-2 text-slate-500">{c.solicitudes_count}</td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/fomento-convenios/${c.id}`} className="text-[#0F4C5C] text-xs font-semibold mr-3">Ver detalle →</Link>
                  <button onClick={() => eliminar(c.id)} className="text-red-500 text-xs font-semibold">Eliminar</button>
                </td>
              </tr>
            ))}
            {convenios.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Sin convenios registrados todavía.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Plantilla>
  );
}
