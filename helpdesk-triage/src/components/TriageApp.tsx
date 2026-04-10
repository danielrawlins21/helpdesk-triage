import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AgentPanel } from "./agent/AgentPanel";
import { Step1Category } from "./triage/Step1Category";
import { Step2Specialty } from "./triage/Step2Specialty";
import { Step2Impact } from "./triage/Step2Impact";
import { Step3Metrics } from "./triage/Step3Metrics";
import { Step4WorkState } from "./triage/Step4WorkState";
import { Step5Alarms } from "./triage/Step5Alarms";
import { Step6Context } from "./triage/Step6Context";
import { TicketResult } from "./triage/TicketResult";
import { classify } from "../lib/classify";
import { createLocalTicketId, createTicketNumber, getQrSourceKey } from "../lib/qrPayload";
import {
  defaultTriageData,
  type BackgroundType,
  type Classification,
  type Specialty,
  type TicketLevel,
  type TicketRecord,
  type TriageData,
} from "../lib/types";

const triageSchema = z.object({
  categoria: z.string().min(1, "Selecciona una categoría para continuar."),
  especialidad: z.string().min(1, "Selecciona un área para continuar."),
  tiempo: z.string().optional(),
  pain: z.number().min(0).max(10),
  vitals: z.object({
    fc: z.number().min(0).max(250).optional(),
    pa: z.number().min(0).max(300).optional(),
    fr: z.number().min(0).max(80).optional(),
    temp: z.number().min(0).max(45).optional(),
    sat: z.number().min(0).max(100).optional(),
  }),
  estado: z.string().min(1, "Selecciona tu estado mental actual."),
  alarmas: z.record(z.boolean()),
  antecedentes: z.array(z.string()),
});

const totalSteps = 7;

const reclassifiedLevels: Record<TicketLevel, Classification> = {
  "NIVEL 1": {
    level: "NIVEL 1",
    cat: "Emergencia absoluta",
    color: "#DC2626",
    time: "Inmediato",
    msg: "Reclasificado por médico para atención inmediata.",
  },
  "NIVEL 2": {
    level: "NIVEL 2",
    cat: "Emergencia",
    color: "#D97706",
    time: "< 15 min",
    msg: "Reclasificado por médico como caso urgente.",
  },
  "NIVEL 3": {
    level: "NIVEL 3",
    cat: "Urgencia alta",
    color: "#B45309",
    time: "< 60 min",
    msg: "Reclasificado por médico con urgencia alta.",
  },
  "NIVEL 4": {
    level: "NIVEL 4",
    cat: "Urgencia baja",
    color: "#16A34A",
    time: "1-2 horas",
    msg: "Reclasificado por médico para vigilancia.",
  },
  "NIVEL 5": {
    level: "NIVEL 5",
    cat: "No urgente",
    color: "#0284C7",
    time: "Puede esperar",
    msg: "Reclasificado por médico como no urgente.",
  },
};

