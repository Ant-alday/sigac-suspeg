<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleSolicitudInsumo extends Model
{
    protected $table = 'detalle_solicitud_insumo';

    protected $fillable = ['solicitud_id', 'insumo_id', 'cantidad', 'precio_unitario'];

    protected $casts = ['precio_unitario' => 'decimal:2'];

    public function solicitud(): BelongsTo
    {
        return $this->belongsTo(SolicitudInsumo::class, 'solicitud_id');
    }

    public function insumo(): BelongsTo
    {
        return $this->belongsTo(Insumo::class, 'insumo_id');
    }
}
