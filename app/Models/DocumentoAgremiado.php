<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentoAgremiado extends Model
{
    // Mismo caso: Laravel adivinaría "documento_agremiados", pero la
    // tabla real se llama "documentos_agremiado".
    protected $table = 'documentos_agremiado';

    public $timestamps = false;

    protected $fillable = [
        'agremiado_id',
        'tipo_documento',
        'nombre_original',
        'ruta_archivo',
    ];

    protected $casts = [
        'fecha_carga' => 'datetime',
    ];

    // Igual que en HistorialEstatus: ponemos la fecha con now() (hora
    // de México) en vez de dejar que la ponga el reloj de MySQL.
    protected static function booted(): void
    {
        static::creating(function (DocumentoAgremiado $documento) {
            $documento->fecha_carga = now();
        });
    }

    public function agremiado(): BelongsTo
    {
        return $this->belongsTo(Agremiado::class);
    }

    public static function tiposRequeridos(): array
    {
        return [
            'nomina' => 'Recibo de nómina',
            'ine' => 'Identificación oficial (INE)',
            'solicitud_afiliacion' => 'Solicitud de afiliación',
            'carta_aceptacion' => 'Carta de aceptación',
            'toma_protesta' => 'Toma de protesta',
            'consentimiento_cuota' => 'Consentimiento de cuota',
        ];
    }
}
