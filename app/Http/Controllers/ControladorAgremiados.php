<?php

namespace App\Http\Controllers;

use App\Models\Agremiado;
use App\Models\CredencialSuspeg;
use App\Models\Dependencia;
use App\Models\DocumentoAgremiado;
use App\Models\HistorialMovimiento;
use App\Models\SecretariaOrganismo;
use App\Exports\ReportePadronExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

/**
 * ============================================================
 *  IMPORTANTE — SOBRE SEGURIDAD EN ESTE ARCHIVO
 * ============================================================
 * Por ahora este controlador NO tiene nada de seguridad todavía:
 *   - No hay middleware de autenticación (auth), o sea cualquiera
 *     que entre a la URL puede usar estas funciones.
 *   - No se valida el rol del usuario (admin / secretario_organizacion).
 *   - No se revisa quién puede ver el sueldo_base (dato sensible).
 *   - Los archivos se guardan sin cifrar y sin revisar permisos.
 * Esto lo agregaremos más adelante, cuando trabajemos la parte de
 * seguridad. Por lo pronto, el objetivo es que el CRUD funcione.
 * ============================================================
 */
class ControladorAgremiados extends Controller
{
    // Mensajes de validación en español. Laravel trae los suyos en
    // inglés por defecto ("The field is required", etc.), así que se
    // los sobreescribimos aquí para que todo el sistema quede en español.
    // ":attribute" lo reemplaza Laravel automáticamente por el nombre
    // del campo (ver $atributos más abajo).
    // El patrón oficial de la CURP (18 caracteres), explicado por partes:
    //   [A-Z]           1 letra  (primera letra del primer apellido)
    //   [AEIOU]         1 vocal  (primera vocal interna del primer apellido)
    //   [A-Z]{2}        2 letras (primera letra del segundo apellido y del nombre)
    //   \d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])   6 dígitos (fecha de nacimiento AAMMDD, con mes y día válidos)
    //   [HM]            1 letra  (sexo: H hombre, M mujer)
    //   (dos letras del estado, ej. GR = Guerrero, NE = nacido en el extranjero)
    //   [B-DF-HJ-NP-TV-Z]{3}   3 consonantes (sin vocales)
    //   [A-Z0-9]        1 caracter diferenciador
    //   \d              1 dígito verificador
    // Si no cumple exactamente este patrón, no es una CURP válida.
    private const PATRON_CURP = '/^[A-Z][AEIOU][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QO|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/';

