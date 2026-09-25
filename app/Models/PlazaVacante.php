<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlazaVacante extends Model
{
    protected $table = 'plazas_vacantes';

    protected $fillable = [
        'agremiado_jubilado_id', 'no_plaza', 'dependencia', 'tipo_plaza',
        'fecha_vacante', 'asignado_a_id', 'fecha_asignacion', 'estatus', 'registrado_por',
    ];

    protected $casts = ['fecha_vacante' => 'date', 'fecha_asignacion' => 'date'];

    public function agremiadoJubilado(): BelongsTo
    {
        return $this->belongsTo(Agremiado::class, 'agremiado_jubilado_id');
    }

    public function asignadoA(): BelongsTo
    {
        return $this->belongsTo(Agremiado::class, 'asignado_a_id');
    }
}
