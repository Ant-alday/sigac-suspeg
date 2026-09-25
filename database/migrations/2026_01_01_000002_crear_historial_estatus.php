<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Cada vez que cambia el estatus de un agremiado (Activo, Baja, etc.),
// se guarda un registro aquí. Así queda un historial completo, en vez de
// solo ver el estatus actual sin saber cuándo ni por qué cambió.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('historial_estatus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agremiado_id')->constrained('agremiados')->cascadeOnDelete();
            $table->string('estatus_anterior', 20)->nullable(); // vacío si es el primer registro
            $table->string('estatus_nuevo', 20);
            $table->string('motivo', 250)->nullable();
            // De nuevo: sin sistema de usuarios todavía, guardamos el nombre como texto.
            $table->string('cambiado_por', 100)->nullable();
            $table->timestamp('fecha_cambio')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historial_estatus');
    }
};
