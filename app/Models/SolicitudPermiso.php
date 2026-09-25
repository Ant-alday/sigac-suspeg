<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SolicitudPermiso extends Model
{
    protected $table = 'solicitudes_permiso';

    protected $fillable = [
        'agremiado_id', 'tipo_permiso', 'fecha_inicio', 'fecha_fin',
        'dias_solicitados', 'motivo', 'estatus', 'registrado_por',
    ];

    protected $casts = ['fecha_inicio' => 'date', 'fecha_fin' => 'date'];

    public function agremiado(): BelongsTo
    {
        return $this->belongsTo(Agremiado::class, 'agremiado_id');
    }
}
