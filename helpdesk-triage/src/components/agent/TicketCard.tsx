import { getBadMetricLabels } from "../../lib/classify";
import type { TicketLevel, TicketRecord } from "../../lib/types";

const levelStyles: Record<TicketLevel, string> = {
  "NIVEL 1": "bg-red-700 text-white",
  "NIVEL 2": "bg-amber-500 text-white",
  "NIVEL 3": "bg-yellow-400 text-slate-900",
  "NIVEL 4": "bg-emerald-600 text-white",
  "NIVEL 5": "bg-sky-700 text-white",
};

const categoryMap: Record<string, string> = {
  pecho: "Dolor en el pecho",
  respirar: "Me cuesta respirar",
  fiebre: "Fiebre / escalofríos",
  golpe: "Golpe / herida / accidente",
  barriga: "Dolor de barriga",
  embarazo: "Embarazo / ginecológico",
  mareo: "Mareo / confusión / desmayo",
  otro: "Otro malestar",
};

const timeMap: Record<string, string> = {
  lt1h: "< 1h",
  "1_24h": "1 a 24h",
  gt24h: "> 24h",
};

const stateMap: Record<string, string> = {
  orientado: "Consciente y orientado",
  confuso: "Confundido o desorientado",
  inconsciente: "No puede responder solo",
};

const alarmLabels: Record<string, string> = {
  dolor_fuerte: "Dolor muy fuerte",
  respiracion: "Dificultad respiratoria",
  sangrado: "Sangrado abundante",
  desmayo: "Desmayo",
  vomito_sangre: "Vómito sangre / heces negras",
  paralisis: "Parálisis / adormecimiento",
};

const backgroundLabels: Record<string, string> = {
  diabetes: "Diabetes",
  corazon: "Problema del corazón",
  embarazada: "Embarazada",
  hipertension: "Hipertensión",
  asma: "Asma / respiratorios",
  cancer: "Cáncer / quimioterapia",
  ninguna: "Ninguna",
  otra: "Otra condición",
};

interface TicketCardProps {
  ticket: TicketRecord;
  onConfirm: (id: string) => void;
  onReclassify: (id: string, level: TicketLevel) => void;
}

export function TicketCard({ ticket, onConfirm, onReclassify }: TicketCardProps) {
  const activeAlarms = Object.entries(ticket.data.alarmas).filter(([, enabled]) => enabled);
  const badMetrics = getBadMetricLabels(ticket.data.vitals);

  return (
    <article className="rounded-2xl bg-white p-5 ticket-shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">Ticket #{ticket.number}</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">
            {categoryMap[ticket.data.categoria] ?? "Sin categoría"}
          </h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${levelStyles[ticket.classification.level]}`}>
          {ticket.classification.level}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-slate-600">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="font-medium text-slate-800">Evolución</p>
          <p>{timeMap[ticket.data.tiempo] ?? "N/D"}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="font-medium text-slate-800">Dolor</p>
          <p>{ticket.data.pain}/10</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="font-medium text-slate-800">Estado mental</p>
          <p>{stateMap[ticket.data.estado] ?? "N/D"}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          ["FC", ticket.data.vitals.fc],
          ["TA", ticket.data.vitals.pa],
          ["FR", ticket.data.vitals.fr],
          ["Temp", ticket.data.vitals.temp],
          ["SpO2", ticket.data.vitals.sat],
        ].map(([label, value]) => {
          if (typeof value !== "number") return null;
          const isBad = badMetrics.includes(label);
          return (
            <span
              key={label}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                isBad ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-700"
              }`}
            >
              {label}: {value}
            </span>
          );
        })}
      </div>

      {activeAlarms.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {activeAlarms.map(([alarm]) => (
            <span key={alarm} className="rounded-full border border-red-700 bg-red-100 px-3 py-1 text-xs text-red-800">
              {alarmLabels[alarm]}
            </span>
          ))}
        </div>
      ) : null}

      {ticket.data.antecedentes.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {ticket.data.antecedentes.map((background) => (
            <span key={background} className="rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-900">
              {backgroundLabels[background]}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-5 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white">
        <p className="font-semibold">
          Clasificación IA (MTS+ESI): {ticket.classification.level} · {ticket.classification.time}
        </p>
        <p className="mt-1 text-slate-300">{ticket.classification.msg}</p>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() => onConfirm(ticket.id)}
          className="flex-1 rounded-lg bg-sky-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
        >
          Confirmar IA
        </button>
      </div>

      <div className="mt-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Reclasificar</p>
        <div className="grid grid-cols-5 gap-2">
        {(["NIVEL 1", "NIVEL 2", "NIVEL 3", "NIVEL 4", "NIVEL 5"] as TicketLevel[]).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onReclassify(ticket.id, level)}
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${levelStyles[level]}`}
          >
            {level.replace("NIVEL ", "N")}
          </button>
        ))}
        </div>
      </div>
    </article>
  );
}
