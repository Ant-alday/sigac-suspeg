import { router } from '@inertiajs/react';
import Plantilla from './Plantilla';

const insigniasEstatus = {
  'En captura': { texto: 'En captura', clase: 'bg-amber-50 text-amber-700' },
  'Enviado al Tribunal': { texto: 'Enviado al Tribunal', clase: 'bg-blue-50 text-blue-700' },
  Entregada: { texto: 'Entregada', clase: 'bg-emerald-50 text-emerald-700' },
};

// CU-09 (adjuntar documentos y enviar al Tribunal) y CU-10 (confirmar
// entrega), en una sola pantalla que va cambiando según el estatus.
export default function Credencial({ credencial }) {
  const camposDocumentos = [
    { campo: 'recibo', etiqueta: 'Recibo de pago (Cuota SUSPEG)', nota: 'Firmado con tinta azul' },
    { campo: 'ficha', etiqueta: 'Ficha de registro', nota: 'Llenada con tinta azul' },
    { campo: 'ine', etiqueta: 'Copia de INE', nota: 'Legible' },
    { campo: 'firma_digital', etiqueta: 'Firma digital', nota: 'Fondo blanco, formato JPG' },
    { campo: 'foto', etiqueta: 'Foto a color', nota: 'Fondo blanco, formato JPG' },
  ];

  function subirDocumento(campo, archivo) {
    const formulario = new FormData();
    formulario.append('campo', campo);
    formulario.append('archivo', archivo);
    router.post(`/credenciales/${credencial.id}/documentos`, formulario);
  }

  function enviarATribunal() {
    router.put(`/credenciales/${credencial.id}/enviar`);
  }

  function confirmarEntrega() {
    router.put(`/credenciales/${credencial.id}/entrega`);
  }

  const rutaDelCampo = (campo) => credencial[`${campo}_ruta`];

  // CU-09, FA_002: el botón de enviar solo se habilita cuando los 5
  // documentos ya se subieron. Lo calculamos aquí mismo, del lado del
  // navegador, para deshabilitar el botón — pero OJO: el servidor
  // (ControladorAgremiados::enviarATribunal) también lo vuelve a
  // comprobar, por si alguien intenta forzar el envío sin querer.
  const documentosCompletos = camposDocumentos.every(({ campo }) => rutaDelCampo(campo));

  const insignia = insigniasEstatus[credencial.estatus];

  return (
    <Plantilla
      tituloPagina="Credencial SUSPEG"
      migaDePan={`Inicio / Padrón / ${credencial.agremiado.nombre_completo} / Credencial`}
      paginaActual="listado"
    >
      <div className="bg-white rounded-lg border border-slate-200 p-5 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase">Requisitos para el trámite</h2>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${insignia.clase}`}>
            {insignia.texto}
          </span>
        </div>

        <ul className="divide-y divide-slate-100 mb-6">
          {camposDocumentos.map(({ campo, etiqueta, nota }) => {
            const ruta = rutaDelCampo(campo);
            return (
              <li key={campo} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p>{etiqueta}</p>
                  <p className="text-xs text-slate-400 italic">{nota}</p>
                </div>
                <div className="flex items-center gap-3">
                  {ruta ? (
                    <>
                      <span className="text-emerald-600 font-semibold">✓ Subido</span>
                      {/* El documento queda guardado y se puede ver/descargar
                          en cualquier momento — no depende de que el Tribunal
                          responda, ya que no hay comunicación real con ellos. */}
                      <a
                        href={`/storage/${ruta}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-suspeg-teal font-semibold underline"
                      >
                        Ver documento
                      </a>
                    </>
                  ) : (
                    // Solo se puede seguir subiendo documentos mientras el
                    // expediente está "En captura". Una vez enviado, se
                    // congela (ya no debería cambiar lo que se le mandó al Tribunal).
                    credencial.estatus === 'En captura' && (
                      <label className="text-suspeg-teal font-semibold cursor-pointer">
                        Subir
                        <input type="file" className="hidden" onChange={(e) => subirDocumento(campo, e.target.files[0])} />
                      </label>
                    )
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <p className="text-xs text-slate-500 italic mb-4">
          Nota: la credencial no se imprime en la Sección — la envía el H. Tribunal de Conciliación y Arbitraje.
          Como no hay comunicación directa con el Tribunal, el envío y la entrega se confirman manualmente aquí.
        </p>

        {/* --- Estatus: En captura → mostrar el botón (deshabilitado hasta completar) --- */}
        {credencial.estatus === 'En captura' && (
          <button
            onClick={enviarATribunal}
            disabled={!documentosCompletos}
            className="bg-suspeg-teal text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            title={!documentosCompletos ? 'Sube los 5 documentos para poder enviar el expediente' : ''}
          >
            Enviar expediente al Tribunal
          </button>
        )}

        {/* --- Estatus: Enviado al Tribunal → esperando, con botón para confirmar entrega --- */}
        {credencial.estatus === 'Enviado al Tribunal' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Expediente enviado. Cuando el Tribunal entregue físicamente la credencial en la Sección, confírmalo aquí:
            </p>
            <button
              onClick={confirmarEntrega}
              className="bg-suspeg-teal text-white rounded-lg px-4 py-2 text-sm font-semibold"
            >
              Confirmar entrega de credencial
            </button>
          </div>
        )}

        {/* --- Estatus: Entregada --- */}
        {credencial.estatus === 'Entregada' && (
          <p className="text-emerald-600 font-semibold text-sm">✓ Credencial entregada correctamente.</p>
        )}
      </div>
    </Plantilla>
  );
}
