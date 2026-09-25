<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Agremiado extends Model
{
    // Sin esto, el "accessor" getSecretariaOrganismoAttribute() de abajo
    // no aparecería en los datos que le llegan a React — Laravel no lo
    // incluye en el JSON a menos que se declare aquí explícitamente.
    protected $appends = ['secretaria_organismo'];

    protected $fillable = [
        'numero_empleado',
        'nombre_completo',
        'curp',
        'rfc',
        'fecha_ingreso',
        'categoria',
        'dependencia_id', // ya NO existe secretaria_organismo_id aquí:
                          // se obtiene a través de dependencia->secretariaOrganismo
        'domicilio',
        'ciudad_localidad_municipio',
        'telefono',
        'correo',
        'estado_civil',
        'es_papa',
        'es_mama',
        'num_ninos',
        'num_ninas',
        'sueldo_base',
        'estatus',
        'fecha_afiliacion',
        'registrado_por',
    ];

    protected $casts = [
        'fecha_ingreso' => 'date',
        'fecha_afiliacion' => 'date',
        'es_papa' => 'boolean',
        'es_mama' => 'boolean',
        'sueldo_base' => 'decimal:2',
    ];

    // --- Relaciones ---

    public function dependencia(): BelongsTo
    {
        return $this->belongsTo(Dependencia::class);
    }

    public function historialMovimientos(): HasMany
    {
        return $this->hasMany(HistorialMovimiento::class)->latest('fecha_movimiento');
    }

    public function documentos(): HasMany
    {
        return $this->hasMany(DocumentoAgremiado::class);
    }

    public function credenciales(): HasMany
    {
        return $this->hasMany(CredencialSuspeg::class);
    }

    // Antes existía una relación directa "secretariaOrganismo()". Ya no
    // hace falta guardarla aparte: se obtiene siempre a través de la
    // dependencia (dependencia -> secretariaOrganismo). Este pequeño
    // "accessor" es solo para que sea más cómodo escribir
    // $agremiado->secretaria_organismo en vez de
    // $agremiado->dependencia->secretariaOrganismo en cada pantalla.
    public function getSecretariaOrganismoAttribute()
    {
        return $this->dependencia?->secretariaOrganismo;
    }

    public function getCuotaSuspegAttribute(): float
    {
        return round((float) $this->sueldo_base * 0.02, 2);
    }

    public function puedeTramitarCredencial(): bool
    {
        return $this->estatus === 'Activo';
    }
}
