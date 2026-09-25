SIGAC-SUSPEG

Sistema Integral de Gestión Administrativa y Control para el Sindicato Único de Servidores Públicos del Estado de Guerrero (SUSPEG), Sección 75.

Módulos
🗂️ Organización — padrón de agremiados, afiliación, credenciales SUSPEG.
💰 Finanzas — ingresos y egresos por partida, informes mensuales/anuales.
🏠 Fomento Habitacional — insumos subsidiados y convenios de descuento.
⚖️ Trabajos y Conflictos — casos laborales, permisos y plazas vacantes.
Stack técnico

Laravel 12 · React 18 + Inertia.js · Tailwind CSS v4 · MySQL

Instalación local
bash
git clone https://github.com/Ant-alday/sigac-suspeg.git
cd sigac-suspeg

composer install
npm install

copy .env.example .env
php artisan key:generate

# Configura DB_DATABASE, DB_USERNAME y DB_PASSWORD en .env

php artisan migrate
php artisan db:seed --class=PartidasPresupuestalesSeeder
php artisan db:seed --class=InsumosSeeder
php artisan storage:link

npm run dev
php artisan serve

Abre http://localhost:8000.
