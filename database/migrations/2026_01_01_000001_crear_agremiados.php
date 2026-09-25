<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Esta migración crea la tabla "agremiados", que es el padrón principal.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agremiados', function (Blueprint $table) {
            $table->id();

            // --- Identificación ---
            $table->string('no_padron', 30)->unique();
            $table->string('numero_empleado', 20)->unique();
            $table->string('nombre_completo', 150);
            $table->string('curp', 18)->unique();
            $table->string('rfc', 13)->unique();

            // --- Datos laborales ---
            $table->date('fecha_ingreso');
            $table->string('categoria', 100);

            // Ya NO se guarda secretaria_organismo_id aquí. Con solo
            // dependencia_id basta: cada dependencia ya sabe a qué
            // secretaría/organismo pertenece (ver crear_dependencias).
            // Repetir el dato aquí habría sido redundante y con riesgo
            // de quedar inconsistente si la dependencia cambiara de
            // secretaría más adelante.
            $table->foreignId('dependencia_id')->constrained('dependencias');

            // --- Domicilio y contacto ---
            $table->string('domicilio', 250);
            $table->string('ciudad_localidad_municipio', 150);
            $table->string('telefono', 10);
            $table->string('correo', 150);

            // --- Datos familiares ---
            // Estos 5 campos ya NO son obligatorios: no siempre se
            // conocen o aplican al momento del registro.
            $table->enum('estado_civil', ['Soltero(a)', 'Casado(a)', 'Divorciado(a)', 'Viudo(a)', 'Union Libre'])->nullable();
            $table->boolean('es_papa')->nullable();
            $table->boolean('es_mama')->nullable();
            $table->unsignedSmallInteger('num_ninos')->nullable();
            $table->unsignedSmallInteger('num_ninas')->nullable();

            // --- Datos económicos ---
            $table->decimal('sueldo_base', 10, 2);

            // --- Estatus de afiliación ---
            $table->enum('estatus', ['En proceso', 'Activo', 'Baja', 'Base'])->default('En proceso');
            $table->date('fecha_afiliacion');

            $table->string('registrado_por', 100)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agremiados');
    }
};
