<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Guarda el trámite de credencial SUSPEG: los 5 documentos que se envían
// al H. Tribunal de Conciliación y Arbitraje, y el seguimiento hasta la entrega.
// Recuerda: la Sección NO imprime la credencial, solo la tramita y la entrega.
// Y como NO hay comunicación real con el Tribunal, el expediente se queda
// "En captura" hasta que la propia Secretaría de Organización confirme que
// ya adjuntó los 5 documentos y lo envía manualmente.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credenciales_suspeg', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agremiado_id')->constrained('agremiados')->cascadeOnDelete();

            $table->string('folio', 20)->unique(); // ej: CRED-2026-000048
            $table->date('fecha_solicitud'); // cuándo se inició el trámite

            // Rutas de los 5 documentos requeridos
            $table->string('recibo_ruta', 255)->nullable();
            $table->string('ficha_ruta', 255)->nullable();
            $table->string('ine_ruta', 255)->nullable();
            $table->string('firma_digital_ruta', 255)->nullable();
            $table->string('foto_ruta', 255)->nullable();

            // "En captura": se están subiendo los documentos, todavía no se envía.
            // "Enviado al Tribunal": ya se adjuntaron los 5 y se oprimió el botón.
            // "Entregada": la credencial física ya llegó y se le entregó al agremiado.
            $table->enum('estatus', ['En captura', 'Enviado al Tribunal', 'Entregada'])
                ->default('En captura');

            $table->date('fecha_envio_tribunal')->nullable(); // cuándo se oprimió "Enviar al Tribunal"
            $table->date('fecha_entrega')->nullable();
            $table->string('registrado_por', 100)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credenciales_suspeg');
    }
};
