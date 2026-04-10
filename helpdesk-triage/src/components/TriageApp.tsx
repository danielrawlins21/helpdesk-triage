import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AgentPanel } from "./agent/AgentPanel";
import { Step1Category } from "./triage/Step1Category";
import { Step2Impact } from "./triage/Step2Impact";
import { Step3Metrics } from "./triage/Step3Metrics";
import { Step4WorkState } from "./triage/Step4WorkState";
import { Step5Alarms } from "./triage/Step5Alarms";
import { Step6Context } from "./triage/Step6Context";
import { TicketResult } from "./triage/TicketResult";
import { classify } from "../lib/classify";
import { defaultTriageData, type Classification, type TicketLevel, type TicketRecord, type TriageData } from "../lib/types";

const triageSchema = z.object({
  categoria: z.string().min(1, "Selecciona una categoría para continuar."),
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
  alarmas: z.object({
    dolor_fuerte: z.boolean(),
    respiracion: z.boolean(),
    sangrado: z.boolean(),
    desmayo: z.boolean(),
    vomito_sangre: z.boolean(),
    paralisis: z.boolean(),
  }),
  antecedentes: z.array(z.string()),
});

const totalSteps = 6;

const reclassifiedLevels: Record<TicketLevel, Classification> = {
  "NIVEL 1": {
    level: "NIVEL 1",
    cat: "Emergencia absoluta",
    color: "#C0392B",
    time: "Inmediato",
    msg: "Reclasificado por médico para atención inmediata.",
  },
  "NIVEL 2": {
    level: "NIVEL 2",
    cat: "Emergencia",
    color: "#E67E22",
    time: "< 15 min",
    msg: "Reclasificado por médico como caso urgente.",
  },
  "NIVEL 3": {
    level: "NIVEL 3",
    cat: "Urgencia alta",
    color: "#D4AC0D",
    time: "< 60 min",
    msg: "Reclasificado por médico con urgencia alta.",
  },
  "NIVEL 4": {
    level: "NIVEL 4",
    cat: "Urgencia baja",
    color: "#27AE60",
    time: "1-2 horas",
    msg: "Reclasificado por médico para vigilancia.",
  },
  "NIVEL 5": {
    level: "NIVEL 5",
    cat: "No urgente",
    color: "#2980B9",
    time: "Puede esperar",
    msg: "Reclasificado por médico como no urgente.",
  },
};

function makeTicketNumber() {
  return String(Math.floor(Math.random() * 900) + 100);
}

function makeTicketId() {
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function toggleArrayValue<T extends string>(list: T[], value: T) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export default function TriageApp() {
  const [activeTab, setActiveTab] = useState<"triage" | "agent">("triage");
  const [currentStep, setCurrentStep] = useState(1);
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null);

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
  const currentTicket = tickets.find((ticket) => ticket.id === currentTicketId) ?? null;

  async function handleNext() {
    if (currentStep === 1) {
      const valid = await trigger("categoria");
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

  function resetFlow() {
    reset(defaultTriageData);
    setCurrentStep(1);
    setCurrentTicketId(null);
    setActiveTab("triage");
  }

  function updateTicket(id: string, updater: (ticket: TicketRecord) => TicketRecord) {
    setTickets((current) => current.map((ticket) => (ticket.id === id ? updater(ticket) : ticket)));
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
    const ticket: TicketRecord = {
      id: makeTicketId(),
      number: makeTicketNumber(),
      createdAt: new Date().toISOString(),
      data,
      classification: classify(data),
      confirmed: false,
    };

    setTickets((current) => [ticket, ...current]);
    setCurrentTicketId(ticket.id);
    setActiveTab("triage");
  });

  const progress = `${(currentStep / totalSteps) * 100}%`;

  return (
    <main className="px-4 py-5">
      <div className="rounded-3xl bg-white/90 p-4 shadow-sm">
        <div className="flex gap-2 rounded-full bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("triage")}
            className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
              activeTab === "triage" ? "bg-sky-900 text-white" : "text-slate-600"
            }`}
          >
            Triage
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("agent")}
            className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
              activeTab === "agent" ? "bg-sky-900 text-white" : "text-slate-600"
            }`}
          >
            Panel Médico
          </button>
        </div>
      </div>

      {activeTab === "agent" ? (
        <div className="mt-5">
          <AgentPanel tickets={tickets} onConfirm={handleConfirm} onReclassify={handleReclassify} />
        </div>
      ) : currentTicket ? (
        <div className="mt-5">
          <TicketResult ticket={currentTicket} onReset={resetFlow} />
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 space-y-5">
          <header className="rounded-3xl bg-slate-900 px-5 py-6 text-white ticket-shadow">
            <p className="text-sm uppercase tracking-widest text-slate-300">Triage médico</p>
            <h1 className="mt-2 text-3xl font-semibold">Clasificación visual de pacientes</h1>
            <p className="mt-3 text-sm text-slate-300">
              Flujo mobile-first de seis pasos para orientar la prioridad de atención.
            </p>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-300">
                <span>Progreso</span>
                <span>
                  Paso {currentStep} / {totalSteps}
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/15">
                <div
                  className="h-2 rounded-full bg-amber-400 transition-all duration-300"
                  style={{ width: progress }}
                />
              </div>
            </div>
          </header>

          <div className="rounded-3xl bg-white p-5 ticket-shadow">
            {currentStep === 1 ? (
              <Step1Category
                value={values.categoria}
                error={errors.categoria?.message}
                onSelect={(value) => setValue("categoria", value, { shouldValidate: true })}
              />
            ) : null}

            {currentStep === 2 ? (
              <Step2Impact
                tiempo={values.tiempo}
                pain={values.pain}
                onTimeChange={(value) => setValue("tiempo", value)}
                onPainChange={(value) => setValue("pain", value)}
              />
            ) : null}

            {currentStep === 3 ? (
              <Step3Metrics
                metrics={values.vitals}
                errors={{
                  fc: errors.vitals?.fc?.message,
                  pa: errors.vitals?.pa?.message,
                  fr: errors.vitals?.fr?.message,
                  temp: errors.vitals?.temp?.message,
                  sat: errors.vitals?.sat?.message,
                }}
                onChange={(key, value) => setValue(`vitals.${key}`, value)}
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
                value={values.alarmas}
                onToggle={(key) => setValue(`alarmas.${key}`, !values.alarmas[key])}
              />
            ) : null}

            {currentStep === 6 ? (
              <Step6Context
                antecedentes={values.antecedentes}
                onToggleBackground={(value) =>
                  setValue("antecedentes", toggleArrayValue(values.antecedentes, value))
                }
              />
            ) : null}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              Atrás
            </button>
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 rounded-lg bg-sky-900 px-4 py-3 text-sm font-semibold text-white"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="submit"
                className="flex-1 rounded-lg bg-sky-900 px-4 py-3 text-sm font-semibold text-white"
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
