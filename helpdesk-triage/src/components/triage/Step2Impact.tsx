import type { IncidentTime } from "../../lib/types";

const timeOptions: Array<{ value: IncidentTime; label: string }> = [
  { value: "lt1h", label: "Menos de 1 hora" },
  { value: "1_24h", label: "1 a 24 horas" },
  { value: "gt24h", label: "Más de 24 horas" },
];

interface Step2ImpactProps {
  tiempo: IncidentTime | "";
  impact: number;
  onTimeChange: (value: IncidentTime) => void;
  onImpactChange: (value: number) => void;
}

export function Step2Impact({
  tiempo,
  impact,
  onTimeChange,
  onImpactChange,
}: Step2ImpactProps) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Paso 2</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Tiempo e impacto</h2>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">
          ¿Desde hace cuánto tiempo tienes este problema?
        </p>
        <div className="space-y-2">
          {timeOptions.map((option) => {
            const selected = tiempo === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onTimeChange(option.value)}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                  selected
                    ? "border-slate-900 bg-sky-900 text-white"
                    : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <p className="text-sm font-medium text-slate-700">
            ¿Qué tan grave es el impacto en tu trabajo?
          </p>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            {impact}/10
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          value={impact}
          onChange={(event) => onImpactChange(Number(event.target.value))}
          className="w-full accent-sky-900"
        />
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="rounded-lg bg-white p-3">0-2 = Puedo trabajar con molestias menores</div>
          <div className="rounded-lg bg-white p-3">3-5 = Trabajo parcialmente afectado</div>
          <div className="rounded-lg bg-white p-3">6-8 = Trabajo muy difícil</div>
          <div className="rounded-lg bg-white p-3">9-10 = No puedo trabajar en absoluto</div>
        </div>
      </div>
    </section>
  );
}
