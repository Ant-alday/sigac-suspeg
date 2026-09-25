<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BienMueble extends Model
{
    // Mismo caso que PartidaPresupuestal: Laravel adivinaría
    // "bien_muebles" en vez de "bienes_muebles". Se deja explícito.
    protected $table = 'bienes_muebles';

    protected $fillable = [
        'concepto',
        'marca',
        'modelo',
        'clave',
        'estatus',
        'responsable',
        'registrado_por',
    ];
}
