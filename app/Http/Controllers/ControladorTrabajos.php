<?php

namespace App\Http\Controllers;

use App\Exports\ReporteCasosExport;
use App\Models\Agremiado;
use App\Models\CasoLaboral;
use App\Models\PlazaVacante;
use App\Models\SeguimientoCaso;
use App\Models\SolicitudPermiso;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

/**
 * Igual que en los demás módulos: todavía sin login ni roles.
 */
class ControladorTrabajos extends Controller
{
    private function mensajesValidacion(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'max' => 'El campo :attribute no debe tener más de :max caracteres.',
            'exists' => 'El valor elegido para :attribute no es válido.',
            'date' => 'El campo :attribute debe ser una fecha válida.',
            'integer' => 'El campo :attribute debe ser un número entero.',
        ];
    }

    // ============================================================
    //  CU-28, CU-29, CU-30: Casos Laborales
    // ============================================================
    public function index(Request $request)
    {
        $casos = CasoLaboral::with('agremiado')
            ->when($request->input('buscar'), function ($q, $buscar) {
                $q->whereHas('agremiado', fn ($q2) => $q2->where('nombre_completo', 'like', "%{$buscar}%"));
            })
            ->when($request->input('tipo_caso'), fn ($q, $tipo) => $q->where('tipo_caso', $tipo))
            ->when($request->input('estatus'), fn ($q, $estatus) => $q->where('estatus', $estatus))
            ->orderByDesc('fecha_registro')
            ->paginate(20);

        return Inertia::render('Trabajos/Listado', [
            'casos' => $casos,
            'filtros' => $request->only('buscar', 'tipo_caso', 'estatus'),
        ]);
    }

    public function crear()
    {
        return Inertia::render('Trabajos/Registrar');
    }

    // Busca agremiados en vivo para el selector del formulario (evita
    // mandar el padrón completo de una sola vez).
    public function buscarAgremiados(Request $request)
    {
        $agremiados = Agremiado::where('nombre_completo', 'like', '%'.$request->input('q', '').'%')
            ->orWhere('numero_empleado', 'like', '%'.$request->input('q', '').'%')
            ->limit(15)
            ->get(['id', 'numero_empleado', 'nombre_completo']);

        return response()->json($agremiados);
    }

    // CU-29: Registrar Caso Laboral
    public function store(Request $request)
    {
        $datos = $request->validate([
            'agremiado_id' => 'required|exists:agremiados,id',
            'escolaridad' => 'nullable|string|max:100',
            'tipo_caso' => 'required|in:Despido Injustificado,Conflicto Individual,Conflicto Colectivo,Demanda por Despido,Otro',
            'descripcion' => 'required|string|max:500',
            'fecha_registro' => 'required|date',
        ], $this->mensajesValidacion());

        $datos['estatus'] = 'En trámite';
        $datos['registrado_por'] = null;

        $caso = CasoLaboral::create($datos);

        return redirect()->route('trabajos.show', $caso)->with('mensaje', 'Caso registrado correctamente.');
    }

    // CU-30: Ver Detalle y Dar Seguimiento al Caso
    public function show(CasoLaboral $caso)
    {
        $caso->load(['agremiado', 'seguimientos']);

        return Inertia::render('Trabajos/Detalle', ['caso' => $caso]);
    }

    public function agregarSeguimiento(Request $request, CasoLaboral $caso)
    {
        $datos = $request->validate([
            'fecha' => 'required|date',
            'nota' => 'required|string|max:400',
        ], $this->mensajesValidacion());

        $datos['caso_id'] = $caso->id;
        $datos['registrado_por'] = null;

        SeguimientoCaso::create($datos);

        // Si el caso apenas se estaba abriendo, pasa a "En seguimiento"
        // automáticamente en cuanto tiene al menos una nota.
        if ($caso->estatus === 'En trámite') {
            $caso->update(['estatus' => 'En seguimiento']);
        }

        return back()->with('mensaje', 'Seguimiento registrado correctamente.');
    }

    public function turnarAJuridico(CasoLaboral $caso)
    {
        $caso->update(['estatus' => 'Turnado a Jurídico']);

        return back()->with('mensaje', 'Caso turnado a Asuntos Jurídicos.');
    }

    public function cerrarCaso(Request $request, CasoLaboral $caso)
    {
        $datos = $request->validate([
            'resultado' => 'required|string|max:300',
            'fecha_resolucion' => 'required|date',
        ], $this->mensajesValidacion());

        $datos['estatus'] = 'Resuelto';
        $caso->update($datos);

        return back()->with('mensaje', 'Caso cerrado correctamente.');
    }

    // ============================================================
    //  CU-31: Solicitudes de Permiso
    // ============================================================
    public function permisosIndex(Request $request)
    {
        $permisos = SolicitudPermiso::with('agremiado')
            ->when($request->input('buscar'), function ($q, $buscar) {
                $q->whereHas('agremiado', fn ($q2) => $q2->where('nombre_completo', 'like', "%{$buscar}%"));
            })
            ->orderByDesc('fecha_inicio')
            ->paginate(20);

        return Inertia::render('Trabajos/Permisos', [
            'permisos' => $permisos,
            'filtros' => $request->only('buscar'),
        ]);
    }

    public function permisosStore(Request $request)
    {
        $datos = $request->validate([
            'agremiado_id' => 'required|exists:agremiados,id',
            'tipo_permiso' => 'required|in:Día Económico,Licencia sin Goce de Sueldo',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'dias_solicitados' => 'required|integer|min:1',
            'motivo' => 'nullable|string|max:300',
        ], $this->mensajesValidacion());

        // RF-37: el día económico tiene un límite real — 9 al año y,
        // dentro de eso, no más de 3 en los últimos 2 meses. Aquí solo
        // se avisa (no se bloquea), porque la Secretaría puede tener un
        // motivo válido para hacer una excepción — igual que el
        // remanente de Finanzas, es información, no un candado.
        $aviso = null;
        if ($datos['tipo_permiso'] === 'Día Económico') {
            $fecha = Carbon::parse($datos['fecha_inicio']);

            $usadosEnAnio = SolicitudPermiso::where('agremiado_id', $datos['agremiado_id'])
                ->where('tipo_permiso', 'Día Económico')
                ->whereYear('fecha_inicio', $fecha->year)
                ->sum('dias_solicitados');

            $usadosEnDosMeses = SolicitudPermiso::where('agremiado_id', $datos['agremiado_id'])
                ->where('tipo_permiso', 'Día Económico')
                ->whereBetween('fecha_inicio', [$fecha->copy()->subMonths(2), $fecha])
                ->sum('dias_solicitados');

            if ($usadosEnAnio + $datos['dias_solicitados'] > 9) {
                $aviso = "Este agremiado ya lleva {$usadosEnAnio} día(s) económico(s) usados este año; el límite normal es 9.";
            } elseif ($usadosEnDosMeses + $datos['dias_solicitados'] > 3) {
                $aviso = "Este agremiado ya lleva {$usadosEnDosMeses} día(s) económico(s) en los últimos 2 meses; el límite normal es 3.";
            }
        }

        $datos['estatus'] = 'Autorizado';
        $datos['registrado_por'] = null;

        SolicitudPermiso::create($datos);

        return back()->with('mensaje', $aviso ?? 'Permiso registrado correctamente.');
    }

    // ============================================================
    //  CU-32, CU-33: Plazas Vacantes
    // ============================================================
    public function plazasIndex(Request $request)
    {
        $plazas = PlazaVacante::with(['agremiadoJubilado', 'asignadoA'])
            ->when($request->input('estatus'), fn ($q, $estatus) => $q->where('estatus', $estatus))
            ->orderByDesc('fecha_vacante')
            ->paginate(20);

        return Inertia::render('Trabajos/Plazas', [
            'plazas' => $plazas,
            'filtros' => $request->only('estatus'),
        ]);
    }

    public function plazasStore(Request $request)
    {
        $datos = $request->validate([
            'agremiado_jubilado_id' => 'required|exists:agremiados,id',
            'no_plaza' => 'required|string|max:20',
            'dependencia' => 'nullable|string|max:150',
            'tipo_plaza' => 'required|in:Base,Confianza,Eventual,Supernumeraria',
            'fecha_vacante' => 'required|date',
        ], $this->mensajesValidacion());

        $datos['estatus'] = 'Vacante';
        $datos['registrado_por'] = null;

        PlazaVacante::create($datos);

        return back()->with('mensaje', 'Plaza vacante registrada correctamente.');
    }

    // CU-33: Asignar Plaza Vacante (Escalafón)
    public function asignarPlaza(Request $request, PlazaVacante $plaza)
    {
        $datos = $request->validate([
            'asignado_a_id' => 'required|exists:agremiados,id',
            'fecha_asignacion' => 'required|date',
        ], $this->mensajesValidacion());

        $datos['estatus'] = 'Asignada';
        $plaza->update($datos);

        return back()->with('mensaje', 'Plaza asignada correctamente.');
    }

    // CU-34: Generar Reporte de Casos Laborales
    public function generarReporte(Request $request)
    {
        $datos = $request->validate([
            'periodo' => 'required|in:mensual,anual',
            'mes' => 'required_if:periodo,mensual|nullable|integer|min:1|max:12',
            'anio' => 'required|integer|min:2020',
            'formato' => 'required|in:pdf,excel',
        ]);

        $resumen = CasoLaboral::query()
            ->whereYear('fecha_registro', $datos['anio'])
            ->when($datos['periodo'] === 'mensual', fn ($q) => $q->whereMonth('fecha_registro', $datos['mes']))
            ->with('agremiado')
            ->get()
            ->groupBy('tipo_caso')
            ->map(fn ($grupo) => [
                'total' => $grupo->count(),
                'casos' => $grupo->map(fn ($c) => [
                    'trabajador' => $c->agremiado->nombre_completo,
                    'estatus' => $c->estatus,
                ]),
            ]);

        $folio = 'TRAB-'.now()->format('YmdHis');
        $etiquetaPeriodo = $datos['periodo'] === 'mensual'
            ? sprintf('%02d/%d', $datos['mes'], $datos['anio'])
            : (string) $datos['anio'];

        if ($datos['formato'] === 'excel') {
            return Excel::download(new ReporteCasosExport($resumen), "reporte-trabajos-{$folio}.xlsx");
        }

        $pdf = Pdf::loadView('pdf.reporte-casos', [
            'resumen' => $resumen,
            'etiquetaPeriodo' => $etiquetaPeriodo,
            'folio' => $folio,
            'fechaGeneracion' => now(),
        ]);

        return $pdf->download("reporte-trabajos-{$folio}.pdf");
    }
}
