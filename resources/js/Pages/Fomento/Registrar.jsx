import { useForm } from '@inertiajs/react';
import Plantilla from '../Agremiados/Plantilla';

function Campo({ etiqueta, obligatorio, error, children }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-slate-700 mb-1">
        {etiqueta} {obligatorio && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}

// CU-21: Registrar Beneficiario. Solo "nombre" es obligatorio — el
// resto queda opcional a propósito, porque en los formatos reales
// (Excel) muchos beneficiarios llegan con datos incompletos y aun así
// se les da de alta.
export default function Registrar() {
  const { data, setData, post, processing, errors } = useForm({
    nombre: '', domicilio: '', comunidad_colonia: '', municipio: '',
    curp: '', celular: '', edad: '', sexo: '', codigo_postal: '',
  });

  function enviar(e) {
    e.preventDefault();
    post('/fomento');
  }

  return (
    <Plantilla tituloPagina="Registrar Beneficiario" migaDePan="Inicio / Fomento Habitacional / Registrar" paginaActual="fomento-registrar">
      <form onSubmit={enviar} className="bg-white rounded-lg border border-slate-200 p-6 max-w-2xl">
        <Campo etiqueta="Nombre completo" obligatorio error={errors.nombre}>
          <input type="text" value={data.nombre} onChange={(e) => setData('nombre', e.target.value)} maxLength={150} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </Campo>
        <Campo etiqueta="Domicilio (Calle, No.)" error={errors.domicilio}>
          <input type="text" value={data.domicilio} onChange={(e) => setData('domicilio', e.target.value)} maxLength={200} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </Campo>
        <div className="grid grid-cols-2 gap-4">
          <Campo etiqueta="Comunidad / Colonia" error={errors.comunidad_colonia}>
            <input type="text" value={data.comunidad_colonia} onChange={(e) => setData('comunidad_colonia', e.target.value)} maxLength={100} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </Campo>
          <Campo etiqueta="Municipio" error={errors.municipio}>
            <input type="text" value={data.municipio} onChange={(e) => setData('municipio', e.target.value)} maxLength={100} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </Campo>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Campo etiqueta="CURP" error={errors.curp}>
            <input type="text" value={data.curp} onChange={(e) => setData('curp', e.target.value.toUpperCase())} maxLength={18} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </Campo>
          <Campo etiqueta="Celular" error={errors.celular}>
            <input type="text" value={data.celular} onChange={(e) => setData('celular', e.target.value)} maxLength={15} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </Campo>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Campo etiqueta="Edad" error={errors.edad}>
            <input type="number" value={data.edad} onChange={(e) => setData('edad', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </Campo>
          <Campo etiqueta="Sexo" error={errors.sexo}>
            <select value={data.sexo} onChange={(e) => setData('sexo', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Selecciona...</option>
              <option value="F">Femenino</option>
              <option value="M">Masculino</option>
            </select>
          </Campo>
          <Campo etiqueta="Código postal" error={errors.codigo_postal}>
            <input type="text" value={data.codigo_postal} onChange={(e) => setData('codigo_postal', e.target.value)} maxLength={10} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </Campo>
        </div>
        <button type="submit" disabled={processing} className="bg-suspeg-teal text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50">
          Guardar beneficiario
        </button>
      </form>
    </Plantilla>
  );
}
