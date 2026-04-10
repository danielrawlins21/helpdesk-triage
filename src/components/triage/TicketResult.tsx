import type { TicketRecord } from "../../lib/types";
import { WaitChat } from "./WaitChat";
import { TicketQrCode } from "./TicketQrCode";

interface TicketResultProps {
  ticket: TicketRecord;
  onReset: () => void;
}

export function TicketResult({ ticket, onReset }: TicketResultProps) {
  return (
    <section className="space-y-4">
      <div className="rounded-3xl bg-white px-6 py-8 text-center ring-1 ring-slate-200/80 ticket-shadow">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Tu número de ticket</p>
        <h2 className="mt-2 text-6xl font-semibold leading-none text-[#1B3A5C]">#{ticket.number}</h2>
        <div className="mt-4 flex flex-col items-center gap-2">
          <span
            className="rounded-full px-5 py-1.5 text-sm font-semibold"
            style={{
              backgroundColor: `${ticket.classification.color}22`,
              color: ticket.classification.color,
            }}
          >
            {ticket.classification.level} - {ticket.classification.cat}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {ticket.classification.time}
          </span>
        </div>
        <p className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
          {ticket.classification.msg} Un médico revisará y confirmará tu clasificación.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-5 text-center ring-1 ring-slate-200/80 ticket-shadow">
        <p className="text-sm font-medium text-slate-700">Estado del ticket</p>
        <div className="mt-3 flex justify-center">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              ticket.confirmed
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {ticket.confirmed
              ? "Clasificación confirmada por el médico"
              : "Esperando confirmación del médico..."}
          </span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="mt-5 w-full rounded-full border border-red-300 bg-white px-4 py-3 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
        >
          Nuevo paciente - Reiniciar formulario
        </button>
      </div>

      <TicketQrCode ticket={ticket} />

      <WaitChat ticket={ticket} />
    </section>
  );
}
