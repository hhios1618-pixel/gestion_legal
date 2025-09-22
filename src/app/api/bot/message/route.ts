export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

/* ===================== Config ===================== */
const MAX_HISTORY_MESSAGES = Number(process.env.MAX_HISTORY_MESSAGES || 30);
const MAX_INPUT_CHARS = 2000;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const SAVE_LEADS = (process.env.SAVE_LEADS ?? 'true').toLowerCase() === 'true';
const DEDUPE_WINDOW_HOURS = Number(process.env.LEADS_DEDUPE_H || 48);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/* =============== Prompt Comercial LEX =============== */
/** Perfil: vendedor/asesor inicial, breve y humano. */
const SYSTEM_PROMPT = `
Eres "LEX", Analista Legal Virtual de DeudaCero (Chile).
Tu misión: captar datos y transmitir que con DeudaCero SÍ hay salida. Tono breve (máx. 2 líneas), humano y comercial.

SLOTS OBLIGATORIOS (en orden):
1) name
2) contact (email O phone válido)
3) motivo (deuda antigua, cobranza, repactación, DICOM, etc.)
4) acreedor (empresa/banco: Santander, Ripley, etc.)
5) monto (CLP aprox.)
6) región
7) comuna

REGLAS:
- Una sola pregunta por turno. No pidas lo ya dado; reconócelo y avanza.
- Validar contacto: email con formato y/o phone 8–15 dígitos.
- En Chile: usa lenguaje local (DICOM, cobranza, prescripción).
- No prometer plazos ni dar asesoría jurídica específica.
- Cierre positivo y comercial cuando tengas los 7 slots.

PLANTILLAS:
- Falta nombre → "Hola, soy LEX de DeudaCero. ¿Cuál es tu nombre?"
- Falta contacto → "Gracias, {name}. Para que un especialista te contacte, ¿tu email o teléfono?"
- Contacto inválido → "Ese dato parece incompleto. ¿Me confirmas un número 8–15 dígitos o un correo válido?"
- Falta motivo → "Perfecto. ¿Cuál es tu situación? (DICOM, cobranza, deuda antigua, repactación)"
- Falta acreedor → "¿Con qué empresa o banco es la deuda?"
- Falta monto → "¿Aproximadamente de cuánto es el monto? (ej: 10 millones)"
- Falta región/comuna → "¿De qué región y comuna nos contactas?"
- Cierre (todo): 
  "Excelente, {name}. Ya registré tu caso: {motivo} con {acreedor} por ${"{monto}"} en {comuna}, {region}.
   Nuestro equipo de DeudaCero te contactará. Con nosotros sí es posible encontrar una salida."

FORMATO LEAD OBLIGATORIO (UNA sola línea al final del cierre):
<LEAD>{"name":"...","email":"...","phone":"...","motivo":"...","acreedor":"...","monto":"...","region":"...","comuna":"..."}</LEAD>
`;

/* =================== Utilidades ==================== */
function trimTo(s: string, n: number): string {
  return s.length > n ? s.substring(0, n) : s;
}

function normEmail(email?: string | null): string | null {
  const v = (email ?? '').trim().toLowerCase();
  if (!v) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : null;
}

function normPhone(phone?: string | null): string | null {
  const raw = (phone ?? '').replace(/[^\d+]/g, '');
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length < 8 || digits.length > 15) return null;
  return raw;
}

function normText(text?: string | null): string | null {
  const t = (text ?? '').trim();
  return t ? t.replace(/\s+/g, ' ') : null;
}

/** Parseo robusto de monto en CLP (ej: "10 millones", "300.000.000", "15m", "1,2 M"). */
function parseMontoToCLP(input?: string | null): number | null {
  if (!input) return null;
  let s = input.toString().toLowerCase().replace(/\s+/g, ' ').trim();

  // normalizar coma como decimal y eliminar separadores de miles
  s = s.replace(/\./g, '').replace(/,/g, '.'); // 300.000.000 → 300000000 ; 1,2 → 1.2
  const hasMillon = /(millones|millon|m\b)/i.test(s);

  // capturar número principal
  const numMatch = s.match(/(\d+(\.\d+)?)/);
  if (!numMatch) return null;
  const base = parseFloat(numMatch[1]);
  if (isNaN(base) || base <= 0) return null;

  // si dice "millones" o "m", multiplicar por 1e6
  const value = hasMillon ? base * 1_000_000 : base;

  // límites sanos (evitar basura): 1 mil a 100 mil millones
  if (value < 1_000 || value > 100_000_000_000) return null;

  return Math.round(value);
}

