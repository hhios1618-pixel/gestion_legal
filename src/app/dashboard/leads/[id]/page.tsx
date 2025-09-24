// src/app/dashboard/leads/[id]/page.tsx
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AttachmentsCard from '@/app/components/AttachmentsCard';
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  ChevronLeft,
  Mail,
  Phone,
  ShieldCheck,
  User,
  FileText,
  MessageSquareText,
} from 'lucide-react';
import type { Database } from '@/app/lib/database.types';

const DEFAULT_CHECKLIST = {
  datosConfirmados: false,
  contactoEfectivo: false,
  documentosSolicitados: false,
  aptoParaCaso: false,
};

type LeadRow = Database['public']['Tables']['leads']['Row'];
type ConversationRow = Database['public']['Tables']['conversations']['Row'];

type Checklist = typeof DEFAULT_CHECKLIST;

type ParsedNotes = {
  body: string;
  checklist: Checklist;
};

function parseNotes(raw: string | null): ParsedNotes {
  if (!raw) return { body: '', checklist: { ...DEFAULT_CHECKLIST } };
  try {
    const json = JSON.parse(raw);
    if (json && typeof json === 'object' && json.__type === 'lead-notes') {
      return {
        body: typeof json.body === 'string' ? json.body : '',
        checklist: { ...DEFAULT_CHECKLIST, ...(json.checklist ?? {}) },
      };
    }
  } catch (e) {
    // ignore malformed JSON
  }
  return { body: raw, checklist: { ...DEFAULT_CHECKLIST } };
}

function serializeNotes(body: string, checklist: Checklist): string | null {
  const trimmed = body.trim();
  const hasChecklist = Object.values(checklist).some(Boolean);
  if (!trimmed && !hasChecklist) return null;
  return JSON.stringify({ __type: 'lead-notes', body: trimmed, checklist });
}

