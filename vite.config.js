import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react'; // <-- 1. Importa el plugin de React

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'], // Si usas JSX, te recomiendo renombrar app.js a app.jsx
            refresh: true,
        }),
        tailwindcss(),
        react(), // <-- 2. Añade el plugin de React aquí
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});