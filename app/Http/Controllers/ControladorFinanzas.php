<?php

namespace App\Http\Controllers;

use App\Exports\InformeFinancieroExport;
use App\Models\BienMueble;
use App\Models\MovimientoFinanciero;
use App\Models\Agremiado;
use App\Models\PartidaPresupuestal;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

/**
 * ============================================================
 *  SOBRE SEGURIDAD EN ESTE ARCHIVO
 * ============================================================
 * Igual que en el módulo de Organización: todavía NO hay login ni
 * roles. Cualquiera que conozca la URL puede usar estas funciones.
 * Eso se agrega más adelante.
 * ============================================================
 */
class ControladorFinanzas extends Controller
{
    private function mensajesValidacion(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'numeric' => 'El campo :attribute debe ser un número.',
            'min' => 'El campo :attribute debe ser mayor a :min.',
            'max' => 'El campo :attribute no debe tener más de :max caracteres.',
            'in' => 'El valor elegido para :attribute no es válido.',
            'exists' => 'La partida elegida no existe.',
            'date' => 'El campo :attribute debe ser una fecha válida.',
            'file' => 'El campo :attribute debe ser un archivo.',
            'mimes' => 'El comprobante debe ser PDF, JPG o PNG.',
            'unique' => 'Ya existe un registro con ese :attribute.',
        ];
    }

    private function nombresCampos(): array
    {
        return [
            'tipo' => 'tipo de movimiento',
            'partida_id' => 'partida',
            'concepto' => 'concepto',
            'importe' => 'importe',
            'comprobante' => 'comprobante',
            'fecha_movimiento' => 'fecha del movimiento',
            'clave' => 'clave',
        ];
    }

    // CU-01: Consultar Movimientos y Saldo por Partida
    public function index(Request $request)
    {
        $partidas = PartidaPresupuestal::orderBy('nombre')->get();

        $movimientos = MovimientoFinanciero::with('partida')
            ->when($request->input('tipo'), fn ($q, $tipo) => $q->where('tipo', $tipo))
            ->when($request->input('partida_id'), fn ($q, $id) => $q->where('partida_id', $id))
            ->orderByDesc('fecha_movimiento')
            ->paginate(20);

        // NUEVO — el control real de la Sección no es "por partida",
        // es un resumen MENSUAL: Ingreso del mes vs. Gasto del mes.
        // Si el gasto supera al ingreso, el remanente sale en rojo,
        // pero no se bloquea nada (así es como funciona el Excel real).
        $mes = (int) $request->input('mes', now()->month);
        $anio = (int) $request->input('anio', now()->year);

        $movimientosDelMes = MovimientoFinanciero::whereMonth('fecha_movimiento', $mes)
            ->whereYear('fecha_movimiento', $anio)
            ->get();

        $ingresoMes = (float) $movimientosDelMes->where('tipo', 'Ingreso')->sum('importe');
        $gastoMes = (float) $movimientosDelMes->where('tipo', 'Egreso')->sum('importe');

        return Inertia::render('Finanzas/Listado', [
            'partidas' => $partidas,
            'movimientos' => $movimientos,
            'filtros' => $request->only('tipo', 'partida_id'),
            'resumenMes' => [
                'mes' => $mes,
                'anio' => $anio,
                'ingreso' => $ingresoMes,
                'gasto' => $gastoMes,
                'remanente' => $ingresoMes - $gastoMes,
            ],
        ]);
    }

    // Muestra el formulario de registro (necesita las partidas para el select)
    public function crear()
    {
        return Inertia::render('Finanzas/Registrar', [
            'partidas' => PartidaPresupuestal::orderBy('nombre')->get(),
        ]);
    }

    // CU-02: Registrar Movimiento (Ingreso/Egreso)
    public function store(Request $request)
    {
        $reglas = [
            'tipo' => 'required|in:Ingreso,Egreso',
            'concepto' => 'required|string|max:300',
            'importe' => 'required|numeric|min:0.01',
            'fecha_movimiento' => 'required|date',
        ];

        // partida_id y comprobante solo son obligatorios si es Egreso
        // (RF-01): el ingreso es la cuota mensual, no pertenece a
        // ninguna partida en particular.
        if ($request->input('tipo') === 'Egreso') {
            $reglas['partida_id'] = 'required|exists:partidas_presupuestales,id';
            $reglas['comprobante'] = 'required|file|mimes:pdf,jpg,jpeg,png|max:5120';
        } else {
            $reglas['comprobante'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120';
        }

        $datos = $request->validate($reglas, $this->mensajesValidacion(), $this->nombresCampos());

        // CORREGIDO — antes esto rechazaba el egreso si "excedía" el
        // saldo de la partida. Al revisar el informe financiero real
        // completo (2025), encontramos que eso no refleja cómo trabaja
        // la Sección: las partidas SÍ pueden gastarse de más algunos
        // meses (ej. "Gastos de Orden Social" pasó de $25,900 en enero a
        // $59,768 en diciembre), y nada de eso se bloquea — solo se ve
        // reflejado como un remanente MENSUAL negativo (en rojo), no
        // como un tope duro por partida. Por eso aquí ya no se rechaza
        // nada; solo se guarda y se actualiza el saldo, aunque quede
        // en negativo.
        $partida = null;
        if ($datos['tipo'] === 'Egreso') {
            $partida = PartidaPresupuestal::findOrFail($datos['partida_id']);
        }

        if ($request->hasFile('comprobante')) {
            $datos['comprobante_ruta'] = $request->file('comprobante')->store('comprobantes', 'public');
        }
        unset($datos['comprobante']);
        $datos['registrado_por'] = null; // sin login todavía

        $movimiento = MovimientoFinanciero::create($datos);

        // RF-02: actualiza el saldo de la partida automáticamente (de
        // referencia; ya no bloquea nada, ver nota arriba).
        if ($partida) {
            $partida->decrement('saldo_actual', $datos['importe']);
        }

        return redirect()->route('finanzas.show', $movimiento)->with('mensaje', 'Movimiento registrado correctamente.');
    }

    // CU-03: Ver Detalle del Movimiento
    public function show(MovimientoFinanciero $movimiento)
    {
        $movimiento->load('partida');

        return Inertia::render('Finanzas/Detalle', ['movimiento' => $movimiento]);
    }

    // CU-04: Editar Movimiento
    public function update(Request $request, MovimientoFinanciero $movimiento)
    {
        $datos = $request->validate([
            'concepto' => 'required|string|max:300',
            'importe' => 'required|numeric|min:0.01',
            'fecha_movimiento' => 'required|date',
        ], $this->mensajesValidacion(), $this->nombresCampos());

        // Si el movimiento es un Egreso, se recalcula el saldo de la
        // partida: primero "devolvemos" el importe viejo, y luego
        // volvemos a descontar el nuevo. Ya no se rechaza si queda
        // negativo (ver la nota en store() de por qué se quitó ese bloqueo).
        if ($movimiento->tipo === 'Egreso' && $movimiento->partida) {
            $movimiento->partida->increment('saldo_actual', $movimiento->importe); // revierte lo viejo
            $movimiento->partida->decrement('saldo_actual', $datos['importe']); // aplica lo nuevo
        }

        $movimiento->update($datos);

        return redirect()->route('finanzas.show', $movimiento)->with('mensaje', 'Movimiento actualizado correctamente.');
    }

    // CU-05: Generar Informe Mensual y Anual
    public function generarInforme(Request $request)
    {
        $datos = $request->validate([
            'periodo' => 'required|in:mensual,anual',
            'mes' => 'required_if:periodo,mensual|nullable|integer|min:1|max:12',
            'anio' => 'required|integer|min:2020',
            'formato' => 'required|in:pdf,excel',
        ]);

        $consulta = MovimientoFinanciero::with('partida')->whereYear('fecha_movimiento', $datos['anio']);
        if ($datos['periodo'] === 'mensual') {
            $consulta->whereMonth('fecha_movimiento', $datos['mes']);
        }
        $movimientos = $consulta->get();

        $ingresoTotal = (float) $movimientos->where('tipo', 'Ingreso')->sum('importe');
        $egresoTotal = (float) $movimientos->where('tipo', 'Egreso')->sum('importe');
        $remanente = $ingresoTotal - $egresoTotal;

        $egresosPorPartida = $movimientos->where('tipo', 'Egreso')
            ->groupBy(fn ($m) => $m->partida->nombre ?? 'Sin partida')
            ->map(fn ($grupo) => $grupo->sum('importe'));

        $folio = 'INF-'.now()->format('YmdHis');
        $etiquetaPeriodo = $datos['periodo'] === 'mensual'
            ? sprintf('%02d/%d', $datos['mes'], $datos['anio'])
            : (string) $datos['anio'];

        if ($datos['formato'] === 'excel') {
            return Excel::download(
                new InformeFinancieroExport($egresosPorPartida, $ingresoTotal, $egresoTotal, $remanente, $etiquetaPeriodo),
                "informe-financiero-{$folio}.xlsx"
            );
        }

        $pdf = Pdf::loadView('pdf.informe-financiero', [
            'egresosPorPartida' => $egresosPorPartida,
            'ingresoTotal' => $ingresoTotal,
            'egresoTotal' => $egresoTotal,
            'remanente' => $remanente,
            'etiquetaPeriodo' => $etiquetaPeriodo,
            'folio' => $folio,
            'fechaGeneracion' => now(),
        ]);

        return $pdf->download("informe-financiero-{$folio}.pdf");
    }

    // CU-19: Verificar Cuota Mensual Reportada.
    //
    // Aunque "Agremiado" es del módulo de Organización, en el código
    // real no hay ninguna barrera entre módulos — es la misma
    // aplicación Laravel, así que aquí simplemente se importa y se usa
    // el modelo directamente, sin nada especial.
    //
    // RF-10 (recordatorio): el sueldo es un dato sensible que debería
    // restringirse por rol una vez que exista login. Por ahora, igual
    // que en el resto del sistema, se deja visible.
    public function verificarCuota(Request $request)
    {
        $datos = $request->validate([
            'mes' => 'nullable|integer|min:1|max:12',
            'anio' => 'nullable|integer|min:2020',
        ]);
        $mes = $datos['mes'] ?? now()->month;
        $anio = $datos['anio'] ?? now()->year;

        // Cada agremiado Activo aporta el 2% de su sueldo (RF-08 del
        // módulo de Organización). Aquí se recalcula igual, para no
        // duplicar ese 2% como una constante distinta en dos lugares.
        $agremiados = Agremiado::where('estatus', 'Activo')
            ->orderBy('nombre_completo')
            ->get(['numero_empleado', 'nombre_completo', 'sueldo_base'])
            ->map(function ($a) {
                return [
                    'numero_empleado' => $a->numero_empleado,
                    'nombre_completo' => $a->nombre_completo,
                    'sueldo_base' => (float) $a->sueldo_base,
                    'cuota_suspeg' => round((float) $a->sueldo_base * 0.02, 2),
                ];
            });

        $totalCuotas = round($agremiados->sum('cuota_suspeg'), 2);

        // El ingreso que Finanzas ya registró para ese mes (si lo hizo).
        $ingresoRegistrado = (float) MovimientoFinanciero::where('tipo', 'Ingreso')
            ->whereYear('fecha_movimiento', $anio)
            ->whereMonth('fecha_movimiento', $mes)
            ->sum('importe');

        return Inertia::render('Finanzas/VerificarCuota', [
            'agremiados' => $agremiados,
            'totalCuotas' => $totalCuotas,
            'ingresoRegistrado' => $ingresoRegistrado,
            'diferencia' => round($ingresoRegistrado - $totalCuotas, 2),
            'mes' => (int) $mes,
            'anio' => (int) $anio,
        ]);
    }

    // ============================================================
    //  CU-06 y CU-07: Inventario de Bienes Muebles
    // ============================================================

    // CU-06: Consultar Inventario de Bienes Muebles
    public function bienesIndex(Request $request)
    {
        $bienes = BienMueble::query()
            ->when($request->input('buscar'), function ($q, $buscar) {
                $q->where('concepto', 'like', "%{$buscar}%")->orWhere('clave', 'like', "%{$buscar}%");
            })
            ->orderBy('concepto')
            ->paginate(20);

        return Inertia::render('Finanzas/BienesListado', [
            'bienes' => $bienes,
            'filtros' => $request->only('buscar'),
        ]);
    }

    public function bienesCrear()
    {
        return Inertia::render('Finanzas/BienesRegistrar');
    }

    // CU-07: Registrar Bien Mueble
    public function bienesStore(Request $request)
    {
        $datos = $request->validate([
            'concepto' => 'required|string|max:150',
            'marca' => 'nullable|string|max:100',
            'modelo' => 'nullable|string|max:100',
            'clave' => 'required|string|max:20|unique:bienes_muebles,clave',
            'estatus' => 'required|in:Activo,En reparación,Dado de baja',
            'responsable' => 'nullable|string|max:150',
        ], $this->mensajesValidacion(), $this->nombresCampos());

        $datos['registrado_por'] = null;

        BienMueble::create($datos);

        return redirect()->route('finanzas.bienes.index')->with('mensaje', 'Bien mueble registrado correctamente.');
    }
}
