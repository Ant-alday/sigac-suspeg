<?php

namespace App\Http\Controllers;

use App\Exports\ReporteInsumosExport;
use App\Models\Agremiado;
use App\Models\Beneficiario;
use App\Models\CategoriaInsumo;
use App\Models\Convenio;
use App\Models\DetalleSolicitudInsumo;
use App\Models\Insumo;
use App\Models\SolicitudConvenio;
use App\Models\SolicitudInsumo;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

/**
 * Igual que en los demás módulos: todavía sin login ni roles.
 */
class ControladorFomento extends Controller
{
    private function mensajesValidacion(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'max' => 'El campo :attribute no debe tener más de :max caracteres.',
            'unique' => 'Ya existe un registro con ese :attribute.',
            'numeric' => 'El campo :attribute debe ser un número.',
            'min' => 'El campo :attribute debe ser mayor a :min.',
            'exists' => 'El valor elegido para :attribute no es válido.',
        ];
    }

    // ============================================================
    //  INTEGRACIÓN CON ORGANIZACIÓN
    // ============================================================
    //
    // Se llega aquí desde el botón "Solicitar beneficio" en el propio
    // Padrón de Beneficiarios (que en realidad lista agremiados — ver
    // index() más abajo). En vez de teclear otra vez el nombre,
    // domicilio, CURP y teléfono del agremiado, se reutilizan los que
    // ya existen en su expediente. Si ese agremiado YA tiene un
    // beneficiario ligado, se reutiliza el mismo registro en vez de
    // crear uno duplicado. Y en vez de mandar solo a su ficha, se manda
    // DIRECTO al formulario de solicitud — un clic menos.
    public function crearDesdeAgremiado(Agremiado $agremiado)
    {
        $beneficiario = Beneficiario::firstOrCreate(
            ['agremiado_id' => $agremiado->id],
            [
                'nombre' => $agremiado->nombre_completo,
                'domicilio' => $agremiado->domicilio,
                'municipio' => $agremiado->ciudad_localidad_municipio,
                'curp' => $agremiado->curp,
                'celular' => $agremiado->telefono,
                'registrado_por' => null,
            ]
        );

        return redirect()->route('fomento.solicitud.create', $beneficiario);
    }

    // CU-20: Consultar Padrón de Beneficiarios.
    //
    // IMPORTANTE — cambio de enfoque: en la práctica, todo beneficiario
    // real es un agremiado (el registro manual aparte casi no se usa).
    // Por eso este padrón ahora muestra directamente el padrón de
    // Organización, con un botón "Solicitar beneficio" en cada fila.
    // No se toca ningún archivo de Organización para esto: solo se
    // consulta su tabla (solo lectura) y, aparte, se consulta cuáles ya
    // tienen un beneficiario/solicitudes ligados, para mostrarlo.
    public function index(Request $request)
    {
        $agremiados = Agremiado::query()
            ->where('estatus', 'Activo')
            ->when($request->input('buscar'), function ($q, $buscar) {
                $q->where('nombre_completo', 'like', "%{$buscar}%")->orWhere('curp', 'like', "%{$buscar}%");
            })
            ->orderBy('nombre_completo')
            ->paginate(20);

        // Para esta página de agremiados, ¿cuáles ya tienen beneficiario
        // y cuántas solicitudes de insumo llevan? Una sola consulta
        // aparte, sin necesidad de una relación Eloquent en Agremiado.
        $beneficiariosPorAgremiado = Beneficiario::whereIn('agremiado_id', $agremiados->pluck('id'))
            ->withCount('solicitudesInsumo')
            ->get()
            ->keyBy('agremiado_id');

        $agremiados->getCollection()->transform(function ($agremiado) use ($beneficiariosPorAgremiado) {
            $beneficiario = $beneficiariosPorAgremiado->get($agremiado->id);
            $agremiado->beneficiario_id = $beneficiario?->id;
            $agremiado->total_solicitudes = $beneficiario?->solicitudes_insumo_count ?? 0;

            return $agremiado;
        });

        return Inertia::render('Fomento/Listado', [
            'agremiados' => $agremiados,
            'filtros' => $request->only('buscar'),
        ]);
    }

    public function crear()
    {
        return Inertia::render('Fomento/Registrar');
    }

    // CU-21: Registrar Beneficiario
    public function store(Request $request)
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:150',
            'domicilio' => 'nullable|string|max:200',
            'comunidad_colonia' => 'nullable|string|max:100',
            'municipio' => 'nullable|string|max:100',
            'curp' => 'nullable|string|max:18|unique:beneficiarios,curp',
            'celular' => 'nullable|string|max:15',
            'edad' => 'nullable|integer|min:0',
            'sexo' => 'nullable|in:F,M',
            'codigo_postal' => 'nullable|string|max:10',
        ], $this->mensajesValidacion());

        $datos['registrado_por'] = null;
        $beneficiario = Beneficiario::create($datos);

        return redirect()->route('fomento.show', $beneficiario)->with('mensaje', 'Beneficiario registrado correctamente.');
    }

    // CU-23: Ver Detalle del Beneficiario (con su historial de solicitudes)
    public function show(Beneficiario $beneficiario)
    {
        $beneficiario->load([
            'agremiado',
            'solicitudesInsumo.detalles.insumo',
            'solicitudesConvenio.convenio',
        ]);

        return Inertia::render('Fomento/Detalle', [
            'beneficiario' => $beneficiario,
            'convenios' => Convenio::orderBy('nombre')->get(),
        ]);
    }

    // Formulario de CU-22
    public function crearSolicitud(Beneficiario $beneficiario)
    {
        return Inertia::render('Fomento/RegistrarSolicitud', [
            'beneficiario' => $beneficiario,
            'categorias' => CategoriaInsumo::with('insumos')->orderBy('nombre')->get(),
        ]);
    }

    // CU-22: Solicitar Insumos (una solicitud puede traer varios insumos)
    public function storeSolicitud(Request $request, Beneficiario $beneficiario)
    {
        $reglas = [
            'fecha_solicitud' => 'required|date',
            'es_para_familiar' => 'boolean',
            'tipo_pago' => 'required|in:Efectivo,Transferencia',
            'observaciones' => 'nullable|string|max:300',
            'items' => 'required|array|min:1',
            'items.*.insumo_id' => 'required|exists:insumos,id',
            'items.*.cantidad' => 'required|integer|min:1',
        ];
        // El nombre y parentesco del familiar solo son obligatorios si
        // se marcó la casilla "Es para un familiar".
        if ($request->boolean('es_para_familiar')) {
            $reglas['nombre_familiar'] = 'required|string|max:150';
            $reglas['parentesco'] = 'required|string|max:50';
        }

        $datos = $request->validate($reglas, $this->mensajesValidacion());

        DB::transaction(function () use ($datos, $beneficiario) {
            $solicitud = SolicitudInsumo::create([
                'beneficiario_id' => $beneficiario->id,
                'fecha_solicitud' => $datos['fecha_solicitud'],
                'es_para_familiar' => $datos['es_para_familiar'] ?? false,
                'nombre_familiar' => $datos['nombre_familiar'] ?? null,
                'parentesco' => $datos['parentesco'] ?? null,
                'tipo_pago' => $datos['tipo_pago'],
                'observaciones' => $datos['observaciones'] ?? null,
                'registrado_por' => null,
            ]);

            foreach ($datos['items'] as $item) {
                $insumo = Insumo::findOrFail($item['insumo_id']);
                DetalleSolicitudInsumo::create([
                    'solicitud_id' => $solicitud->id,
                    'insumo_id' => $insumo->id,
                    'cantidad' => $item['cantidad'],
                    // Se congela el precio de HOY; si el precio del
                    // insumo cambia después, este registro no se altera.
                    'precio_unitario' => $insumo->precio_actual,
                ]);
            }
        });

        return redirect()->route('fomento.show', $beneficiario)->with('mensaje', 'Solicitud registrada correctamente.');
    }

    // Registra CUÁNDO se entregó físicamente el insumo — un momento
    // distinto al de la solicitud (se puede solicitar hoy y entregar
    // hasta que llegue el insumo del proveedor).
    public function marcarEntregada(Request $request, SolicitudInsumo $solicitud)
    {
        $datos = $request->validate([
            'fecha_entrega' => 'required|date',
        ], $this->mensajesValidacion());

        $solicitud->update($datos);

        return back()->with('mensaje', 'Entrega registrada correctamente.');
    }

    // Eliminar beneficiario y beneficios (a petición explícita).
    public function beneficiarioEliminar(Beneficiario $beneficiario)
    {
        // Si tiene historial, se avisa en vez de borrar en silencio —
        // perdería el rastro de lo que ya se le entregó.
        if ($beneficiario->solicitudesInsumo()->exists() || $beneficiario->solicitudesConvenio()->exists()) {
            return back()->withErrors([
                'beneficiario' => 'No se puede eliminar: ya tiene beneficios registrados. Elimina primero cada uno de ellos.',
            ]);
        }

        $beneficiario->delete();

        return redirect()->route('fomento.index')->with('mensaje', 'Beneficiario eliminado correctamente.');
    }

    public function solicitudInsumoEliminar(SolicitudInsumo $solicitud)
    {
        $beneficiarioId = $solicitud->beneficiario_id;
        $solicitud->delete(); // borra en cascada su detalle (detalle_solicitud_insumo)

        return redirect()->route('fomento.show', $beneficiarioId)->with('mensaje', 'Beneficio eliminado correctamente.');
    }

    public function solicitudConvenioEliminar(SolicitudConvenio $solicitud)
    {
        $beneficiarioId = $solicitud->beneficiario_id;
        $solicitud->delete();

        return redirect()->route('fomento.show', $beneficiarioId)->with('mensaje', 'Beneficio eliminado correctamente.');
    }

    // CU-25: Solicitar Convenio de Descuento
    public function storeConvenio(Request $request, Beneficiario $beneficiario)
    {
        $datos = $request->validate([
            'convenio_id' => 'required|exists:convenios,id',
            'nombre_familiar' => 'required|string|max:150',
            'parentesco' => 'required|string|max:50',
            // Datos propios del hijo/hija (a petición explícita), aparte
            // del nombre — para tener su expediente un poco más completo.
            'edad_familiar' => 'nullable|integer|min:0|max:99',
            'curp_familiar' => 'nullable|string|max:18',
            'beneficio_solicitado' => 'required|string|max:200',
            'fecha_solicitud' => 'required|date',
        ], $this->mensajesValidacion());

        $datos['beneficiario_id'] = $beneficiario->id;
        $datos['estatus'] = 'Enviada';
        $datos['registrado_por'] = null;

        SolicitudConvenio::create($datos);

        return redirect()->route('fomento.show', $beneficiario)->with('mensaje', 'Solicitud de convenio enviada correctamente.');
    }

    // ============================================================
    //  CU-24: Gestionar Catálogo de Insumos (en tarjetas por categoría)
    // ============================================================

    // Cada categoría es una tarjeta; al abrirla se ve su lista de insumos.
    public function insumosIndex()
    {
        return Inertia::render('Fomento/Insumos', [
            'categorias' => CategoriaInsumo::with('insumos')->orderBy('nombre')->get(),
        ]);
    }

    // Crea una categoría nueva (una tarjeta nueva vacía).
    public function categoriasStore(Request $request)
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:100|unique:categorias_insumo,nombre',
        ], $this->mensajesValidacion(), ['nombre' => 'nombre de la categoría']);

        CategoriaInsumo::create($datos);

        return back()->with('mensaje', 'Categoría creada correctamente.');
    }

    public function categoriasEliminar(CategoriaInsumo $categoria)
    {
        if ($categoria->insumos()->exists()) {
            return back()->withErrors([
                'categoria' => 'No se puede eliminar: todavía tiene insumos registrados dentro.',
            ]);
        }

        $categoria->delete();

        return back()->with('mensaje', 'Categoría eliminada correctamente.');
    }

    // Agrega un insumo a una categoría ya existente, o a una nueva si
    // se escribió un nombre de categoría que todavía no existe.
    public function insumosStore(Request $request)
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:120|unique:insumos,nombre',
            'categoria_id' => 'nullable|exists:categorias_insumo,id',
            'categoria_nueva' => 'nullable|string|max:100',
            'precio_actual' => 'required|numeric|min:0',
            'unidad_medida' => 'nullable|string|max:30',
        ], $this->mensajesValidacion());

        if (empty($datos['categoria_id']) && empty($datos['categoria_nueva'])) {
            return back()->withErrors(['categoria_id' => 'Elige una categoría existente o escribe el nombre de una nueva.']);
        }

        $categoriaId = $datos['categoria_id']
            ?? CategoriaInsumo::firstOrCreate(['nombre' => $datos['categoria_nueva']])->id;

        Insumo::create([
            'nombre' => $datos['nombre'],
            'categoria_id' => $categoriaId,
            'precio_actual' => $datos['precio_actual'],
            'unidad_medida' => $datos['unidad_medida'] ?? 'Pieza',
        ]);

        return back()->with('mensaje', 'Insumo agregado correctamente.');
    }

    // Edita el insumo completo (nombre, precio, unidad) — antes solo se
    // podía cambiar el precio; ahora se puede corregir cualquier dato.
    public function insumosActualizar(Request $request, Insumo $insumo)
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:120|unique:insumos,nombre,'.$insumo->id,
            'precio_actual' => 'required|numeric|min:0',
            'unidad_medida' => 'nullable|string|max:30',
        ], $this->mensajesValidacion());

        $insumo->update($datos);

        return back()->with('mensaje', 'Insumo actualizado correctamente.');
    }

    public function insumosEliminar(Insumo $insumo)
    {
        if ($insumo->detalleSolicitudes()->exists()) {
            return back()->withErrors([
                'insumo' => 'No se puede eliminar: ya tiene solicitudes registradas con este insumo.',
            ]);
        }

        $insumo->delete();

        return back()->with('mensaje', 'Insumo eliminado correctamente.');
    }

    // ============================================================
    //  Catálogo de Convenios de Descuento
    // ============================================================
    public function conveniosIndex()
    {
        return Inertia::render('Fomento/Convenios', [
            'convenios' => Convenio::withCount('solicitudes')->orderBy('nombre')->get(),
        ]);
    }

    // Detalle de un convenio: la lista de cada beneficiario que lo usó,
    // con los datos del familiar Y del agremiado al que está ligado —
    // más el documento del convenio, para verlo o descargarlo.
    public function convenioDetalle(Convenio $convenio)
    {
        $convenio->load(['solicitudes.beneficiario.agremiado']);

        return Inertia::render('Fomento/ConvenioDetalle', ['convenio' => $convenio]);
    }

    public function conveniosStore(Request $request)
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:150|unique:convenios,nombre',
            'institucion' => 'nullable|string|max:150',
            // El documento firmado del convenio (opcional al crearlo; se
            // puede subir después desde el detalle si no se tiene a la mano).
            'documento' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ], $this->mensajesValidacion());

        if ($request->hasFile('documento')) {
            $datos['documento_ruta'] = $request->file('documento')->store('convenios', 'public');
        }
        unset($datos['documento']);

        Convenio::create($datos);

        return back()->with('mensaje', 'Convenio agregado correctamente.');
    }

    // Sube (o reemplaza) el documento de un convenio ya existente.
    public function conveniosSubirDocumento(Request $request, Convenio $convenio)
    {
        $datos = $request->validate([
            'documento' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ], $this->mensajesValidacion());

        $convenio->update([
            'documento_ruta' => $request->file('documento')->store('convenios', 'public'),
        ]);

        return back()->with('mensaje', 'Documento subido correctamente.');
    }

    public function conveniosEliminar(Convenio $convenio)
    {
        if ($convenio->solicitudes()->exists()) {
            return back()->withErrors([
                'convenio' => 'No se puede eliminar: ya tiene solicitudes registradas con este convenio.',
            ]);
        }

        $convenio->delete();

        return back()->with('mensaje', 'Convenio eliminado correctamente.');
    }

    // CU-26: Generar Reporte de Beneficiarios por Insumo
    public function generarReporte(Request $request)
    {
        $datos = $request->validate([
            'periodo' => 'required|in:mensual,anual',
            'mes' => 'required_if:periodo,mensual|nullable|integer|min:1|max:12',
            'anio' => 'required|integer|min:2020',
            'formato' => 'required|in:pdf,excel',
        ]);

        // Agrupa por insumo, sumando cantidades — igual que la fila
        // "TOTAL CALENTADORES SOLARES" que ya se hace a mano en el Excel real.
        $resumen = DetalleSolicitudInsumo::with(['insumo', 'solicitud.beneficiario.agremiado'])
            ->whereHas('solicitud', function ($q) use ($datos) {
                $q->whereYear('fecha_solicitud', $datos['anio']);
                if ($datos['periodo'] === 'mensual') {
                    $q->whereMonth('fecha_solicitud', $datos['mes']);
                }
            })
            ->get()
            ->groupBy(fn ($d) => $d->insumo->nombre)
            ->map(function ($grupo) {
                return [
                    'total_cantidad' => $grupo->sum('cantidad'),
                    'beneficiarios' => $grupo->map(function ($d) {
                        $sol = $d->solicitud;
                        return [
                            // Si el beneficio fue para un familiar, se
                            // muestra su nombre Y el del agremiado al que
                            // está asociado — a petición explícita, para
                            // no perder de vista quién es el titular.
                            'nombre' => $sol->es_para_familiar
                                ? "{$sol->nombre_familiar} ({$sol->parentesco} de {$sol->beneficiario->nombre})"
                                : $sol->beneficiario->nombre,
                            'cantidad' => $d->cantidad,
                        ];
                    }),
                ];
            });

        $folio = 'FOM-'.now()->format('YmdHis');
        $etiquetaPeriodo = $datos['periodo'] === 'mensual'
            ? sprintf('%02d/%d', $datos['mes'], $datos['anio'])
            : (string) $datos['anio'];

        if ($datos['formato'] === 'excel') {
            return Excel::download(new ReporteInsumosExport($resumen), "reporte-fomento-{$folio}.xlsx");
        }

        $pdf = Pdf::loadView('pdf.reporte-insumos', [
            'resumen' => $resumen,
            'anio' => $datos['anio'],
            'etiquetaPeriodo' => $etiquetaPeriodo,
            'folio' => $folio,
            'fechaGeneracion' => now(),
        ]);

        return $pdf->download("reporte-fomento-{$folio}.pdf");
    }
}
