import { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import Plantilla from './Plantilla';
import ModalCatalogo from './ModalCatalogo';

// Campo de texto reutilizable. Vive AFUERA de Registrar() a propósito
// (si se define adentro, React lo destruye en cada tecla y se pierde
// el foco al escribir).
function Campo({ etiqueta, valor, error, onChange, tipo = 'text', requerido = true, ayuda, ...resto }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">
        {etiqueta} {requerido && <span className="text-red-500">*</span>}
      </label>
      <input
        type={tipo}
        value={valor}
        onChange={onChange}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
        {...resto}
      />
      {ayuda && !error && <p className="text-slate-400 text-xs mt-1">{ayuda}</p>}
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}

// CU-02: Registrar Agremiado.
export default function Registrar({ dependencias, secretariasOrganismos }) {
  const [mostrarModal, setMostrarModal] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    numero_empleado: '',
    nombre_completo: '',
    curp: '',
    rfc: '',
    fecha_ingreso: '',
    categoria: '',
    // Estos dos ya no son independientes: primero se elige la
    // secretaría (solo para filtrar la lista), y lo que en realidad se
    // guarda es la dependencia (dependencia_id), porque ella ya sabe a
    // qué secretaría pertenece.
    secretaria_organismo_id_filtro: '',
    dependencia_id: '',
    domicilio: '',
    ciudad_localidad_municipio: '',
    telefono: '',
    correo: '',
    estado_civil: '',
    es_papa: false,
    es_mama: false,
    num_ninos: '',
    num_ninas: '',
    sueldo_base: '',
  });

  // Solo se muestran las dependencias que pertenecen a la secretaría
  // elegida arriba (desplegable en cascada).
  const dependenciasFiltradas = dependencias.filter(
    (d) => String(d.secretaria_organismo_id) === String(data.secretaria_organismo_id_filtro)
  );

  function cambiarSecretaria(valor) {
    setData({ ...data, secretaria_organismo_id_filtro: valor, dependencia_id: '' });
  }

  function enviarFormulario(e) {
    e.preventDefault();
    post('/agremiados');
  }

  return (
    <Plantilla tituloPagina="Registrar Agremiado" migaDePan="Inicio / Padrón / Registrar" paginaActual="registrar">
      <form onSubmit={enviarFormulario} className="bg-white rounded-lg border border-slate-200 p-6 max-w-3xl space-y-6">
        <p className="text-xs text-slate-500">
          <span className="text-red-500">*</span> Campo obligatorio.
        </p>

        {/* --- Identificación --- */}
        <fieldset className="grid grid-cols-2 gap-4">
          <legend className="text-xs font-bold text-slate-400 uppercase mb-2">Identificación</legend>
          <Campo etiqueta="Número de empleado" valor={data.numero_empleado} error={errors.numero_empleado} onChange={(e) => setData('numero_empleado', e.target.value)} />
          <Campo etiqueta="Nombre completo" valor={data.nombre_completo} error={errors.nombre_completo} onChange={(e) => setData('nombre_completo', e.target.value)} />
          <Campo
            etiqueta="CURP"
            valor={data.curp}
            error={errors.curp}
            onChange={(e) => setData('curp', e.target.value.toUpperCase())}
            maxLength={18}
            ayuda="18 caracteres: 4 letras, 6 dígitos de nacimiento, H/M, 2 letras de estado, 3 consonantes y 2 finales. Ej: GOAL850214MGRNRC08"
          />
          <Campo etiqueta="RFC" valor={data.rfc} error={errors.rfc} onChange={(e) => setData('rfc', e.target.value.toUpperCase())} maxLength={13} />
        </fieldset>

        {/* --- Datos laborales --- */}
        <fieldset className="grid grid-cols-2 gap-4">
          <legend className="text-xs font-bold text-slate-400 uppercase mb-2">Datos laborales</legend>
          <Campo etiqueta="Fecha de ingreso" valor={data.fecha_ingreso} error={errors.fecha_ingreso} onChange={(e) => setData('fecha_ingreso', e.target.value)} tipo="date" />
          <Campo etiqueta="Categoría" valor={data.categoria} error={errors.categoria} onChange={(e) => setData('categoria', e.target.value)} />

          {/* Paso 1 de la cascada: Secretaría (solo para filtrar) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Secretaría / Organismo <span className="text-red-500">*</span>
            </label>
            <select
              value={data.secretaria_organismo_id_filtro}
              onChange={(e) => cambiarSecretaria(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">Selecciona una opción...</option>
              {secretariasOrganismos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Paso 2 de la cascada: Dependencia (filtrada por la secretaría de arriba) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Dependencia <span className="text-red-500">*</span>
            </label>
            <select
              value={data.dependencia_id}
              onChange={(e) => setData('dependencia_id', e.target.value)}
              disabled={!data.secretaria_organismo_id_filtro}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white disabled:bg-slate-50"
            >
              <option value="">
                {data.secretaria_organismo_id_filtro ? 'Selecciona una opción...' : 'Primero elige una secretaría'}
              </option>
              {dependenciasFiltradas.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>
            {errors.dependencia_id && <p className="text-red-600 text-xs mt-1">{errors.dependencia_id}</p>}
          </div>

          <div className="col-span-2 -mt-2">
            <button
              type="button"
              onClick={() => setMostrarModal(true)}
              className="text-xs text-suspeg-teal underline"
            >
              ¿No está la secretaría o dependencia que buscas? Agrégala aquí →
            </button>
          </div>

          <Campo etiqueta="Sueldo base" valor={data.sueldo_base} error={errors.sueldo_base} onChange={(e) => setData('sueldo_base', e.target.value)} tipo="number" step="0.01" />
        </fieldset>

        {/* --- Domicilio y contacto --- */}
        <fieldset className="grid grid-cols-2 gap-4">
          <legend className="text-xs font-bold text-slate-400 uppercase mb-2">Domicilio y contacto</legend>
          <Campo etiqueta="Domicilio" valor={data.domicilio} error={errors.domicilio} onChange={(e) => setData('domicilio', e.target.value)} />
          <Campo etiqueta="Ciudad / Municipio" valor={data.ciudad_localidad_municipio} error={errors.ciudad_localidad_municipio} onChange={(e) => setData('ciudad_localidad_municipio', e.target.value)} />
          <Campo etiqueta="Teléfono" valor={data.telefono} error={errors.telefono} onChange={(e) => setData('telefono', e.target.value)} maxLength={10} />
          <Campo etiqueta="Correo" valor={data.correo} error={errors.correo} onChange={(e) => setData('correo', e.target.value)} tipo="email" />
        </fieldset>

        {/* --- Datos familiares: SIN asterisco, son opcionales --- */}
        <fieldset className="grid grid-cols-2 gap-4">
          <legend className="text-xs font-bold text-slate-400 uppercase mb-2">Datos familiares (opcional)</legend>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Estado civil</label>
            <select
              value={data.estado_civil}
              onChange={(e) => setData('estado_civil', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">Sin especificar</option>
              <option>Soltero(a)</option>
              <option>Casado(a)</option>
              <option>Divorciado(a)</option>
              <option>Viudo(a)</option>
              <option>Union Libre</option>
            </select>
          </div>

          <div className="flex items-end gap-6 pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={data.es_papa} onChange={(e) => setData('es_papa', e.target.checked)} />
              Es papá
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={data.es_mama} onChange={(e) => setData('es_mama', e.target.checked)} />
              Es mamá
            </label>
          </div>

          <Campo etiqueta="Número de niños" valor={data.num_ninos} error={errors.num_ninos} onChange={(e) => setData('num_ninos', e.target.value)} tipo="number" min={0} requerido={false} />
          <Campo etiqueta="Número de niñas" valor={data.num_ninas} error={errors.num_ninas} onChange={(e) => setData('num_ninas', e.target.value)} tipo="number" min={0} requerido={false} />
        </fieldset>

        <div className="flex justify-end gap-3">
          <Link href="/agremiados" className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600">
            Cancelar
          </Link>
          <button type="submit" disabled={processing} className="px-4 py-2 rounded-lg bg-suspeg-teal text-white text-sm font-semibold disabled:opacity-50">
            {processing ? 'Guardando...' : 'Guardar agremiado'}
          </button>
        </div>
      </form>

      {mostrarModal && (
        <ModalCatalogo secretariasOrganismos={secretariasOrganismos} onCerrar={() => setMostrarModal(false)} />
      )}
    </Plantilla>
  );
}
