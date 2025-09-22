"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import {
  extractLeadBlock,
  saveConversationForReview,
  getConversationId,
  setConversationId,
  sendBotMessage,
} from "@/app/lib/chatAdapter";

type Message = { role: "user" | "assistant"; content: string };

// ✅ PROMPT MEJORADO: Enfocado en capturar leads y derivar a ventas
const SYSTEM_PROMPT = `Eres "LEX", Analista Legal Virtual de DeudaCero Chile. Tu objetivo es CAPTURAR LEADS y derivarlos a nuestro equipo comercial.

MISIÓN: Capturar nombre + contacto (email O teléfono) + motivo, luego derivar a ventas.

REGLAS ESTRICTAS:
1) Preséntate como LEX de DeudaCero
2) Mensajes BREVES (máximo 2 líneas)
3) UNA pregunta por turno
4) Prioridad: nombre → contacto → motivo
5) Si ya tienes un dato en el historial, NO lo pidas de nuevo
6) NO des asesoría gratuita - tu trabajo es CAPTURAR y DERIVAR
7) Cuando tengas nombre + contacto, di: "Perfecto [nombre], nuestro equipo te contactará pronto para ayudarte con [motivo]. ¿Prefieres que te llamemos o te escribamos?"

RESPUESTAS TIPO:
- Sin nombre: "Hola, soy LEX de DeudaCero. Para ayudarte mejor, ¿me dices tu nombre?"
- Sin contacto: "Gracias [nombre]. ¿Me das tu email o teléfono para que te contactemos?"
- Sin motivo: "¿Cuál es tu situación con las deudas? ¿DICOM, cobranza, repactación?"
- Con todo: "Perfecto [nombre], te contactaremos pronto. Nuestros especialistas te darán la mejor solución."

Cuando tengas mínimos (nombre + contacto), agrega:
<LEAD>{"name":"...", "email":"...", "phone":"...", "motivo":"..."}</LEAD>`;

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
    { role: "assistant", content: "Hola, soy LEX de DeudaCero. ¿Tienes problemas con deudas o DICOM? ¿Me dices tu nombre para ayudarte?" },
  ]);
  const [unread, setUnread] = useState(0);
  const [showNudge, setShowNudge] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      return () => { clearTimeout(t); clearTimeout(t2); };
    }
  }, []);

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
      if (e.key === "Escape" && open) setOpen(false);
      if (e.key.toLowerCase() === "l" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleOpen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  function toggleOpen() {
    setOpen((v) => {
      const next = !v;
      if (next) {
        setUnread(0);
        setShowNudge(false);
        sessionStorage.setItem("lex_seen", "1");
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      return next;
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
      // Usar sendBotMessage del chatAdapter corregido
      const result = await sendBotMessage(text, {
        systemPrompt: SYSTEM_PROMPT,
        history: newHistory.map(m => ({ role: m.role, content: m.content }))
      });

      const reply = result.reply || "";
      
      setIsTyping(false);
      setMsgs([...newHistory, { role: "assistant", content: reply }]);

      // ✅ MEJORADO: Marcar como completada solo si se capturó un lead
      if (result.leadId) {
        console.log('✅ Lead capturado exitosamente:', result.leadId);
        await saveConversationForReview(result.conversationId);
      }

    } catch (e) {
      console.error('Error en el chat:', e);
      setIsTyping(false);
      setMsgs((curr) => [
        ...curr,
        { role: "assistant", content: "Disculpa, tuve un problema técnico. ¿Puedes intentar de nuevo?" },
      ]);
    }
  }

  return (
    <>
      {/* Nudge teaser */}
      {showNudge && (
        <div className="fixed bottom-24 right-5 z-[60] max-w-[260px] animate-fade-in-up">
          <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-[0_8px_24px_rgba(2,6,23,0.12)]">
            <div className="mb-1 font-semibold text-slate-900">¿Problemas con deudas?</div>
            <div className="text-slate-600">
              <span className="font-medium text-emerald-700">LEX</span> te ayuda a salir de DICOM y negociar tus deudas.
            </div>
          </div>
        </div>
      )}

      {/* Botón launcher */}
      <button
        onClick={toggleOpen}
        aria-label="Abrir chat con LEX"
        className="fixed bottom-5 right-5 z-[65] group flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-3 text-white shadow-xl ring-1 ring-emerald-400/30 transition hover:brightness-110 hover:scale-[1.02] animate-lex-pulse"
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
          ¿Deudas? <span className="hidden sm:inline">¡Te ayudamos!</span>
        </span>
      </button>

      {/* Ventana de chat */}
      {open && (
        <div className="fixed bottom-20 right-5 z-[70] flex h-[min(640px,calc(100vh-120px))] w-[min(420px,calc(100vw-40px))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-[0_16px_60px_rgba(2,6,23,0.25)] animate-fade-in-up sm:h-[min(680px,calc(100vh-120px))] sm:w-[420px] max-sm:fixed max-sm:inset-0 max-sm:rounded-none max-sm:border-0">
          {/* Header */}
          <header className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow ring-1 ring-emerald-300/40">
                <MessageCircle size={18} />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">LEX — DeudaCero Chile</div>
                <div className="text-[11px] text-slate-500">Especialistas en deudas y DICOM</div>
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
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`} aria-live="polite">
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm shadow-sm ${m.role === "user" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-900"}`}>
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
                className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-emerald-600"
                aria-label="Mensaje para LEX"
              />
              <button
                onClick={send}
                disabled={isTyping || !input.trim()}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
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
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.25s ease-out; }

        @keyframes lex-pulse {
          0%   { transform: translateZ(0) scale(1);   box-shadow: 0 12px 28px rgba(4,120,87,0.25); }
          50%  { transform: translateZ(0) scale(1.03); box-shadow: 0 16px 38px rgba(4,120,87,0.35); }
          100% { transform: translateZ(0) scale(1);   box-shadow: 0 12px 28px rgba(4,120,87,0.25); }
        }
        .animate-lex-pulse { animation: lex-pulse 2.6s ease-in-out infinite; }
      `}</style>
    </>
  );
}