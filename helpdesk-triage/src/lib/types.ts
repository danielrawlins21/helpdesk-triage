export type TicketLevel = "P1" | "P2" | "P3" | "P4";
export type IncidentCategory =
  | "red"
  | "hardware"
  | "software"
  | "acceso"
  | "correo"
  | "datos"
  | "servidor"
  | "otro";
export type IncidentTime = "lt1h" | "1_24h" | "gt24h";
export type WorkState = "operativo" | "parcial" | "bloqueado";
export type EnvironmentType = "produccion" | "desarrollo" | "staging" | "local";
export type BackgroundType =
  | "configuracion"
  | "actualizacion"
  | "incidente_reciente"
  | "legacy"
  | "alta_carga"
  | "mantenimiento"
  | "ninguno"
  | "otro";

export interface Metrics {
  usuariosAfectados?: number;
  disponibilidad?: number;
  respuestaMs?: number;
  erroresPorMinuto?: number;
}

export interface Alarms {
  datos_en_riesgo: boolean;
  produccion_caida: boolean;
  muchos_usuarios: boolean;
  cliente_vip: boolean;
  mas_24h: boolean;
  seguridad: boolean;
}

export interface TriageData {
  categoria: IncidentCategory | "";
  tiempo: IncidentTime | "";
  impact: number;
  metrics: Metrics;
  estado: WorkState | "";
  alarmas: Alarms;
  entornos: EnvironmentType[];
  antecedentes: BackgroundType[];
}

export interface Classification {
  level: TicketLevel;
  cat: string;
  color: string;
  time: string;
  msg: string;
}

export interface TicketRecord {
  id: string;
  number: string;
  createdAt: string;
  data: TriageData;
  classification: Classification;
  confirmed: boolean;
}

export const defaultTriageData: TriageData = {
  categoria: "",
  tiempo: "",
  impact: 0,
  metrics: {},
  estado: "",
  alarmas: {
    datos_en_riesgo: false,
    produccion_caida: false,
    muchos_usuarios: false,
    cliente_vip: false,
    mas_24h: false,
    seguridad: false,
  },
  entornos: [],
  antecedentes: [],
};
