<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Dependencia extends Model
{
    protected $fillable = ['nombre', 'secretaria_organismo_id'];

    // Cada dependencia pertenece a una sola Secretaría/Organismo
    // (ej. "Delegación Administrativa" pertenece a "Secretaría de
    // Finanzas y Administración").
    public function secretariaOrganismo(): BelongsTo
    {
        return $this->belongsTo(SecretariaOrganismo::class);
    }

    public function agremiados(): HasMany
    {
        return $this->hasMany(Agremiado::class);
    }
}
