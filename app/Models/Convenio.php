<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Convenio extends Model
{
    protected $fillable = ['nombre', 'institucion', 'documento_ruta'];

    public function solicitudes(): HasMany
    {
        return $this->hasMany(SolicitudConvenio::class, 'convenio_id');
    }
}
