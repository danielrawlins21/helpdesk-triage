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

## Clasificacion
- La logica de prioridad vive en `src/lib/classify.ts`.
- No modificar la clasificacion P1-P4 sin revisar antes los criterios ITIL del proyecto.
