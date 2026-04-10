import type { BackgroundType } from "../../lib/types";

const backgroundOptions: Array<{ value: BackgroundType; label: string }> = [
  { value: "diabetes", label: "Diabetes" },
  { value: "corazon", label: "Problema del corazón" },
  { value: "embarazada", label: "Embarazada" },
  { value: "hipertension", label: "Hipertensión" },
  { value: "asma", label: "Asma / respiratorios" },
  { value: "cancer", label: "Cáncer / quimioterapia" },
  { value: "ninguna", label: "Ninguna" },
  { value: "otra", label: "Otra condición" },
];

interface Step6ContextProps {
  antecedentes: BackgroundType[];
  onToggleBackground: (value: BackgroundType) => void;
}

function SelectGrid({
  selectedValues,
  options,
  onToggle,
}: {
  selectedValues: string[];
  options: Array<{ value: string; label: string }>;
  onToggle: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option) => {
        const selected = selectedValues.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onToggle(option.value)}
            className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
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
  );
}

export function Step6Context({
  antecedentes,
  onToggleBackground,
}: Step6ContextProps) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Paso 6</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Antecedentes</h2>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">¿Tienes alguna de estas condiciones de salud?</p>
        <SelectGrid
          selectedValues={antecedentes}
          options={backgroundOptions}
          onToggle={(value) => onToggleBackground(value as BackgroundType)}
        />
      </div>
    </section>
  );
}
