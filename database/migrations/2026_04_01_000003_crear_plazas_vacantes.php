<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Plaza que queda libre cuando un agremiado se jubila, hasta que se
// asigna por escalafón (antigüedad). Dos referencias a agremiados
// porque son dos personas distintas en dos momentos distintos: quien
// deja la plaza y quien la recibe.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plazas_vacantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agremiado_jubilado_id')->constrained('agremiados');
            $table->string('no_plaza', 20);
            $table->string('dependencia', 150)->nullable();
            $table->enum('tipo_plaza', ['Base', 'Confianza', 'Eventual', 'Supernumeraria']);
            $table->date('fecha_vacante');
            $table->foreignId('asignado_a_id')->nullable()->constrained('agremiados');
            $table->date('fecha_asignacion')->nullable();
            $table->enum('estatus', ['Vacante', 'Asignada'])->default('Vacante');
            $table->string('registrado_por', 100)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plazas_vacantes');
    }
};
