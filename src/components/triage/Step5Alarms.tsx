import { getSpecialtyAlarmDefinition } from "../../lib/alarms";
import type { Alarms, Specialty } from "../../lib/types";

type AlarmLevel = "prioritario" | "general";

interface AlarmPresentationItem {
  key: string;
  text: string;
  level: AlarmLevel;
}

interface AlarmPresentationSection {
  title: string;
  items: AlarmPresentationItem[];
}

interface Step5AlarmsProps {
  specialty: Specialty | "";
  value: Alarms;
  onToggle: (key: string) => void;
}

const NONE_KEY = "ningunaSintoma";

const levelStyles: Record<
  AlarmLevel,
  {
    headerStyle: { backgroundColor: string; color: string };
    selectedCardStyle: { backgroundColor: string; borderColor: string; color: string };
    selectedRadioClassName: string;
  }
> = {
  prioritario: {
    headerStyle: { backgroundColor: "#FCEBEB", color: "#791F1F" },
    selectedCardStyle: { backgroundColor: "#FCEBEB", borderColor: "#A32D2D", color: "#791F1F" },
    selectedRadioClassName: "border-[#A32D2D] bg-[#A32D2D]",
  },
  general: {
    headerStyle: { backgroundColor: "#FDF3E3", color: "#633806" },
    selectedCardStyle: { backgroundColor: "#EAF3DE", borderColor: "#3B6D11", color: "#27470C" },
    selectedRadioClassName: "border-[#3B6D11] bg-[#3B6D11]",
  },
};

export function Step5Alarms({ specialty, value, onToggle }: Step5AlarmsProps) {
  const definition = getSpecialtyAlarmDefinition(specialty);
  const sections: AlarmPresentationSection[] = definition.sections.map((section) => ({
    title: section.title,
    items: section.items.map((alarm) => ({
      key: alarm.key,
      text: alarm.text,
      level: alarm.critical ? "prioritario" : "general",
    })),
  }));
  const alarmKeys = sections.flatMap((section) => section.items.map((alarm) => alarm.key));
  const selectedCount = alarmKeys.filter((key) => Boolean(value[key])).length;
  const noneSelected = Boolean(value[NONE_KEY]);
  const selectionMessage =
    selectedCount === 0
      ? "Ningún síntoma marcado"
      : `${selectedCount} síntoma${selectedCount === 1 ? "" : "s"} marcado${selectedCount === 1 ? "" : "s"}`;

  function handleAlarmToggle(key: string) {
    if (noneSelected) {
      onToggle(NONE_KEY);
    }

    onToggle(key);
  }

  function handleNoneSelect() {
    alarmKeys.forEach((key) => {
      if (value[key]) {
        onToggle(key);
      }
    });

    if (!noneSelected) {
      onToggle(NONE_KEY);
    }
  }

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

      <div
        className="inline-flex rounded-full px-3 py-1.5 text-xs font-semibold"
        style={{ backgroundColor: `${definition.color}22`, color: definition.color }}
      >
        {definition.label}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">{selectionMessage}</p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => {
          const sectionLevel: AlarmLevel = section.items.some((alarm) => alarm.level === "prioritario")
            ? "prioritario"
            : "general";
          const sectionStyle = levelStyles[sectionLevel];

          return (
            <div key={section.title} className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="rounded-md px-[10px] py-[6px]" style={sectionStyle.headerStyle}>
                <p className="text-[11px] font-semibold uppercase tracking-widest">{section.title}</p>
              </div>
              <div className="space-y-2">
                {section.items.map((alarm) => {
                const checked = Boolean(value[alarm.key]);
                const levelStyle = levelStyles[alarm.level];
                return (
                  <button
                    key={alarm.key}
                    type="button"
                    onClick={() => handleAlarmToggle(alarm.key)}
                    aria-pressed={checked}
                    className="flex min-h-11 w-full items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    style={checked ? levelStyle.selectedCardStyle : undefined}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        checked ? levelStyle.selectedRadioClassName : "border-slate-300 bg-white"
                      }`}
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-white" />
                    </span>
                    <span>{alarm.text}</span>
                  </button>
                );
              })}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleNoneSelect}
        aria-pressed={noneSelected}
        className={`flex min-h-11 w-full items-center justify-center rounded-xl border px-4 py-3 text-center text-sm font-semibold transition ${
          noneSelected
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
        }`}
      >
        No tengo ninguno de estos síntomas
      </button>
    </section>
  );
}
