# AGENTS.md
## Proyecto
Repositorio de trabajo para `helpdesk-triage`, una web app mobile-first de triage para soporte tecnico.
La app principal vive en `helpdesk-triage/`.

## Stack activo
- Astro 5
- React
- Tailwind CSS v4
- React Hook Form
- Zod
- TypeScript estricto

## Convenciones
- Componentes en PascalCase.
- Utilidades y tipos compartidos en `helpdesk-triage/src/lib/`.
- Estado del frontend en memoria; no usar persistencia local ni backend en esta fase.
- La logica de clasificacion se mantiene en `helpdesk-triage/src/lib/classify.ts`.
