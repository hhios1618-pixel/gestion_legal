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
- Validar contacto: email con formato y/o phone 8–15 dígitos (sólo números al almacenar).
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
function parseMontoToCLP(input?: string | null): number | null {
  if (!input) return null;
  let s = input.toString().toLowerCase().trim();

  // normalizar separadores
  s = s.replace(/\./g, '').replace(/,/g, '.'); // 300.000.000 → 300000000 ; 1,2 → 1.2
  const hasMillon = /(millones|millon|m\b)/i.test(s);

  const numMatch = s.match(/(\d+(\.\d+)?)/);
  if (!numMatch) return null;
  const base = parseFloat(numMatch[1]);
  if (isNaN(base) || base <= 0) return null;

  const value = hasMillon ? base * 1_000_000 : base;

  // límites sanos
  if (value < 1_000 || value > 100_000_000_000) return null;

  return Math.round(value);
}

function formatCLP(n?: number | null): string | null {
  if (!n || !Number.isFinite(n)) return null;
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
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

type Msg = { role: 'system' | 'user' | 'assistant'; content: string };

function sniffSlots(history: Msg[]) {
  const all = history.map(m => m.content).join(' ').toLowerCase();

  const email = normEmail(all.match(/([^\s@]+@[^\s@]+\.[^\s@]+)/)?.[1] ?? null);
  const phone = normPhone(all.match(/(\+?[\d\-\s\(\)]{8,20})/)?.[1] ?? null);
  const name =
    normText(all.match(/(?:mi nombre es|me llamo|soy)\s+([a-záéíóúñ\s]{2,60})/i)?.[1] ?? null);
  const acreedor =
    normText(all.match(/\b(santander|ripley|scotiabank|bci|falabella|lider|bbva|itau|cmr|la\s*polar)\b/i)?.[1] ?? null);

  const motivo =
    normText(
      all.match(/\b(dicom|cobranza|repactaci[oó]n|prescripci[oó]n|deuda\s+antigua|demanda|juicio)\b/i)?.[0] ??
      null
    );

  const montoText = all.match(/(\d[\d\.\,]*\s*(millones|millon|m\b)?)/i)?.[0] ?? null;
  const monto = parseMontoToCLP(montoText);

  // región/comuna: que el modelo las pida; sin heurística dura
  return { name, email, phone, motivo, acreedor, monto: monto ?? null, region: null as string | null, comuna: null as string | null };
}

function resolveNext(slots: { name: any; email: any; phone: any; motivo: any; acreedor: any; monto: any; region: any; comuna: any; }) {
  if (!slots.name) return 'name';
  if (!slots.email && !slots.phone) return 'contact';
  if (!slots.motivo) return 'motivo';
  if (!slots.acreedor) return 'acreedor';
  if (!slots.monto) return 'monto';
  if (!slots.region) return 'region';
  if (!slots.comuna) return 'comuna';
  return 'close';
}

function slotsComplete(slots: ReturnType<typeof sniffSlots> & { region: any; comuna: any }) {
  return Boolean(slots.name && (slots.email || slots.phone) && slots.motivo && slots.acreedor && slots.monto && slots.region && slots.comuna);
}

function buildMotivoRich(baseMotivo: string | null, extra: { acreedor?: string | null; montoCLP?: number | null; region?: string | null; comuna?: string | null }) {
  const parts: string[] = [];
  if (baseMotivo) parts.push(baseMotivo);
  if (extra.acreedor) parts.push(`Acreedor: ${extra.acreedor}`);
  if (extra.montoCLP) parts.push(`Monto aprox: ${formatCLP(extra.montoCLP)}`);
  if (extra.comuna || extra.region) parts.push(`Ubicación: ${[extra.comuna, extra.region].filter(Boolean).join(', ')}`);
  return parts.join(' | ') || null;
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

async function upsertLeadFromSlots(slots: ReturnType<typeof sniffSlots> & { region: string | null; comuna: string | null }, conversationId: string) {
  if (!SAVE_LEADS) return { leadId: null, leadStatus: 'disabled' as const };

  const name = normText(slots.name);
  const email = normEmail(slots.email);
  const phone = normPhone(slots.phone);
  const motivo = normText(slots.motivo);
  const acreedor = normText(slots.acreedor);
  const region = normText(slots.region);
  const comuna = normText(slots.comuna);
  const monto = slots.monto ?? null;

  // mínimos para crear
  if (!name || (!email && !phone)) return { leadId: null, leadStatus: 'skipped' as const };

  // dedupe 48h
  const dup = await findRecentDuplicate(email, phone);
  if (dup) return { leadId: dup.id as string, leadStatus: 'deduped' as const };

  // motivo enriquecido (sin columnas nuevas)
  const motivoRich = buildMotivoRich(motivo, {
    acreedor,
    montoCLP: monto,
    region: region ?? undefined,
    comuna: comuna ?? undefined
  });

  const payload: any = {
    name,
    email,
    phone,
    motivo: motivoRich,
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
    const slotsWithGeo = { ...baseSlots, region: null as string | null, comuna: null as string | null };
    const next = resolveNext(slotsWithGeo);

    // steering para evitar loops
    const steering = `KnownSlots: ${JSON.stringify({
      name: baseSlots.name ?? null,
      email: baseSlots.email ?? null,
      phone: baseSlots.phone ?? null,
      motivo: baseSlots.motivo ?? null,
      acreedor: baseSlots.acreedor ?? null,
      monto: baseSlots.monto ?? null,
      region: null,
      comuna: null
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

    // --------- AUTO-LEAD FALLBACK: si el modelo no lo emitió pero ya están los 7 slots ----------
    // Intento reconstruir slots completos leyendo *todo* el historial (incluida la última respuesta del usuario antes del cierre).
    // OJO: region/comuna sólo las tiene el modelo, pero si el modelo ya las preguntó y el usuario respondió, irán en history.
    // Aquí sólo activamos fallback si detectamos explícitamente que ya se preguntó y respondió.
    const fullText = currentHistory.map(m => m.content).join(' ').toLowerCase();
    const regionMatch = fullText.match(/\b(region|región)\s*:?\s*([a-záéíóúñ\s]{2,60})/i)?.[2] ?? null;
    const comunaMatch = fullText.match(/\bcomuna\s*:?\s*([a-záéíóúñ\s]{2,60})/i)?.[1] ?? null;

    const reconstructSlots = {
      ...baseSlots,
      region: normText(regionMatch),
      comuna: normText(comunaMatch)
    };

    if (!leadBlock && slotsComplete(reconstructSlots as any)) {
      // construimos LEAD compatible
      leadBlock = {
        name: reconstructSlots.name,
        email: reconstructSlots.email,
        phone: reconstructSlots.phone,
        motivo: reconstructSlots.motivo,
        acreedor: reconstructSlots.acreedor,
        monto: reconstructSlots.monto ? String(reconstructSlots.monto) : null,
        region: reconstructSlots.region,
        comuna: reconstructSlots.comuna
      };
      // añadimos un cierre amable (no repetimos saludo)
      const cierre = `Excelente, ${reconstructSlots.name}. Ya registré tu caso. Nuestro equipo de DeudaCero te contactará. Con nosotros sí es posible encontrar una salida.`;
      reply = `${reply}\n\n${cierre}\n<LEAD>${JSON.stringify(leadBlock)}</LEAD>`;
      // Guardamos esta respuesta aumentada en la conversación
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
          motivo: leadBlock.motivo ?? baseSlots.motivo,
          acreedor: leadBlock.acreedor ?? baseSlots.acreedor,
          monto: parseMontoToCLP(leadBlock.monto ?? (baseSlots.monto ? String(baseSlots.monto) : null)),
          region: normText(leadBlock.region) ?? null,
          comuna: normText(leadBlock.comuna) ?? null
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
