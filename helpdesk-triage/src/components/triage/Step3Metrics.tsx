import { getBadMetricLabels } from "../../lib/classify";
import type { Vitals } from "../../lib/types";

interface Step3MetricsProps {
  metrics: Vitals;
  errors: Partial<Record<keyof Vitals, string>>;
  onChange: <K extends keyof Vitals>(key: K, value: number | undefined) => void;
}

const fields: Array<{
  key: keyof Vitals;
  label: string;
  alertLabel: string;
  hint: string;
  min: number;
  max: number;
}> = [
  {
    key: "fc",
    label: "Frecuencia cardiaca (FC)",
    alertLabel: "FC",
    hint: "Ref: 60-100 lpm",
    min: 0,
    max: 250,
  },
  {
    key: "pa",
    label: "Presión arterial (TA)",
    alertLabel: "TA",
    hint: "Ref: 90-140 mmHg",
    min: 0,
    max: 300,
  },
  {
    key: "fr",
    label: "Frecuencia respiratoria",
    alertLabel: "FR",
    hint: "Ref: 12-20 rpm",
    min: 0,
    max: 80,
  },
  {
    key: "temp",
    label: "Temperatura (°C)",
    alertLabel: "Temp",
    hint: "Ref: 36-37.5°C",
    min: 0,
    max: 45,
  },
  {
    key: "sat",
    label: "Saturación O2 (SpO2 %)",
    alertLabel: "SpO2",
    hint: "Ref: 94-100%",
    min: 0,
    max: 100,
  },
];

export function Step3Metrics({ metrics, errors, onChange }: Step3MetricsProps) {
  const alerts = getBadMetricLabels(metrics);
  const alertSet = new Set(alerts);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Paso 3</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Signos vitales</h2>
        <p className="mt-2 text-sm text-slate-600">
          Si tienes un aparato, ingresa los valores. Si no los sabes, déjalos en blanco.
        </p>
      </div>

      {alerts.length > 0 ? (
        <div className="rounded-xl border border-red-700 bg-red-100 px-4 py-3 text-sm text-red-800">
          Valor fuera de rango normal detectado
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
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