function fmtDate(d?: string | null) {
  return d ? new Date(d).toLocaleString('es-CL') : '—';
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: leadId } = await params;

  const { data: lead, error: leadError } = await supabaseAdmin
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (leadError || !lead) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
        Lead no encontrado o error al cargar.
      </div>
    );
  }

  let convo: ConversationRow | null = null;
  if (lead.conversation_id) {
    const { data: c } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('id', lead.conversation_id)
      .single();
    convo = (c as ConversationRow) ?? null;
  }

  const parsedNotes = parseNotes(lead.notes);

  async function updateLeadStatus(formData: FormData) {
    'use server';
    const raw = (formData.get('status') as string) || 'nuevo';
    const allowed = new Set(['nuevo', 'contactado', 'descartado', 'valido']);
    const status = allowed.has(raw) ? raw : 'nuevo';

    await supabaseAdmin.from('leads').update({ status }).eq('id', leadId);
    revalidatePath(`/dashboard/leads/${leadId}`);
    revalidatePath('/dashboard/leads');
  }

  async function saveNotes(formData: FormData) {
    'use server';
    const body = (formData.get('notes_body') as string) ?? '';
    const checklist: Checklist = {
      datosConfirmados: formData.get('chk_datos') === 'on',
      contactoEfectivo: formData.get('chk_contacto') === 'on',
      documentosSolicitados: formData.get('chk_docs') === 'on',
      aptoParaCaso: formData.get('chk_apto') === 'on',
    };

    const serialized = serializeNotes(body, checklist);
    await supabaseAdmin.from('leads').update({ notes: serialized }).eq('id', leadId);
    revalidatePath(`/dashboard/leads/${leadId}`);
  }

  async function convertToCase() {
    'use server';
    const { data: existing } = await supabaseAdmin
      .from('cases')
      .select('id')
      .eq('lead_id', leadId)
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      redirect(`/dashboard/cases/${existing.id}`);
      return;
    }

    const { data: lr } = await supabaseAdmin
      .from('leads')
      .select('motivo')
      .eq('id', leadId)
      .single();

    const desc = (lr as Pick<LeadRow, 'motivo'> | null)?.motivo?.trim();
    const payload: Record<string, any> = {
      lead_id: leadId,
      estado: 'nuevo',
      ...(desc ? { descripcion: desc } : {}),
    };

    const { data: created, error } = await supabaseAdmin
      .from('cases')
      .insert(payload)
      .select('id')
      .single();

    if (error || !created) return;

    await supabaseAdmin.from('leads').update({ status: 'valido' }).eq('id', leadId);

    revalidatePath('/dashboard/leads');
    revalidatePath('/dashboard/cases');
    redirect(`/dashboard/cases/${created.id}`);
  }

  const statuses: Array<LeadRow['status']> = ['nuevo', 'contactado', 'descartado', 'valido'];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <header className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_16px_40px_rgba(2,6,23,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-1 text-xs text-slate-500">
              <Link href="/dashboard/leads" className="inline-flex items-center gap-1 hover:text-slate-700">
                <ChevronLeft size={14} /> Volver a Leads
              </Link>
            </div>
            <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">
              {lead.short_code ?? '—'} <span className="text-slate-500">• {lead.name ?? 'Lead sin nombre'}</span>
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Origen: <Chip>{lead.channel ?? '—'}</Chip> <span className="mx-1">/</span> <Chip>{lead.source}</Chip>
            </p>
            <p className="text-xs text-slate-500">
              Registrado el {fmtDate(lead.created_at)}
            </p>
          </div>
          <div className="grid gap-2 text-sm text-slate-700">
            <a
              href={lead.phone ? `tel:${lead.phone}` : undefined}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 shadow-sm transition ${
                lead.phone
                  ? 'border-slate-200 bg-white hover:bg-slate-50'
                  : 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400'
              }`}
            >
              <Phone size={16} /> {lead.phone ?? 'Sin teléfono'}
            </a>
            <a
              href={lead.email ? `mailto:${lead.email}` : undefined}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 shadow-sm transition ${
                lead.email
                  ? 'border-slate-200 bg-white hover:bg-slate-50'
                  : 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400'
              }`}
            >
              <Mail size={16} /> {lead.email ?? 'Sin correo'}
            </a>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {/* Estado y acciones */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <BadgeCheck size={16} className="text-slate-600" /> Estado del lead
              </div>
              <form action={updateLeadStatus} className="flex flex-wrap items-center gap-2 text-sm">
                <select
                  name="status"
                  defaultValue={lead.status ?? 'nuevo'}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-100"
                >
                  {statuses.map((st) => (
                    <option key={st ?? 'null'} value={st ?? 'nuevo'} className="capitalize">
                      {st?.replace('_', ' ') ?? 'nuevo'}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1f2d5c] via-[#3358ff] to-[#2bb8d6] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                >
                  Actualizar
                </button>
              </form>
            </div>
            <div className="mt-4 grid gap-3 text-xs text-slate-600 sm:grid-cols-3">
              <MiniInfo label="Canal" value={lead.channel ?? '—'} />
              <MiniInfo label="Fuente" value={lead.source} />
              <MiniInfo label="Conversación" value={lead.conversation_id ? 'Sí' : 'No'} />
            </div>
          </section>

          {/* Checklist + Notas */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ClipboardList size={16} className="text-slate-600" /> Validación y notas internas
            </h3>
            <form action={saveNotes} className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-start gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="chk_datos"
                    defaultChecked={parsedNotes.checklist.datosConfirmados}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-100"
                  />
                  Datos de contacto verificados
                </label>
                <label className="flex items-start gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="chk_contacto"
                    defaultChecked={parsedNotes.checklist.contactoEfectivo}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-100"
                  />
                  Se conversó con el cliente y confirma interés
                </label>
                <label className="flex items-start gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="chk_docs"
                    defaultChecked={parsedNotes.checklist.documentosSolicitados}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-100"
                  />
                  Documentación requerida solicitada/recibida
                </label>
                <label className="flex items-start gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="chk_apto"
                    defaultChecked={parsedNotes.checklist.aptoParaCaso}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-100"
                  />
                  Lead listo para asignar abogado
                </label>
              </div>

              <textarea
                name="notes_body"
                defaultValue={parsedNotes.body}
                placeholder="Notas del ejecutivo: llamadas, pendientes, documentación remitida, etc."
                className="w-full min-h-32 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-sky-100"
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Guardar actualización
                </button>
              </div>
            </form>
          </section>

          {/* Motivo */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MessageSquareText size={16} className="text-slate-600" /> Motivo declarado por el cliente
            </h3>
            <p className="whitespace-pre-wrap text-[15px] leading-6 text-slate-800">
              {lead.motivo?.trim() || '— Sin detalle —'}
            </p>
          </section>

          {/* Conversación */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FileText size={16} className="text-slate-600" /> Conversación con el chatbot (resumen)
            </h3>
            {!convo?.messages || (Array.isArray(convo.messages) && convo.messages.length === 0) ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                No hay mensajes vinculados a este lead.
              </div>
            ) : (
              <div className="max-h-72 space-y-3 overflow-auto">
                {(convo!.messages as any[]).slice(0, 20).map((m: any, index: number) => {
                  const isBot = m.role === 'assistant';
                  return (
                    <div key={index} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-5 shadow-sm ${
                          isBot
                            ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-200'
                            : 'bg-sky-50 text-sky-900 ring-1 ring-sky-200'
                        }`}
                      >
                        <span className="block text-[10px] uppercase tracking-wide opacity-60">
                          {isBot ? 'LEX' : 'Lead'}
                        </span>
                        <span className="whitespace-pre-wrap">{m.content}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recursos adicionales */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck size={16} className="text-slate-600" /> Acciones sugeridas
            </h3>
            <ul className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              {[
                {
                  label: 'Agendar llamada de seguimiento',
                  description: 'Coordina una llamada para confirmar disponibilidad y próximos pasos.',
                },
                {
                  label: 'Solicitar documentación vía correo',
                  description: 'Envía correo plantilla con la lista de documentos necesarios según el caso.',
                },
                {
                  label: 'Registrar resultado en notas',
                  description: 'Deja constancia de compromisos, horarios y expectativas del cliente.',
                },
                {
                  label: 'Crear caso sólo si checklist completo',
                  description: 'Asegúrate de marcar “Apto para caso” y adjuntar documentos clave.',
                },
              ].map((item) => (
                <li key={item.label} className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                  <p className="font-semibold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <BadgeCheck size={16} className="text-slate-600" /> Siguiente paso
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Cuando la información esté validada y el cliente confirme que quiere avanzar, crea el caso para que lo tome un abogado.
            </p>
            <form action={convertToCase} className="mt-4">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#1f2d5c] via-[#3358ff] to-[#2bb8d6] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
              >
                Crear caso ahora <ArrowRight size={16} />
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <User size={16} className="text-slate-600" /> Resumen del cliente
            </h3>
            <dl className="space-y-3 text-sm text-slate-700">
              <InfoRow label="Nombre" value={lead.name ?? '—'} />
              <InfoRow label="Teléfono" value={lead.phone ?? '—'} />
              <InfoRow label="Correo" value={lead.email ?? '—'} />
              <InfoRow label="Código" value={lead.short_code ?? '—'} />
            </dl>
          </section>

          <AttachmentsCard
            ownerId={leadId}
            ownerType="lead"
            title="Adjuntos"
            description="Carga y comparte documentación entregada por el cliente."
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-0.5 text-xs text-slate-700 ring-1 ring-slate-200">
      {children}
    </span>
  );
}
