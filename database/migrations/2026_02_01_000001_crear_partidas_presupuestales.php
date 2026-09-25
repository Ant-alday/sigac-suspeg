<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Catálogo de las 9 partidas presupuestales OFICIALES de la Sección
// (tomadas del informe financiero real que usa la Secretaría). No se
// crean partidas nuevas libremente desde el sistema — las 9 se cargan
// una sola vez con un seeder (ver database/seeders/PartidasPresupuestalesSeeder.php).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partidas_presupuestales', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 120)->unique();

            // Cuánto dinero tiene asignado la partida (el presupuesto
            // fijo mensual, según el informe real) y cuánto le queda
            // disponible en este momento.
            $table->decimal('monto_asignado', 12, 2);
            $table->decimal('saldo_actual', 12, 2);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partidas_presupuestales');
    }
};
