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

const compactVitalsSchema = z.object({
  fc: z.number().min(0).max(250).optional(),
  pa: z.number().min(0).max(300).optional(),
  fr: z.number().min(0).max(80).optional(),
  temp: z.number().min(0).max(45).optional(),
  sat: z.number().min(0).max(100).optional(),
});

const compactPayloadSchema = z.object({
  v: z.literal(QR_TRIAGE_VERSION),
  i: z.string().datetime(),
  n: z.string().min(1),
  d: z.object({
    c: z.enum(["pecho", "respirar", "fiebre", "golpe", "barriga", "embarazo", "mareo", "otro", ""]),
    e: z.enum(["pediatria", "ginecologia", "cirugia", "interna", ""]),
    t: z.enum(["lt1h", "1_24h", "gt24h", ""]),
    p: z.number().min(0).max(10),
    v: compactVitalsSchema,
    s: z.enum(["orientado", "confuso", "somnoliento", "inconsciente", ""]),
    l: z.array(z.string()),
    a: z.array(
      z.enum(["diabetes", "corazon", "embarazada", "hipertension", "asma", "cancer", "renal", "anticoag", "ninguna", "otra"]),
    ),
  }),
  c: z.tuple([
    z.enum(["NIVEL 1", "NIVEL 2", "NIVEL 3", "NIVEL 4", "NIVEL 5"]),
    z.string().min(1),
    z.string().min(1),
    z.string().min(1),
    z.string().min(1),
  ]),
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

function buildCompactPayload(ticket: TicketRecord) {
  return {
    v: QR_TRIAGE_VERSION,
    i: ticket.createdAt,
    n: ticket.number,
    d: {
      c: ticket.data.categoria,
      e: ticket.data.especialidad,
      t: ticket.data.tiempo,
      p: ticket.data.pain,
      v: ticket.data.vitals,
      s: ticket.data.estado,
      l: Object.entries(ticket.data.alarmas)
        .filter(([, value]) => value)
        .map(([key]) => key),
      a: ticket.data.antecedentes,
    },
    c: [
      ticket.classification.level,
      ticket.classification.cat,
      ticket.classification.color,
      ticket.classification.time,
      ticket.classification.msg,
    ],
  };
}

export function serializeQrPayload(ticket: TicketRecord) {
  return JSON.stringify(buildCompactPayload(ticket));
}

export function parseQrPayload(raw: string): TicketRecord {
  const parsedJson = JSON.parse(raw);
  const compactResult = compactPayloadSchema.safeParse(parsedJson);

  const parsed = compactResult.success
    ? {
        version: compactResult.data.v,
        issuedAt: compactResult.data.i,
        ticketNumber: compactResult.data.n,
        data: {
          categoria: compactResult.data.d.c,
          especialidad: compactResult.data.d.e,
          tiempo: compactResult.data.d.t,
          pain: compactResult.data.d.p,
          vitals: compactResult.data.d.v,
          estado: compactResult.data.d.s,
          alarmas: Object.fromEntries(compactResult.data.d.l.map((alarmKey) => [alarmKey, true])),
          antecedentes: compactResult.data.d.a,
        },
        classification: {
          level: compactResult.data.c[0],
          cat: compactResult.data.c[1],
          color: compactResult.data.c[2],
          time: compactResult.data.c[3],
          msg: compactResult.data.c[4],
        },
      }
    : qrPayloadSchema.parse(parsedJson);

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
