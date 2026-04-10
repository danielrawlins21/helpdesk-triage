import type { TicketRecord } from "../../lib/types";

interface TicketResultProps {
  ticket: TicketRecord;
  onReset: () => void;
}

export function TicketResult({ ticket, onReset }: TicketResultProps) {
  return (
    <section className="space-y-5">
      <div className="rounded-3xl bg-slate-900 px-6 py-7 text-white ticket-shadow">
        <p className="text-sm uppercase tracking-widest text-slate-300">Ticket generado</p>
        <h2 className="mt-2 text-4xl font-semibold">#{ticket.number}</h2>
        <div className="mt-5 flex items-center gap-3">
          <span
            className="rounded-full px-3 py-1 text-sm font-semibold"
            style={{ backgroundColor: ticket.classification.color }}
          >
            {ticket.classification.level} {ticket.classification.cat}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm">
            {ticket.classification.time}
          </span>
        </div>
        <p className="mt-5 text-sm text-slate-200">{ticket.classification.msg}</p>
      </div>

      <div className="rounded-2xl bg-white p-5 ticket-shadow">
        <p className="text-sm font-medium text-slate-700">Estado del ticket</p>
        <div className="mt-3 flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              ticket.confirmed
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {ticket.confirmed ? "Confirmado" : "Esperando confirmación del agente..."}
          </span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="mt-5 w-full rounded-lg bg-sky-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
        >
          Nuevo ticket - Reiniciar formulario
        </button>
      </div>
    </section>
  );
}
