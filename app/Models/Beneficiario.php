<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Beneficiario extends Model
{
    protected $fillable = [
        'agremiado_id', 'nombre', 'domicilio', 'comunidad_colonia', 'municipio',
        'curp', 'celular', 'edad', 'sexo', 'codigo_postal', 'registrado_por',
    ];

    // Nulo si el beneficiario no es (o no se ligó con) un agremiado.
    public function agremiado(): BelongsTo
    {
        return $this->belongsTo(Agremiado::class, 'agremiado_id');
    }

    public function solicitudesInsumo(): HasMany
    {
        return $this->hasMany(SolicitudInsumo::class, 'beneficiario_id');
    }

    public function solicitudesConvenio(): HasMany
    {
        return $this->hasMany(SolicitudConvenio::class, 'beneficiario_id');
    }
}
