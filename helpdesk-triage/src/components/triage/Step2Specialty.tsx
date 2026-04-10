import type { Specialty } from "../../lib/types";

const specialtyOptions: Array<{
  value: Specialty;
  label: string;
  hint: string;
}> = [
  { value: "pediatria", label: "Pediatría", hint: "Niño/a menor de 15 años" },
  { value: "ginecologia", label: "Ginecología", hint: "Problema ginecológico o embarazo" },
  { value: "cirugia", label: "Cirugía", hint: "Dolor abdominal fuerte o herida" },
  { value: "interna", label: "Medicina interna", hint: "Problema general de adulto" },
];

interface Step2SpecialtyProps {
  value: Specialty | "";
  error?: string;
  onSelect: (value: Specialty) => void;
}

export function Step2Specialty({ value, error, onSelect }: Step2SpecialtyProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Paso 2 de 7</p>
        <h2 className="mt-1 text-base font-semibold leading-snug text-slate-900">
          ¿A qué área crees que pertenece tu problema?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Esto nos ayuda a hacer las preguntas más adecuadas. Si no estás seguro/a, elige la más parecida.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {specialtyOptions.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`rounded-xl border px-3 py-4 text-center transition ${
                selected
                  ? "border-[#1B3A5C] bg-[#1B3A5C] text-white shadow-sm"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-500 hover:bg-blue-50"
              }`}
            >
              <span className="block text-sm font-semibold">{option.label}</span>
              <span className={`mt-1 block text-xs ${selected ? "text-white/75" : "text-slate-500"}`}>
                {option.hint}
              </span>
            </button>
          );
        })}
      </div>

      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
