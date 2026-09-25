<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SecretariaOrganismo extends Model
{
    protected $table = 'secretarias_organismos';

    protected $fillable = ['nombre'];

    // Una Secretaría/Organismo puede tener varias dependencias
    // (áreas de adscripción) debajo de ella.
    public function dependencias(): HasMany
    {
        return $this->hasMany(Dependencia::class);
    }
}
