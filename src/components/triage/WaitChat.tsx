import { useEffect, useRef, useState } from "react";
import {
  buildChatPatientContext,
  chatProviderOptions,
  getChatFallbackMessage,
  getWelcomeMessage,
  suggestionsByLevel,
  type ChatProvider,
  type ChatMessage,
  type ChatPatientContext,
  type ChatResponse,
} from "../../lib/chat";
import type { TicketRecord } from "../../lib/types";

type ChatStatus = "connecting" | "online" | "typing" | "offline";

interface WaitChatProps {
  ticket: TicketRecord;
}

const proxyUrls: Record<ChatProvider, string> = {
  ollama: import.meta.env.VITE_OLLAMA_CHAT_PROXY_URL ?? "http://127.0.0.1:8787/api/chat",
  bedrock: import.meta.env.VITE_BEDROCK_CHAT_PROXY_URL ?? "",
};

const defaultProvider = (import.meta.env.VITE_CHAT_PROVIDER as ChatProvider | undefined) ?? "ollama";

function getProviderLabel(provider: ChatProvider) {
  return chatProviderOptions.find((option) => option.value === provider)?.label ?? provider;
}

function getHealthUrl(chatUrl: string) {
  const url = new URL(chatUrl, window.location.origin);
  url.pathname = url.pathname.replace(/\/api\/chat$/, "/api/health");
  return url.toString();
}

function getStatusLabel(status: ChatStatus, model: string | null, provider: ChatProvider) {
  const providerLabel = getProviderLabel(provider);

  if (status === "connecting") return "Conectando con Ollama...";
  if (status === "typing") return "Escribiendo...";
  if (status === "offline") return `${providerLabel} no disponible`;
  return model ? `En línea · ${providerLabel} · ${model}` : `En línea · ${providerLabel}`;
}

async function requestChatReply(chatUrl: string, messages: ChatMessage[], context: ChatPatientContext) {
  const response = await fetch(chatUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      context,
      messages: messages.slice(-10),
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed with status ${response.status}`);
  }

  return response.json() as Promise<ChatResponse>;
}

async function requestChatHealth(chatUrl: string) {
  const response = await fetch(getHealthUrl(chatUrl));

  if (!response.ok) {
    throw new Error(`Chat health request failed with status ${response.status}`);
  }

  return response.json() as Promise<{ model: string }>;
}

export function WaitChat({ ticket }: WaitChatProps) {
  const context = buildChatPatientContext(ticket);
  const [provider, setProvider] = useState<ChatProvider>(defaultProvider);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      role: "assistant",
      content: getWelcomeMessage(ticket.classification.level, ticket.data.pain),
    },
  ]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<ChatStatus>("connecting");
  const [model, setModel] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const chatUrl = proxyUrls[provider];
  const providerConfigured = chatUrl.length > 0;

  const suggestions = suggestionsByLevel[ticket.classification.level];
  const isBusy = status === "typing" || status === "connecting";
  const canSend = status === "online" && providerConfigured;

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: getWelcomeMessage(ticket.classification.level, ticket.data.pain),
      },
    ]);
    setInput("");
    setStatus("connecting");
    setModel(null);
  }, [ticket.id, ticket.classification.level, ticket.data.pain]);

  async function checkHealth() {
    setStatus("connecting");

    if (!providerConfigured) {
      setModel(null);
      setStatus("offline");
      return;
    }

    try {
      const data = await requestChatHealth(chatUrl);
      setModel(data.model);
      setStatus("online");
    } catch {
      setModel(null);
      setStatus("offline");
    }
  }

  useEffect(() => {
    let active = true;

    async function checkInitialHealth() {
      if (!providerConfigured) {
        if (!active) return;
        setModel(null);
        setStatus("offline");
        return;
      }

      try {
        const data = await requestChatHealth(chatUrl);
        if (!active) return;
        setModel(data.model);
        setStatus("online");
      } catch {
        if (!active) return;
        setModel(null);
        setStatus("offline");
      }
    }

    void checkInitialHealth();

    return () => {
      active = false;
    };
  }, [ticket.id, chatUrl, providerConfigured]);

  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || !canSend) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setStatus("typing");

    try {
      const data = await requestChatReply(chatUrl, nextMessages, context);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.reply || getChatFallbackMessage(),
        },
      ]);
      setModel(data.model);
      setStatus("online");
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: getChatFallbackMessage(),
        },
      ]);
      setModel(null);
      setStatus("offline");
    }
  }

  function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/80 ticket-shadow">
      <header className="flex items-center gap-3 bg-gradient-to-br from-[#1B3A5C] to-blue-600 px-4 py-3 text-white">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10 text-xs font-semibold">
          AI
        </div>
        <div>
          <h3 className="text-sm font-semibold">Asistente de espera</h3>
          <p className="mt-0.5 text-[11px] text-white/70">{getStatusLabel(status, model, provider)}</p>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor={`chat-provider-${ticket.id}`} className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Proveedor
            </label>
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
              Configuración
            </span>
          </div>

          <select
            id={`chat-provider-${ticket.id}`}
            value={provider}
            onChange={(event) => {
              setProvider(event.target.value as ChatProvider);
              setStatus("connecting");
              setModel(null);
            }}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {chatProviderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <p className="text-xs leading-5 text-slate-500">
            {chatProviderOptions.find((option) => option.value === provider)?.description}
          </p>

          {!providerConfigured ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
              Este proveedor no tiene un proxy configurado todavía. Define la variable de entorno correspondiente
              para poder usarlo.
            </p>
          ) : null}
        </div>
      </div>

      <div ref={messagesRef} className="max-h-80 space-y-3 overflow-y-auto bg-slate-50 px-3 py-4">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-2 text-sm leading-6 ${
                message.role === "user"
                  ? "rounded-br-md bg-[#1B3A5C] text-white"
                  : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {status === "typing" ? (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
              Pensando una respuesta breve...
            </div>
          </div>
        ) : null}

        {status === "offline" ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
            No puedo conectar con el proveedor seleccionado. Ejecuta <span className="font-semibold">npm run dev:chat</span> o levanta <span className="font-semibold">npm run chat:proxy</span> y vuelve a intentar.
          </div>
        ) : null}
      </div>

      <div className="space-y-3 border-t border-slate-200 bg-white px-3 py-3">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={!canSend}
              onClick={() => void sendMessage(suggestion)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            disabled={!canSend}
            onChange={(event) => setInput(event.target.value)}
            placeholder={status === "offline" ? "Proxy local no disponible" : "Escribe cómo te sientes..."}
            className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
          />
          {status === "offline" ? (
            <button
              type="button"
              onClick={() => void checkHealth()}
              className="rounded-full bg-[#1B3A5C] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#152E4A]"
            >
              Reintentar
            </button>
          ) : (
            <button
              type="submit"
              disabled={isBusy || input.trim().length === 0}
              className="rounded-full bg-[#1B3A5C] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#152E4A] disabled:opacity-50"
            >
              Enviar
            </button>
          )}
        </form>
      </div>
    </section>
  );
}
