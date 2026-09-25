<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Cada ingreso o egreso de dinero de la Sección.
//
// IMPORTANTE — esto lo corregimos al revisar el informe financiero real:
// en la práctica, el INGRESO es una sola "cuota mensual" que no se
// reparte entre partidas (ej. "Ingreso (cuota): $102,100.39"). Solo los
// EGRESOS se clasifican en una de las 9 partidas. Por eso partida_id es
// opcional (nullable): obligatorio para Egreso, vacío para Ingreso.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('movimientos_financieros', function (Blueprint $table) {
            $table->id();
            $table->enum('tipo', ['Ingreso', 'Egreso']);

            // Nulo cuando tipo = Ingreso (la cuota mensual no es de
            // ninguna partida en particular). Obligatorio cuando es Egreso.
            $table->foreignId('partida_id')->nullable()->constrained('partidas_presupuestales');

            $table->string('concepto', 300);
            $table->decimal('importe', 12, 2);

            // Solo obligatorio para egresos (ver validación en el controlador).
            $table->string('comprobante_ruta', 255)->nullable();

            $table->date('fecha_movimiento');
            $table->string('registrado_por', 100)->nullable(); // sin login todavía

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimientos_financieros');
    }
};
