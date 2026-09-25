<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovimientoFinanciero extends Model
{
    // Laravel adivinaría "movimiento_financieros" (un error de
    // pluralización parecido al que ya nos pasó en Organización), así
    // que lo dejamos explícito.
    protected $table = 'movimientos_financieros';

    protected $fillable = [
        'tipo',
        'partida_id',
        'concepto',
        'importe',
        'comprobante_ruta',
        'fecha_movimiento',
        'registrado_por',
    ];

    protected $casts = [
        'importe' => 'decimal:2',
        'fecha_movimiento' => 'date',
    ];

    public function partida(): BelongsTo
    {
        return $this->belongsTo(PartidaPresupuestal::class, 'partida_id');
    }

    public function esIngreso(): bool
    {
        return $this->tipo === 'Ingreso';
    }
}
