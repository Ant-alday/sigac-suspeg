import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

// Este es el archivo donde arranca todo. Inertia busca automáticamente
// el componente de React que corresponde a cada página (por ejemplo,
// "Agremiados/Listado" carga el archivo Pages/Agremiados/Listado.jsx),
// sin que nosotros tengamos que armar un router a mano.
createInertiaApp({
    resolve: (nombre) => {
        // import.meta.glob busca todos los archivos .jsx dentro de Pages/
        const paginas = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        return paginas[`./Pages/${nombre}.jsx`];
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});