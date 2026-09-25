<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

// Cada categoría es una "tarjeta" en la pantalla del catálogo (CU-24).
// Se separó de "insumos" para que el usuario pueda crear una categoría
// nueva libremente desde la pantalla, en vez de elegir de una lista fija.
class CategoriaInsumo extends Model
{
    protected $table = 'categorias_insumo';

    protected $fillable = ['nombre'];

    public function insumos(): HasMany
    {
        return $this->hasMany(Insumo::class, 'categoria_id');
    }
}
