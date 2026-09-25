<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistorialEstatus extends Model
{
    // Laravel adivina el nombre de la tabla pluralizando el nombre del
    // modelo en inglés ("HistorialEstatus" -> "historial_estatuses"),
    // pero nuestra tabla se llama "historial_estatus" (en español, sin
    // esa "es" al final). Por eso hay que decírselo explícitamente aquí.
    protected $table = 'historial_estatus';

    public $timestamps = false; // usamos fecha_cambio en vez de created_at/updated_at

    protected $fillable = [
        'agremiado_id',
        'estatus_anterior',
        'estatus_nuevo',
        'motivo',
        'cambiado_por',
    ];

    protected $casts = [
        'fecha_cambio' => 'datetime',
    ];

    // Ponemos la fecha nosotros mismos con now() (hora de México, según
    // config/app.php) en vez de dejar que MySQL la ponga con su propio
    // reloj, que podría estar en otra zona horaria (ej. UTC).
    protected static function booted(): void
    {
        static::creating(function (HistorialEstatus $historial) {
            $historial->fecha_cambio = now();
        });
    }

    public function agremiado(): BelongsTo
    {
        return $this->belongsTo(Agremiado::class);
    }
}
