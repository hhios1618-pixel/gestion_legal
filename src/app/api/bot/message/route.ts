export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Configuración
const MAX_HISTORY_MESSAGES = Number(process.env.MAX_HISTORY_MESSAGES || 30);
const MAX_INPUT_CHARS = 2000;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const SAVE_LEADS = (process.env.SAVE_LEADS ?? 'true').toLowerCase() === 'true';
const DEDUPE_WINDOW_HOURS = Number(process.env.LEADS_DEDUPE_H || 48);

// Clientes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Utilidades
function trimTo(s: string, n: number): string {
  return s.length > n ? s.substring(0, n) : s;
}

function normEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed) ? trimmed : null;
}

function normPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

function normText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

function extractLeadBlock(text: string): any | null {
  const regex = /<LEAD>([\s\S]*?)<\/LEAD>/;
  const match = text.match(regex);
  if (!match) return null;
  
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function sniffSlots(allText: string): { name: string | null; email: string | null; phone: string | null } {
  const text = allText.toLowerCase();
  
  // Buscar email
  const emailMatch = text.match(/([^\s@]+@[^\s@]+\.[^\s@]+)/);
  const email = emailMatch ? normEmail(emailMatch[1]) : null;
  
  // Buscar teléfono
  const phoneMatch = text.match(/(\+?[\d\s\-\(\)]{8,15})/);
  const phone = phoneMatch ? normPhone(phoneMatch[1]) : null;
  
  // Buscar nombre (heurística simple)
  let name: string | null = null;
  const namePatterns = [
    /mi nombre es ([a-záéíóúñ\s]+)/i,
    /me llamo ([a-záéíóúñ\s]+)/i,
    /soy ([a-záéíóúñ\s]+)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      name = normText(match[1]);
      break;
    }
  }
  
  return { name, email, phone };
}

async function getOrCreateConversation(conversationId?: string | null): Promise<{ id: string; messages: any[] }> {
  if (conversationId) {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, messages')
      .eq('id', conversationId)
      .single();
    
    if (!error && data) {
      return { id: data.id, messages: data.messages || [] };
    }
  }
  
  // Crear nueva conversación
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      messages: [],
      status: 'active'
    })
    .select('id, messages')
    .single();
  
  if (error) throw new Error(`Error creating conversation: ${error.message}`);
  
  return { id: data.id, messages: data.messages || [] };
}

async function updateConversationMessages(conversationId: string, messages: any[]): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .update({ messages })
    .eq('id', conversationId);
  
  if (error) throw new Error(`Error updating conversation: ${error.message}`);
}

