<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Expediente de un conflicto laboral (despido injustificado, conflicto
// individual/colectivo, demanda). Se separa en 2 tablas porque un
// mismo caso puede tener varios seguimientos a lo largo del tiempo.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('casos_laborales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agremiado_id')->constrained('agremiados');
            // Único dato realmente NUEVO respecto al expediente del
            // agremiado (nombre, dependencia, edad, estado civil e
            // hijos ya existen allá y se consultan por la relación).
            $table->string('escolaridad', 100)->nullable();
            $table->enum('tipo_caso', [
                'Despido Injustificado', 'Conflicto Individual', 'Conflicto Colectivo',
                'Demanda por Despido', 'Otro',
            ]);
            $table->string('descripcion', 500);
            $table->date('fecha_registro');
            $table->enum('estatus', ['En trámite', 'En seguimiento', 'Turnado a Jurídico', 'Resuelto'])->default('En trámite');
            $table->date('fecha_resolucion')->nullable();
            $table->string('resultado', 300)->nullable();
            $table->string('registrado_por', 100)->nullable();
            $table->timestamps();
        });

        Schema::create('seguimientos_caso', function (Blueprint $table) {
            $table->id();
            $table->foreignId('caso_id')->constrained('casos_laborales')->cascadeOnDelete();
            $table->date('fecha');
            $table->string('nota', 400);
            $table->string('registrado_por', 100)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seguimientos_caso');
        Schema::dropIfExists('casos_laborales');
    }
};
