<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Catálogo de dependencias (áreas de adscripción). IMPORTANTE: una
// dependencia siempre pertenece a una Secretaría u Organismo — no es
// independiente. Ejemplo real: la dependencia "Delegación Administrativa"
// pertenece a la Secretaría de Finanzas y Administración.
//
// Por eso esta tabla tiene secretaria_organismo_id: cada dependencia
// queda ligada a su secretaría desde que se registra en el catálogo.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dependencias', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150);
            $table->foreignId('secretaria_organismo_id')->constrained('secretarias_organismos');
            $table->timestamps();

            // El mismo nombre de dependencia puede repetirse en teoría bajo
            // secretarías distintas, pero no dos veces bajo la misma.
            $table->unique(['nombre', 'secretaria_organismo_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dependencias');
    }
};
