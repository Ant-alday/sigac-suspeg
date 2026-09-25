<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeguimientoCaso extends Model
{
    protected $table = 'seguimientos_caso';

    protected $fillable = ['caso_id', 'fecha', 'nota', 'registrado_por'];

    protected $casts = ['fecha' => 'date'];

    public function caso(): BelongsTo
    {
        return $this->belongsTo(CasoLaboral::class, 'caso_id');
    }
}
