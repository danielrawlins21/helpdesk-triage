import { getAlarmStats } from "./alarms";
import type { Classification, TriageData, Vitals } from "./types";

const metricChecks = [
  {
    key: "fc",
    label: "FC",
    test: (value: number) => value < 60 || value > 100,
  },
  {
    key: "pa",
    label: "TA",
    test: (value: number) => value < 90 || value > 140,
  },
  {
    key: "fr",
    label: "FR",
    test: (value: number) => value < 12 || value > 20,
  },
  {
    key: "temp",
    label: "Temp",
    test: (value: number) => value < 36 || value > 37.5,
  },
  {
    key: "sat",
    label: "SpO2",
    test: (value: number) => value < 94 || value > 100,
  },
] as const;

export function getBadMetricLabels(vitals: Vitals): string[] {
  return metricChecks
    .filter(({ key, test }) => {
      const value = vitals[key];
      return typeof value === "number" && test(value);
    })
    .map(({ label }) => label);
}

export function checkBadMetrics(vitals: Vitals): boolean {
  return getBadMetricLabels(vitals).length > 0;
}

export function classify(data: TriageData): Classification {
  const { alarmCount, criticalCount } = getAlarmStats(data.alarmas, data.especialidad);
  const badV =
    (data.vitals.fc && (data.vitals.fc > 130 || data.vitals.fc < 45)) ||
    (data.vitals.pa && (data.vitals.pa < 85 || data.vitals.pa > 185)) ||
    (data.vitals.sat && data.vitals.sat < 92) ||
    (data.vitals.temp && (data.vitals.temp > 40 || data.vitals.temp < 35));

  if (data.estado === "inconsciente" || criticalCount >= 2 || badV) {
    return {
      level: "NIVEL 1",
      cat: "Emergencia absoluta",
      color: "#DC2626",
      time: "Inmediato",
      msg: "Caso crítico - atención inmediata necesaria.",
    };
  }

  if (data.estado === "somnoliento" || criticalCount >= 1 || data.pain >= 8 || alarmCount >= 2) {
    return {
      level: "NIVEL 2",
      cat: "Emergencia",
      color: "#D97706",
      time: "< 15 min",
      msg: "Caso urgente - no debe esperar.",
    };
  }

  if (data.pain >= 5 || alarmCount >= 1 || data.tiempo === "lt1h") {
    return {
      level: "NIVEL 3",
      cat: "Urgencia alta",
      color: "#B45309",
      time: "< 60 min",
      msg: "Urgencia moderada - prioridad de atención.",
    };
  }

  if (data.pain >= 3 || data.tiempo === "1_24h") {
    return {
      level: "NIVEL 4",
      cat: "Urgencia baja",
      color: "#16A34A",
      time: "1-2 horas",
      msg: "Puede esperar con vigilancia.",
    };
  }

  return {
    level: "NIVEL 5",
    cat: "No urgente",
    color: "#0284C7",
    time: "Puede esperar",
    msg: "No requiere atención urgente.",
  };
}
