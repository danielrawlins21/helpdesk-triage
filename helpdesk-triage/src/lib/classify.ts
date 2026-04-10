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
  const alarms = Object.values(data.alarmas).filter(Boolean).length;
  const badV =
    (data.vitals.fc && (data.vitals.fc > 130 || data.vitals.fc < 45)) ||
    (data.vitals.pa && (data.vitals.pa < 85 || data.vitals.pa > 185)) ||
    (data.vitals.sat && data.vitals.sat < 92) ||
    (data.vitals.temp && (data.vitals.temp > 40 || data.vitals.temp < 35));

  if (data.estado === "inconsciente" || data.alarmas.sangrado || data.alarmas.paralisis || badV) {
    return {
      level: "NIVEL 1",
      cat: "Emergencia absoluta",
      color: "#C0392B",
      time: "Inmediato",
      msg: "Caso crítico - atención inmediata.",
    };
  }

  if (
    data.estado === "confuso" ||
    data.pain >= 8 ||
    alarms >= 2 ||
    data.alarmas.respiracion ||
    data.alarmas.vomito_sangre
  ) {
    return {
      level: "NIVEL 2",
      cat: "Emergencia",
      color: "#E67E22",
      time: "< 15 min",
      msg: "Caso urgente - no debe esperar.",
    };
  }

  if (data.pain >= 5 || alarms >= 1 || data.tiempo === "lt1h") {
    return {
      level: "NIVEL 3",
      cat: "Urgencia alta",
      color: "#D4AC0D",
      time: "< 60 min",
      msg: "Urgencia moderada.",
    };
  }

  if (data.pain >= 3 || data.tiempo === "1_24h") {
    return {
      level: "NIVEL 4",
      cat: "Urgencia baja",
      color: "#27AE60",
      time: "1-2 horas",
      msg: "Puede esperar con vigilancia.",
    };
  }

  return {
    level: "NIVEL 5",
    cat: "No urgente",
    color: "#2980B9",
    time: "Puede esperar",
    msg: "No requiere atención urgente.",
  };
}
