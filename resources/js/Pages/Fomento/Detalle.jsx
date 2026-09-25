import { useState } from 'react';
import { useForm, Link, router } from '@inertiajs/react';
import Plantilla from '../Agremiados/Plantilla';

function BotonMarcarEntrega({ solicitud }) {
  const [editando, setEditando] = useState(false);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));

  if (solicitud.fecha_entrega) {
    return <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Entregado: {solicitud.fecha_entrega}</span>;
  }

  if (editando) {
    return (
      <span className="inline-flex items-center gap-1">
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="border border-slate-300 rounded px-2 py-0.5 text-xs" />
        <button
          onClick={() => router.put(`/fomento-solicitudes/${solicitud.id}/entrega`, { fecha_entrega: fecha }, { onSuccess: () => setEditando(false) })}
          className="text-emerald-600 text-xs font-semibold"
        >
          Confirmar
        </button>
      </span>
    );
  }

  return (
    <button onClick={() => setEditando(true)} className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
      Pendiente de entrega — marcar
    </button>
  );
}

function Dato({ etiqueta, valor }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase">{etiqueta}</p>
      <p className="text-sm text-slate-800">{valor || '—'}</p>
    </div>
  );
}

function eliminarSolicitudInsumo(id) {
  if (confirm('¿Eliminar este beneficio? Esta acción no se puede deshacer.')) {
    router.delete(`/fomento-solicitudes/${id}`);
  }
}

function eliminarSolicitudConvenio(id) {
  if (confirm('¿Eliminar este beneficio de convenio? Esta acción no se puede deshacer.')) {
    router.delete(`/fomento-solicitudes-convenio/${id}`);
  }
}

