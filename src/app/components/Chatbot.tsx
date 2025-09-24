// File: src/app/components/Chatbot.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { sendBotMessage, saveConversationForReview } from "@/app/lib/chatAdapter";

type Message = { role: "user" | "assistant"; content: string };

/**
 * PROMPT COMERCIAL ROBUSTO
 * - No reinicia el saludo una vez comenzada la conversación
 * - 1 pregunta por turno, máximo 2 líneas
 * - Valida email/teléfono
 * - Cierra y emite <LEAD> cuando ya tiene nombre + contacto + caso legal
 */
const SYSTEM_PROMPT = `Eres "LEX", Concierge Legal Virtual de LexMatch (Chile). Tu misión es captar leads y conectar a cada persona con el estudio jurídico más adecuado.

SLOTS OBLIGATORIOS (en este orden):
1) nombre
2) contacto (email válido O teléfono válido)
3) caso (breve con materia legal, comuna/ciudad y urgencia si existe)

REGLAS DURAS:
- Presentación sólo en el primer turno. Nunca vuelvas a decir "Hola, soy LEX..." una vez iniciado.
- UNA pregunta por turno. Mensajes breves (máx. 2 líneas).
- Si un slot ya está en el historial, NO lo repitas: reconoce y avanza al siguiente.
- Valida contacto:
  • email: formato válido.
  • teléfono: sólo dígitos (ignora espacios/guiones), 8–15 dígitos. Si es inválido, pide corrección o el otro canal.
- No prometas plazos ni resultados específicos.
- Nada de "tuve un problema técnico" salvo que el usuario lo exija.
- Cuando tengas (nombre + contacto válido + caso), CIERRA y EMITE EXACTAMENTE al FINAL:
<LEAD>{"name":"NOMBRE","email":"EMAIL_o_null","phone":"PHONE_o_null","caso":"CASO"}</LEAD>

TONO COMERCIAL (sin prometer):
- "Es muy posible que podamos ayudarte; coordinaremos con un abogado o estudio verificado de nuestra red." 
- Si falta contacto: "Gracias, [NOMBRE]. ¿Cuál es tu email o teléfono para coordinar?"
- Si falta caso: "¿Qué tipo de asunto legal necesitas resolver? (ej: arriendo, familia, laboral) Indica comuna y urgencia si puedes." 
- Si contacto inválido: "Ese contacto no parece válido. ¿Puedes confirmarlo o compartir el otro canal?"

IMPORTANTE:
- No generes el bloque <LEAD> hasta tener los 3 slots.
- Una vez emitas <LEAD>, no sigas preguntando; finaliza con el cierre comercial.`;

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="bg-zinc-800 text-zinc-100 max-w-[85%] rounded-2xl px-4 py-3 text-sm flex items-center space-x-2">
      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-pulse [animation-delay:0.1s]" />
      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-pulse [animation-delay:0.2s]" />
      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-pulse [animation-delay:0.3s]" />
    </div>
  </div>
);

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [msgs, setMsgs] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hola, soy LEX de LexMatch. ¿Me dices tu nombre para ayudarte a coordinar con el equipo legal correcto?",
    },
  ]);
  const [unread, setUnread] = useState(0);
  const [showNudge, setShowNudge] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingMatterRef = useRef<string | null>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, isTyping, open]);

  // Nudge primera visita
  useEffect(() => {
    const seen = sessionStorage.getItem("lex_seen");
    if (!seen) {
      const t = setTimeout(() => setShowNudge(true), 1000);
      const t2 = setTimeout(() => setShowNudge(false), 9000);
      return () => {
        clearTimeout(t);
        clearTimeout(t2);
      };
    }
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<string | undefined>;
      if (custom.detail) {
        pendingMatterRef.current = custom.detail;
        try {
          localStorage.setItem('LEX_PREFILL', custom.detail);
        } catch {}
      }
      openChatWindow();
    };
    window.addEventListener('open-lex-chat', handler as EventListener);
    return () => window.removeEventListener('open-lex-chat', handler as EventListener);
  }, []);

  useEffect(() => {
    if (open) {
      try {
        const stored = localStorage.getItem('LEX_PREFILL');
        if (stored) {
          pendingMatterRef.current = stored;
        }
      } catch {}
      if (pendingMatterRef.current) {
        const matter = pendingMatterRef.current;
        const newGreeting = `Hola, soy LEX de LexMatch. Veo que necesitas apoyo en ${matter}. ¿Me dices tu nombre para ayudarte a coordinar el caso?`;
        setMsgs([{ role: 'assistant', content: newGreeting }]);
        pendingMatterRef.current = null;
        try {
          localStorage.removeItem('LEX_PREFILL');
        } catch {}
      }
    }
  }, [open]);

  // Badge no leídos
  useEffect(() => {
    if (!open && msgs.length > 0) {
      const last = msgs[msgs.length - 1];
      if (last.role === "assistant") setUnread((u) => u + 1);
    }
  }, [msgs, open]);

  // Hotkeys
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = typeof e.key === "string" ? e.key : "";
      if (!key) return;
      if (key === "Escape" && open) setOpen(false);
      if ((key === "l" || key === "L") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleOpen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  function openChatWindow() {
    setOpen((prev) => {
      if (prev) return prev;
      setUnread(0);
      setShowNudge(false);
      sessionStorage.setItem("lex_seen", "1");
      setTimeout(() => inputRef.current?.focus(), 50);
      return true;
    });
  }

  function toggleOpen() {
    setOpen((v) => {
      if (v) return false;
      setUnread(0);
      setShowNudge(false);
      sessionStorage.setItem("lex_seen", "1");
      setTimeout(() => inputRef.current?.focus(), 50);
      return true;
    });
  }

  async function send() {
    const text = input.trim();
    if (!text || isTyping) return;

    setInput("");
    const userMessage: Message = { role: "user", content: text };
    const newHistory = [...msgs, userMessage];
    setMsgs(newHistory);
    setIsTyping(true);

    try {
      const { reply, conversationId, leadId, leadStatus } = await sendBotMessage(text, {
        systemPrompt: SYSTEM_PROMPT,
        history: newHistory.map((m) => ({ role: m.role, content: m.content })),
      });

      setIsTyping(false);
      setMsgs([...newHistory, { role: "assistant", content: reply || "" }]);

      // Marcamos success solo si realmente insertamos un lead nuevo o dedupe válido
      if ((leadStatus === "inserted" || leadStatus === "deduped") && conversationId) {
        await saveConversationForReview(conversationId, "success");
        if (leadId) {
          console.log("✅ Lead guardado:", leadId, "| status:", leadStatus);
        }
      }
    } catch (e) {
      console.error("Error en el chat:", e);
      setIsTyping(false);
      setMsgs((curr) => [
        ...curr,
        {
          role: "assistant",
          content:
            "Disculpa, tuve un problema. ¿Puedes repetir tu último mensaje o compartir tu email/teléfono para ayudarte?",
        },
      ]);
    }
  }

  return (
    <>
      {/* Nudge teaser */}
      {showNudge && (
        <div className="fixed bottom-24 right-5 z-[60] max-w-[260px] animate-fade-in-up">
          <div className="rounded-2xl border border-[#dbe3ff] bg-white px-4 py-3 text-sm text-slate-800 shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
            <div className="mb-1 font-semibold text-slate-900">¿Necesitas coordinación legal?</div>
            <div className="text-slate-600">
              <span className="font-medium text-[#3358ff]">LEX</span> se encarga de conectar y dar seguimiento con estudios verificados.
            </div>
          </div>
        </div>
      )}

      {/* Launcher */}
      <button
        onClick={toggleOpen}
        aria-label="Abrir chat con LEX"
        className="fixed bottom-5 right-5 z-[65] group flex items-center gap-3 rounded-full bg-gradient-to-r from-[#1f2d5c] via-[#3358ff] to-[#2bb8d6] px-5 py-3 text-white shadow-xl ring-1 ring-[#3358ff]/40 transition hover:brightness-[1.05] hover:scale-[1.02] animate-lex-pulse"
      >
        <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
          <MessageCircle size={22} />
          <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/30 group-hover:ring-white/50" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-rose-600 px-1.5 text-[10px] font-semibold leading-5">
              {unread}
            </span>
          )}
        </span>
        <span className="relative z-10 text-sm font-semibold tracking-tight">
          Equipo LexMatch
        </span>
      </button>

      {/* Ventana */}
      {open && (
        <div className="fixed bottom-20 right-5 z-[70] flex h-[min(640px,calc(100vh-120px))] w-[min(420px,calc(100vw-40px))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-[0_16px_60px_rgba(2,6,23,0.25)] animate-fade-in-up sm:h-[min(680px,calc(100vh-120px))] sm:w-[420px] max-sm:fixed max-sm:inset-0 max-sm:rounded-none max-sm:border-0">
          {/* Header */}
          <header className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#3358ff] to-[#2bb8d6] text-white shadow ring-1 ring-[#3358ff]/40">
                <MessageCircle size={18} />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">LEX — LexMatch Chile</div>
                <div className="text-[11px] text-slate-500">Coordinación y seguimiento garantizados</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Cerrar chat"
            >
              <X size={18} />
            </button>
          </header>

          {/* Conversación */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 bg-white">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                aria-live="polite"
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-[#1f2d5c] via-[#3358ff] to-[#2bb8d6] text-white"
                      : "bg-[#eef1f9] text-slate-900"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <footer className="flex-shrink-0 border-t border-slate-200 bg-white p-2">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Escribe tu consulta…"
                className="flex-1 rounded-md border border-[#dbe3ff] bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-[#3358ff]"
                aria-label="Mensaje para LEX"
              />
              <button
                onClick={send}
                disabled={isTyping || !input.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1f2d5c] via-[#3358ff] to-[#2bb8d6] px-3 py-2 text-sm font-semibold text-white shadow transition hover:scale-105 disabled:opacity-50"
              >
                <Send size={18} />
                Enviar
              </button>
            </div>
          </footer>
        </div>
      )}

      {/* Animaciones globales */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.25s ease-out;
        }

        @keyframes lex-pulse {
          0% {
            transform: translateZ(0) scale(1);
            box-shadow: 0 14px 36px rgba(51, 88, 255, 0.28);
          }
          50% {
            transform: translateZ(0) scale(1.04);
            box-shadow: 0 18px 44px rgba(43, 184, 214, 0.32);
          }
          100% {
            transform: translateZ(0) scale(1);
            box-shadow: 0 14px 36px rgba(51, 88, 255, 0.28);
          }
        }
        .animate-lex-pulse {
          animation: lex-pulse 2.6s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
