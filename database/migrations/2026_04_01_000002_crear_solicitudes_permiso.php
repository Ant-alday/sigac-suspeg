<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Días económicos (9 al año, 3 cada 2 meses) y licencias sin goce de
// sueldo. Se unieron en una sola tabla con un campo "tipo_permiso"
// porque comparten exactamente los mismos datos (quién, cuándo, por
// qué) — la diferencia está solo en la validación de límite, que se
// hace en el controlador según el tipo.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solicitudes_permiso', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agremiado_id')->constrained('agremiados');
            $table->enum('tipo_permiso', ['Día Económico', 'Licencia sin Goce de Sueldo']);
            $table->date('fecha_inicio');
            // Nula para un día económico de un solo día; con valor
            // para una licencia sin goce de sueldo con rango de fechas.
            $table->date('fecha_fin')->nullable();
            $table->unsignedTinyInteger('dias_solicitados')->default(1);
            $table->string('motivo', 300)->nullable();
            $table->enum('estatus', ['Solicitado', 'Autorizado', 'Rechazado'])->default('Autorizado');
            $table->string('registrado_por', 100)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitudes_permiso');
    }
};
