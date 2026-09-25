# SIGAC-SUSPEG

Sistema Integral de Gestión Administrativa y Control para el **Sindicato Único de Servidores Públicos del Estado de Guerrero (SUSPEG), Sección 75**.


## ¿Qué es SIGAC-SUSPEG?

Hoy, cada secretaría de la Sección 75 lleva su información por su cuenta: padrones en Excel, expedientes en papel, comprobantes sueltos, sin ninguna conexión entre ellas. SIGAC-SUSPEG junta esa operación en un solo sistema web, respetando cómo trabaja realmente cada secretaría, y conectando la información donde tiene sentido (por ejemplo, un mismo agremiado puede aparecer en Organización, pedir un beneficio en Fomento Habitacional, o tener un caso abierto en Trabajos y Conflictos, sin volver a capturar sus datos cada vez).

## Módulos

---Secretaría de Organización----
Padrón completo de agremiados (afiliación, expedientes, documentos), gestión de estatus, credenciales SUSPEG, y el catálogo de secretarías/dependencias del gobierno del estado.

----Secretaría de Finanzas----
Registro de ingresos y egresos por partida presupuestal, verificación de la cuota mensual reportada contra la nómina real de agremiados activos, inventario de bienes muebles, e informes financieros mensuales/anuales.

----Secretaría de Fomento Habitacional----
Programa de insumos subsidiados (calentadores solares, tinacos, cisternas, leche) en colaboración con la Congregación Mariana Trinitaria A.C., catálogo de categorías dinámico, convenios de descuento con instituciones externas (ej. CIEX), y reportes de beneficiarios por insumo.

----Secretaría de Trabajos y Conflictos----
Seguimiento de casos laborales (despidos injustificados, conflictos individuales/colectivos, demandas) con coordinación hacia Asuntos Jurídicos, solicitudes de permiso (días económicos y licencias sin goce de sueldo), y administración de plazas vacantes por jubilación mediante escalafón.

---Notificaciones---
Sistema de notificaciones interno (sin ninguna API externa) que conecta eventos entre secretarías: un beneficio solicitado, un caso turnado a Jurídico, una plaza vacante sin asignar, o un remanente mensual en números rojos.

Abre `http://localhost:8000` una vez instalado de manera local
