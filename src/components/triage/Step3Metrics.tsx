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
    label: "Presión arterial (sistólica)",
    alertLabel: "TA",
    hint: "Ref: 90-140 mmHg",
    min: 0,
    max: 300,
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
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Paso 6 de 7</p>
        <h2 className="mt-1 text-base font-semibold text-slate-900">Signos vitales (si los tienes)</h2>
        <p className="mt-2 text-sm text-slate-600">
          Si tienes un tensiómetro u oxímetro, ingresa los valores. Si no, déjalos en blanco.
        </p>
      </div>

      {alerts.length > 0 ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Valor fuera de rango normal detectado
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        {fields.map((field) => {
          const value = metrics[field.key];
          const isAlert = alertSet.has(field.alertLabel);
          return (
            <label key={field.key} className="block rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <span className="mb-2 block text-sm font-semibold leading-5 text-slate-700">{field.label}</span>
              <input
                type="number"
                min={field.min}
                max={field.max}
                value={typeof value === "number" ? value : ""}
                onChange={(event) => {
                  const raw = event.target.value;
                  onChange(field.key, raw === "" ? undefined : Number(raw));
                }}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                  errors[field.key] || isAlert
                    ? "border-red-600 text-red-700"
                    : "border-slate-200 text-slate-700"
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
