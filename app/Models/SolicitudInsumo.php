<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SolicitudInsumo extends Model
{
    // Laravel adivinaría "solicitud_insumos"; se deja explícito, mismo
    // caso que ya nos había pasado con otros modelos del proyecto.
    protected $table = 'solicitudes_insumo';

    protected $fillable = [
        'beneficiario_id', 'fecha_solicitud', 'fecha_entrega', 'es_para_familiar', 'nombre_familiar',
        'parentesco', 'tipo_pago', 'observaciones', 'registrado_por',
    ];

    protected $casts = ['fecha_solicitud' => 'date', 'fecha_entrega' => 'date', 'es_para_familiar' => 'boolean'];

    public function beneficiario(): BelongsTo
    {
        return $this->belongsTo(Beneficiario::class, 'beneficiario_id');
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleSolicitudInsumo::class, 'solicitud_id');
    }
}
