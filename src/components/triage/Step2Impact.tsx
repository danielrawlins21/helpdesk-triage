import type { IncidentTime } from "../../lib/types";

const timeOptions: Array<{ value: IncidentTime; label: string }> = [
  { value: "lt1h", label: "Menos de 1 hora" },
  { value: "1_24h", label: "1 a 24 horas" },
  { value: "gt24h", label: "Más de 24 horas" },
];

const painOptions = Array.from({ length: 11 }, (_, value) => value);

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
    <section className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Paso 3 de 7</p>
        <h2 className="mt-1 text-base font-semibold text-slate-900">Tiempo y dolor</h2>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">¿Hace cuánto empezó este malestar?</p>
        <div className="grid grid-cols-3 gap-2">
          {timeOptions.map((option) => {
            const selected = tiempo === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onTimeChange(option.value)}
                className={`w-full rounded-xl border px-2 py-3 text-center text-xs font-semibold transition ${
                  selected
                    ? "border-[#1B3A5C] bg-[#1B3A5C] text-white shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-500 hover:bg-blue-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-700">¿Cuánto molesta el dolor?</p>
            <p className="mt-1 text-xs text-slate-500">
              0 = sin dolor · 10 = el peor dolor imaginable
            </p>
          </div>
          <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700">
            {pain}/10
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 rounded-2xl bg-slate-50 p-2">
          {painOptions.map((option) => {
            const selected = pain === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onPainChange(option)}
                className={`h-8 w-8 rounded-full border text-xs font-semibold transition ${
                  selected
                    ? "border-red-600 bg-red-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-red-300 hover:bg-red-50"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Sin dolor</span>
          <span>Moderado</span>
          <span>Insoportable</span>
        </div>
      </div>
    </section>
  );
}
