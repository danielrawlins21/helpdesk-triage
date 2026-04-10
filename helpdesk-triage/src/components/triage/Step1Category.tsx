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
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Paso 1</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">¿Cuál es tu molestia principal?</h2>
        <p className="mt-2 text-sm text-slate-600">
          Selecciona la que más te preocupa ahora mismo.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {categoryOptions.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`rounded-lg border px-4 py-4 text-left text-sm transition ${
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
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
