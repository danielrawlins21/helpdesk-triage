import { TicketCard } from "./TicketCard";
import type { TicketLevel, TicketRecord } from "../../lib/types";

interface AgentPanelProps {
  tickets: TicketRecord[];
  onConfirm: (id: string) => void;
  onReclassify: (id: string, level: TicketLevel) => void;
}

export function AgentPanel({ tickets, onConfirm, onReclassify }: AgentPanelProps) {
  const pending = tickets.filter((ticket) => !ticket.confirmed).length;

  return (
    <section className="space-y-4">
      <header className="rounded-3xl bg-slate-900 px-5 py-6 text-white">
        <p className="text-sm uppercase tracking-widest text-slate-300">Panel Médico</p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Casos enviados por pacientes</h2>
            <p className="mt-1 text-sm text-slate-300">Clasificación visual en memoria.</p>
          </div>
          <span className="rounded-full bg-sky-900 px-4 py-2 text-sm font-semibold">{pending} pendientes</span>
        </div>
      </header>

      {tickets.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-sm text-slate-600 ticket-shadow">
          Todavía no hay pacientes enviados.
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onConfirm={onConfirm}
              onReclassify={onReclassify}
            />
          ))}
        </div>
      )}
    </section>
  );
}
