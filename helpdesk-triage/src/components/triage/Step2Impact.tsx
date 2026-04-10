import type { IncidentTime } from "../../lib/types";

const timeOptions: Array<{ value: IncidentTime; label: string }> = [
  { value: "lt1h", label: "Menos de 1 hora" },
  { value: "1_24h", label: "1 a 24 horas" },
  { value: "gt24h", label: "Más de 24 horas" },
];

interface Step2ImpactProps {
  tiempo: IncidentTime | "";
  pain: number;
  onTimeChange: (value: IncidentTime) => void;
  onPainChange: (value: number) => void;
}

export function Step2Impact({
  tiempo,
  pain,
  onTimeChange,
  onPainChange,
}: Step2ImpactProps) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Paso 2</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Tiempo y dolor</h2>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">¿Hace cuánto tiempo tienes esta molestia?</p>
        <div className="grid grid-cols-3 gap-2">
          {timeOptions.map((option) => {
            const selected = tiempo === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onTimeChange(option.value)}
                className={`w-full rounded-lg border px-3 py-3 text-center text-sm transition ${
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
          <div>
            <p className="text-sm font-medium text-slate-700">¿Cómo describes el dolor?</p>
            <p className="mt-1 text-xs text-slate-500">
              Escala de dolor (0 = sin dolor · 10 = insoportable)
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            {pain}/10
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          value={pain}
          onChange={(event) => onPainChange(Number(event.target.value))}
          className="w-full accent-sky-900"
        />
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Sin dolor</span>
          <span>Moderado</span>
          <span>Insoportable</span>
        </div>
      </div>
    </section>
  );
}
