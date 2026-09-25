import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import Plantilla from './Plantilla';
import ModalCatalogo from './ModalCatalogo';

function contarDocumentosSubidos(credencial) {
  const campos = ['recibo_ruta', 'ficha_ruta', 'ine_ruta', 'firma_digital_ruta', 'foto_ruta'];
  return campos.filter((campo) => credencial[campo]).length;
}

function formatearFecha(fechaTexto) {
  if (!fechaTexto) return '—';
  return new Date(fechaTexto).toLocaleString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const coloresMovimiento = {
  Registro: 'bg-blue-500',
  'Cambio de estatus': 'bg-amber-500',
  'Edición de datos': 'bg-slate-400',
  'Documento de afiliación': 'bg-purple-400',
  'Trámite de credencial': 'bg-teal-500',
};

function Dato({ etiqueta, valor }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase">{etiqueta}</p>
      <p className="text-slate-800">{valor ?? '—'}</p>
    </div>
  );
}

export default function Detalle({ agremiado, documentosRequeridos, dependencias, secretariasOrganismos }) {
  const [nuevoEstatus, setNuevoEstatus] = useState(agremiado.estatus);
  const [editando, setEditando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  const formularioEdicion = useForm({
    nombre_completo: agremiado.nombre_completo,
    curp: agremiado.curp,
    rfc: agremiado.rfc,
    categoria: agremiado.categoria,
    // Igual que en Registrar: la secretaría es solo para filtrar la
    // lista de dependencias; lo que en verdad se guarda es dependencia_id.
    secretaria_organismo_id_filtro: agremiado.secretaria_organismo?.id ?? '',
    dependencia_id: agremiado.dependencia_id,
    domicilio: agremiado.domicilio,
    ciudad_localidad_municipio: agremiado.ciudad_localidad_municipio,
    telefono: agremiado.telefono,
    correo: agremiado.correo,
    sueldo_base: agremiado.sueldo_base,
  });

  const dependenciasFiltradas = dependencias.filter(
    (d) => String(d.secretaria_organismo_id) === String(formularioEdicion.data.secretaria_organismo_id_filtro)
  );

  function guardarEdicion(e) {
    e.preventDefault();
    formularioEdicion.put(`/agremiados/${agremiado.id}`, {
      preserveScroll: true,
      onSuccess: () => setEditando(false),
    });
  }

  function cancelarEdicion() {
    formularioEdicion.reset();
    formularioEdicion.clearErrors();
    setEditando(false);
  }

  function guardarEstatus() {
    router.put(`/agremiados/${agremiado.id}/estatus`, { estatus_nuevo: nuevoEstatus });
  }

  function subirDocumento(tipoDocumento, archivo) {
    const formulario = new FormData();
    formulario.append('tipo_documento', tipoDocumento);
    formulario.append('archivo', archivo);
    router.post(`/agremiados/${agremiado.id}/documentos`, formulario);
  }

  function eliminarDocumento(documentoId) {
    if (confirm('¿Seguro que quieres eliminar este documento? No se puede deshacer.')) {
      router.delete(`/documentos/${documentoId}`);
    }
  }

  function solicitarCredencial() {
    router.post(`/agremiados/${agremiado.id}/credencial`);
  }

  function documentoSubido(tipo) {
    return agremiado.documentos.find((doc) => doc.tipo_documento === tipo);
  }

  const credencialEnCurso = agremiado.credenciales.find((c) => c.estatus !== 'Entregada');

  return (
    <Plantilla tituloPagina={agremiado.nombre_completo} migaDePan="Inicio / Padrón / Detalle" paginaActual="listado">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* --- Datos generales: lectura o edición --- */}
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-400 uppercase">Datos generales</h2>
              <div className="flex items-center gap-4">
                {/* CU-07: Exportar Ficha del Agremiado (PDF). Es un
                    enlace normal <a>, no un botón de React — así el
                    navegador se encarga solo de descargar el archivo
                    que regresa el servidor, sin que tengamos que
                    escribir código para manejar la descarga. */}
                <a href={`/agremiados/${agremiado.id}/ficha-pdf`} className="text-suspeg-teal text-sm font-semibold">
                  Exportar ficha (PDF)
                </a>
                {!editando && (
                  <button onClick={() => setEditando(true)} className="text-suspeg-teal text-sm font-semibold">
                    Editar
                  </button>
                )}
              </div>
            </div>

            {!editando ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Dato etiqueta="No. de padrón" valor={agremiado.no_padron} />
                <Dato etiqueta="No. de empleado" valor={agremiado.numero_empleado} />
                <Dato etiqueta="CURP" valor={agremiado.curp} />
                <Dato etiqueta="RFC" valor={agremiado.rfc} />
                <Dato etiqueta="Secretaría / organismo" valor={agremiado.secretaria_organismo?.nombre} />
                <Dato etiqueta="Dependencia" valor={agremiado.dependencia?.nombre} />
                <Dato etiqueta="Categoría" valor={agremiado.categoria} />
                <Dato etiqueta="Domicilio" valor={agremiado.domicilio} />
                <Dato etiqueta="Ciudad / Municipio" valor={agremiado.ciudad_localidad_municipio} />
                <Dato etiqueta="Teléfono" valor={agremiado.telefono} />
                <Dato etiqueta="Correo" valor={agremiado.correo} />
                <Dato etiqueta="Sueldo base" valor={`$${Number(agremiado.sueldo_base).toLocaleString('es-MX')}`} />
                <Dato etiqueta="Estado civil" valor={agremiado.estado_civil} />
                <Dato etiqueta="Fecha de registro" valor={formatearFecha(agremiado.created_at)} />
              </div>
            ) : (
              <form onSubmit={guardarEdicion} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <CampoEdicion etiqueta="Nombre completo" valor={formularioEdicion.data.nombre_completo} error={formularioEdicion.errors.nombre_completo} onChange={(v) => formularioEdicion.setData('nombre_completo', v)} />
                  <CampoEdicion etiqueta="CURP" valor={formularioEdicion.data.curp} error={formularioEdicion.errors.curp} onChange={(v) => formularioEdicion.setData('curp', v.toUpperCase())} maxLength={18} />
                  <CampoEdicion etiqueta="RFC" valor={formularioEdicion.data.rfc} error={formularioEdicion.errors.rfc} onChange={(v) => formularioEdicion.setData('rfc', v.toUpperCase())} maxLength={13} />
                  <CampoEdicion etiqueta="Categoría" valor={formularioEdicion.data.categoria} error={formularioEdicion.errors.categoria} onChange={(v) => formularioEdicion.setData('categoria', v)} />

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Secretaría / Organismo</label>
                    <select
                      value={formularioEdicion.data.secretaria_organismo_id_filtro}
                      onChange={(e) => {
                        formularioEdicion.setData('secretaria_organismo_id_filtro', e.target.value);
                        formularioEdicion.setData('dependencia_id', '');
                      }}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white"
                    >
                      <option value="">Selecciona una opción...</option>
                      {secretariasOrganismos.map((s) => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Dependencia</label>
                    <select
                      value={formularioEdicion.data.dependencia_id}
                      onChange={(e) => formularioEdicion.setData('dependencia_id', e.target.value)}
                      disabled={!formularioEdicion.data.secretaria_organismo_id_filtro}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white disabled:bg-slate-50"
                    >
                      <option value="">Selecciona una opción...</option>
                      {dependenciasFiltradas.map((d) => (
                        <option key={d.id} value={d.id}>{d.nombre}</option>
                      ))}
                    </select>
                    {formularioEdicion.errors.dependencia_id && (
                      <p className="text-red-600 text-xs mt-1">{formularioEdicion.errors.dependencia_id}</p>
                    )}
                  </div>
                  <div className="col-span-2 -mt-2">
                    <button type="button" onClick={() => setMostrarModal(true)} className="text-xs text-suspeg-teal underline">
                      ¿No está la secretaría o dependencia que buscas? Agrégala aquí →
                    </button>
                  </div>

                  <CampoEdicion etiqueta="Domicilio" valor={formularioEdicion.data.domicilio} error={formularioEdicion.errors.domicilio} onChange={(v) => formularioEdicion.setData('domicilio', v)} />
                  <CampoEdicion etiqueta="Ciudad / Municipio" valor={formularioEdicion.data.ciudad_localidad_municipio} error={formularioEdicion.errors.ciudad_localidad_municipio} onChange={(v) => formularioEdicion.setData('ciudad_localidad_municipio', v)} />
                  <CampoEdicion etiqueta="Teléfono" valor={formularioEdicion.data.telefono} error={formularioEdicion.errors.telefono} onChange={(v) => formularioEdicion.setData('telefono', v)} maxLength={10} />
                  <CampoEdicion etiqueta="Correo" valor={formularioEdicion.data.correo} error={formularioEdicion.errors.correo} onChange={(v) => formularioEdicion.setData('correo', v)} tipo="email" />
                  <CampoEdicion etiqueta="Sueldo base" valor={formularioEdicion.data.sueldo_base} error={formularioEdicion.errors.sueldo_base} onChange={(v) => formularioEdicion.setData('sueldo_base', v)} tipo="number" />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={cancelarEdicion} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600">
                    Cancelar
                  </button>
                  <button type="submit" disabled={formularioEdicion.processing} className="px-4 py-2 rounded-lg bg-suspeg-teal text-white text-sm font-semibold disabled:opacity-50">
                    {formularioEdicion.processing ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* --- Documentos de afiliación --- */}
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-400 uppercase mb-3">Documentos de afiliación</h2>
            <p className="text-xs text-slate-400 mb-2">Formatos permitidos: PDF, JPG o PNG. Tamaño máximo: 5 MB.</p>
            <ul className="divide-y divide-slate-100">
              {Object.entries(documentosRequeridos).map(([tipo, etiqueta]) => {
                const subido = documentoSubido(tipo);
                return (
                  <li key={tipo} className="flex items-center justify-between py-2 text-sm">
                    <span>{etiqueta}</span>
                    {subido ? (
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-600 font-semibold">✓ Subido</span>
                        <a href={`/storage/${subido.ruta_archivo}`} target="_blank" rel="noopener noreferrer" className="text-suspeg-teal font-semibold underline">
                          Ver documento
                        </a>
                        <button onClick={() => eliminarDocumento(subido.id)} className="text-red-500 font-semibold">
                          Eliminar
                        </button>
                      </div>
                    ) : (
                      <label className="text-suspeg-teal font-semibold cursor-pointer">
                        Subir
                        <input type="file" className="hidden" onChange={(e) => subirDocumento(tipo, e.target.files[0])} />
                      </label>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* --- Historial de movimientos --- */}
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-400 uppercase mb-3">Historial de movimientos</h2>
            {agremiado.historial_movimientos.length === 0 && (
              <p className="text-sm text-slate-400">Todavía no hay movimientos registrados.</p>
            )}
            <ul className="space-y-4">
              {agremiado.historial_movimientos.map((movimiento) => (
                <li key={movimiento.id} className="flex gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${coloresMovimiento[movimiento.tipo_movimiento] || 'bg-slate-400'}`}></span>
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">{movimiento.tipo_movimiento}:</span> {movimiento.descripcion}
                    </p>
                    <p className="text-xs text-slate-400">{formatearFecha(movimiento.fecha_movimiento)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- Columna derecha --- */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-400 uppercase mb-3">Estatus de afiliación</h2>
            <select value={nuevoEstatus} onChange={(e) => setNuevoEstatus(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-3">
              <option value="En proceso">En proceso</option>
              <option value="Activo">Activo</option>
              <option value="Baja">Baja</option>
              <option value="Base">Base</option>
            </select>
            <button onClick={guardarEstatus} className="w-full bg-suspeg-teal text-white rounded-lg py-2 text-sm font-semibold">
              Guardar estatus
            </button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-400 uppercase mb-3">Credencial SUSPEG</h2>
            {credencialEnCurso ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Folio {credencialEnCurso.folio}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${credencialEnCurso.estatus === 'En captura' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                    {credencialEnCurso.estatus}
                  </span>
                </div>
                {credencialEnCurso.estatus === 'En captura' && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{contarDocumentosSubidos(credencialEnCurso)} de 5 documentos subidos</p>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-suspeg-teal h-1.5 rounded-full" style={{ width: `${(contarDocumentosSubidos(credencialEnCurso) / 5) * 100}%` }}></div>
                    </div>
                  </div>
                )}
                {credencialEnCurso.estatus === 'Enviado al Tribunal' && (
                  <p className="text-xs text-slate-500">Expediente completo, esperando que el Tribunal entregue la credencial física.</p>
                )}
                <Link href={`/credenciales/${credencialEnCurso.id}`} className="block text-center border border-suspeg-teal text-suspeg-teal rounded-lg py-2 text-sm font-semibold">
                  Ir al trámite
                </Link>
              </div>
            ) : agremiado.estatus === 'Activo' ? (
              <button onClick={solicitarCredencial} className="w-full bg-suspeg-teal text-white rounded-lg py-2 text-sm font-semibold">
                Tramitar credencial
              </button>
            ) : (
              <p className="text-xs text-slate-500">
                El agremiado debe estar en estatus <b>Activo</b> para poder tramitar su credencial.
              </p>
            )}
          </div>
        </div>
      </div>

      {mostrarModal && (
        <ModalCatalogo secretariasOrganismos={secretariasOrganismos} onCerrar={() => setMostrarModal(false)} />
      )}
    </Plantilla>
  );
}

function CampoEdicion({ etiqueta, valor, error, onChange, tipo = 'text', ...resto }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{etiqueta}</label>
      <input type={tipo} value={valor ?? ''} onChange={(e) => onChange(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm" {...resto} />
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}
