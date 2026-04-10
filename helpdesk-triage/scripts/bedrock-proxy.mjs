import http from "node:http";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const BEDROCK_REGION =
  process.env.BEDROCK_REGION ?? process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? "us-east-1";
const BEDROCK_MODEL_ID = process.env.BEDROCK_MODEL_ID ?? "anthropic.claude-3-haiku-20240307-v1:0";
const PORT = Number(process.env.BEDROCK_PROXY_PORT ?? 8788);
const PROXY_HOST = process.env.BEDROCK_PROXY_HOST ?? "127.0.0.1";
const REQUEST_TIMEOUT_MS = Number(process.env.BEDROCK_PROXY_TIMEOUT_MS ?? 60_000);
const MAX_BODY_BYTES = 128 * 1024;
const MAX_TOKENS = Number(process.env.BEDROCK_MAX_TOKENS ?? 300);
const TEMPERATURE = Number(process.env.BEDROCK_TEMPERATURE ?? 0.4);
const ALLOWED_ORIGINS = (process.env.BEDROCK_PROXY_ALLOWED_ORIGINS ??
  "http://localhost:4321,http://127.0.0.1:4321")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const client = new BedrockRuntimeClient({ region: BEDROCK_REGION, maxAttempts: 2 });

function isOriginAllowed(origin) {
  if (!origin) {
    return true;
  }

  return ALLOWED_ORIGINS.includes("*") || ALLOWED_ORIGINS.includes(origin);
}

function buildCorsHeaders(origin) {
  if (!origin || !isOriginAllowed(origin)) {
    return {
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin",
    };
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "false",
    Vary: "Origin",
  };
}

function sendJson(response, statusCode, payload, origin) {
  response.writeHead(statusCode, {
    ...buildCorsHeaders(origin),
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function normalizeError(error, fallbackMessage) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

async function readJsonBody(request) {
  let body = "";

  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
      throw new Error("Request body is too large.");
    }
  }

  if (!body) {
    return {};
  }

  return JSON.parse(body);
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

function parseClaudeContent(payload) {
  if (typeof payload?.content === "string") {
    return cleanText(payload.content, 2_000);
  }

  if (!Array.isArray(payload?.content)) {
    return "";
  }

  return payload.content
    .map((block) => (block?.type === "text" ? cleanText(block.text, 2_000) : ""))
    .filter(Boolean)
    .join(" ")
    .trim();
}

async function invokeBedrock(context, messages) {
  const requestBody = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    system: buildSystemPrompt(context),
    messages: messages.map((message) => ({
      role: message.role,
      content: [{ type: "text", text: message.content }],
    })),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const command = new InvokeModelCommand({
      modelId: BEDROCK_MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(requestBody),
    });

    const response = await client.send(command, { abortSignal: controller.signal });
    const rawBody = response.body instanceof Uint8Array ? response.body : new Uint8Array(response.body ?? []);
    const decoded = new TextDecoder().decode(rawBody);
    return decoded ? JSON.parse(decoded) : {};
  } finally {
    clearTimeout(timeout);
  }
}

async function handleHealth(request, response) {
  const origin = request.headers.origin;

  if (origin && !isOriginAllowed(origin)) {
    sendJson(response, 403, { ok: false, error: "Origin not allowed." }, origin);
    return;
  }

  sendJson(
    response,
    200,
    {
      ok: true,
      provider: "bedrock",
      region: BEDROCK_REGION,
      model: BEDROCK_MODEL_ID,
    },
    origin,
  );
}

async function handleChat(request, response) {
  const origin = request.headers.origin;

  if (origin && !isOriginAllowed(origin)) {
    sendJson(response, 403, { error: "Origin not allowed." }, origin);
    return;
  }

  if (!request.headers["content-type"]?.includes("application/json")) {
    sendJson(response, 415, { error: "Content-Type must be application/json." }, origin);
    return;
  }

  try {
    const body = await readJsonBody(request);
    const context = sanitizeContext(body.context);
    const messages = sanitizeMessages(body.messages);

    if (messages.length === 0) {
      sendJson(response, 400, { error: "At least one chat message is required." }, origin);
      return;
    }

    const payload = await invokeBedrock(context, messages);
    const reply = parseClaudeContent(payload) ||
      "Estoy aquí contigo. Si necesitas algo urgente, avisa al personal de enfermería.";

    sendJson(response, 200, {
      reply,
      model: BEDROCK_MODEL_ID,
      provider: "bedrock",
      region: BEDROCK_REGION,
    }, origin);
  } catch (error) {
    sendJson(response, 503, {
      error: normalizeError(error, "Bedrock chat request failed."),
      model: BEDROCK_MODEL_ID,
      provider: "bedrock",
      region: BEDROCK_REGION,
    }, origin);
  }
}

const server = http.createServer((request, response) => {
  const origin = request.headers.origin;

  if (request.method === "OPTIONS") {
    if (origin && !isOriginAllowed(origin)) {
      response.writeHead(403, {
        "Content-Type": "application/json; charset=utf-8",
        ...buildCorsHeaders(origin),
      });
      response.end(JSON.stringify({ error: "Origin not allowed." }));
      return;
    }

    response.writeHead(204, buildCorsHeaders(origin));
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

  sendJson(response, 404, { error: "Not found." }, origin);
});

server.on("error", (error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

server.listen(PORT, PROXY_HOST, () => {
  console.log(`Bedrock chat proxy listening on http://${PROXY_HOST}:${PORT}`);
  console.log(`Using Bedrock region ${BEDROCK_REGION} with model ${BEDROCK_MODEL_ID}`);
});