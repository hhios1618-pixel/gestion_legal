import { supabaseAdmin } from '@/app/lib/supabaseAdmin';
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `
Eres un asistente virtual experto en calificación de clientes para "DeudasCero", una firma de abogados.
Tu objetivo es recolectar la información esencial de un cliente potencial de forma amable y conversacional.
No eres un robot, habla de forma natural.

Debes obtener la siguiente información:
1.  **name**: Nombre del cliente.
2.  **contact**: Ya sea un email o un número de teléfono (phone).
3.  **motivo**: Una breve descripción de su problema de deudas.

PROCESO OBLIGATORIO:
1.  Conversa con el usuario hasta que tengas, como mínimo, su nombre, un método de contacto y el motivo.
2.  Una vez que tengas esa información, tu SIGUIENTE respuesta DEBE contener dos partes:
    a) Un mensaje de confirmación para el usuario (ej: "¡Perfecto, Juan! Gracias por la información. Un agente de nuestro equipo te contactará a la brevedad para analizar tu caso.").
    b) INMEDIATAMENTE DESPUÉS, un bloque de código especial para el sistema, NO visible para el usuario, que contenga los datos recolectados en formato JSON. Este bloque DEBE estar encerrado entre las etiquetas <LEAD> y </LEAD>.

Ejemplo de cómo debe ser tu respuesta final:
"¡Perfecto, Juan! Gracias por la información. Un agente de nuestro equipo te contactará a la brevedad para analizar tu caso."
<LEAD>
{
  "name": "Juan Pérez",
  "email": "juan.perez@email.com",
  "phone": null,
  "motivo": "Tengo una deuda con una casa comercial y me están llamando mucho."
}
</LEAD>

NUNCA preguntes por todos los datos a la vez. Hazlo paso a paso en la conversación.
`;

// Tipado de historial
type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

// Type guard de mensajes
function isValidMessageHistory(messages: unknown): messages is ChatMessage[] {
  return (
    Array.isArray(messages) &&
    messages.every(
      (msg) =>
        typeof msg === 'object' &&
        msg !== null &&
        'role' in msg &&
        'content' in msg &&
        typeof (msg as any).role === 'string' &&
        typeof (msg as any).content === 'string'
    )
  );
}

export async function POST(req: Request) {
  try {
    const { message, conversationId } = await req.json();

    let conversationHistory: ChatMessage[] = [{ role: 'system', content: systemPrompt }];
    let currentConversationId: string | null = conversationId ?? null;

    if (currentConversationId) {
      const { data, error } = await supabaseAdmin
        .from('conversations')
        .select('messages')
        .eq('id', currentConversationId)
        .single();

      if (!error && data && isValidMessageHistory(data.messages)) {
        conversationHistory = [...conversationHistory, ...data.messages];
      }
    }

    conversationHistory.push({ role: 'user', content: message });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: conversationHistory,
    });

    const botReply = completion.choices[0]?.message?.content || 'No pude procesar tu solicitud.';

    conversationHistory.push({ role: 'assistant', content: botReply });

    // Persistir (sin el system prompt)
    const messagesToStore = conversationHistory.slice(1);

    if (!currentConversationId) {
      const { data, error } = await supabaseAdmin
        .from('conversations')
        .insert({ messages: messagesToStore as any, status: 'active' })
        .select('id')
        .single();

      if (!error && data?.id) currentConversationId = data.id;
    } else {
      await supabaseAdmin
        .from('conversations')
        .update({ messages: messagesToStore as any })
        .eq('id', currentConversationId);
    }

    return NextResponse.json({
      reply: botReply,
      conversationId: currentConversationId,
    });
  } catch (_error) { // <- sin warning de var sin usar
    console.error('[BOT API ERROR]', _error);
    const msg = _error instanceof Error ? _error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}