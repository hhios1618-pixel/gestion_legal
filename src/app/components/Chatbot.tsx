"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Hola, soy tu asistente. ¿Buscas orientación legal o quieres agendar una evaluación?" }
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, open]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const history = [...msgs, { role: "user", content: text } as Msg];
    setMsgs(history);
    setBusy(true);

    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history })
      });
      const data = await r.json();

      const next: Msg[] = [...history, { role: "assistant", content: data.reply || "…" }];
      // Si detectó intención de cita, agrega CTAs
      if (data?.lead?.intent === "cita") {
        const links: string[] = [];
        if (data.links?.whatsapp) links.push(`👉 Agenda por WhatsApp: ${data.links.whatsapp}`);
        if (data.links?.calendly) links.push(`📅 Agenda en Calendly: ${data.links.calendly}`);
        if (links.length) next.push({ role: "assistant", content: links.join("\n") });
      }
      setMsgs(next);
    } catch (e) {
      setMsgs(m => [...m, { role: "assistant", content: "Perdón, hubo un problema. Intenta de nuevo." }]);
    } finally {
      setBusy(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") send();
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 rounded-full bg-emerald-600 px-5 py-3 text-white shadow-lg hover:bg-emerald-700"
        aria-label="Abrir chat"
      >
        Chat
      </button>

      {/* Ventana */}
      {open && (
        <div className="fixed bottom-20 right-5 z-50 w-[360px] overflow-hidden rounded-2xl border border-zinc-800 bg-neutral-950 text-zinc-100 shadow-2xl">
          <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <div className="text-sm font-semibold">Asesor Legal — DeudasCero</div>
            <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-200">✕</button>
          </header>

          <div className="h-80 space-y-3 overflow-y-auto px-4 py-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`${m.role === "user" ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-100"} max-w-[85%] rounded-2xl px-3 py-2 text-sm`}>
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <footer className="border-t border-zinc-800 p-2">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="Escribe tu mensaje…"
                className="flex-1 rounded-md border border-zinc-700 bg-neutral-900 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
              />
              <button
                onClick={send}
                disabled={busy}
                className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white disabled:opacity-60"
              >
                Enviar
              </button>
            </div>
            <p className="mt-2 px-1 text-[10px] leading-snug text-zinc-400">
              *La información entregada es referencial y cada caso se evalúa de forma particular. No garantiza tiempos ni resultados.
            </p>
          </footer>
        </div>
      )}
    </>
  );
}