function extractLeadBlock(text: string): any | null {
  const m = text.match(/<LEAD>\s*([\s\S]*?)\s*<\/LEAD>/i);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

function sniffSlots(history: { role: string; content: string }[]) {
  const all = history.map(m => m.content).join(' ').toLowerCase();

  const email = normEmail(all.match(/([^\s@]+@[^\s@]+\.[^\s@]+)/)?.[1] ?? null);
  const phone = normPhone(all.match(/(\+?[\d\-\s\(\)]{8,20})/)?.[1] ?? null);
  const name =
    normText(all.match(/(?:mi nombre es|me llamo|soy)\s+([a-záéíóúñ\s]{2,60})/i)?.[1] ?? null);
  const acreedor =
    normText(all.match(/\b(santander|ripley|credicenter|scotiabank|bci|falabella|lider|bbva|itau|cmr|hm|la polar)\b/i)?.[1] ?? null);

  // heurística simple de motivo
  const motivo =
    normText(
      all.match(/\b(dicom|cobranza|repactaci[oó]n|prescripci[oó]n|deuda\s+antigua|demanda|juicio)\b/i)?.[0] ??
      all.match(/deuda(?:\s+de\b|\s+por\b|.*\b[a-záéíóúñ]+)/i)?.[0] ??
      null
    );

  // monto: números grandes o “millones”
  const montoText =
    all.match(/(\d[\d\.\,]*\s*(millones|millon|m\b)?)/i)?.[0] ?? null;
  const monto = parseMontoToCLP(montoText);

  // región/comuna: dejamos al modelo pedir; aquí no hay heurística dura
  return { name, email, phone, motivo, acreedor, monto: monto ?? null };
}

function resolveNext(slots: { name: any; email: any; phone: any; motivo: any; acreedor: any; monto: any; region?: any; comuna?: any; }) {
  if (!slots.name) return 'name';
  if (!slots.email && !slots.phone) return 'contact';
  if (!slots.motivo) return 'motivo';
  if (!slots.acreedor) return 'acreedor';
  if (!slots.monto) return 'monto';
  if (!slots.region) return 'region';
  if (!slots.comuna) return 'comuna';
  return 'close';
}

async function getOrCreateConversation(conversationId?: string | null) {
  if (conversationId) {
    const { data } = await supabase
      .from('conversations')
      .select('id,messages')
      .eq('id', conversationId)
      .single();
    if (data) return { id: data.id as string, messages: (data as any).messages || [] };
  }
  const { data, error } = await supabase
    .from('conversations')
    .insert({ messages: [], status: 'active' })
    .select('id,messages')
    .single();
  if (error || !data) throw new Error('No se pudo crear conversación');
  return { id: data.id as string, messages: (data as any).messages || [] };
}

async function updateConversationMessages(conversationId: string, messages: any[]) {
  const { error } = await supabase
    .from('conversations')
    .update({ messages })
    .eq('id', conversationId);
  if (error) throw new Error('No se pudo actualizar conversación');
}

async function findRecentDuplicate(email: string | null, phone: string | null) {
  if (!email && !phone) return null;
  const since = new Date(Date.now() - DEDUPE_WINDOW_HOURS * 3600 * 1000).toISOString();
  let q = supabase
    .from('leads')
    .select('id')
    .gte('created_at', since)
    .limit(1);
  if (email && phone) q = q.or(`email.eq.${email},phone.eq.${phone}`);
  else if (email) q = q.eq('email', email);
  else if (phone) q = q.eq('phone', phone);
  const { data } = await q;
  return data?.[0] ?? null;
}

async function upsertLead(raw: any, conversationId: string) {
  if (!SAVE_LEADS) return { leadId: null, leadStatus: 'disabled' as const };

  const name = normText(raw?.name);
  const email = normEmail(raw?.email);
  const phone = normPhone(raw?.phone);
  const motivo = normText(raw?.motivo);
  const acreedor = normText(raw?.acreedor);
  const region = normText(raw?.region);
  const comuna = normText(raw?.comuna);
  const monto = parseMontoToCLP(raw?.monto);

  // mínimos para crear (tu negocio puede endurecer esto si quieres)
  if (!name || (!email && !phone)) {
    return { leadId: null, leadStatus: 'skipped' as const };
  }

  const dup = await findRecentDuplicate(email, phone);
  if (dup) return { leadId: dup.id as string, leadStatus: 'deduped' as const };

  const payload: any = {
    name,
    email,
    phone,
    motivo: motivo ?? null,
    acreedor: acreedor ?? null,
    monto: monto ?? null,
    region: region ?? null,
    comuna: comuna ?? null,
    source: 'bot',          // ⬅ consistente con tu tabla/datos
    channel: 'bot',
    conversation_id: conversationId
  };

  const { data, error } = await supabase
    .from('leads')
    .insert(payload)
    .select('id')
    .single();

  if (error || !data) return { leadId: null, leadStatus: 'error' as const };
  return { leadId: data.id as string, leadStatus: 'inserted' as const };
}

/* ====================== Handler ====================== */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, conversationId, systemPrompt, history } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const trimmedMessage = trimTo(message.trim(), MAX_INPUT_CHARS);

    const conversation = await getOrCreateConversation(conversationId);
    let currentHistory: any[] = Array.isArray(history)
      ? history.map((m: any) => ({ role: m.role, content: m.content }))
      : (conversation.messages || []);

    // append turno usuario
    currentHistory.push({ role: 'user', content: trimmedMessage });
    if (currentHistory.length > MAX_HISTORY_MESSAGES) {
      currentHistory = currentHistory.slice(-MAX_HISTORY_MESSAGES);
    }
    await updateConversationMessages(conversation.id, currentHistory);

    // slots conocidos + siguiente paso
    const known = sniffSlots(currentHistory);
    // región/comuna las determina el modelo; las pasamos nulas aquí
    const next = resolveNext({ ...known, region: null, comuna: null });

    const steering = `KnownSlots: ${JSON.stringify({
      name: known.name, email: known.email, phone: known.phone,
      motivo: known.motivo, acreedor: known.acreedor,
      monto: known.monto ? `${known.monto}` : null,
      region: null, comuna: null
    })}\nPróximo paso: ${next}. Pregunta SOLO por ese slot.`;

    const messages = [
      { role: 'system', content: systemPrompt || SYSTEM_PROMPT },
      { role: 'system', content: steering },
      ...currentHistory
    ];

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: messages as any,
      temperature: 0.2,
      max_tokens: 500
    });

    const reply = completion.choices[0]?.message?.content || 'Lo siento, no pude procesar tu solicitud.';

    // guardar respuesta del bot
    currentHistory.push({ role: 'assistant', content: reply });
    if (currentHistory.length > MAX_HISTORY_MESSAGES) {
      currentHistory = currentHistory.slice(-MAX_HISTORY_MESSAGES);
    }
    await updateConversationMessages(conversation.id, currentHistory);

    // procesar LEAD
    const leadBlock = extractLeadBlock(reply);
    let leadId: string | null = null;
    let leadStatus: 'inserted' | 'deduped' | 'skipped' | 'disabled' | 'error' = 'skipped';

    if (leadBlock) {
      const result = await upsertLead(leadBlock, conversation.id);
      leadId = result.leadId;
      leadStatus = result.leadStatus;
    }

    // limpiar respuesta visible
    const cleanReply = reply.replace(/<LEAD>[\s\S]*?<\/LEAD>/, '').trim();

    return NextResponse.json({
      conversationId: conversation.id,
      reply: cleanReply,
      leadId,
      leadStatus
    });

  } catch (e) {
    console.error('[api/bot/message] error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
