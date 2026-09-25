<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Inventario del mobiliario y equipo propiedad de la Sección.
//
// Corregido contra el Excel real de bienes muebles: al catálogo le
// faltaba el campo "estatus" (Activo / En reparación / Dado de baja,
// que sí aparece en la columna "Estado" del inventario real), y
// "responsable" en la práctica casi nunca se llena todavía — por eso
// aquí queda opcional (nullable) en vez de obligatorio.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bienes_muebles', function (Blueprint $table) {
            $table->id();
            $table->string('concepto', 150); // ej. "Ventilador", "Impresora"
            $table->string('marca', 100)->nullable();
            $table->string('modelo', 100)->nullable();

            // Clave de control real, ej. "20000201". Se guarda como texto
            // (no número) para no perder ceros a la izquierda.
            $table->string('clave', 20)->unique();

            $table->enum('estatus', ['Activo', 'En reparación', 'Dado de baja'])->default('Activo');

            // Nullable a propósito: en el inventario real, la mayoría de
            // los bienes todavía no tienen un responsable asignado.
            $table->string('responsable', 150)->nullable();

            $table->string('registrado_por', 100)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bienes_muebles');
    }
};
