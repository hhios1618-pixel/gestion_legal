// Archivo: src/app/lib/chatAdapter.ts
// Reemplaza todo el contenido con este código

type SendOptions = { userEmail?: string; systemPrompt?: string };

const KEY = 'dc_conversation_id';

export function getConversationId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEY);
}

export function setConversationId(id: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, id);
}

export function resetConversation() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}

export async function sendBotMessage(message: string, opts: SendOptions = {}) {
  const conversationId = getConversationId();
  const res = await fetch('/api/bot/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversationId,
      userEmail: opts.userEmail ?? null,
      message,
      systemPrompt: opts.systemPrompt ?? null,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Error en la API del bot');

  if (json.conversationId && json.conversationId !== conversationId) {
    setConversationId(json.conversationId);
  }
  return json as { conversationId: string; reply: string };
}

export function extractLeadBlock(text: string): object | null {
  const match = text.match(/<LEAD>([\s\S]*?)<\/LEAD>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

export async function captureLead(payload: object) {
  const conversationId = getConversationId();
  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversationId,
      ...payload,
      channel: 'Chatbot', 
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Error al capturar el lead');
  return json as { leadId: string };
}


// --- FUNCIÓN CORREGIDA Y FINAL ---
// Marca una conversación para que un humano la revise
export async function saveConversationForReview(conversationId: string | null) {
  if (!conversationId) return;

  // Ahora llama a la nueva y correcta ruta de API
  const res = await fetch(`/api/conversations/${conversationId}`, {
    method: 'PATCH', // Usamos PATCH para actualizar
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'needs_review', // Enviamos el nuevo estado
    }),
  });

  if (!res.ok) {
    // El error de la consola ahora será mucho más específico si algo falla
    const errorBody = await res.json();
    console.error('Error al marcar conversación para revisión:', errorBody.error);
  } else {
    console.log(`Conversación ${conversationId} marcada para revisión.`);
  }
}