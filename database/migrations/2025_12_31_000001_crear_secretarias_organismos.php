<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Mismo caso que dependencias: catálogo de secretarías u organismos,
// para que se elijan de una lista en vez de escribirse libremente.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('secretarias_organismos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150)->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('secretarias_organismos');
    }
};
