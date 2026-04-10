import type { WorkState } from "../../lib/types";

const options: Array<{
  value: WorkState;
  label: string;
  tone: string;
}> = [
  { value: "orientado", label: "Me siento consciente y orientado", tone: "bg-emerald-600 text-white" },
  { value: "confuso", label: "Estoy confundido o desorientado", tone: "bg-amber-500 text-white" },
  {
    value: "inconsciente",
    label: "Alguien me ayuda porque no puedo responder solo",
    tone: "bg-red-700 text-white",
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
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Paso 4</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">¿Cómo está tu estado mental ahora mismo?</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((option, index) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`rounded-lg border px-4 py-4 text-left text-sm font-medium transition ${
                index === 2 ? "col-span-2" : ""
              } ${selected ? option.tone + " border-transparent" : "border-slate-300 bg-white text-slate-700"}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
