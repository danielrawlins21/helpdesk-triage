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
export type WorkState = "orientado" | "confuso" | "inconsciente";
export type BackgroundType =
  | "diabetes"
  | "corazon"
  | "embarazada"
  | "hipertension"
  | "asma"
  | "cancer"
  | "ninguna"
  | "otra";

export interface Vitals {
  fc?: number;
  pa?: number;
  fr?: number;
  temp?: number;
  sat?: number;
}

export interface Alarms {
  dolor_fuerte: boolean;
  respiracion: boolean;
  sangrado: boolean;
  desmayo: boolean;
  vomito_sangre: boolean;
  paralisis: boolean;
}

export interface TriageData {
  categoria: IncidentCategory | "";
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
  tiempo: "",
  pain: 0,
  vitals: {},
  estado: "",
  alarmas: {
    dolor_fuerte: false,
    respiracion: false,
    sangrado: false,
    desmayo: false,
    vomito_sangre: false,
    paralisis: false,
  },
  antecedentes: [],
};
