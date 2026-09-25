<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Bitácora general de TODO lo que le pasa a un agremiado a lo largo del
// tiempo: registro, cambios de estatus, ediciones, documentos de
// afiliación subidos/eliminados, y todo el trámite de su credencial
// SUSPEG (inicio, cada documento adjuntado, envío al Tribunal, entrega).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('historial_movimientos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agremiado_id')->constrained('agremiados')->cascadeOnDelete();

            $table->enum('tipo_movimiento', [
                'Registro',
                'Cambio de estatus',
                'Edición de datos',
                'Documento de afiliación',
                'Trámite de credencial',
            ]);

            // Texto que explica qué pasó, ej: "Se registró al agremiado"
            // o "Se actualizó: teléfono, correo".
            $table->string('descripcion', 500);

            // Estos dos solo se usan cuando tipo_movimiento = "Cambio de estatus".
            $table->string('estatus_anterior', 20)->nullable();
            $table->string('estatus_nuevo', 20)->nullable();

            // Sin sistema de usuarios todavía, guardamos el nombre como texto.
            $table->string('realizado_por', 100)->nullable();

            $table->timestamp('fecha_movimiento'); // la ponemos nosotros con now(), hora de México
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historial_movimientos');
    }
};
