import type { BackgroundType, EnvironmentType } from "../../lib/types";

const envOptions: Array<{ value: EnvironmentType; label: string }> = [
  { value: "produccion", label: "Producción" },
  { value: "desarrollo", label: "Desarrollo" },
  { value: "staging", label: "Staging" },
  { value: "local", label: "Local" },
];

const backgroundOptions: Array<{ value: BackgroundType; label: string }> = [
  { value: "configuracion", label: "Cambio reciente de configuración" },
  { value: "actualizacion", label: "Actualización de software" },
  { value: "incidente_reciente", label: "Incidente anterior reciente" },
  { value: "legacy", label: "Sistema legacy / antiguo" },
  { value: "alta_carga", label: "Alta carga de usuarios" },
  { value: "mantenimiento", label: "Mantenimiento programado" },
  { value: "ninguno", label: "Ninguno" },
  { value: "otro", label: "Otro contexto" },
];

interface Step6ContextProps {
  entornos: EnvironmentType[];
  antecedentes: BackgroundType[];
  onToggleEnv: (value: EnvironmentType) => void;
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
  entornos,
  antecedentes,
  onToggleEnv,
  onToggleBackground,
}: Step6ContextProps) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Paso 6</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Contexto del sistema</h2>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">¿En qué entorno ocurre el problema?</p>
        <SelectGrid
          selectedValues={entornos}
          options={envOptions}
          onToggle={(value) => onToggleEnv(value as EnvironmentType)}
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">¿Tienes alguno de estos antecedentes?</p>
        <SelectGrid
          selectedValues={antecedentes}
          options={backgroundOptions}
          onToggle={(value) => onToggleBackground(value as BackgroundType)}
        />
      </div>
    </section>
  );
}
