import type { BackgroundType } from "../../lib/types";

const backgroundOptions: Array<{ value: BackgroundType; label: string }> = [
  { value: "diabetes", label: "Diabetes" },
  { value: "corazon", label: "Problema del corazón" },
  { value: "embarazada", label: "Embarazada" },
  { value: "hipertension", label: "Hipertensión" },
  { value: "asma", label: "Asma / respiratorios" },
  { value: "cancer", label: "Cáncer / quimioterapia" },
  { value: "renal", label: "Enfermedad del riñón" },
  { value: "anticoag", label: "Tomo anticoagulantes" },
  { value: "ninguna", label: "Ninguna de las anteriores" },
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
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const selected = selectedValues.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onToggle(option.value)}
            className={`rounded-xl border px-3 py-3 text-center text-xs font-semibold transition ${
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
  );
}

export function Step6Context({
  antecedentes,
  onToggleBackground,
}: Step6ContextProps) {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Paso 7 de 7</p>
        <h2 className="mt-1 text-base font-semibold leading-snug text-slate-900">
          ¿Tienes alguna de estas condiciones de salud?
        </h2>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">
          Puedes marcar varias. Ayuda al médico a evaluar mejor tu caso.
        </p>
        <p className="rounded-xl bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-800">
          Si marcas "Ninguna", se desmarcan las demás condiciones.
        </p>
        <SelectGrid
          selectedValues={antecedentes}
          options={backgroundOptions}
          onToggle={(value) => onToggleBackground(value as BackgroundType)}
        />
      </div>
    </section>
  );
}
