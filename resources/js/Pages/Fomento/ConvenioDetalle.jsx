import { useForm } from '@inertiajs/react';
import Plantilla from '../Agremiados/Plantilla';

// Detalle de un convenio (ej. CIEX): quién lo ha usado — con los datos
// del familiar Y del agremiado titular — y el documento firmado del
// convenio, para verlo o descargarlo.
export default function ConvenioDetalle({ convenio }) {
  const { data, setData, post, processing } = useForm({ documento: null });

  function subirDocumento(e) {
    e.preventDefault();
    post(`/fomento-convenios/${convenio.id}/documento`, { forceFormData: true });
  }

  return (
    <Plantilla tituloPagina={convenio.nombre} migaDePan="Inicio / Fomento Habitacional / Convenios / Detalle" paginaActual="fomento-convenios">
      {/* --- Documento del convenio --- */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-6">
        <h2 className="text-sm font-bold text-slate-400 uppercase mb-3">Documento del convenio</h2>
        {convenio.documento_ruta ? (
          <div className="flex items-center gap-4">
            <a href={`/storage/${convenio.documento_ruta}`} target="_blank" className="text-[#8C5C8C] text-sm font-semibold">
              Ver documento →
            </a>
            <a href={`/storage/${convenio.documento_ruta}`} download className="text-[#8C5C8C] text-sm font-semibold">
              Descargar →
            </a>
          </div>
        ) : (
          <p className="text-sm text-slate-400 mb-3">Todavía no se ha subido el documento firmado de este convenio.</p>
        )}
        <form onSubmit={subirDocumento} className="flex gap-2 items-center mt-3">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setData('documento', e.target.files[0])}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
          />
          <button type="submit" disabled={processing} className="text-white text-sm font-semibold px-3 py-1.5 rounded-lg bg-[#8C5C8C] hover:bg-[#764C76]">
            {convenio.documento_ruta ? 'Reemplazar documento' : 'Subir documento'}
          </button>
        </form>
      </div>

      {/* --- Beneficiarios que han usado este convenio --- */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <h2 className="text-sm font-bold text-slate-400 uppercase px-5 pt-5 pb-2">
          Beneficiarios ({convenio.solicitudes.length})
        </h2>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Agremiado titular</th>
              <th className="text-left px-4 py-2">Familiar</th>
              <th className="text-left px-4 py-2">Parentesco</th>
              <th className="text-left px-4 py-2">Beneficio</th>
              <th className="text-left px-4 py-2">Estatus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {convenio.solicitudes.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2 font-semibold">
                  {s.beneficiario.agremiado?.nombre_completo ?? s.beneficiario.nombre}
                </td>
                <td className="px-4 py-2">{s.nombre_familiar}</td>
                <td className="px-4 py-2 text-slate-500">{s.parentesco}{s.edad_familiar ? `, ${s.edad_familiar} años` : ''}</td>
                <td className="px-4 py-2 text-slate-500">{s.beneficio_solicitado}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs font-semibold ${s.estatus === 'Autorizada' ? 'text-emerald-600' : s.estatus === 'Rechazada' ? 'text-red-600' : 'text-amber-600'}`}>
                    {s.estatus}
                  </span>
                </td>
              </tr>
            ))}
            {convenio.solicitudes.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Nadie ha usado este convenio todavía.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Plantilla>
  );
}
