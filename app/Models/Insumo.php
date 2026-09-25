<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Insumo extends Model
{
    protected $fillable = ['nombre', 'categoria_id', 'precio_actual', 'unidad_medida'];

    protected $casts = ['precio_actual' => 'decimal:2'];

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaInsumo::class, 'categoria_id');
    }

    public function detalleSolicitudes(): HasMany
    {
        return $this->hasMany(DetalleSolicitudInsumo::class, 'insumo_id');
    }
}
