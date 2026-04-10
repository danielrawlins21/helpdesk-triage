import { getBadMetricLabels } from "../../lib/classify";
import type { TicketLevel, TicketRecord } from "../../lib/types";

const levelStyles: Record<TicketLevel, string> = {
  P1: "bg-red-700 text-white",
  P2: "bg-amber-500 text-white",
  P3: "bg-yellow-400 text-slate-900",
  P4: "bg-emerald-600 text-white",
};

const categoryMap: Record<string, string> = {
  red: "Red / conectividad",
  hardware: "Hardware / dispositivo",
  software: "Software / aplicación",
  acceso: "Acceso / permisos",
  correo: "Correo / comunicaciones",
  datos: "Base de datos / datos",
  servidor: "Servidor / infraestructura",
  otro: "Otro problema",
};

const timeMap: Record<string, string> = {
  lt1h: "< 1h",
  "1_24h": "1 a 24h",
  gt24h: "> 24h",
};

const stateMap: Record<string, string> = {
  operativo: "Con dificultades",
  parcial: "Parcialmente bloqueado",
  bloqueado: "Completamente detenido",
};

const alarmLabels: Record<string, string> = {
  datos_en_riesgo: "Datos en riesgo",
  produccion_caida: "Producción caída",
  muchos_usuarios: ">10 usuarios",
  cliente_vip: "Cliente VIP",
  mas_24h: ">24h sin resolverse",
  seguridad: "Seguridad",
};

const backgroundLabels: Record<string, string> = {
  configuracion: "Cambio de configuración",
  actualizacion: "Actualización",
  incidente_reciente: "Incidente reciente",
  legacy: "Sistema legacy",
  alta_carga: "Alta carga",
  mantenimiento: "Mantenimiento",
  ninguno: "Ninguno",
  otro: "Otro contexto",
};

interface TicketCardProps {
  ticket: TicketRecord;
  onConfirm: (id: string) => void;
  onReclassify: (id: string, level: TicketLevel) => void;
}

export function TicketCard({ ticket, onConfirm, onReclassify }: TicketCardProps) {
  const activeAlarms = Object.entries(ticket.data.alarmas).filter(([, enabled]) => enabled);
  const badMetrics = getBadMetricLabels(ticket.data.metrics);

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
          <p className="font-medium text-slate-800">Tiempo</p>
          <p>{timeMap[ticket.data.tiempo] ?? "N/D"}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="font-medium text-slate-800">Impacto</p>
          <p>{ticket.data.impact}/10</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="font-medium text-slate-800">Estado</p>
          <p>{stateMap[ticket.data.estado] ?? "N/D"}</p>
        </div>
      </div>

      {badMetrics.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {badMetrics.map((metric) => (
            <span key={metric} className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
              {metric}
            </span>
          ))}
        </div>
      ) : null}

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
          Clasificación IA: {ticket.classification.level} · {ticket.classification.time}
        </p>
        <p className="mt-1 text-slate-300">{ticket.classification.msg}</p>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() => onConfirm(ticket.id)}
          className="flex-1 rounded-lg bg-sky-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
        >
          Confirmar
        </button>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {(["P1", "P2", "P3", "P4"] as TicketLevel[]).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onReclassify(ticket.id, level)}
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${levelStyles[level]}`}
          >
            {level}
          </button>
        ))}
      </div>
    </article>
  );
}
