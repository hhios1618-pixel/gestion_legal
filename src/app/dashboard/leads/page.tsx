// src/app/dashboard/leads/page.tsx
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';
import Link from 'next/link';
import {
  ChevronRight,
  Download,
  Mail,
  Phone,
  Plus,
  Search,
  Users,
  ClipboardCheck,
  FileStack,
} from 'lucide-react';

/** Helpers **/
function fmtDate(d: string | null) {
  return d ? new Date(d).toLocaleString('es-CL') : '—';
}

function StatusBadge({ status }: { status: string | null }) {
  const s = (status ?? 'nuevo').toLowerCase();
  const map: Record<string, string> = {
    nuevo: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    contactado: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
    valido: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    descartado: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${map[s] ?? map['nuevo']}`}>
      {s}
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-0.5 text-xs text-slate-700 ring-1 ring-slate-200">
      {children}
    </span>
  );
}

function QuickFilter({
  label,
  href,
  active = false,
  tone,
}: {
  label: string;
  href: string;
  active?: boolean;
  tone?: 'sky' | 'indigo' | 'emerald' | 'rose';
}) {
  const toneMap: Record<string, string> = {
    sky: 'bg-sky-50 text-sky-700 ring-sky-200 hover:bg-sky-100',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200 hover:bg-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200 hover:bg-rose-100',
  };
  const base = 'inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium ring-1 transition';
  const normal = 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50';
  const activeCls = tone ? toneMap[tone] : 'bg-slate-900 text-white ring-slate-900 hover:bg-slate-800';
  return (
    <Link href={href} className={`${base} ${active ? activeCls : normal}`}>
      {label}
    </Link>
  );
}

function MetricPill({
  label,
  value,
  tone = 'neutral',
  tooltip,
}: {
  label: string;
  value: number;
  tone?: 'neutral' | 'warning' | 'info' | 'success';
  tooltip?: string;
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-slate-50 text-slate-700 ring-slate-200',
    warning: 'bg-amber-50 text-amber-700 ring-amber-200',
    info: 'bg-sky-50 text-sky-700 ring-sky-200',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  };
  return (
    <div
      className={`flex flex-col rounded-2xl border ${tones[tone]} px-4 py-3 text-center shadow-sm`}
      title={tooltip}
    >
      <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      <span className="mt-1 text-lg font-semibold">{value.toLocaleString('es-CL')}</span>
    </div>
  );
}

/** Page **/

type LeadRow = {
  id: string;
  short_code: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  channel: string | null;
  source: string;
  created_at: string | null;
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const status = String(sp?.status ?? '').toLowerCase();
  const source = String(sp?.source ?? '').toLowerCase();
  const q = String(sp?.q ?? '').trim();

  let query = supabaseAdmin
    .from('leads')
    .select('id, short_code, name, email, phone, status, channel, source, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (status) query = query.eq('status', status);
  if (source) query = query.eq('source', source);
  if (q) {
    query = query.or(
      [
        `name.ilike.%${q}%`,
        `email.ilike.%${q}%`,
        `phone.ilike.%${q}%`,
        `short_code.ilike.%${q}%`,
      ].join(',')
    );
  }

  const [listRes, totalRes, activosRes, pendientesRes, contactadosRes, validadosRes] = await Promise.all([
    query,
    supabaseAdmin.from('leads').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('leads').select('id', { count: 'exact', head: true }).neq('status', 'descartado'),
    supabaseAdmin.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'nuevo'),
    supabaseAdmin.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'contactado'),
    supabaseAdmin.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'valido'),
  ]);

  if (listRes.error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
        Error al cargar los leads: {listRes.error.message}
      </div>
    );
  }

  const leads = (listRes.data ?? []) as LeadRow[];
  const total = totalRes.count ?? 0;
  const activos = activosRes.count ?? 0;
  const pendientes = pendientesRes.count ?? 0;
  const contactados = contactadosRes.count ?? 0;
  const validados = validadosRes.count ?? 0;

  return (
    <div className="space-y-6">
      {/* Header + métricas */}
      <header className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_14px_40px_rgba(2,6,23,0.08)] backdrop-blur">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-slate-500">
              <Users size={14} /> Mesa de Leads
            </div>
            <h1 className="mt-3 text-[26px] font-semibold tracking-tight text-slate-900">
              Validación de oportunidades
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Revisa la información obtenida desde formularios y chatbot, confirma datos clave y deriva sólo los casos sólidos al equipo legal.
            </p>
          </div>
          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
            <MetricPill label="Total" value={total} tooltip="Leads acumulados" />
            <MetricPill label="Pendientes" value={pendientes} tone="warning" tooltip="Leads nuevos sin validar" />
            <MetricPill label="Contactados" value={contactados} tone="info" tooltip="Seguimiento en curso" />
            <MetricPill label="Aprobados" value={validados} tone="success" tooltip="Listos para crear caso" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <form className="flex w-full flex-col gap-2 sm:flex-row sm:items-center" method="GET">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Buscar por nombre, email o código…"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-sky-100"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                name="status"
                defaultValue={status}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-100 sm:w-44"
              >
                <option value="">Estado</option>
                <option value="nuevo">Nuevo</option>
                <option value="contactado">Contactado</option>
                <option value="valido">Válido</option>
                <option value="descartado">Descartado</option>
              </select>
              <select
                name="source"
                defaultValue={source}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-100 sm:w-44"
              >
                <option value="">Origen</option>
                <option value="bot">Chatbot</option>
                <option value="form">Formulario</option>
                <option value="manual">Carga manual</option>
              </select>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1f2d5c] via-[#3358ff] to-[#2bb8d6] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
              >
                Aplicar filtros
              </button>
            </div>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="tel:+56900000000"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Phone size={16} /> Discador rápido
            </Link>
            <a
              href="mailto:coordinacion@lexmatch.cl"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Mail size={16} /> Correo plantilla
            </a>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              title="Exportar CSV (próximamente)"
            >
              <Download size={16} /> Exportar
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <QuickFilter label="Todos" href="/dashboard/leads" active={!status} />
          <QuickFilter label="Nuevo" href="/dashboard/leads?status=nuevo" tone="sky" active={status === 'nuevo'} />
          <QuickFilter label="Contactado" href="/dashboard/leads?status=contactado" tone="indigo" active={status === 'contactado'} />
          <QuickFilter label="Válido" href="/dashboard/leads?status=valido" tone="emerald" active={status === 'valido'} />
          <QuickFilter label="Descartado" href="/dashboard/leads?status=descartado" tone="rose" active={status === 'descartado'} />
        </div>
      </header>

      {/* Tabla de leads */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_32px_rgba(2,6,23,0.06)]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Código</th>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Contacto</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3">Origen</th>
              <th className="px-5 py-3">Creado</th>
              <th className="px-5 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80">
                <td className="px-5 py-3">
                  <div className="font-semibold text-slate-900">{lead.short_code ?? '—'}</div>
                  <div className="text-[11px] text-slate-500">{lead.id.slice(0, 8)}</div>
                </td>
                <td className="px-5 py-3">
                  <div className="font-medium text-slate-900">{lead.name ?? '—'}</div>
                  <div className="text-[11px] text-slate-500">{lead.phone ?? '—'}</div>
                </td>
                <td className="px-5 py-3 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    {lead.email ? (
                      <a
                        href={`mailto:${lead.email}`}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                      >
                        <Mail size={14} /> Email
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                    {lead.phone ? (
                      <a
                        href={`tel:${lead.phone}`}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                      >
                        <Phone size={14} /> Llamar
                      </a>
                    ) : null}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap items-center gap-1">
                    <Chip>{lead.channel ?? '—'}</Chip>
                    <Chip>{lead.source}</Chip>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-slate-700">{fmtDate(lead.created_at)}</td>
                <td className="px-5 py-3">
                  <Link
                    href={`/dashboard/leads/${lead.id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1f2d5c] via-[#3358ff] to-[#2bb8d6] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:brightness-110"
                  >
                    Gestionar <ChevronRight size={14} />
                  </Link>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="mx-auto max-w-md">
                    <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-slate-100" />
                    <div className="text-sm font-medium text-slate-900">Sin leads para mostrar</div>
                    <p className="text-sm text-slate-500">
                      Cuando se registren nuevos leads desde el bot o formularios, aparecerán aquí.
                    </p>
                    <button className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      <Plus size={16} /> Crear lead
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-slate-500">
        Mostrando {Math.min(leads.length, 50)} de {total.toLocaleString('es-CL')} registros.
      </div>

      {/* Recursos para validadores */}
      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_12px_35px_rgba(2,6,23,0.06)] lg:grid-cols-2">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ClipboardCheck size={16} className="text-slate-600" /> Checklist sugerido
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {[
              'Verificar nombre, correo y teléfono en línea (buscador, redes, dicom).',
              'Contactar por teléfono: confirmar motivo y disponibilidad para reunión.',
              'Solicitar documentación mínima según el tipo de caso.',
              'Registrar observaciones y compromisos en las notas internas.',
              'Marcar “Válido” sólo cuando el lead esté listo para crear un caso.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#3358ff]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FileStack size={16} className="text-slate-600" /> Recursos rápidos
          </h3>
          <ul className="mt-3 grid gap-2 text-sm text-slate-600">
            {[
              { label: 'Guión de validación telefónica', href: '#', description: 'Preguntas guía para confirmar identidad y necesidad.' },
              { label: 'Checklist de documentos por materia', href: '#', description: 'PDF con requisitos mínimos para abrir expediente.' },
              { label: 'Planilla de seguimiento diario', href: '#', description: 'Formato Excel para registrar llamadas y compromisos.' },
              { label: 'Oficina Judicial Virtual (PJUD)', href: 'https://oficinajudicialvirtual.pjud.cl', description: 'Revisa el estado de causas asociadas al lead.' },
            ].map(({ label, href, description }) => (
              <li key={label} className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <a
                      href={href !== '#' ? href : undefined}
                      target={href !== '#' ? '_blank' : undefined}
                      rel={href !== '#' ? 'noopener noreferrer' : undefined}
                      className="font-semibold text-slate-900 hover:text-[#3358ff]"
                    >
                      {label}
                    </a>
                    <p className="text-xs text-slate-500">{description}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-400" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
