import { TicketCard } from "./TicketCard";
import { QrScannerPanel } from "./QrScannerPanel";
import type { TicketLevel, TicketRecord } from "../../lib/types";

interface AgentPanelProps {
  tickets: TicketRecord[];
  onClearTickets: () => void;
  onConfirm: (id: string) => void;
  onReclassify: (id: string, level: TicketLevel) => void;
  onImportTicket: (ticket: TicketRecord) => boolean;
}

export function AgentPanel({
  tickets,
  onClearTickets,
  onConfirm,
  onReclassify,
  onImportTicket,
}: AgentPanelProps) {
  const pending = tickets.filter((ticket) => !ticket.confirmed).length;

  return (
    <section className="space-y-4">
      <header className="rounded-2xl bg-gradient-to-br from-[#1B3A5C] to-blue-600 px-5 py-4 text-white ticket-shadow">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Panel médico</h2>
            <p className="mt-1 text-xs text-white/70">Casos importados desde el QR del paciente</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">{pending} pendientes</span>
            <button
              type="button"
              onClick={onClearTickets}
              className="rounded-full border border-white/40 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              Limpiar
            </button>
          </div>
        </div>
      </header>

      <QrScannerPanel onImportTicket={onImportTicket} />

      {tickets.length === 0 ? (
        <div className="rounded-3xl bg-white px-6 py-12 text-center text-sm text-slate-600 ring-1 ring-slate-200/80 ticket-shadow">
          <p className="mt-3 font-medium text-slate-700">No hay casos pendientes aún.</p>
          <p className="mt-1 text-xs text-slate-500">Escanea el QR del paciente para cargar el caso en este panel.</p>
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
