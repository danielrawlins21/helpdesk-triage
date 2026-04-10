import { useEffect, useState } from "react";
import * as QRCode from "qrcode";
import { serializeQrPayload } from "../../lib/qrPayload";
import type { TicketRecord } from "../../lib/types";

interface TicketQrCodeProps {
  ticket: TicketRecord;
}

export function TicketQrCode({ ticket }: TicketQrCodeProps) {
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function generateQr() {
      try {
        const nextQrSrc = await QRCode.toDataURL(serializeQrPayload(ticket), {
          errorCorrectionLevel: "L",
          margin: 2,
          width: 360,
        });

        if (!cancelled) {
          setQrSrc(nextQrSrc);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setQrSrc(null);
          setError("No pudimos generar el QR del ticket.");
        }
      }
    }

    generateQr();

    return () => {
      cancelled = true;
    };
  }, [ticket]);

  return (
    <div className="rounded-3xl bg-white p-5 text-center ring-1 ring-slate-200/80 ticket-shadow">
      <p className="text-sm font-semibold text-slate-800">Código QR para el médico</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        Muéstralo al personal médico para importar tu triage en su panel.
      </p>

      <div className="mt-4 flex justify-center">
        {qrSrc ? (
          <img
            src={qrSrc}
            alt={`QR del ticket ${ticket.number}`}
            className="h-72 w-72 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
          />
        ) : (
          <div className="flex h-72 w-72 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 text-sm text-slate-500">
            {error ?? "Generando código QR..."}
          </div>
        )}
      </div>

      <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
        El QR contiene el resumen completo de tu formulario y la clasificación inicial para que el médico la revise.
      </p>
    </div>
  );
}
