<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SolicitudConvenio extends Model
{
    protected $table = 'solicitudes_convenio';

    protected $fillable = [
        'convenio_id', 'beneficiario_id', 'nombre_familiar', 'parentesco', 'edad_familiar',
        'curp_familiar', 'beneficio_solicitado', 'fecha_solicitud', 'estatus', 'registrado_por',
    ];

    protected $casts = ['fecha_solicitud' => 'date'];

    public function convenio(): BelongsTo
    {
        return $this->belongsTo(Convenio::class, 'convenio_id');
    }

    public function beneficiario(): BelongsTo
    {
        return $this->belongsTo(Beneficiario::class, 'beneficiario_id');
    }
}
