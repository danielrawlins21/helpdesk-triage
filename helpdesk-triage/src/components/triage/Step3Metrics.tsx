import { getBadMetricLabels } from "../../lib/classify";
import type { Metrics } from "../../lib/types";

interface Step3MetricsProps {
  metrics: Metrics;
  errors: Partial<Record<keyof Metrics, string>>;
  onChange: <K extends keyof Metrics>(key: K, value: number | undefined) => void;
}

const fields: Array<{
  key: keyof Metrics;
  label: string;
  alertLabel: string;
  hint: string;
  min: number;
  max: number;
}> = [
  {
    key: "usuariosAfectados",
    label: "Usuarios afectados",
    alertLabel: "Usuarios afectados",
    hint: "Ref normal: 1-5",
    min: 0,
    max: 100000,
  },
  {
    key: "disponibilidad",
    label: "% disponibilidad del servicio",
    alertLabel: "Disponibilidad baja",
    hint: "Ref normal: 95-100%",
    min: 0,
    max: 100,
  },
  {
    key: "respuestaMs",
    label: "Tiempo de respuesta en ms",
    alertLabel: "Respuesta lenta",
    hint: "Ref normal: < 500ms",
    min: 0,
    max: 120000,
  },
  {
    key: "erroresPorMinuto",
    label: "Errores por minuto",
    alertLabel: "Errores elevados",
    hint: "Ref normal: 0-5",
    min: 0,
    max: 100000,
  },
];

export function Step3Metrics({ metrics, errors, onChange }: Step3MetricsProps) {
  const alerts = getBadMetricLabels(metrics);
  const alertSet = new Set(alerts);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Paso 3</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Métricas del sistema</h2>
        <p className="mt-2 text-sm text-slate-600">
          Si tienes datos, ingresa los siguientes valores. Son opcionales.
        </p>
      </div>

      {alerts.length > 0 ? (
        <div className="rounded-xl border border-red-700 bg-red-100 px-4 py-3 text-sm text-red-800">
          Alerta: hay métricas fuera del rango de referencia.
        </div>
      ) : null}

      <div className="space-y-4">
        {fields.map((field) => {
          const value = metrics[field.key];
          const isAlert = alertSet.has(field.alertLabel);
          return (
            <label key={field.key} className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{field.label}</span>
              <input
                type="number"
                min={field.min}
                max={field.max}
                value={typeof value === "number" ? value : ""}
                onChange={(event) => {
                  const raw = event.target.value;
                  onChange(field.key, raw === "" ? undefined : Number(raw));
                }}
                className={`w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none transition ${
                  errors[field.key] || isAlert
                    ? "border-red-600 text-red-700"
                    : "border-slate-300 text-slate-700"
                }`}
              />
              <span className="mt-1 block text-xs text-slate-500">{field.hint}</span>
              {errors[field.key] ? (
                <span className="mt-1 block text-xs text-red-700">{errors[field.key]}</span>
              ) : null}
            </label>
          );
        })}
      </div>
    </section>
  );
}
