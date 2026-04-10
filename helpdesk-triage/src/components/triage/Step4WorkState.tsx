import type { WorkState } from "../../lib/types";

const options: Array<{
  value: WorkState;
  label: string;
  tone: string;
}> = [
  {
    value: "orientado",
    label: "Estoy bien despierto, sé dónde estoy y puedo responder",
    tone: "border-emerald-300 bg-emerald-50 text-emerald-800",
  },
  {
    value: "confuso",
    label: "Estoy confundido, desorientado o con la mente lenta",
    tone: "border-amber-300 bg-amber-50 text-amber-800",
  },
  {
    value: "somnoliento",
    label: "Estoy muy dormido/a, es difícil despertarme",
    tone: "border-orange-300 bg-orange-50 text-orange-800",
  },
  {
    value: "inconsciente",
    label: "No responde o está inconsciente - alguien lo/la ayuda",
    tone: "border-red-300 bg-red-50 text-red-800",
  },
];

interface Step4WorkStateProps {
  value: WorkState | "";
  error?: string;
  onSelect: (value: WorkState) => void;
}

export function Step4WorkState({ value, error, onSelect }: Step4WorkStateProps) {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Paso 4 de 7</p>
        <h2 className="mt-1 text-base font-semibold text-slate-900">
          ¿Cómo está el estado mental en este momento?
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Si el paciente no puede responder, que lo haga un acompañante.
        </p>
      </div>

      <div className="space-y-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
                onClick={() => onSelect(option.value)}
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                selected ? option.tone + " shadow-sm" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-500 hover:bg-blue-50"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
