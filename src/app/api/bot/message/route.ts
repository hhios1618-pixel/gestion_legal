// src/app/api/bot/message/route.ts
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
Eres "LEX", Concierge Legal Virtual de LexMatch (Chile).
Tu misión: captar datos esenciales y transmitir que conectaremos al usuario con estudios jurídicos verificados. Tono breve (máx. 2 líneas), humano y profesional.

SLOTS OBLIGATORIOS (orden):
1) name
2) contact (email O phone válido)
3) case (tipo de asunto legal + comuna/ciudad + urgencia si existe)

REGLAS:
- Una sola pregunta por turno. No pidas lo ya entregado; reconócelo y avanza.
- Valida contacto: email con formato y/o phone 8–15 dígitos (sólo números al almacenar).
- Usa lenguaje local chileno cuando aplique (familia, arriendo, laboral, contratos, litigios, mediación, etc.).
- No prometas plazos ni asesoría jurídica específica.
- Cierre cordial cuando tengas los 3 slots.

PLANTILLAS:
- Falta nombre → "Hola, soy LEX de LexMatch. ¿Cuál es tu nombre?"
- Falta contacto → "Gracias, {name}. Para coordinar con un abogado o estudio, ¿tu email o teléfono?"
- Contacto inválido → "Ese dato parece incompleto. ¿Me confirmas un número 8–15 dígitos o un correo válido?"
- Falta caso → "Perfecto. ¿Qué tipo de asunto legal necesitas resolver? Indica la materia y comuna si puedes."
- Cierre (todo):
  "Excelente, {name}. Registré tu caso legal: {case}. Un coordinador de LexMatch te contactará en breve con estudios especializados."

FORMATO LEAD OBLIGATORIO (UNA sola línea al final del cierre):
<LEAD>{"name":"...","email":"...","phone":"...","caso":"..."}</LEAD>
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
  const raw = (phone ?? '').replace(/[^\d]/g, ''); // sólo dígitos
  if (!raw) return null;
  if (raw.length < 8 || raw.length > 15) return null;
  return raw;
}

function normText(text?: string | null): string | null {
  const t = (text ?? '').trim();
  return t ? t.replace(/\s+/g, ' ') : null;
}

/** Parseo robusto de monto en CLP (ej: "10 millones", "300.000.000", "15m", "1,2 M"). */
function extractLeadBlock(text: string): any | null {
  const m = text.match(/<LEAD>\s*([\s\S]*?)\s*<\/LEAD>/i);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

type Msg = { role: 'system' | 'user' | 'assistant'; content: string };

function looksLikeContact(text: string | null): boolean {
  if (!text) return false;
  const trimmed = text.trim().toLowerCase();
  if (!trimmed) return false;
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(trimmed)) return true;
  const digits = trimmed.replace(/[^\d]/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

const CASE_PROMPT_PATTERNS = [
  /tipo de asunto/i,
  /caso legal/i,
  /qué tipo de asunto/i,
  /qué tipo de caso/i,
  /cu[eé]nt[aé]me/,
  /cu[aé]l es tu caso/i,
  /cu[aé]ntanos/i,
];

function findLastCasePromptIndex(history: Msg[]): number | null {
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    if (msg.role !== 'assistant') continue;
    const lower = msg.content.toLowerCase();
    if (CASE_PROMPT_PATTERNS.some((p) => p.test(lower))) {
      return i;
    }
  }
  return null;
}

function isLikelyCaseDetail(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  if (lower.length < 15) return false;
  if (/(mi nombre es|me llamo|soy\s|hola|buenos d[ií]as|buenas tardes|buenas noches)/.test(lower)) return false;
  if (/(contrato|divorcio|demanda|juicio|arriendo|arrendatario|laboral|despido|empresa|sociedad|familia|herencia|patrimonio|indemnizaci[oó]n|compraventa|propiedad|inmobiliario|mediaci[oó]n|cumplimiento|comercial|marcas|responsabilidad|cobranza|litigio|denuncia|querella|asesor[ií]a|problema|disputa|conflicto|legal)/.test(lower)) return true;
  if (/(necesito|requiero|busco|quiero resolver|tengo un|tengo una|me demandaron|me requiere|me pidieron|me solicitan|estoy enfrentando|me hicieron|me enviaron)/.test(lower)) return true;
  const words = lower.split(/\s+/).filter(Boolean);
  return words.length >= 6;
}

function extractCaseDetail(history: Msg[]): string | null {
  const promptIndex = findLastCasePromptIndex(history);

  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    if (msg.role !== 'user') continue;
    if (promptIndex !== null && i < promptIndex) break;

    const text = normText(msg.content);
    if (!text) continue;
    if (looksLikeContact(text)) continue;
    if (!isLikelyCaseDetail(text)) continue;
    return text;
  }
  return null;
}