function toggleArrayValue<T extends string>(list: T[], value: T) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export default function TriageApp() {
  const [activeTab, setActiveTab] = useState<"triage" | "agent">("triage");
  const [currentStep, setCurrentStep] = useState(1);
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [currentTicket, setCurrentTicket] = useState<TicketRecord | null>(null);

  const {
    watch,
    setValue,
    handleSubmit,
    trigger,
    reset,
    formState: { errors },
  } = useForm<TriageData>({
    resolver: zodResolver(triageSchema),
    defaultValues: defaultTriageData,
    mode: "onChange",
  });

  const values = watch();

  function handleVitalChange<K extends keyof TriageData["vitals"]>(
    key: K,
    value: TriageData["vitals"][K],
  ) {
    setValue(
      "vitals",
      {
        ...values.vitals,
        [key]: value,
      },
      { shouldValidate: true },
    );
  }

  async function handleNext() {
    if (currentStep === 1) {
      const valid = await trigger("categoria");
      if (!valid) return;
    }

    if (currentStep === 2) {
      const valid = await trigger("especialidad");
      if (!valid) return;
    }

    if (currentStep === 4) {
      const valid = await trigger("estado");
      if (!valid) return;
    }

    setCurrentStep((step) => Math.min(totalSteps, step + 1));
  }

  function handlePrevious() {
    setCurrentStep((step) => Math.max(1, step - 1));
  }

  function resetPatientFlow() {
    reset(defaultTriageData);
    setCurrentStep(1);
    setCurrentTicket(null);
    setActiveTab("triage");
  }

  function clearTickets() {
    setTickets([]);
  }

  function handleSpecialtySelect(value: Specialty) {
    setValue("especialidad", value, { shouldValidate: true });
    setValue("alarmas", {}, { shouldValidate: true });
  }

  function toggleAlarm(key: string) {
    setValue(
      "alarmas",
      {
        ...values.alarmas,
        [key]: !values.alarmas[key],
      },
      { shouldValidate: true },
    );
  }

  function toggleBackground(value: BackgroundType) {
    if (value === "ninguna") {
      const nextValue: BackgroundType[] = values.antecedentes.includes("ninguna") ? [] : ["ninguna"];
      setValue("antecedentes", nextValue, { shouldValidate: true });
      return;
    }

    const currentWithoutNone = values.antecedentes.filter((background) => background !== "ninguna");
    setValue("antecedentes", toggleArrayValue(currentWithoutNone, value), { shouldValidate: true });
  }

  function updateTicket(id: string, updater: (ticket: TicketRecord) => TicketRecord) {
    let updatedTicket: TicketRecord | null = null;

    setTickets((current) =>
      current.map((ticket) => {
        if (ticket.id !== id) return ticket;
        const nextTicket = updater(ticket);
        updatedTicket = nextTicket;
        return nextTicket;
      }),
    );

    if (updatedTicket?.sourceKey) {
      setCurrentTicket((currentPatientTicket) =>
        currentPatientTicket?.sourceKey === updatedTicket?.sourceKey ? updatedTicket : currentPatientTicket,
      );
    }
  }

  function appendTicket(ticket: TicketRecord) {
    let added = false;

    setTickets((current) => {
      const isDuplicate =
        ticket.sourceKey && current.some((existingTicket) => existingTicket.sourceKey === ticket.sourceKey);

      if (isDuplicate) {
        return current;
      }

      added = true;
      return [ticket, ...current];
    });

    return added;
  }

  function handleConfirm(id: string) {
    updateTicket(id, (ticket) => ({ ...ticket, confirmed: true }));
  }

  function handleReclassify(id: string, level: TicketLevel) {
    updateTicket(id, (ticket) => ({
      ...ticket,
      confirmed: true,
      classification: reclassifiedLevels[level],
    }));
  }

  const onSubmit = handleSubmit((data) => {
    const createdAt = new Date().toISOString();
    const number = createTicketNumber();
    const ticket: TicketRecord = {
      id: createLocalTicketId(),
      number,
      createdAt,
      data,
      classification: classify(data),
      confirmed: false,
      sourceKey: getQrSourceKey({
        ticketNumber: number,
        issuedAt: createdAt,
      }),
    };

    setCurrentTicket(ticket);
    setActiveTab("triage");
  });

  const progress = `${(currentStep / totalSteps) * 100}%`;

  return (
    <main className="px-3 py-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("triage")}
            className={`flex-1 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
              activeTab === "triage" ? "bg-[#1B3A5C] text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Formulario Paciente
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("agent")}
            className={`flex-1 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
              activeTab === "agent" ? "bg-[#1B3A5C] text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Panel Médico
          </button>
        </div>
      </div>

      {activeTab === "agent" ? (
        <div className="mt-5">
          <AgentPanel
            tickets={tickets}
            onClearTickets={clearTickets}
            onConfirm={handleConfirm}
            onReclassify={handleReclassify}
            onImportTicket={appendTicket}
          />
        </div>
      ) : currentTicket ? (
        <div className="mt-5">
          <TicketResult ticket={currentTicket} onReset={resetPatientFlow} />
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900">Tu evaluación</p>
            <button
              type="button"
              onClick={resetPatientFlow}
              className="rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
            >
              Reiniciar
            </button>
          </div>

          <header className="rounded-2xl bg-gradient-to-br from-[#1B3A5C] to-blue-600 px-5 py-4 text-white ticket-shadow">
            <h1 className="text-base font-semibold">Bienvenido - Cuéntanos cómo te sientes</h1>
            <p className="mt-1 text-xs text-white/75">
              Responde con calma. Un médico revisará tu información.
            </p>

            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-white/65">
                <span>Progreso</span>
                <span>
                  Paso {currentStep} / {totalSteps}
                </span>
              </div>
              <div className="mt-2 h-1 rounded-full bg-white/25">
                <div
                  className="h-1 rounded-full bg-white transition-all duration-300"
                  style={{ width: progress }}
                />
              </div>
            </div>
          </header>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 ticket-shadow">
            {currentStep === 1 ? (
              <Step1Category
                value={values.categoria}
                error={errors.categoria?.message}
                onSelect={(value) => setValue("categoria", value, { shouldValidate: true })}
              />
            ) : null}

            {currentStep === 2 ? (
              <Step2Specialty
                value={values.especialidad}
                error={errors.especialidad?.message}
                onSelect={handleSpecialtySelect}
              />
            ) : null}

            {currentStep === 3 ? (
              <Step2Impact
                tiempo={values.tiempo}
                pain={values.pain}
                onTimeChange={(value) => setValue("tiempo", value)}
                onPainChange={(value) => setValue("pain", value)}
              />
            ) : null}

            {currentStep === 4 ? (
              <Step4WorkState
                value={values.estado}
                error={errors.estado?.message}
                onSelect={(value) => setValue("estado", value, { shouldValidate: true })}
              />
            ) : null}

            {currentStep === 5 ? (
              <Step5Alarms
                specialty={values.especialidad}
                value={values.alarmas}
                onToggle={toggleAlarm}
              />
            ) : null}

            {currentStep === 6 ? (
              <Step3Metrics
                metrics={values.vitals}
                errors={{
                  fc: errors.vitals?.fc?.message,
                  pa: errors.vitals?.pa?.message,
                  temp: errors.vitals?.temp?.message,
                  sat: errors.vitals?.sat?.message,
                }}
                onChange={handleVitalChange}
              />
            ) : null}

            {currentStep === 7 ? (
              <Step6Context
                antecedentes={values.antecedentes}
                onToggleBackground={toggleBackground}
              />
            ) : null}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              Atrás
            </button>
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 rounded-full bg-[#1B3A5C] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#152E4A]"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="submit"
                className="flex-1 rounded-full bg-[#1B3A5C] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#152E4A]"
              >
                Enviar al médico
              </button>
            )}
          </div>
        </form>
      )}
    </main>
  );
}
