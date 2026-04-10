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

Si quieres usar el chatbot local, usa este comando en lugar de `npm run dev`:

```bash
npm run dev:chat
```

## Scripts disponibles

- `npm run dev`: inicia servidor de desarrollo
- `npm run dev:chat`: inicia el proxy local del chatbot y Astro juntos
- `npm run start`: alias de desarrollo (`astro dev`)
- `npm run build`: genera build de produccion
- `npm run preview`: levanta la build generada para previsualizar
- `npm run check`: validacion de tipos y chequeos de Astro
- `npm run chat:proxy`: inicia el proxy local del chatbot para Ollama

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

## Chatbot de espera

El chatbot de acompanamiento usa Ollama en local mediante un proxy Node separado.
No usa Anthropic, no usa claves API y no persiste conversaciones.
El frontend llama solo al proxy local; el proxy habla con Ollama.

Flujo local recomendado:

```bash
ollama serve
```

Opcionalmente, precarga el modelo fallback descargado:

```bash
ollama run gemma3:latest
```

Opcion recomendada desde `helpdesk-triage/`:

```bash
npm run dev:chat
```

Alternativamente, en otra terminal, desde `helpdesk-triage/`, inicia el proxy:

```bash
npm run chat:proxy
```

En una tercera terminal, tambien desde `helpdesk-triage/`, inicia Astro:

```bash
npm run dev
```

El proxy usa por defecto:

- `OLLAMA_HOST=http://127.0.0.1:11434`
- `OLLAMA_PROXY_HOST=127.0.0.1`
- `OLLAMA_PROXY_PORT=8787`
- `OLLAMA_MODEL=gemma3:latest`

La seleccion de modelo prioriza el primer modelo activo de `ollama ps`.
Si no hay modelos activos, usa `gemma3:latest`.
Si el fallback no esta descargado o Ollama no esta disponible, el chat muestra un mensaje local seguro sin romper la pantalla del ticket.

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
