import http from "node:http";

const OLLAMA_HOST = process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434";
const PORT = Number(process.env.OLLAMA_PROXY_PORT ?? 8787);
const PROXY_HOST = process.env.OLLAMA_PROXY_HOST ?? "127.0.0.1";
const FALLBACK_MODEL = process.env.OLLAMA_MODEL ?? "gemma3:latest";
const REQUEST_TIMEOUT_MS = Number(process.env.OLLAMA_PROXY_TIMEOUT_MS ?? 60_000);
const MAX_BODY_BYTES = 128 * 1024;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    ...corsHeaders,
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function normalizeOllamaUrl(path) {
  return new URL(path, OLLAMA_HOST.endsWith("/") ? OLLAMA_HOST : `${OLLAMA_HOST}/`);
}

async function fetchOllama(path, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(normalizeOllamaUrl(path), {
      ...init,
      signal: controller.signal,
    });

    const text = await response.text();
    const payload = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(payload.error ?? `Ollama responded with status ${response.status}`);
    }

    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

async function readJsonBody(request) {
  let body = "";

  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
      throw new Error("Request body is too large.");
    }
  }

  return body ? JSON.parse(body) : {};
}

function cleanText(value, maxLength = 1_200) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((message) => message?.role === "user" || message?.role === "assistant")
    .map((message) => ({
      role: message.role,
      content: cleanText(message.content),
    }))
    .filter((message) => message.content.length > 0)
    .slice(-10);
}

function sanitizeContext(context) {
  return {
    ticket: cleanText(context?.ticket, 40) || "sin ticket",
    level: cleanText(context?.level, 20) || "sin clasificar",
    category: cleanText(context?.category, 80) || "sin categoría",
    waitTime: cleanText(context?.waitTime, 80) || "sin tiempo estimado",
    specialty: cleanText(context?.specialty, 80) || "General",
    reason: cleanText(context?.reason, 140) || "malestar no especificado",
    pain: Number.isFinite(Number(context?.pain)) ? Number(context.pain) : 0,
    mentalState: cleanText(context?.mentalState, 120) || "no especificado",
  };
}

async function chooseModel() {
  const ps = await fetchOllama("/api/ps");
  const activeModel = ps.models?.find((model) => typeof model?.name === "string")?.name;

  if (activeModel) {
    return { model: activeModel, source: "active" };
  }

  const tags = await fetchOllama("/api/tags");
  const downloadedModels = tags.models?.map((model) => model.name) ?? [];
  const fallbackIsAvailable = downloadedModels.includes(FALLBACK_MODEL);

  if (!fallbackIsAvailable) {
    throw new Error(
      `No active Ollama model found and fallback model "${FALLBACK_MODEL}" is not downloaded.`,
    );
  }

  return { model: FALLBACK_MODEL, source: "fallback" };
}

function buildSystemPrompt(context) {
  const levelMessages = {
    "NIVEL 1":
      "El paciente tiene una emergencia absoluta y será atendido de inmediato. Transmite calma urgente y dile que el equipo está al tanto.",
    "NIVEL 2":
      "El paciente tiene una emergencia con espera estimada menor a 15 minutos. Sé cálido y tranquilizador.",
    "NIVEL 3":
      "El paciente tiene una urgencia moderada. Ayúdale a manejar la espera con calma y frases simples.",
    "NIVEL 4":
      "El paciente tiene una urgencia baja. Tranquiliza sin minimizar lo que siente.",
    "NIVEL 5":
      "El paciente tiene un caso no urgente. Sé amable y acompaña sin dar consejos médicos.",
  };

  return `Eres el "Asistente de espera" de una sala de urgencias. Tu misión es acompañar emocionalmente al paciente mientras aguarda ser atendido.

CONTEXTO DEL PACIENTE:
- Ticket: #${context.ticket}
- Clasificación interna: ${context.level} - ${context.category}
- Tiempo estimado: ${context.waitTime}
- Especialidad: ${context.specialty}
- Motivo: ${context.reason}
- Dolor reportado: ${context.pain}/10
- Estado mental: ${context.mentalState}

INSTRUCCIONES:
- ${levelMessages[context.level] ?? "Sé cálido, claro y tranquilizador."}
- Habla siempre en español, con tono humano, suave y seguro.
- Usa máximo 2 o 3 frases por respuesta.
- No menciones niveles técnicos, códigos, MTS ni ESI al paciente.
- NUNCA des diagnósticos, tratamientos, dosis, indicaciones clínicas ni decisiones de alta.
- Si te pregunta algo médico, responde que eso lo evaluará el médico.
- Si el paciente dice que se siente peor, que no puede respirar bien, que tiene dolor intenso nuevo, mucho miedo, desmayo, sangrado, confusión o una urgencia nueva, dile que avise al personal de enfermería de inmediato.
- Puedes sugerir medidas emocionales suaves como respirar lento, intentar estar cómodo/a o pedir compañía.
- No prometas tiempos exactos ni resultados clínicos.`;
}

async function handleHealth(_request, response) {
  try {
    const selected = await chooseModel();
    sendJson(response, 200, {
      ok: true,
      ollamaHost: OLLAMA_HOST,
      model: selected.model,
      source: selected.source,
    });
  } catch (error) {
    sendJson(response, 503, {
      ok: false,
      ollamaHost: OLLAMA_HOST,
      model: FALLBACK_MODEL,
      error: error instanceof Error ? error.message : "Ollama is not available.",
    });
  }
}

async function handleChat(request, response) {
  try {
    const body = await readJsonBody(request);
    const context = sanitizeContext(body.context);
    const messages = sanitizeMessages(body.messages);

    if (messages.length === 0) {
      sendJson(response, 400, { error: "At least one chat message is required." });
      return;
    }

    const selected = await chooseModel();
    const payload = await fetchOllama("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: selected.model,
        stream: false,
        messages: [
          { role: "system", content: buildSystemPrompt(context) },
          ...messages,
        ],
      }),
    });

    sendJson(response, 200, {
      reply:
        cleanText(payload.message?.content, 2_000) ||
        "Estoy aquí contigo. Si necesitas algo urgente, avisa al personal de enfermería.",
      model: selected.model,
    });
  } catch (error) {
    sendJson(response, 503, {
      error: error instanceof Error ? error.message : "Ollama chat request failed.",
      model: FALLBACK_MODEL,
    });
  }
}

const server = http.createServer((request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, corsHeaders);
    response.end();
    return;
  }

  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (request.method === "GET" && url.pathname === "/api/health") {
    void handleHealth(request, response);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/chat") {
    void handleChat(request, response);
    return;
  }

  sendJson(response, 404, { error: "Not found." });
});

server.on("error", (error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

server.listen(PORT, PROXY_HOST, () => {
  console.log(`Ollama chat proxy listening on http://${PROXY_HOST}:${PORT}`);
  console.log(`Using Ollama host ${OLLAMA_HOST} with fallback model ${FALLBACK_MODEL}`);
});
