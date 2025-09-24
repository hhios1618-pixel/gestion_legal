// src/app/dashboard/cases/page.tsx
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';
import Link from 'next/link';
import {
  FolderKanban,
  Filter,
  ExternalLink,
  ClipboardList,
  FileText,
  UserCheck,
} from 'lucide-react';

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    nuevo: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    en_proceso: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    cerrado: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium capitalize ${map[estado] ?? 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'}`}>
      {estado?.replace('_', ' ') || '—'}
    </span>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: number; tone: 'info' | 'progress' | 'success' }) {
  const styles: Record<string, string> = {
    info: 'border-sky-200 bg-sky-50 text-sky-700',
    progress: 'border-amber-200 bg-amber-50 text-amber-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  };
  return (
    <div className={`rounded-2xl border px-4 py-3 text-center ${styles[tone]}`}>
      <p className="text-[11px] uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value.toLocaleString('es-CL')}</p>
    </div>
  );
}

export default async function CasesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = searchParams ? await searchParams : {};
  const estadoFilter = String(sp?.estado ?? '').toLowerCase();

  let query = supabaseAdmin
    .from('cases')
    .select(`
      id,
      short_code,
      estado,
      descripcion,
      nota_interna,
      created_at,
      lead:leads ( short_code, name ),
      abogado:users!abogado_id ( name )
    `)
    .order('created_at', { ascending: false });

  if (estadoFilter) query = query.eq('estado', estadoFilter);

  const [casesRes, totalRes, enProcesoRes, cerradosRes] = await Promise.all([
    query,
    supabaseAdmin.from('cases').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('cases').select('id', { count: 'exact', head: true }).eq('estado', 'en_proceso'),
    supabaseAdmin.from('cases').select('id', { count: 'exact', head: true }).eq('estado', 'cerrado'),
  ]);

  if (casesRes.error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
        Error al cargar los casos: {casesRes.error.message}
      </div>
    );
  }

  const cases = casesRes.data ?? [];
  const total = totalRes.count ?? 0;
  const enProceso = enProcesoRes.count ?? 0;
  const cerrados = cerradosRes.count ?? 0;
  const nuevos = total - enProceso - cerrados;

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_16px_40px_rgba(2,6,23,0.08)] backdrop-blur">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-slate-500">
              <FolderKanban size={14} /> Escritorio Legal
            </div>
            <h1 className="mt-3 text-[26px] font-semibold tracking-tight text-slate-900">
              Gestión de casos activos
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Visualiza los casos asignados, su estado procesal y las notas clave para avanzar. Desde aquí puedes acceder a recursos y enlaces externos.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="Casos nuevos" value={nuevos < 0 ? 0 : nuevos} tone="info" />
            <MetricCard label="En proceso" value={enProceso} tone="progress" />
            <MetricCard label="Cerrados" value={cerrados} tone="success" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <form method="GET" className="flex flex-wrap items-center gap-2 text-sm">
            <select
              name="estado"
              defaultValue={estadoFilter}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-100"
            >
              <option value="">Todos los estados</option>
              <option value="nuevo">Nuevo</option>
              <option value="en_proceso">En proceso</option>
              <option value="cerrado">Cerrado</option>
            </select>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Filter className="h-4 w-4" /> Aplicar
            </button>
          </form>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link
              href="https://oficinajudicialvirtual.pjud.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-white px-3 py-2 text-[12px] font-medium text-sky-700 shadow-sm transition-colors hover:border-sky-300 hover:text-sky-800"
            >
              Oficina Judicial Virtual <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="https://www.pjud.cl/documents/396729/562858/Tabla_De_Plazos.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-900"
            >
              Tabla de plazos procesales
            </Link>
          </div>
        </div>
      </header>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(2,6,23,0.08)]">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 text-left">Caso</th>
              <th className="px-5 py-3 text-left">Lead</th>
              <th className="px-5 py-3 text-left">Abogado</th>
              <th className="px-5 py-3 text-left">Estado</th>
              <th className="px-5 py-3 text-left">Creado</th>
              <th className="px-5 py-3 text-left">Notas</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.id} className="border-t border-slate-200 hover:bg-slate-50/60">
                <td className="px-5 py-3 font-medium text-slate-900">{c.short_code}</td>
                <td className="px-5 py-3 text-slate-700">
                  <div className="font-medium">{c.lead?.name ?? '—'}</div>
                  <div className="text-[11px] text-slate-500">{c.lead?.short_code ?? '—'}</div>
                </td>
                <td className="px-5 py-3 text-slate-700">{c.abogado?.name ?? '—'}</td>
                <td className="px-5 py-3">
                  <EstadoBadge estado={c.estado ?? 'nuevo'} />
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {c.created_at ? new Date(c.created_at).toLocaleString('es-CL') : '—'}
                </td>
                <td className="px-5 py-3 text-slate-700 line-clamp-1">
                  {(c.nota_interna?.trim() || c.descripcion?.trim() || '—')}
                </td>
                <td className="px-5 py-3">
                  <Link
                    href={`/dashboard/cases/${c.id}`}
                    className="inline-flex items-center rounded-md bg-gradient-to-r from-sky-600 to-blue-600 px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm transition hover:brightness-110"
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
            {cases.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                  No hay casos registrados aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Recursos para abogados */}
      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_12px_35px_rgba(2,6,23,0.06)] lg:grid-cols-2">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ClipboardList size={16} className="text-slate-600" /> Herramientas de trabajo
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• Plantillas de demanda, contestación y recursos actualizadas.</li>
            <li>• Directorio de peritos y notarios de confianza.</li>
            <li>• Agenda semanal de audiencias y recordatorios clave.</li>
            <li>• Checklist de documentación mínima por materia.</li>
          </ul>
        </div>
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FileText size={16} className="text-slate-600" /> Bibliografía y enlaces
          </h3>
          <ul className="mt-3 grid gap-2 text-sm text-slate-600">
            {[
              { label: 'Repertorio de jurisprudencia', href: '#', description: 'Casos relevantes por materia.' },
              { label: 'Plantillas contractuales LexMatch', href: '#', description: 'Documentos modelo para uso interno.' },
              { label: 'Calendario procesal', href: '#', description: 'Fechas claves y plazos por tribunal.' },
              { label: 'Guía de etiquetado en LexMatch', href: '#', description: 'Buenas prácticas para notas y adjuntos.' },
            ].map((item) => (
              <li key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <a
                      href={item.href !== '#' ? item.href : undefined}
                      target={item.href !== '#' ? '_blank' : undefined}
                      rel={item.href !== '#' ? 'noopener noreferrer' : undefined}
                      className="font-semibold text-slate-900 hover:text-[#3358ff]"
                    >
                      {item.label}
                    </a>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
