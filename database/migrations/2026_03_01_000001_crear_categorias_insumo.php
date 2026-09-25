<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Catálogo de CATEGORÍAS de insumo (cada una es una "tarjeta" en
// pantalla: Calentador Solar, Tinaco, Leche, etc.). Se separó de
// "insumos" a petición explícita: el usuario debe poder crear una
// categoría nueva libremente desde la pantalla (una tarjeta nueva),
// no elegir de una lista fija — por eso ya NO es un ENUM.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categorias_insumo', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100)->unique(); // ej. "Calentador Solar"
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categorias_insumo');
    }
};
