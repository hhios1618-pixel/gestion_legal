// src/app/api/bot/message/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const SAVE_LEADS = (process.env.SAVE_LEADS ?? 'true').toLowerCase() === 'true';
const DEDUPE_WINDOW_HOURS = Number(process.env.LEADS_DEDUPE_H || 48);

const systemPrompt = `
Eres un asistente virtual experto en calificación de clientes para "DeudasCero".
Objetivo mínimo: nombre, un método de contacto (email o teléfono) y motivo.
Cuando tengas los 3, responde al usuario con un cierre amable y luego EMITE:
<LEAD>
{ "name": "...", "email": "...", "phone": "...", "motivo": "..." }
</LEAD>
No pidas todo a la vez. No prometas tiempos ni resultados.
`;

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

function trimTo(s: unknown, n: number) {
  const v = String(s ?? '');
  return v.length > n ? v.slice(0, n) : v;
}
const MAX_INPUT_CHARS = 2000;

function normEmail(v?: string | null) {
  const s = (v ?? '').trim().toLowerCase();
  if (!s) return null;
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  return ok ? s : null;
}
function normPhone(v?: string | null) {
  const s = (v ?? '').replace(/[^\d+]/g, '');
  if (!s) return null;
  const digits = s.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return null;
  return s;
}
function normText(v?: string | null) {
  return trimTo((v ?? '').trim(), 500);
}

function extractLeadBlock(text: string) {
  const m = text.match(/<LEAD>\s*([\s\S]*?)\s*<\/LEAD>/i);
  if (!m) return null;
  try {
    const json = JSON.parse(m[1]);
    return json;
  } catch {
    return null;
  }
}

function getClientMeta(reqUrl: string, headers: Headers) {
  const ua = headers.get('user-agent') ?? '';
  const referer = headers.get('referer') ?? '';
  const ip = headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
  const url = new URL(reqUrl);
  const utm = Object.fromEntries(
    Array.from(url.searchParams.entries()).filter(([k]) => k.startsWith('utm_'))
  );
  return { ua, referer, ip, utm };
}

async function findRecentDuplicate(email: string | null, phone: string | null) {
  if (!email && !phone) return null;
  const since = new Date(Date.now() - DEDUPE_WINDOW_HOURS * 3600 * 1000).toISOString();
  const q = supabaseAdmin.from('leads').select('id,created_at').gte('created_at', since).limit(1);
  if (email) q.eq('email', email);
  if (phone) q.eq('phone', phone);
  const { data } = await q;
  return data?.[0] ?? null;
}

function isValidMessageHistory(messages: unknown): messages is ChatMessage[] {
  return (
    Array.isArray(messages) &&
    messages.every(
      (m) =>
        m &&
        typeof m === 'object' &&
        'role' in m &&
        'content' in m &&
        typeof (m as any).role === 'string' &&
        typeof (m as any).content === 'string'
    )
  );
}

export async function POST(req: Request) {
  try {
    const { message, conversationId, history } = await req.json();

    let conversationHistory: ChatMessage[] = [{ role: 'system', content: systemPrompt }];

    if (isValidMessageHistory(history)) {
      // (opcional) si mandas history desde el cliente, úsalo
      conversationHistory = [conversationHistory[0], ...history].map((m) => ({
        role: m.role,
        content: trimTo(m.content, MAX_INPUT_CHARS),
      }));
    }

    // Si usas Supabase para persistir, la lógica original aquí:
    // ... (puedes traer y fusionar historial de conversations como ya tenías)

    conversationHistory.push({ role: 'user', content: trimTo(message, MAX_INPUT_CHARS) });

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: conversationHistory,
      temperature: 0.2,
      max_tokens: 500,
    });

    const botReply = completion.choices[0]?.message?.content || 'No pude procesar tu solicitud.';

    // Intentar extraer <LEAD> del reply y persistir
    let persistedLeadId: string | null = null;
    if (SAVE_LEADS) {
      const raw = extractLeadBlock(botReply);
      if (raw) {
        const name = normText(raw.name);
        const email = normEmail(raw.email);
        const phone = normPhone(raw.phone);
        const motivo = normText(raw.motivo);
        const enough = !!(name && (email || phone) && motivo);
        if (enough) {
          const meta = getClientMeta(req.url, new Headers(req.headers));
          const dup = await findRecentDuplicate(email, phone);
          if (!dup) {
            const { data, error } = await supabaseAdmin
              .from('leads')
              .insert({
                name,
                email,
                phone,
                objetivo: motivo,
                source: 'web_bot',
                meta,
              })
              .select('id')
              .single();
            if (!error && data?.id) persistedLeadId = data.id;
          }
        }
      }
    }

    // (opcional) persistir conversación como ya haces… (omito por brevedad)
    // …

    return NextResponse.json({ reply: botReply, leadId: persistedLeadId });
  } catch (err) {
    console.error('[api/bot/message] error', err);
    const msg = err instanceof Error ? err.message : 'internal_error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}