function sniffSlots(history: Msg[]) {
  const all = history.map(m => m.content).join(' ');
  const lower = all.toLowerCase();

  const email = normEmail(lower.match(/([^\s@]+@[^\s@]+\.[^\s@]+)/)?.[1] ?? null);
  const phone = normPhone(lower.match(/(\+?[\d\-\s\(\)]{8,20})/)?.[1] ?? null);
  const name = normText(lower.match(/(?:mi\s+nombre\s+es|me\s+llamo|soy)\s+([a-záéíóúñ\s]{2,60})/i)?.[1] ?? null);
  const caseDetail = extractCaseDetail(history);

  return { name, email, phone, caseDetail };
}

function resolveNext(slots: ReturnType<typeof sniffSlots>) {
  if (!slots.name) return 'name';
  if (!slots.email && !slots.phone) return 'contact';
  if (!slots.caseDetail) return 'case';
  return 'close';
}

function slotsComplete(slots: ReturnType<typeof sniffSlots>) {
  return Boolean(slots.name && (slots.email || slots.phone) && slots.caseDetail);
}

/* ============= Supabase helpers (con tu esquema) ============= */
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

async function upsertLeadFromSlots(slots: ReturnType<typeof sniffSlots>, conversationId: string) {
  if (!SAVE_LEADS) return { leadId: null, leadStatus: 'disabled' as const };

  const name = normText(slots.name);
  const email = normEmail(slots.email);
  const phone = normPhone(slots.phone);
  const caseSummary = normText(slots.caseDetail);

  // mínimos para crear
  if (!name || (!email && !phone) || !caseSummary) return { leadId: null, leadStatus: 'skipped' as const };

  // dedupe 48h
  const dup = await findRecentDuplicate(email, phone);
  if (dup) return { leadId: dup.id as string, leadStatus: 'deduped' as const };

  const payload: any = {
    name,
    email,
    phone,
    motivo: caseSummary,
    source: 'bot',
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

    // conversación
    const conversation = await getOrCreateConversation(conversationId);
    let currentHistory: Msg[] = Array.isArray(history)
      ? history.map((m: any) => ({ role: m.role, content: String(m.content ?? '') as string }))
      : (conversation.messages || []);

    // append turno usuario
    currentHistory.push({ role: 'user', content: trimmedMessage });
    if (currentHistory.length > MAX_HISTORY_MESSAGES) {
      currentHistory = currentHistory.slice(-MAX_HISTORY_MESSAGES);
    }
    await updateConversationMessages(conversation.id, currentHistory);

    // slots conocidos + siguiente paso
    const baseSlots = sniffSlots(currentHistory);
    // región/comuna aún no detectadas por heurística => null
    const next = resolveNext(baseSlots);

    // steering para evitar loops
    const steering = `KnownSlots: ${JSON.stringify({
      name: baseSlots.name ?? null,
      email: baseSlots.email ?? null,
      phone: baseSlots.phone ?? null,
      case: baseSlots.caseDetail ?? null
    })}\nPróximo paso: ${next}. Pregunta SOLO por ese slot y no repitas slots ya resueltos.`;

    // LLM
    const messages = [
      { role: 'system', content: systemPrompt || SYSTEM_PROMPT },
      { role: 'system', content: steering },
      ...currentHistory
    ] as Msg[];

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: messages as any,
      temperature: 0.2,
      max_tokens: 500
    });

    let reply = completion.choices[0]?.message?.content || 'Lo siento, no pude procesar tu solicitud.';

    // guardar respuesta del bot
    currentHistory.push({ role: 'assistant', content: reply });
    if (currentHistory.length > MAX_HISTORY_MESSAGES) {
      currentHistory = currentHistory.slice(-MAX_HISTORY_MESSAGES);
    }
    await updateConversationMessages(conversation.id, currentHistory);

    // procesar LEAD desde respuesta
    let leadId: string | null = null;
    let leadStatus: 'inserted' | 'deduped' | 'skipped' | 'disabled' | 'error' = 'skipped';

    let leadBlock = extractLeadBlock(reply);

    // --------- AUTO-LEAD FALLBACK: si el modelo no lo emitió pero ya están los 3 slots ----------
    if (!leadBlock && slotsComplete(baseSlots)) {
      leadBlock = {
        name: baseSlots.name,
        email: baseSlots.email,
        phone: baseSlots.phone,
        caso: baseSlots.caseDetail
      };
      const cierre = `Excelente, ${baseSlots.name}. Registré tu caso legal: ${baseSlots.caseDetail}. Un coordinador de LexMatch te contactará en breve.`;
      reply = `${reply}\n\n${cierre}\n<LEAD>${JSON.stringify(leadBlock)}</LEAD>`;
      currentHistory.push({ role: 'assistant', content: reply });
      await updateConversationMessages(conversation.id, currentHistory);
    }
    // -------------------------------------------------------------------------------------------

    if (leadBlock) {
      const result = await upsertLeadFromSlots(
        {
          name: leadBlock.name ?? baseSlots.name,
          email: leadBlock.email ?? baseSlots.email,
          phone: leadBlock.phone ?? baseSlots.phone,
          caseDetail: leadBlock.caso ?? leadBlock.motivo ?? baseSlots.caseDetail
        },
        conversation.id
      );
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
