# EVENTIA - App de Eventos y Experiencias

**EVENTIA** es una aplicación web tipo móvil (PWA/SPA) orientada a la exploración, creación y gestión de eventos locales. Su objetivo es permitir a los usuarios descubrir actividades cercanas en tiempo real, interactuando con organizadores y otros participantes de manera dinámica.

## 🚀 Características Principales

*   **Exploración de Eventos:** Descubre eventos locales basados en tu ubicación e intereses.
*   **Gestión de Tickets:** Compra, visualiza y administra tus entradas a eventos.
*   **Creación de Experiencias:** Los organizadores pueden crear eventos, establecer precios y publicar detalles completos (requiere suscripción/premium).
*   **Chat en Tiempo Real:** Interacción directa con organizadores y espacios dedicados para cada evento.
*   **Perfiles de Usuario:** Crea tu identidad y conecta con una comunidad basada en intereses comunes.

## 📱 Público Objetivo

EVENTIA está dirigida al público en general (jóvenes y adultos) que buscan actividades de entretenimiento o culturales, así como a emprendedores y organizadores que deseen promocionar sus eventos y consolidar una audiencia.

## 🛠️ Tecnologías Utilizadas

*   **Frontend:** React (con Vite), TypeScript
*   **Estilos:** Tailwind CSS y diseño moderno (Glassmorphism, dark/light modes).
*   **Navegación:** React Router DOM
*   **Manejo de Estado/Caching:** Tanstack Query
*   **Base de datos / Backend (Futuro):** Preparado para migrar de Mock Data (en memoria y `localStorage`) a Supabase.

## 📦 Configuración del Proyecto

Para iniciar el entorno de desarrollo local, ejecuta los siguientes comandos:

```bash
# Instalar dependencias
npm install / bun install

# Ejecutar el servidor de desarrollo
npm run dev / bun run dev
```

El sitio estará disponible para visualizarse en modo SPA con diseño móvil por defecto.

## 🎯 Mejoras de Diseño y UX

El sitio está diseñado buscando:
- **Diseño limpio y profesional:** con colores seleccionados y micro-animaciones en las interacciones de botones y tarjetas.
- **Responsividad Móvil First:** Navegación pensada originalmente para verse y sentirse como una aplicación nativa.

## 📈 Próximos pasos
Consulta el archivo `ROOTMAP.md` para ver el estado actual del desarrollo del proyecto según el PRD definido.
