<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Catálogo de insumos del programa "Corresponsabilidad Social para
// Superar la Pobreza". Corregido: la categoría ahora es una relación
// con categorias_insumo (cada categoría es una tarjeta en pantalla),
// para que el usuario pueda crear categorías nuevas libremente en vez
// de elegir de una lista fija.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('insumos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 120); // ej. "Calentador Solar 120L / 10 Tubos"
            $table->foreignId('categoria_id')->constrained('categorias_insumo');
            $table->decimal('precio_actual', 10, 2);
            $table->string('unidad_medida', 30)->default('Pieza'); // Pieza, Caja, Costal, etc.
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('insumos');
    }
};
