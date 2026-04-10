import type { Specialty, TicketLevel, TicketRecord } from "./types";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatPatientContext {
  ticket: string;
  level: TicketLevel;
  category: string;
  waitTime: string;
  specialty: string;
  reason: string;
  pain: number;
  mentalState: string;
}

export interface ChatResponse {
  reply: string;
  model: string;
}

const categoryMap: Record<string, string> = {
  pecho: "dolor en el pecho",
  respirar: "dificultad para respirar",
  fiebre: "fiebre o escalofríos",
  golpe: "golpe, herida o accidente",
  barriga: "dolor de barriga",
  embarazo: "embarazo o consulta ginecológica",
  mareo: "mareo, confusión o desmayo",
  otro: "otro malestar",
};

const specialtyMap: Record<Specialty, string> = {
  pediatria: "Pediatría",
  ginecologia: "Ginecología",
  cirugia: "Cirugía",
  interna: "Medicina Interna",
};

const mentalStateMap: Record<string, string> = {
  orientado: "consciente y orientado",
  confuso: "confundido o desorientado",
  somnoliento: "somnoliento o difícil de despertar",
  inconsciente: "no responde o está inconsciente",
};

export const suggestionsByLevel: Record<TicketLevel, string[]> = {
  "NIVEL 1": ["Tengo miedo", "Necesito ayuda", "¿Qué hago ahora?"],
  "NIVEL 2": ["¿Es grave?", "Tengo ansiedad", "¿Qué hago mientras espero?"],
  "NIVEL 3": ["El dolor aumenta", "¿Es normal esperar?", "Estoy nervioso/a"],
  "NIVEL 4": ["¿Cuánto espero?", "¿Puedo estar cómodo/a?", "Me siento mejor"],
  "NIVEL 5": ["¿Cuánto espero?", "Tengo una duda", "Me siento tranquilo/a"],
};

export function buildChatPatientContext(ticket: TicketRecord): ChatPatientContext {
  return {
    ticket: ticket.number,
    level: ticket.classification.level,
    category: ticket.classification.cat,
    waitTime: ticket.classification.time,
    specialty: ticket.data.especialidad ? specialtyMap[ticket.data.especialidad] : "General",
    reason: categoryMap[ticket.data.categoria] ?? "malestar no especificado",
    pain: ticket.data.pain,
    mentalState: mentalStateMap[ticket.data.estado] ?? "no especificado",
  };
}

export function getWelcomeMessage(level: TicketLevel, pain: number) {
  if (level === "NIVEL 1" || level === "NIVEL 2") {
    return "Ya recibimos tu información y el equipo médico está al tanto de tu caso. Estoy aquí contigo mientras esperan atenderte. ¿Cómo te sientes ahora?";
  }

  if (level === "NIVEL 3" || pain >= 7) {
    return "Tu información ya está con el médico. La espera puede ser incómoda, pero estás en el lugar correcto. ¿Qué te preocupa más en este momento?";
  }

  return "Tu caso ya fue registrado y el médico lo revisará pronto. Puedes intentar ponerte cómodo/a y respirar con calma. ¿Cómo te encuentras?";
}

export function getChatFallbackMessage() {
  return "Estoy aquí contigo. Si te sientes peor, aparece una urgencia nueva o necesitas ayuda inmediata, avisa al personal de enfermería de inmediato.";
}
