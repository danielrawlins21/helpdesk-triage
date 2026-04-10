import type { IncidentCategory } from "../../lib/types";

const categoryOptions: Array<{ value: IncidentCategory; label: string }> = [
  { value: "pecho", label: "Dolor en el pecho" },
  { value: "respirar", label: "Me cuesta respirar" },
  { value: "fiebre", label: "Fiebre / escalofríos" },
  { value: "golpe", label: "Golpe / herida / accidente" },
  { value: "barriga", label: "Dolor de barriga" },
  { value: "embarazo", label: "Embarazo / ginecológico" },
  { value: "mareo", label: "Mareo / confusión / desmayo" },
  { value: "otro", label: "Otro malestar" },
];

interface Step1CategoryProps {
  value: IncidentCategory | "";
  error?: string;
  onSelect: (value: IncidentCategory) => void;
}

export function Step1Category({ value, error, onSelect }: Step1CategoryProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Paso 1 de 7</p>
        <h2 className="mt-1 text-base font-semibold leading-snug text-slate-900">
          ¿Cuál es tu molestia principal?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Selecciona la que más te preocupa ahora mismo.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {categoryOptions.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`rounded-xl border px-3 py-3 text-center text-xs leading-5 transition ${
                selected
                  ? "border-[#1B3A5C] bg-[#1B3A5C] font-semibold text-white shadow-sm"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-500 hover:bg-blue-50"
              }`}
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
