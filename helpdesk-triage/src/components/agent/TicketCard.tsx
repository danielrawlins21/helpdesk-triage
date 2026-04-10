import { useState } from "react";
import { getSelectedAlarmItems } from "../../lib/alarms";
import { getBadMetricLabels } from "../../lib/classify";
import type { Specialty, TicketLevel, TicketRecord } from "../../lib/types";

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
  somnoliento: "Somnoliento o difícil de despertar",
  inconsciente: "No puede responder solo",
};

const specialtyMap: Record<Specialty, string> = {
  pediatria: "Pediatría",
  ginecologia: "Ginecología",
  cirugia: "Cirugía",
  interna: "Medicina Interna",
};

const backgroundLabels: Record<string, string> = {
  diabetes: "Diabetes",
  corazon: "Problema del corazón",
  embarazada: "Embarazada",
  hipertension: "Hipertensión",
  asma: "Asma / respiratorios",
  cancer: "Cáncer / quimioterapia",
  renal: "Enfermedad del riñón",
  anticoag: "Tomo anticoagulantes",
  ninguna: "Ninguna",
  otra: "Otra condición",
};

interface TicketCardProps {
  ticket: TicketRecord;
  onConfirm: (id: string) => void;
  onReclassify: (id: string, level: TicketLevel) => void;
}

export function TicketCard({ ticket, onConfirm, onReclassify }: TicketCardProps) {
  const [showReclassify, setShowReclassify] = useState(false);
  const activeAlarms = getSelectedAlarmItems(ticket.data.alarmas, ticket.data.especialidad);
  const badMetrics = getBadMetricLabels(ticket.data.vitals);
  const metrics = [
    { label: "FC", value: ticket.data.vitals.fc },
    { label: "TA", value: ticket.data.vitals.pa },
    { label: "Temp", value: ticket.data.vitals.temp },
    { label: "SpO2", value: ticket.data.vitals.sat },
  ];
  const hasMetrics = metrics.some(({ value }) => typeof value === "number");

  function handleConfirm() {
    setShowReclassify(false);
    onConfirm(ticket.id);
  }

  function handleReclassify(level: TicketLevel) {
    setShowReclassify(false);
    onReclassify(ticket.id, level);
  }

  return (
    <article className="rounded-3xl bg-white p-5 ring-1 ring-slate-200/80 ticket-shadow">
      <div className="flex items-center gap-3">
        <span
          className="h-3.5 w-3.5 shrink-0 rounded-full shadow-sm"
          style={{ backgroundColor: ticket.classification.color }}
        />
        <div className="min-w-0">
          <p className="text-base font-semibold text-slate-900">Ticket #{ticket.number}</p>
          <h3 className="mt-0.5 text-xs text-slate-500">
            {ticket.data.especialidad ? specialtyMap[ticket.data.especialidad] : "Sin especialidad"} ·{" "}
            {categoryMap[ticket.data.categoria] ?? "Sin categoría"}
          </h3>
        </div>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${levelStyles[ticket.classification.level]}`}
        >
          {ticket.confirmed ? "Confirmado" : "Pendiente"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Motivo</p>
          <p className="mt-1 font-semibold text-slate-800">{categoryMap[ticket.data.categoria] ?? "N/D"}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Especialidad</p>
          <p className="mt-1 font-semibold text-slate-800">
            {ticket.data.especialidad ? specialtyMap[ticket.data.especialidad] : "N/D"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Evolución</p>
          <p className="mt-1 font-semibold text-slate-800">{timeMap[ticket.data.tiempo] ?? "N/D"}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Dolor</p>
          <p
            className={`mt-1 font-semibold ${
              ticket.data.pain >= 7 ? "text-red-700" : ticket.data.pain >= 4 ? "text-amber-600" : "text-slate-800"
            }`}
          >
            {ticket.data.pain}/10
          </p>
        </div>
        <div className="col-span-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Estado mental</p>
          <p
            className={`mt-1 font-semibold ${
              ticket.data.estado === "inconsciente"
                ? "text-red-700"
                : ticket.data.estado === "confuso" || ticket.data.estado === "somnoliento"
                  ? "text-amber-600"
                  : "text-slate-800"
            }`}
          >
            {stateMap[ticket.data.estado] ?? "N/D"}
          </p>
        </div>
      </div>

      {hasMetrics ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {metrics.map(({ label, value }) => {
            if (typeof value !== "number") return null;
            const isBad = badMetrics.includes(label);
            return (
              <span
                key={label}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  isBad ? "border-red-200 bg-red-50 text-red-800" : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                {label}: {value}
              </span>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 text-xs text-slate-500">Vitales: no ingresados</p>
      )}

      {activeAlarms.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {activeAlarms.map((alarm) => (
            <span
              key={alarm.key}
              className={`rounded-full border px-3 py-1 text-xs ${
                alarm.critical
                  ? "border-red-200 bg-red-50 font-semibold text-red-800"
                  : "border-amber-300 bg-amber-50 text-amber-800"
              }`}
            >
              {alarm.critical ? "Crítico: " : ""}
              {alarm.text}
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

      <div
        className="mt-5 rounded-2xl px-4 py-3 text-sm"
        style={{
          backgroundColor: ticket.confirmed ? `${ticket.classification.color}22` : "#1B3A5C",
          color: ticket.confirmed ? ticket.classification.color : "#ffffff",
        }}
      >
        <p className="font-semibold">
          {ticket.confirmed ? "Clasificación médica" : "Clasificación IA (MTS+ESI)"}:{" "}
          {ticket.classification.level} - {ticket.classification.cat} ({ticket.classification.time})
        </p>
        <p className={`mt-1 ${ticket.confirmed ? "" : "text-slate-300"}`}>
          {ticket.confirmed ? "Clasificación confirmada por el médico." : ticket.classification.msg}
        </p>
      </div>

      {!ticket.confirmed ? (
        <div className="mt-5 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-full bg-[#1B3A5C] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#152E4A]"
            >
              Confirmar IA
            </button>
            <button
              type="button"
              onClick={() => setShowReclassify((current) => !current)}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              Reclasificar
            </button>
          </div>

          {showReclassify ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Selecciona nueva clasificación
              </p>
              <div className="space-y-2">
                {(["NIVEL 1", "NIVEL 2", "NIVEL 3", "NIVEL 4", "NIVEL 5"] as TicketLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleReclassify(level)}
                    className={`w-full rounded-xl px-3 py-2 text-left text-xs font-semibold ${levelStyles[level]}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