    private function mensajesValidacion(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'unique' => 'Ya existe un registro con ese :attribute.',
            'email' => 'El campo :attribute debe ser un correo válido.',
            'date' => 'El campo :attribute debe ser una fecha válida.',
            'numeric' => 'El campo :attribute debe ser un número.',
            'integer' => 'El campo :attribute debe ser un número entero.',
            'min' => 'El campo :attribute debe ser mayor o igual a :min.',
            'max' => 'El campo :attribute no debe tener más de :max caracteres.',
            'size' => 'El campo :attribute debe tener exactamente :size caracteres.',
            'string' => 'El campo :attribute debe ser texto.',
            'boolean' => 'El campo :attribute debe ser verdadero o falso.',
            'in' => 'El valor elegido para :attribute no es válido.',
            'exists' => 'La opción elegida para :attribute no existe en el catálogo.',
            'file' => 'El campo :attribute debe ser un archivo.',
            'mimes' => 'El campo :attribute debe ser un archivo de tipo: :values.',
            // Mensaje específico para cuando la CURP no cumple el formato oficial.
            'curp.regex' => 'La CURP no tiene un formato válido. Debe tener 18 caracteres: '
                . '4 letras (ej. GOAL), 6 dígitos de fecha de nacimiento (AAMMDD), '
                . 'una H o M (sexo), 2 letras del estado, 3 consonantes, y 2 caracteres finales.',
        ];
    }

    // Los nombres de los campos, ya traducidos, para que el mensaje diga
    // por ejemplo "El campo Número de empleado es obligatorio" en vez de
    // "El campo numero_empleado es obligatorio".
    private function nombresCampos(): array
    {
        return [
            'numero_empleado' => 'número de empleado',
            'nombre_completo' => 'nombre completo',
            'curp' => 'CURP',
            'rfc' => 'RFC',
            'fecha_ingreso' => 'fecha de ingreso',
            'categoria' => 'categoría',
            'dependencia_id' => 'dependencia',
            'domicilio' => 'domicilio',
            'ciudad_localidad_municipio' => 'ciudad o municipio',
            'telefono' => 'teléfono',
            'correo' => 'correo electrónico',
            'estado_civil' => 'estado civil',
            'sueldo_base' => 'sueldo base',
            'estatus_nuevo' => 'estatus',
            'motivo' => 'motivo',
            'tipo_documento' => 'tipo de documento',
            'archivo' => 'archivo',
        ];
    }

    // CU-01: Consultar y Buscar Agremiados
    public function index(Request $request)
    {
        $busqueda = $request->input('buscar');
        $estatus = $request->input('estatus');

        $agremiados = Agremiado::query()
            ->with('dependencia.secretariaOrganismo') // dependencia y, dentro, su secretaría
            ->when($busqueda, function ($query, $busqueda) {
                $query->where(function ($q) use ($busqueda) {
                    $q->where('nombre_completo', 'like', "%{$busqueda}%")
                        ->orWhere('numero_empleado', 'like', "%{$busqueda}%")
                        ->orWhere('curp', 'like', "%{$busqueda}%")
                        ->orWhere('rfc', 'like', "%{$busqueda}%");
                });
            })
            ->when($estatus, fn ($query, $estatus) => $query->where('estatus', $estatus))
            ->orderBy('nombre_completo')
            ->paginate(20);

        return Inertia::render('Agremiados/Listado', [
            'agremiados' => $agremiados,
            'filtros' => ['buscar' => $busqueda, 'estatus' => $estatus],
        ]);
    }

    // Muestra el formulario vacío de registro. Antes esta pantalla se
    // mostraba con una ruta directa sin pasar por el controlador; ahora
    // necesita traer los catálogos de dependencias y secretarías para
    // llenar los selects del formulario.
    public function crear()
    {
        return Inertia::render('Agremiados/Registrar', [
            'dependencias' => Dependencia::orderBy('nombre')->get(),
            'secretariasOrganismos' => SecretariaOrganismo::orderBy('nombre')->get(),
        ]);
    }

    // CU-02: Registrar Agremiado
    public function store(Request $request)
    {
        $datos = $request->validate([
            'numero_empleado' => 'required|string|max:20|unique:agremiados,numero_empleado',
            'nombre_completo' => 'required|string|max:150',
            'curp' => ['required', 'string', 'size:18', 'unique:agremiados,curp', 'regex:'.self::PATRON_CURP],
            'rfc' => 'required|string|max:13|unique:agremiados,rfc',
            'fecha_ingreso' => 'required|date',
            'categoria' => 'required|string|max:100',
            'dependencia_id' => 'required|exists:dependencias,id',
            'domicilio' => 'required|string|max:250',
            'ciudad_localidad_municipio' => 'required|string|max:150',
            'telefono' => 'required|string|size:10',
            'correo' => 'required|email|max:150',
            // Datos familiares: ya no son obligatorios.
            'estado_civil' => 'nullable|string',
            'es_papa' => 'nullable|boolean',
            'es_mama' => 'nullable|boolean',
            'num_ninos' => 'nullable|integer|min:0',
            'num_ninas' => 'nullable|integer|min:0',
            'sueldo_base' => 'required|numeric|min:0',
        ], $this->mensajesValidacion(), $this->nombresCampos());

        $datos['fecha_afiliacion'] = now();
        $datos['estatus'] = 'En proceso';
        $datos['registrado_por'] = null; // sin login todavía

        $agremiado = new Agremiado($datos);
        $agremiado->no_padron = $this->generarFolioPadron();
        $agremiado->save();

        // Queda constancia de la fecha y hora exactas del registro
        // (created_at, que Eloquent llena solo) y además un movimiento
        // en la bitácora general, para que se vea junto con los demás
        // cambios que le pasen al agremiado más adelante.
        HistorialMovimiento::create([
            'agremiado_id' => $agremiado->id,
            'tipo_movimiento' => 'Registro',
            'descripcion' => 'Se registró al agremiado en el padrón.',
        ]);

        return redirect()
            ->route('agremiados.show', $agremiado)
            ->with('mensaje', 'Agremiado registrado correctamente.');
    }

    // CU-03: Ver Detalle del Agremiado
    public function show(Agremiado $agremiado)
    {
        $agremiado->load(['historialMovimientos', 'documentos', 'credenciales', 'dependencia.secretariaOrganismo']);

        return Inertia::render('Agremiados/Detalle', [
            'agremiado' => $agremiado,
            'documentosRequeridos' => DocumentoAgremiado::tiposRequeridos(),
            // Se necesitan aquí también porque ahora se puede editar sin
            // salir de esta pantalla (ver el botón "Editar" en Detalle.jsx).
            'dependencias' => Dependencia::orderBy('nombre')->get(),
            'secretariasOrganismos' => SecretariaOrganismo::orderBy('nombre')->get(),
        ]);
    }

    // CU-04: Editar Datos del Agremiado
    public function update(Request $request, Agremiado $agremiado)
    {
        $datos = $request->validate([
            'nombre_completo' => 'required|string|max:150',
            'curp' => ['required', 'string', 'size:18', "unique:agremiados,curp,{$agremiado->id}", 'regex:'.self::PATRON_CURP],
            'rfc' => "required|string|max:13|unique:agremiados,rfc,{$agremiado->id}",
            'categoria' => 'required|string|max:100',
            'dependencia_id' => 'required|exists:dependencias,id',
            'domicilio' => 'required|string|max:250',
            'ciudad_localidad_municipio' => 'required|string|max:150',
            'telefono' => 'required|string|size:10',
            'correo' => 'required|email|max:150',
            'sueldo_base' => 'required|numeric|min:0',
        ], $this->mensajesValidacion(), $this->nombresCampos());

        $agremiado->update($datos);

        // getChanges() nos dice exactamente qué campos cambiaron de
        // verdad (si el usuario abrió el formulario y guardó sin tocar
        // nada, esto viene vacío y no registramos un movimiento falso).
        $camposCambiados = array_keys($agremiado->getChanges());
        if (! empty($camposCambiados)) {
            $nombresCampos = $this->nombresCampos();
            $listaLegible = collect($camposCambiados)
                ->map(fn ($campo) => $nombresCampos[$campo] ?? $campo)
                ->implode(', ');

            HistorialMovimiento::create([
                'agremiado_id' => $agremiado->id,
                'tipo_movimiento' => 'Edición de datos',
                'descripcion' => "Se actualizó: {$listaLegible}.",
            ]);
        }

        return redirect()
            ->route('agremiados.show', $agremiado)
            ->with('mensaje', 'Datos actualizados correctamente.');
    }

    // CU-05: Cambiar Estatus del Agremiado
    public function cambiarEstatus(Request $request, Agremiado $agremiado)
    {
        $datos = $request->validate([
            'estatus_nuevo' => 'required|in:En proceso,Activo,Baja,Base',
            'motivo' => 'nullable|string|max:250',
        ], $this->mensajesValidacion(), $this->nombresCampos());

        HistorialMovimiento::create([
            'agremiado_id' => $agremiado->id,
            'tipo_movimiento' => 'Cambio de estatus',
            'descripcion' => $datos['motivo'] ?? "Cambio de estatus a \"{$datos['estatus_nuevo']}\".",
            'estatus_anterior' => $agremiado->estatus,
            'estatus_nuevo' => $datos['estatus_nuevo'],
        ]);

        $agremiado->update(['estatus' => $datos['estatus_nuevo']]);

        return back()->with('mensaje', 'Estatus actualizado correctamente.');
    }

    // CU-06: Gestionar Documentos de Afiliación (subir)
    public function subirDocumento(Request $request, Agremiado $agremiado)
    {
        $datos = $request->validate([
            'tipo_documento' => 'required|in:nomina,ine,solicitud_afiliacion,carta_aceptacion,toma_protesta,consentimiento_cuota',
            'archivo' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ], $this->mensajesValidacion(), $this->nombresCampos());

        $archivo = $request->file('archivo');
        $ruta = $archivo->store('documentos', 'public');

        $yaExistia = DocumentoAgremiado::where('agremiado_id', $agremiado->id)
            ->where('tipo_documento', $datos['tipo_documento'])
            ->exists();

        DocumentoAgremiado::updateOrCreate(
            ['agremiado_id' => $agremiado->id, 'tipo_documento' => $datos['tipo_documento']],
            ['nombre_original' => $archivo->getClientOriginalName(), 'ruta_archivo' => $ruta]
        );

        $etiquetaDocumento = DocumentoAgremiado::tiposRequeridos()[$datos['tipo_documento']];
        HistorialMovimiento::create([
            'agremiado_id' => $agremiado->id,
            'tipo_movimiento' => 'Documento de afiliación',
            'descripcion' => $yaExistia
                ? "Se reemplazó el documento: {$etiquetaDocumento}."
                : "Se subió el documento: {$etiquetaDocumento}.",
        ]);

        return back()->with('mensaje', 'Documento subido correctamente.');
    }

    // CU-06: Eliminar un documento ya subido
    public function eliminarDocumento(DocumentoAgremiado $documento)
    {
        $etiquetaDocumento = DocumentoAgremiado::tiposRequeridos()[$documento->tipo_documento];

        HistorialMovimiento::create([
            'agremiado_id' => $documento->agremiado_id,
            'tipo_movimiento' => 'Documento de afiliación',
            'descripcion' => "Se eliminó el documento: {$etiquetaDocumento}.",
        ]);

        Storage::disk('public')->delete($documento->ruta_archivo);
        $documento->delete();

        return back()->with('mensaje', 'Documento eliminado.');
    }

    // CU-09, paso 1-2: Inicia el trámite (el agremiado ya está Activo).
    //
    // IMPORTANTE: antes esta función creaba un expediente NUEVO cada vez
    // que se oprimía "Tramitar credencial", sin importar si ya existía
    // uno en curso. Eso hacía que, al subir documentos y volver a entrar
    // desde el detalle del agremiado, pareciera que todo se había
    // borrado — en realidad no se borraba nada, solo se creaba OTRO
    // expediente vacío y te mandaba a ese, dejando el anterior (con tus
    // documentos ya subidos) guardado pero fuera de vista.
    //
    // La corrección: primero buscamos si ya hay un trámite que no esté
    // "Entregada" todavía, y si existe, vamos directo a ese en vez de
    // crear uno nuevo.
    public function solicitarCredencial(Agremiado $agremiado)
    {
        if (! $agremiado->puedeTramitarCredencial()) {
            return back()->withErrors([
                'estatus' => 'El agremiado debe estar en estatus Activo para tramitar su credencial.',
            ]);
        }

        $credencialExistente = $agremiado->credenciales()
            ->where('estatus', '!=', 'Entregada')
            ->latest()
            ->first();

        if ($credencialExistente) {
            return redirect()->route('credenciales.show', $credencialExistente);
        }

        $credencial = CredencialSuspeg::create([
            'agremiado_id' => $agremiado->id,
            'folio' => $this->generarFolioCredencial(),
            'fecha_solicitud' => now(),
            'estatus' => 'En captura',
        ]);

        HistorialMovimiento::create([
            'agremiado_id' => $agremiado->id,
            'tipo_movimiento' => 'Trámite de credencial',
            'descripcion' => "Se inició el trámite de credencial SUSPEG (folio {$credencial->folio}).",
        ]);

        return redirect()->route('credenciales.show', $credencial);
    }

    // CU-09, paso 4 / FA_002: Este es el botón que se habilita solo
    // cuando ya están los 5 documentos. Aquí lo volvemos a comprobar en
    // el servidor (nunca hay que confiar solo en que el botón estaba
    // deshabilitado en la pantalla — alguien podría forzar la petición).
    public function enviarATribunal(CredencialSuspeg $credencial)
    {
        if (! $credencial->documentosCompletos()) {
            return back()->withErrors([
                'documentos' => 'Faltan documentos por adjuntar. No se puede enviar el expediente todavía.',
            ]);
        }

        $credencial->update([
            'estatus' => 'Enviado al Tribunal',
            'fecha_envio_tribunal' => now(),
        ]);

        HistorialMovimiento::create([
            'agremiado_id' => $credencial->agremiado_id,
            'tipo_movimiento' => 'Trámite de credencial',
            'descripcion' => "Se envió el expediente de credencial (folio {$credencial->folio}) al H. Tribunal de Conciliación y Arbitraje.",
        ]);

        return back()->with('mensaje', 'Expediente enviado al H. Tribunal de Conciliación y Arbitraje.');
    }

    // Sube uno de los 5 documentos requeridos para el trámite de credencial
    public function subirDocumentoCredencial(Request $request, CredencialSuspeg $credencial)
    {
        $datos = $request->validate([
            'campo' => 'required|in:recibo,ficha,ine,firma_digital,foto',
            'archivo' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ], $this->mensajesValidacion(), $this->nombresCampos());

        $ruta = $request->file('archivo')->store('credenciales', 'public');
        $credencial->update(["{$datos['campo']}_ruta" => $ruta]);

        $etiquetasCampos = [
            'recibo' => 'Recibo de pago (Cuota SUSPEG)',
            'ficha' => 'Ficha de registro',
            'ine' => 'Copia de INE',
            'firma_digital' => 'Firma digital',
            'foto' => 'Foto a color',
        ];

        HistorialMovimiento::create([
            'agremiado_id' => $credencial->agremiado_id,
            'tipo_movimiento' => 'Trámite de credencial',
            'descripcion' => "Se adjuntó \"{$etiquetasCampos[$datos['campo']]}\" al expediente de credencial (folio {$credencial->folio}).",
        ]);

        return back()->with('mensaje', 'Documento adjuntado.');
    }

    // CU-10: Registrar Entrega de Credencial
    // Precondición (según la documentación): el expediente debe estar
    // en estatus "Enviado al Tribunal" antes de poder confirmarse la entrega.
    public function confirmarEntrega(CredencialSuspeg $credencial)
    {
        if ($credencial->estatus !== 'Enviado al Tribunal') {
            return back()->withErrors([
                'estatus' => 'El expediente todavía no se ha enviado al Tribunal.',
            ]);
        }

        $credencial->update([
            'estatus' => 'Entregada',
            'fecha_entrega' => now(),
        ]);

        HistorialMovimiento::create([
            'agremiado_id' => $credencial->agremiado_id,
            'tipo_movimiento' => 'Trámite de credencial',
            'descripcion' => "Se entregó la credencial SUSPEG al agremiado (folio {$credencial->folio}).",
        ]);

        return back()->with('mensaje', 'Entrega registrada correctamente.');
    }

    // CU-07: Exportar Ficha del Agremiado (PDF)
    public function exportarFichaPdf(Agremiado $agremiado)
    {
        $agremiado->load('dependencia.secretariaOrganismo');

        // RF-10: el sueldo solo se muestra a roles autorizados (admin y
        // secretario_organizacion). Como todavía no hay sistema de
        // login/roles, dejamos esta bandera fija en "true" por ahora.
        // Cuando se agregue la autenticación, aquí se reemplaza por algo
        // como: auth()->user()->hasRole(['admin', 'secretario_organizacion']).
        $puedeVerSueldo = true;

        $pdf = Pdf::loadView('pdf.ficha-agremiado', [
            'agremiado' => $agremiado,
            'puedeVerSueldo' => $puedeVerSueldo,
            'folio' => 'FICHA-'.now()->format('YmdHis'),
            'fechaGeneracion' => now(),
        ]);

        return $pdf->download("ficha-{$agremiado->no_padron}.pdf");
    }

    // CU-08: Generar Reporte del Padrón Completo
    public function generarReporte(Request $request)
    {
        $formato = $request->validate([
            'formato' => 'required|in:pdf,excel',
        ])['formato'];

        // Mismo caso que en exportarFichaPdf(): sin roles todavía, se
        // deja en true. Ver el comentario de arriba.
        $puedeVerSueldo = true;

        // FA_001: agrupamos por estatus; si algún grupo queda vacío
        // (ej. no hay nadie "Baja"), la vista/exportación lo maneja
        // mostrando la leyenda correspondiente en vez de una tabla vacía.
        $estatusPosibles = ['En proceso', 'Activo', 'Baja', 'Base'];
        $agremiadosPorEstatus = Agremiado::with('dependencia.secretariaOrganismo')
            ->get()
            ->groupBy('estatus');

        $folio = 'REPORTE-'.now()->format('YmdHis');

        if ($formato === 'excel') {
            return Excel::download(
                new ReportePadronExport($agremiadosPorEstatus, $estatusPosibles, $puedeVerSueldo),
                "reporte-padron-{$folio}.xlsx"
            );
        }

        $pdf = Pdf::loadView('pdf.reporte-padron', [
            'agremiadosPorEstatus' => $agremiadosPorEstatus,
            'estatusPosibles' => $estatusPosibles,
            'puedeVerSueldo' => $puedeVerSueldo,
            'folio' => $folio,
            'fechaGeneracion' => now(),
        ]);

        return $pdf->download("reporte-padron-{$folio}.pdf");
    }

    // --- Funciones internas de apoyo ---

    private function generarFolioPadron(): string
    {
        $anio = now()->year;
        $siguiente = Agremiado::whereYear('created_at', $anio)->count() + 1;

        return sprintf('SUSPEG-%d-%06d', $anio, $siguiente);
    }

    private function generarFolioCredencial(): string
    {
        $anio = now()->year;
        $siguiente = CredencialSuspeg::whereYear('created_at', $anio)->count() + 1;

        return sprintf('CRED-%d-%06d', $anio, $siguiente);
    }
}