async function upsertLead(leadData: any, conversationId: string): Promise<string | null> {
  if (!SAVE_LEADS) return null;
  
  const { name, email, phone, motivo } = leadData;
  
  if (!name || (!email && !phone)) return null;
  
  // Verificar dedupe en las últimas 48h
  const dedupeDate = new Date();
  dedupeDate.setHours(dedupeDate.getHours() - DEDUPE_WINDOW_HOURS);
  
  let dedupeQuery = supabase
    .from('leads')
    .select('id')
    .gte('created_at', dedupeDate.toISOString());
  
  if (email && phone) {
    dedupeQuery = dedupeQuery.or(`email.eq.${email},phone.eq.${phone}`);
  } else if (email) {
    dedupeQuery = dedupeQuery.eq('email', email);
  } else if (phone) {
    dedupeQuery = dedupeQuery.eq('phone', phone);
  }
  
  const { data: existingLeads } = await dedupeQuery;
  
  if (existingLeads && existingLeads.length > 0) {
    return existingLeads[0].id;
  }
  
  // Insertar nuevo lead
  const insertData: any = {
    name: normText(name),
    conversation_id: conversationId,
    source: 'web_bot'
  };
  
  if (email) insertData.email = normEmail(email);
  if (phone) insertData.phone = normPhone(phone);
  if (motivo) insertData.motivo = normText(motivo);
  
  const { data, error } = await supabase
    .from('leads')
    .insert(insertData)
    .select('id')
    .single();
  
  if (error) throw new Error(`Error creating lead: ${error.message}`);
  
  return data.id;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, conversationId, systemPrompt, history } = body;
    
    // 1. Validar message
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    const trimmedMessage = trimTo(message.trim(), MAX_INPUT_CHARS);
    
    // 2. Resolver conversationId
    const conversation = await getOrCreateConversation(conversationId);
    
    // 3. Determinar historial a usar
    let currentHistory: any[] = [];
    
    if (history && Array.isArray(history)) {
      currentHistory = history.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
    } else {
      currentHistory = conversation.messages || [];
    }
    
    // 4. Append del turno del usuario
    currentHistory.push({ role: 'user', content: trimmedMessage });
    
    // Limitar historial
    if (currentHistory.length > MAX_HISTORY_MESSAGES) {
      currentHistory = currentHistory.slice(-MAX_HISTORY_MESSAGES);
    }
    
    // Persistir en base de datos
    await updateConversationMessages(conversation.id, currentHistory);
    
    // 5. Preparar prompt de sistema y KnownSlots
    const defaultSystemPrompt = `Eres "LEX", Analista Legal Virtual de DeudaCero (Chile). Tono profesional, empático y claro.
Objetivo de captura (slot-filling, en este orden):
1) Nombre
2) Contacto: email O teléfono (uno basta)
3) Motivo
Reglas duras:
- UNA pregunta por turno, mensajes breves.
- Si un slot ya está en el historial o en KnownSlots, NO lo pidas de nuevo; reconócelo y avanza.
- Nunca repitas la misma pregunta en turnos consecutivos.
- No prometas tiempos ni resultados; no des asesoría legal específica.
- Cuando tengas (nombre + email/telefono), agrega al FINAL del mensaje:
<LEAD>{"name":"...","email":"...","phone":"..."}</LEAD>
- Si también tienes el motivo, inclúyelo en el mismo bloque: {"motivo":"..."}
Lenguaje local de Chile (DICOM, cobranza, prescripción, repactación).`;
    
    const finalSystemPrompt = systemPrompt || defaultSystemPrompt;
    
    // Detectar slots conocidos
    const allHistoryText = currentHistory.map(msg => msg.content).join(' ');
    const knownSlots = sniffSlots(allHistoryText);
    
    const systemPromptWithSlots = `${finalSystemPrompt}

KnownSlots: ${JSON.stringify(knownSlots)}
Política: si un slot está presente en KnownSlots o aparece en el historial, NO lo vuelvas a pedir.`;
    
    // 6. Llamar a OpenAI
    const messages = [
      { role: 'system', content: systemPromptWithSlots },
      ...currentHistory
    ];
    
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: messages as any,
      temperature: 0.2,
      max_tokens: 500,
    });
    
    const reply = completion.choices[0]?.message?.content || '';
    
    // 7. Append reply al historial
    currentHistory.push({ role: 'assistant', content: reply });
    
    // Limitar historial nuevamente
    if (currentHistory.length > MAX_HISTORY_MESSAGES) {
      currentHistory = currentHistory.slice(-MAX_HISTORY_MESSAGES);
    }
    
    // Persistir historial actualizado
    await updateConversationMessages(conversation.id, currentHistory);
    
    // 8. Extraer bloque LEAD
    const leadBlock = extractLeadBlock(reply);
    let leadId: string | null = null;
    
    if (leadBlock && leadBlock.name && (leadBlock.email || leadBlock.phone)) {
      leadId = await upsertLead(leadBlock, conversation.id);
    }
    
    // 9. Responder JSON
    const cleanReply = reply.replace(/<LEAD>[\s\S]*?<\/LEAD>/, '').trim();
    
    return NextResponse.json({
      conversationId: conversation.id,
      reply: cleanReply,
      ...(leadId && { leadId })
    });
    
  } catch (error) {
    console.error('Error in bot message endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} // 👈 ESTA TE FALTA