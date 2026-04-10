import type { Alarms } from "../../lib/types";

const alarmOptions: Array<{ key: keyof Alarms; label: string }> = [
  { key: "datos_en_riesgo", label: "Hay datos en riesgo o posible pérdida de información" },
  { key: "produccion_caida", label: "El servicio está caído en producción" },
  { key: "muchos_usuarios", label: "Más de 10 usuarios están afectados" },
  { key: "cliente_vip", label: "Es un cliente VIP o contrato crítico" },
  { key: "mas_24h", label: "El problema lleva más de 24h sin resolverse" },
  { key: "seguridad", label: "Hay riesgo de seguridad o acceso no autorizado" },
];

interface Step5AlarmsProps {
  value: Alarms;
  onToggle: (key: keyof Alarms) => void;
}

export function Step5Alarms({ value, onToggle }: Step5AlarmsProps) {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Paso 5</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">
          ¿Alguna de estas situaciones aplica?
        </h2>
        <p className="mt-2 text-sm text-slate-600">Marca todas las que apliquen.</p>
      </div>

      <div className="space-y-3">
        {alarmOptions.map((alarm) => {
          const checked = value[alarm.key];
          return (
            <button
              key={alarm.key}
              type="button"
              onClick={() => onToggle(alarm.key)}
              className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
                checked
                  ? "border-red-700 bg-red-100 text-red-900"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              <span
                className={`mt-0.5 h-5 w-5 rounded border ${
                  checked ? "border-red-700 bg-red-700" : "border-slate-400"
                }`}
              />
              <span>{alarm.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
