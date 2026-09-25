<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PartidaPresupuestal extends Model
{
    // Laravel adivinaría "partida_presupuestals" (mala pluralización de
    // un nombre compuesto en español) — el mismo tipo de error que ya
    // nos había pasado antes con otros modelos. Se deja explícito.
    protected $table = 'partidas_presupuestales';

    protected $fillable = ['nombre', 'monto_asignado', 'saldo_actual'];

    protected $casts = [
        'monto_asignado' => 'decimal:2',
        'saldo_actual' => 'decimal:2',
    ];

    public function movimientos(): HasMany
    {
        return $this->hasMany(MovimientoFinanciero::class, 'partida_id');
    }

    // RF-03: revisa si la partida tiene fondos suficientes para un
    // egreso antes de dejarlo registrar.
    public function tieneSaldoPara(float $importe): bool
    {
        return (float) $this->saldo_actual >= $importe;
    }
}
