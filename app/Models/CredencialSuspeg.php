<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CredencialSuspeg extends Model
{
    protected $table = 'credenciales_suspeg';

    protected $fillable = [
        'agremiado_id',
        'folio',
        'fecha_solicitud',
        'recibo_ruta',
        'ficha_ruta',
        'ine_ruta',
        'firma_digital_ruta',
        'foto_ruta',
        'estatus',
        'fecha_envio_tribunal',
        'fecha_entrega',
        'registrado_por',
    ];

    protected $casts = [
        'fecha_solicitud' => 'date',
        'fecha_envio_tribunal' => 'date',
        'fecha_entrega' => 'date',
    ];

    public function agremiado(): BelongsTo
    {
        return $this->belongsTo(Agremiado::class);
    }

    // CU-09, FA_002: el botón "Enviar expediente al Tribunal" solo se
    // habilita cuando los 5 documentos ya están adjuntados.
    public function documentosCompletos(): bool
    {
        return $this->recibo_ruta
            && $this->ficha_ruta
            && $this->ine_ruta
            && $this->firma_digital_ruta
            && $this->foto_ruta;
    }
}
