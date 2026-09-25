<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CasoLaboral extends Model
{
    // Mismo caso que otros modelos del proyecto: Laravel adivinaría
    // "caso_laborals"; se deja explícito.
    protected $table = 'casos_laborales';

    protected $fillable = [
        'agremiado_id', 'escolaridad', 'tipo_caso', 'descripcion', 'fecha_registro',
        'estatus', 'fecha_resolucion', 'resultado', 'registrado_por',
    ];

    protected $casts = ['fecha_registro' => 'date', 'fecha_resolucion' => 'date'];

    public function agremiado(): BelongsTo
    {
        return $this->belongsTo(Agremiado::class, 'agremiado_id');
    }

    public function seguimientos(): HasMany
    {
        return $this->hasMany(SeguimientoCaso::class, 'caso_id')->orderBy('fecha');
    }
}
