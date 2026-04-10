import { getAlarmStats, getSpecialtyAlarmDefinition } from "../../lib/alarms";
import type { Alarms, Specialty } from "../../lib/types";

interface Step5AlarmsProps {
  specialty: Specialty | "";
  value: Alarms;
  onToggle: (key: string) => void;
}

export function Step5Alarms({ specialty, value, onToggle }: Step5AlarmsProps) {
  const definition = getSpecialtyAlarmDefinition(specialty);
  const { criticalCount } = getAlarmStats(value, specialty);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Paso 5 de 7</p>
        <h2 className="mt-1 text-base font-semibold text-slate-900">
          ¿Tienes alguno de estos síntomas ahora?
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Marca todos los que apliquen. Esto es muy importante para el médico.
        </p>
      </div>

      {criticalCount > 0 ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Hay señales de alerta graves. Un médico debe revisarlo con prioridad.
        </div>
      ) : null}

      <div
        className="inline-flex rounded-full px-3 py-1.5 text-xs font-semibold"
        style={{ backgroundColor: `${definition.color}22`, color: definition.color }}
      >
        {definition.label}
      </div>

      <div className="space-y-4">
        {definition.sections.map((section) => (
          <div key={section.title} className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{section.title}</p>
            <div className="space-y-2">
              {section.items.map((alarm) => {
                const checked = Boolean(value[alarm.key]);
                return (
                  <button
                    key={alarm.key}
                    type="button"
                    onClick={() => onToggle(alarm.key)}
                    className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                      checked
                        ? "border-red-300 bg-red-50 text-red-900 shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        checked ? "border-red-600 bg-red-600" : "border-slate-300 bg-white"
                      }`}
                    />
                    <span>
                      {alarm.critical ? <span className="font-semibold text-red-700">Crítico: </span> : null}
                      {alarm.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
