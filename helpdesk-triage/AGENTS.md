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
- Los comandos de Astro del proyecto ejecutan con `ASTRO_TELEMETRY_DISABLED=1`.

## Chatbot Local
- El chatbot de acompanamiento corre en local con Ollama mediante un proxy Node.
- No usar Anthropic ni claves API para este flujo.
- No persistir conversaciones; el estado del chat debe permanecer en memoria.
- El frontend solo debe hablar con el proxy local y el proxy con Ollama.
- Scripts relacionados: `dev:chat` para levantar Astro y el proxy juntos, y `chat:proxy` para iniciar solo el proxy.

## Service Worker y Cache
- El registro del service worker esta desactivado actualmente en la app para evitar errores de cache durante desarrollo.
- Si se reactiva el service worker, mantener el manejo de `fetch` limitado a requests del mismo origen (same-origin).
- No cachear requests de extensiones del navegador ni origenes externos.

## Scripts
- `npm run dev`: inicia Astro en desarrollo.
- `npm run dev:chat`: inicia Astro junto con el chatbot local.
- `npm run start`: alias de desarrollo.
- `npm run build`: genera la build de produccion.
- `npm run preview`: previsualiza la build.
- `npm run check`: valida tipos y configuracion de Astro.
- `npm run chat:proxy`: inicia solo el proxy local de Ollama.

## Clasificacion
- La logica de prioridad vive en `src/lib/classify.ts`.
- No modificar la clasificacion P1-P4 sin revisar antes los criterios ITIL del proyecto.
