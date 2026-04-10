import type { IncidentCategory } from "../../lib/types";

const categoryOptions: Array<{ value: IncidentCategory; label: string }> = [
  { value: "red", label: "Red / conectividad" },
  { value: "hardware", label: "Hardware / dispositivo" },
  { value: "software", label: "Software / aplicación" },
  { value: "acceso", label: "Acceso / permisos" },
  { value: "correo", label: "Correo / comunicaciones" },
  { value: "datos", label: "Base de datos / datos" },
  { value: "servidor", label: "Servidor / infraestructura" },
  { value: "otro", label: "Otro problema" },
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
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">
          ¿Cuál es el tipo de problema?
        </h2>
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
