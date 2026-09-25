<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Padrón de beneficiarios del programa.
//
// IMPORTANTE — agregado a petición: un beneficiario puede venir
// directamente del padrón de agremiados (botón "Registrar beneficio"
// desde Organización, que autocompleta este registro con sus datos).
// agremiado_id es NULABLE a propósito: en la práctica la mayoría son
// agremiados, pero el programa también puede atender a alguien que no
// lo sea, tal como reflejan los formatos reales (no piden número de
// empleado).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('beneficiarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agremiado_id')->nullable()->constrained('agremiados')->nullOnDelete();
            $table->string('nombre', 150);
            $table->string('domicilio', 200)->nullable();
            $table->string('comunidad_colonia', 100)->nullable();
            $table->string('municipio', 100)->nullable();
            $table->string('curp', 18)->nullable()->unique();
            $table->string('celular', 15)->nullable();
            $table->unsignedTinyInteger('edad')->nullable();
            $table->enum('sexo', ['F', 'M'])->nullable();
            $table->string('codigo_postal', 10)->nullable();
            $table->string('registrado_por', 100)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('beneficiarios');
    }
};