// CU-23: Ver Detalle del Beneficiario, con su historial de solicitudes
// de insumos y de convenios de descuento.
export default function Detalle({ beneficiario, convenios }) {
  const [mostrarConvenio, setMostrarConvenio] = useState(false);

  const formConvenio = useForm({
    convenio_id: '',
    nombre_familiar: '',
    parentesco: '',
    edad_familiar: '',
    curp_familiar: '',
    beneficio_solicitado: '',
    fecha_solicitud: new Date().toISOString().slice(0, 10),
  });

  function enviarConvenio(e) {
    e.preventDefault();
    formConvenio.post(`/fomento/${beneficiario.id}/convenio`, {
      onSuccess: () => { formConvenio.reset(); setMostrarConvenio(false); },
    });
  }

  function eliminarBeneficiario() {
    if (confirm(`¿Eliminar a ${beneficiario.nombre} del padrón de beneficiarios? Solo se puede si no tiene beneficios registrados.`)) {
      router.delete(`/fomento/${beneficiario.id}`);
    }
  }

  return (
    <Plantilla tituloPagina={beneficiario.nombre} migaDePan="Inicio / Fomento Habitacional / Detalle" paginaActual="fomento-listado">
      {/* --- Datos generales --- */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-400 uppercase">Datos del beneficiario</h2>
          <div className="flex items-center gap-3">
            {beneficiario.agremiado && (
              <a href={`/agremiados/${beneficiario.agremiado.id}`} className="text-xs font-semibold text-[#0F4C5C] bg-[#EAF2F3] px-2 py-1 rounded-full">
                Vinculado al agremiado: {beneficiario.agremiado.nombre_completo} →
              </a>
            )}
            {/* Eliminar beneficiario, a petición explícita */}
            <button onClick={eliminarBeneficiario} className="text-red-500 text-xs font-semibold">
              Eliminar beneficiario
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Dato etiqueta="Nombre" valor={beneficiario.nombre} />
          <Dato etiqueta="CURP" valor={beneficiario.curp} />
          <Dato etiqueta="Celular" valor={beneficiario.celular} />
          <Dato etiqueta="Domicilio" valor={beneficiario.domicilio} />
          <Dato etiqueta="Comunidad/Colonia" valor={beneficiario.comunidad_colonia} />
          <Dato etiqueta="Municipio" valor={beneficiario.municipio} />
        </div>
      </div>

      {/* --- CU-22: Solicitudes de insumo --- */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-400 uppercase">Solicitudes de insumos</h2>
          <Link href={`/fomento/${beneficiario.id}/solicitar`} className="text-white text-sm font-semibold px-3 py-1.5 rounded-lg bg-[#C2703D] hover:bg-[#A85D30]">
            + Nueva solicitud
          </Link>
        </div>
        {beneficiario.solicitudes_insumo.length === 0 && (
          <p className="text-sm text-slate-400">Sin solicitudes de insumos todavía.</p>
        )}
        {beneficiario.solicitudes_insumo.map((s) => (
          <div key={s.id} className="border-t border-slate-100 pt-3 mt-3 first:border-0 first:pt-0 first:mt-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-400">
                Solicitado: {s.fecha_solicitud} {s.observaciones && `— ${s.observaciones}`}
                <span className="ml-2 text-slate-400">· Pago: {s.tipo_pago}</span>
                {s.es_para_familiar && (
                  <span className="ml-2 text-[#9C5228] bg-[#FDF3EC] px-2 py-0.5 rounded-full font-semibold">
                    Para: {s.nombre_familiar} ({s.parentesco})
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2">
                <BotonMarcarEntrega solicitud={s} />
                <button onClick={() => eliminarSolicitudInsumo(s.id)} className="text-red-500 text-xs font-semibold">Eliminar</button>
              </div>
            </div>
            <ul className="text-sm">
              {s.detalles.map((d) => (
                <li key={d.id} className="flex justify-between py-0.5">
                  <span>{d.cantidad} × {d.insumo.nombre}</span>
                  <span className="text-slate-500">${Number(d.precio_unitario * d.cantidad).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* --- CU-25: Solicitudes de convenio --- */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-400 uppercase">Convenios de descuento</h2>
          <button onClick={() => setMostrarConvenio(!mostrarConvenio)} className="text-white text-sm font-semibold px-3 py-1.5 rounded-lg bg-[#8C5C8C] hover:bg-[#764C76]">
            + Solicitar convenio
          </button>
        </div>

        {mostrarConvenio && (
          <form onSubmit={enviarConvenio} className="bg-slate-50 rounded-lg p-4 mb-4 space-y-3">
            <select
              value={formConvenio.data.convenio_id}
              onChange={(e) => formConvenio.setData('convenio_id', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Selecciona el convenio...</option>
              {convenios.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            {formConvenio.errors.convenio_id && <p className="text-red-600 text-xs">{formConvenio.errors.convenio_id}</p>}

            {/* Datos del hijo/hija (o el familiar de que se trate) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input type="text" placeholder="Nombre del familiar" value={formConvenio.data.nombre_familiar} onChange={(e) => formConvenio.setData('nombre_familiar', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                {formConvenio.errors.nombre_familiar && <p className="text-red-600 text-xs">{formConvenio.errors.nombre_familiar}</p>}
              </div>
              <div>
                <input type="text" placeholder="Parentesco (ej. Hija)" value={formConvenio.data.parentesco} onChange={(e) => formConvenio.setData('parentesco', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                {formConvenio.errors.parentesco && <p className="text-red-600 text-xs">{formConvenio.errors.parentesco}</p>}
              </div>
              <div>
                <input type="number" min="0" placeholder="Edad (opcional)" value={formConvenio.data.edad_familiar} onChange={(e) => formConvenio.setData('edad_familiar', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <input type="text" placeholder="CURP del familiar (opcional)" value={formConvenio.data.curp_familiar} onChange={(e) => formConvenio.setData('curp_familiar', e.target.value.toUpperCase())} maxLength={18} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>

            <input type="text" placeholder="Beneficio solicitado (ej. Inglés básico 2)" value={formConvenio.data.beneficio_solicitado} onChange={(e) => formConvenio.setData('beneficio_solicitado', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <input type="date" value={formConvenio.data.fecha_solicitud} onChange={(e) => formConvenio.setData('fecha_solicitud', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />

            <button type="submit" disabled={formConvenio.processing} className="bg-[#8C5C8C] hover:bg-[#764C76] text-white px-4 py-2 rounded-lg text-sm font-semibold">
              Enviar solicitud
            </button>
          </form>
        )}

        {beneficiario.solicitudes_convenio.length === 0 && (
          <p className="text-sm text-slate-400">Sin convenios solicitados todavía.</p>
        )}
        {beneficiario.solicitudes_convenio.map((s) => (
          <div key={s.id} className="flex justify-between items-center border-t border-slate-100 pt-2 mt-2 text-sm">
            <span>
              {s.convenio.nombre} — {s.nombre_familiar} ({s.parentesco}{s.edad_familiar ? `, ${s.edad_familiar} años` : ''}): {s.beneficio_solicitado}
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold ${s.estatus === 'Autorizada' ? 'text-emerald-600' : s.estatus === 'Rechazada' ? 'text-red-600' : 'text-amber-600'}`}>
                {s.estatus}
              </span>
              <button onClick={() => eliminarSolicitudConvenio(s.id)} className="text-red-500 text-xs font-semibold">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </Plantilla>
  );
}
