import type { Classification, Metrics, TriageData } from "./types";

const metricChecks = [
  {
    key: "usuariosAfectados",
    label: "Usuarios afectados",
    test: (value: number) => value > 5,
  },
  {
    key: "disponibilidad",
    label: "Disponibilidad baja",
    test: (value: number) => value < 95,
  },
  {
    key: "respuestaMs",
    label: "Respuesta lenta",
    test: (value: number) => value > 500,
  },
  {
    key: "erroresPorMinuto",
    label: "Errores elevados",
    test: (value: number) => value > 5,
  },
] as const;

export function getBadMetricLabels(metrics: Metrics): string[] {
  return metricChecks
    .filter(({ key, test }) => {
      const value = metrics[key];
      return typeof value === "number" && test(value);
    })
    .map(({ label }) => label);
}

export function checkBadMetrics(metrics: Metrics): boolean {
  return getBadMetricLabels(metrics).length > 0;
}

export function classify(data: TriageData): Classification {
  const alarms = Object.values(data.alarmas).filter(Boolean).length;
  const badMetrics = checkBadMetrics(data.metrics);

  if (
    data.estado === "bloqueado" ||
    data.alarmas.datos_en_riesgo ||
    data.alarmas.seguridad ||
    badMetrics
  ) {
    return {
      level: "P1",
      cat: "Crítico",
      color: "#C0392B",
      time: "Inmediato",
      msg: "Incidente crítico - atención inmediata requerida.",
    };
  }

  if (
    data.estado === "parcial" ||
    data.impact >= 8 ||
    alarms >= 2 ||
    data.alarmas.produccion_caida
  ) {
    return {
      level: "P2",
      cat: "Alto",
      color: "#E67E22",
      time: "< 15 min",
      msg: "Incidente urgente - no debe esperar.",
    };
  }

  if (data.impact >= 5 || alarms >= 1 || data.tiempo === "lt1h") {
    return {
      level: "P3",
      cat: "Medio",
      color: "#D4AC0D",
      time: "< 60 min",
      msg: "Urgencia moderada - asignar pronto.",
    };
  }

  if (data.impact >= 3 || data.tiempo === "1_24h") {
    return {
      level: "P4",
      cat: "Bajo",
      color: "#27AE60",
      time: "2-4 horas",
      msg: "Puede esperar con seguimiento.",
    };
  }

  return {
    level: "P4",
    cat: "Bajo",
    color: "#2980B9",
    time: "Programar",
    msg: "No urgente - programar atención.",
  };
}
