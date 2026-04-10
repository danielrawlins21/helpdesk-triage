# AGENTS.md
## Proyecto
Web app mobile-first de triage para helpdesk tecnico.
Frontend visual en Astro 5 con una isla React para el flujo completo del formulario y el panel del agente.

## Stack
- Astro 5
- React
- Tailwind CSS v4
- React Hook Form
- Zod
- TypeScript estricto

## Convenciones
- Componentes React en PascalCase.
- Tipos y utilidades compartidas en `src/lib`.
- Estado solo en memoria dentro de `src/components/TriageApp.tsx`.
- No usar `localStorage`, backend ni llamadas `fetch`.
- Mantener el enfoque mobile-first con ancho maximo de 460px.

## Service Worker y Cache
- El registro del service worker esta desactivado actualmente en la app para evitar errores de cache durante desarrollo.
- Si se reactiva el service worker, mantener el manejo de `fetch` limitado a requests del mismo origen (same-origin).
- No cachear requests de extensiones del navegador ni origenes externos.

## Clasificacion
- La logica de prioridad vive en `src/lib/classify.ts`.
- No modificar la clasificacion P1-P4 sin revisar antes los criterios ITIL del proyecto.
