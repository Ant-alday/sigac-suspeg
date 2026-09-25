<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistorialMovimiento extends Model
{
    // La tabla real se llama "historial_movimientos" — coincide con lo
    // que Laravel adivinaría, pero lo dejamos explícito para no
    // depender de la adivinanza (ver el problema que tuvimos antes
    // con HistorialEstatus, DocumentoAgremiado y CredencialSuspeg).
    protected $table = 'historial_movimientos';

    public $timestamps = false; // usamos fecha_movimiento en vez de created_at/updated_at

    protected $fillable = [
        'agremiado_id',
        'tipo_movimiento',
        'descripcion',
        'estatus_anterior',
        'estatus_nuevo',
        'realizado_por',
    ];

    protected $casts = [
        'fecha_movimiento' => 'datetime',
    ];

    // Ponemos la fecha nosotros mismos con now() (hora de México),
    // en vez de dejar que la ponga el reloj de MySQL.
    protected static function booted(): void
    {
        static::creating(function (HistorialMovimiento $movimiento) {
            $movimiento->fecha_movimiento = now();
        });
    }

    public function agremiado(): BelongsTo
    {
        return $this->belongsTo(Agremiado::class);
    }
}
