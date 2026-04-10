export type TicketLevel = "NIVEL 1" | "NIVEL 2" | "NIVEL 3" | "NIVEL 4" | "NIVEL 5";
export type IncidentCategory =
  | "pecho"
  | "respirar"
  | "fiebre"
  | "golpe"
  | "barriga"
  | "embarazo"
  | "mareo"
  | "otro";
export type IncidentTime = "lt1h" | "1_24h" | "gt24h";
export type Specialty = "pediatria" | "ginecologia" | "cirugia" | "interna";
export type WorkState = "orientado" | "confuso" | "somnoliento" | "inconsciente";
export type BackgroundType =
  | "diabetes"
  | "corazon"
  | "embarazada"
  | "hipertension"
  | "asma"
  | "cancer"
  | "renal"
  | "anticoag"
  | "ninguna"
  | "otra";

export interface Vitals {
  fc?: number;
  pa?: number;
  fr?: number;
  temp?: number;
  sat?: number;
}

export type Alarms = Record<string, boolean>;

export interface TriageData {
  categoria: IncidentCategory | "";
  especialidad: Specialty | "";
  tiempo: IncidentTime | "";
  pain: number;
  vitals: Vitals;
  estado: WorkState | "";
  alarmas: Alarms;
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
  especialidad: "",
  tiempo: "",
  pain: 6,
  vitals: {},
  estado: "",
  alarmas: {},
  antecedentes: [],
};
