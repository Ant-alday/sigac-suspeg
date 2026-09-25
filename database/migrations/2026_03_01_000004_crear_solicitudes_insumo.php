<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Una solicitud puede incluir varios insumos a la vez (ej. tinaco +
// cemento + mortero juntos). Por eso son 2 tablas: la solicitud en sí,
// y su detalle.
//
// IMPORTANTE — agregado a petición: la solicitud puede ser para un
// FAMILIAR del beneficiario en vez de para él mismo (checkbox
// "Es para un familiar" en el formulario). Si se marca, se piden el
// nombre y el parentesco; si no, ambos quedan nulos.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solicitudes_insumo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('beneficiario_id')->constrained('beneficiarios');
            $table->date('fecha_solicitud');
            // Nula hasta que el insumo realmente se entrega — no son el
            // mismo momento: puede pasar tiempo entre que se solicita
            // (y se aparta) y que llega y se entrega físicamente.
            $table->date('fecha_entrega')->nullable();

            $table->boolean('es_para_familiar')->default(false);
            $table->string('nombre_familiar', 150)->nullable();
            $table->string('parentesco', 50)->nullable();

            // Con qué se pagó/cubrió el beneficio (a petición explícita).
            $table->enum('tipo_pago', ['Efectivo', 'Transferencia'])->default('Efectivo');

            // Ej. "Nuevo ingreso" / "Ya está registrada", tal como en el Excel real.
            $table->string('observaciones', 300)->nullable();
            $table->string('registrado_por', 100)->nullable();
            $table->timestamps();
        });

        Schema::create('detalle_solicitud_insumo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('solicitud_id')->constrained('solicitudes_insumo')->cascadeOnDelete();
            $table->foreignId('insumo_id')->constrained('insumos');
            $table->unsignedInteger('cantidad')->default(1);
            // Se guarda el precio AL MOMENTO de la solicitud, para que si
            // el precio del insumo cambia después, el histórico no se altere.
            $table->decimal('precio_unitario', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_solicitud_insumo');
        Schema::dropIfExists('solicitudes_insumo');
    }
};
