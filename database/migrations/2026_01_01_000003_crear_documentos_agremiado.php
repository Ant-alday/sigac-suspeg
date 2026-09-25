<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Guarda los 6 documentos digitales del expediente de afiliación
// (nómina, INE, solicitud, carta de aceptación, protesta, consentimiento de cuota).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documentos_agremiado', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agremiado_id')->constrained('agremiados')->cascadeOnDelete();

            $table->enum('tipo_documento', [
                'nomina',
                'ine',
                'solicitud_afiliacion',
                'carta_aceptacion',
                'toma_protesta',
                'consentimiento_cuota',
            ]);

            $table->string('nombre_original', 255); // nombre del archivo que subió el usuario
            $table->string('ruta_archivo', 255);     // dónde quedó guardado en el servidor
            $table->timestamp('fecha_carga')->useCurrent();

            $table->unique(['agremiado_id', 'tipo_documento']); // un archivo por tipo, por agremiado
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documentos_agremiado');
    }
};
