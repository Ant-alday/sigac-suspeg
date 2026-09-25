<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Convenios de descuento con instituciones externas (ej. CIEX — Centro
// de Idiomas Extranjeros), donde el beneficio es para un FAMILIAR del
// agremiado, no para él directamente, y se tramita vía descuento de
// nómina en vez de con un insumo físico. Por eso es un modelo aparte
// de solicitudes_insumo.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('convenios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150); // ej. "Centro de Idiomas Extranjeros (CIEX)"
            $table->string('institucion', 150)->nullable();
            // El documento firmado del convenio con la empresa/institución
            // (PDF o imagen), para poder consultarlo y descargarlo después.
            $table->string('documento_ruta', 255)->nullable();
            $table->timestamps();
        });

        Schema::create('solicitudes_convenio', function (Blueprint $table) {
            $table->id();
            $table->foreignId('convenio_id')->constrained('convenios');
            $table->foreignId('beneficiario_id')->constrained('beneficiarios'); // el trabajador
            $table->string('nombre_familiar', 150);
            $table->string('parentesco', 50);
            // Datos propios del hijo/hija (o el familiar de que se trate),
            // más allá de solo su nombre — a petición explícita.
            $table->unsignedTinyInteger('edad_familiar')->nullable();
            $table->string('curp_familiar', 18)->nullable();
            $table->string('beneficio_solicitado', 200); // ej. "Inglés básico 2"
            $table->date('fecha_solicitud');
            $table->enum('estatus', ['Enviada', 'Autorizada', 'Rechazada'])->default('Enviada');
            $table->string('registrado_por', 100)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitudes_convenio');
        Schema::dropIfExists('convenios');
    }
};
