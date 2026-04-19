# Informe del Proyecto y Mapa de Ruta (ROOTMAP)

Este documento describe el estado actual del desarrollo de la aplicación **EVENTIA** contrastándolo con los requerimientos definidos en el `PRD.md`.

## 📍 Estado Actual del Proyecto

Actualmente, el proyecto es una **SPA** configurada con React, TypeScript, Vite y Tailwind CSS. Utiliza un sistema centralizado de navegación (React Router DOM) con un `BottomNav` diseñado para experiencia móvil. Los datos son simulados (`mockData.ts`) y no hay persistencia real aún.

### Pantallas Desarrolladas (Completadas / V1)
✅ **Inicio (`/`):** Implementada en `HomePage.tsx`. Contiene un listado de eventos destacados o cercanos.
✅ **Explorar (`/explore`):** Implementada en `ExplorePage.tsx`. Permite buscar y filtrar.
✅ **Detalle del Evento (`/event/:id`):** Implementada en `EventDetailPage.tsx`. Muestra la información descriptiva y opciones (comprar ticket, etc.).
✅ **Chat (`/chat`):** Módulo de chat implementado en `ChatPage.tsx`.
✅ **Crear Evento (`/create`):** Formulario para la gestión de nuevos eventos en `CreateEventPage.tsx`.
✅ **Perfil (`/profile`):** Vista de información del usuario en `ProfilePage.tsx`.

### Pantallas Pendientes por Desarrollar
⏳ **Edición de Eventos:** Ruta y componente `EditEventPage.tsx` no existen.
⏳ **Mis eventos:** Filtro o pantalla específica para eventos creados por el usuario (si es organizador).
⏳ **Mis tickets:** Visualización detallada de tickets comprados (puede integrarse en el perfil).
⏳ **Notificaciones:** Menú o pantalla destinada a listar notificaciones en la app.
⏳ **Suscripciones:** Panel para que los organizadores gestionen sus pagos y beneficios premium.
⏳ **Configuración:** Preferencias de cuenta, privacidad, notificaciones, etc.
⏳ **Panel de Admin:** Interfaz de control maestro para administrar usuarios y aprobar eventos (dashboard administrativo).

## 🚀 Funcionalidades Globales
| Funcionalidad | Estado | Comentarios |
| --- | --- | --- |
| Registro/Autenticación | ⚠️ Mock/Ficticio | Se requiere implementar integración con backend (Supabase) |
| Preferencias iniciales | ❌ Pendiente | Flujo de Onboarding. |
| Creación de eventos | ✅ Funcionando (Mock) | Formulario armado; falta validación con Backend. |
| Compra de tickets | ⚠️ Mock/Ficticio | UI planteada, lógica real pendiente. |
| Geolocalización y Mapas | ⚠️ Mock/Ficticio | Se muestra distancia u ordenación simulada. |
| Chat en tiempo real | ⚠️ Mock/Ficticio | Interfaz construida, falta sistema websockets/Supabase Realtime. |

## 🛠 Tareas Inmediatas a Futuro (Next Steps)
1. **Integración de Backend:** Sustituir la lógica del `mockData.ts` conectando la app con **Supabase** (Autenticación y base de datos).
2. **Sistema de Roles:** Controlar el acceso a `/create` solo para organizadores o administradores.
3. **Persistencia Local:** Asegurar que información temporal (como favoritos o compras pendientes) se manejen al menos en `localStorage` antes de enviarlos a la DB.
4. **Onboarding / Autenticación:** Interfaz y flujo de inicio de sesión y registro de usuarios nuevos.
5. **Completar las Vistas Pendientes:** Mis Tickets, Notificaciones y Configuración.
