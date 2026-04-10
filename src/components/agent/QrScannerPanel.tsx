import { useState } from "react";
import { BarcodeFormat } from "@zxing/library";
import { DecodeHintType, useZxing } from "react-zxing";
import { parseQrPayload } from "../../lib/qrPayload";
import type { TicketRecord } from "../../lib/types";

interface QrScannerPanelProps {
  onImportTicket: (ticket: TicketRecord) => boolean;
}

export function QrScannerPanel({ onImportTicket }: QrScannerPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"neutral" | "success" | "error">("neutral");
  const hints = new Map<DecodeHintType, unknown>();

  hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
  hints.set(DecodeHintType.TRY_HARDER, true);

  const { ref } = useZxing({
    paused: !isOpen,
    hints,
    timeBetweenDecodingAttempts: 100,
    constraints: {
      audio: false,
      video: {
        facingMode: { ideal: "environment" },
      },
    },
    onDecodeResult(result) {
      try {
        const ticket = parseQrPayload(result.getText());
        const added = onImportTicket(ticket);

        if (!added) {
          setMessageTone("error");
          setMessage("Este QR ya fue importado en esta sesión.");
          return;
        }

        setMessageTone("success");
        setMessage(`Ticket #${ticket.number} importado correctamente.`);
        setIsOpen(false);
      } catch {
        setMessageTone("error");
        setMessage("El código escaneado no corresponde a un triage válido.");
      }
    },
    onError() {
      setMessageTone("error");
      setMessage("No se pudo acceder a la cámara. Revisa permisos o prueba desde otro dispositivo.");
    },
  });

  const toneStyles =
    messageTone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : messageTone === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <section className="rounded-3xl bg-white p-5 ring-1 ring-slate-200/80 ticket-shadow">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Escanear QR del paciente</h3>
          <p className="mt-1 text-xs text-slate-500">Abre la cámara y apunta al código generado al final del formulario.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsOpen((current) => !current);
            setMessage(null);
            setMessageTone("neutral");
          }}
          className="rounded-full bg-[#1B3A5C] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#152E4A]"
        >
          {isOpen ? "Cerrar escáner" : "Escanear QR"}
        </button>
      </div>

      {message ? <p className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${toneStyles}`}>{message}</p> : null}

      {isOpen ? (
        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-950">
          <video ref={ref} className="aspect-[4/5] w-full object-cover" muted playsInline />
        </div>
      ) : (
        <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
          Activa el escáner para importar un caso desde el QR del paciente.
        </div>
      )}

      <p className="mt-3 text-xs leading-5 text-slate-500">
        Si no lo detecta, acerca más el código, sube el brillo de la pantalla del paciente y evita reflejos.
      </p>
    </section>
  );
}
