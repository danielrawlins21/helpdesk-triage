import { z } from "zod";
import { QR_TRIAGE_VERSION, type QrTriagePayload, type TicketRecord, type TriageData } from "./types";

const triageDataSchema: z.ZodType<TriageData> = z.object({
  categoria: z.enum(["pecho", "respirar", "fiebre", "golpe", "barriga", "embarazo", "mareo", "otro", ""]),
  especialidad: z.enum(["pediatria", "ginecologia", "cirugia", "interna", ""]),
  tiempo: z.enum(["lt1h", "1_24h", "gt24h", ""]),
  pain: z.number().min(0).max(10),
  vitals: z.object({
    fc: z.number().min(0).max(250).optional(),
    pa: z.number().min(0).max(300).optional(),
    fr: z.number().min(0).max(80).optional(),
    temp: z.number().min(0).max(45).optional(),
    sat: z.number().min(0).max(100).optional(),
  }),
  estado: z.enum(["orientado", "confuso", "somnoliento", "inconsciente", ""]),
  alarmas: z.record(z.boolean()),
  antecedentes: z.array(
    z.enum(["diabetes", "corazon", "embarazada", "hipertension", "asma", "cancer", "renal", "anticoag", "ninguna", "otra"]),
  ),
});

const classificationSchema = z.object({
  level: z.enum(["NIVEL 1", "NIVEL 2", "NIVEL 3", "NIVEL 4", "NIVEL 5"]),
  cat: z.string().min(1),
  color: z.string().min(1),
  time: z.string().min(1),
  msg: z.string().min(1),
});

const qrPayloadSchema: z.ZodType<QrTriagePayload> = z.object({
  version: z.literal(QR_TRIAGE_VERSION),
  issuedAt: z.string().datetime(),
  ticketNumber: z.string().min(1),
  data: triageDataSchema,
  classification: classificationSchema,
});

export function createLocalTicketId() {
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function createTicketNumber() {
  return String(Math.floor(Math.random() * 900) + 100);
}

export function getQrSourceKey(payload: Pick<QrTriagePayload, "ticketNumber" | "issuedAt">) {
  return `${payload.ticketNumber}:${payload.issuedAt}`;
}

export function buildQrPayload(ticket: TicketRecord): QrTriagePayload {
  return {
    version: QR_TRIAGE_VERSION,
    issuedAt: ticket.createdAt,
    ticketNumber: ticket.number,
    data: ticket.data,
    classification: ticket.classification,
  };
}

export function serializeQrPayload(ticket: TicketRecord) {
  return JSON.stringify(buildQrPayload(ticket));
}

export function parseQrPayload(raw: string): TicketRecord {
  const parsed = qrPayloadSchema.parse(JSON.parse(raw));

  return {
    id: createLocalTicketId(),
    number: parsed.ticketNumber,
    createdAt: parsed.issuedAt,
    data: parsed.data,
    classification: parsed.classification,
    confirmed: false,
    sourceKey: getQrSourceKey(parsed),
  };
}
