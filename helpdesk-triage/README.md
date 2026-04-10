# Helpdesk Triage

Web app mobile-first de triage tecnico construida con Astro + React.

## Requisitos

- Node.js 20 LTS o superior
- npm (incluido con Node.js)

Verifica versiones:

```bash
node -v
npm -v
```

## Instalacion

Desde la carpeta del proyecto:

```bash
cd helpdesk-triage
npm install
```

## Ejecutar en desarrollo

```bash
npm run dev
```

Luego abre en el navegador la URL que muestra Astro (normalmente `http://localhost:4321`).

## Scripts disponibles

- `npm run dev`: inicia servidor de desarrollo
- `npm run start`: alias de desarrollo (`astro dev`)
- `npm run build`: genera build de produccion
- `npm run preview`: levanta la build generada para previsualizar
- `npm run check`: validacion de tipos y chequeos de Astro

## Flujo recomendado

1. Instalar dependencias:

```bash
npm install
```

2. Revisar tipos y estado del proyecto:

```bash
npm run check
```

3. Ejecutar entorno local:

```bash
npm run dev
```

## Solucion de problemas rapida

- Si `npm` no se reconoce en terminal, instala Node.js desde el sitio oficial y reinicia la terminal.
- Si cambia la version de Node, elimina `node_modules` y reinstala:

```bash
rm -rf node_modules package-lock.json
npm install
```

En PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```
