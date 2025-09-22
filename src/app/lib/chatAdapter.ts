// Archivo: src/app/lib/chatAdapter.ts
// Reemplaza todo el contenido con este código

type SendOptions = { userEmail?: string; systemPrompt?: string; history?: Array<{role: string; content: string}> };

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
  
  // Preparar el payload según el contrato del route.ts
  const payload: any = {
    message,
    conversationId: conversationId || null,
  };

  // Agregar systemPrompt si viene
  if (opts.systemPrompt) {
    payload.systemPrompt = opts.systemPrompt;
  }

  // Agregar history si viene (esto es lo que usa el route.ts)
  if (opts.history && Array.isArray(opts.history)) {
    payload.history = opts.history;
  }

  const res = await fetch('/api/bot/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Error en la API del bot');

  // Guardar conversationId si es nuevo
  if (json.conversationId && json.conversationId !== conversationId) {
    setConversationId(json.conversationId);
  }
  
  return json as { conversationId: string; reply: string; leadId?: string };
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

// Esta función ya no es necesaria porque el route.ts maneja los leads automáticamente
// Pero la mantenemos para compatibilidad
export async function captureLead(payload: object) {
  console.log('Lead capturado automáticamente por el bot:', payload);
  return { leadId: 'auto-captured' };
}

// ✅ CORREGIDO: Función para marcar conversación como exitosa (success)
export async function saveConversationForReview(conversationId: string | null) {
  if (!conversationId) return;

  try {
    const res = await fetch(`/api/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'success', // ✅ Cambiado a 'success' (valor permitido por el constraint)
      }),
    });

    if (!res.ok) {
      const errorBody = await res.json();
      console.error('Error al marcar conversación como exitosa:', errorBody.error);
    } else {
      console.log(`Conversación ${conversationId} marcada como exitosa.`);
    }
  } catch (error) {
    console.error('Error de red al marcar conversación:', error);
  }
}