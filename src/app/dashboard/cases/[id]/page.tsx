'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AttachmentsCard from '@/app/components/AttachmentsCard';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ClipboardList,
  ExternalLink,
  FileText,
  FolderKanban,
  User2,
} from 'lucide-react';

const ESTADOS = ['nuevo', 'en_proceso', 'cerrado'] as const;
const EVENT_TYPES = [
  'ingreso',
  'gestion_preparatoria',
  'demanda',
  'notificacion',
  'requerimiento',
  'embargo',
  'remate',
  'audiencia',
  'acuerdo',
  'cierre',
] as const;

function EstadoPill({ estado }: { estado: string }) {
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

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [estado, setEstado] = useState('nuevo');
  const [descripcion, setDescripcion] = useState('');
  const [notaInterna, setNotaInterna] = useState('');
  const [abogadoId, setAbogadoId] = useState('');

  const [evType, setEvType] = useState('ingreso');
  const [evDetail, setEvDetail] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [caseRes, usersRes, eventsRes] = await Promise.all([
          fetch(`/api/cases/${id}`, { cache: 'no-store' }),
          fetch('/api/users', { cache: 'no-store' }),
          fetch(`/api/case-events?case_id=${id}`, { cache: 'no-store' }),
        ]);

        const caseJson = await caseRes.json();
        const usersJson = await usersRes.json();
        const eventsJson = await eventsRes.json();

        setItem(caseJson.item ?? null);
        setUsers(usersJson.items ?? []);
        setEvents(eventsJson.items ?? []);

        if (caseJson.item) {
          setEstado(caseJson.item.estado ?? 'nuevo');
          setDescripcion(caseJson.item.descripcion ?? '');
          setNotaInterna(caseJson.item.nota_interna ?? '');
          setAbogadoId(caseJson.item.abogado?.id ?? '');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const abogadoName = useMemo(
    () => users.find((u) => u.id === abogadoId)?.name ?? '',
    [users, abogadoId]
  );

  async function saveCase() {
    setSaving(true);
    try {
      const body: Record<string, any> = {
        estado,
        descripcion: descripcion || null,
        abogado_id: abogadoId || null,
        nota_interna: notaInterna || null,
      };

      const r = await fetch(`/api/cases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error('Error guardando el caso');
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? 'Error guardando el caso');
    } finally {
      setSaving(false);
    }
  }

  async function addEvent() {
    if (!evDetail.trim()) {
      alert('Escribe un detalle para el evento.');
      return;
    }
    const body = { case_id: id, type: evType, detail: evDetail.trim() };
    const r = await fetch('/api/case-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (r.ok) {
      setEvents((prev) => [
        { ...body, id: crypto.randomUUID(), event_date: new Date().toISOString() },
        ...prev,
      ]);
      setEvDetail('');
    } else {
      alert('Error creando evento');
    }
  }

  if (loading) return <div className="p-6 text-slate-500">Cargando…</div>;
  if (!item) return <div className="p-6 text-rose-600">No se encontró el caso.</div>;

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_16px_40px_rgba(2,6,23,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-slate-500">
              <FolderKanban size={14} /> Caso
            </div>
            <h1 className="mt-2 text-[26px] font-semibold tracking-tight text-slate-900">
              {item.short_code}{' '}
              <span className="font-normal text-slate-500">— {item.lead?.name ?? '—'}</span>
            </h1>
            <p className="text-xs text-slate-500">
              Creado el {item.created_at ? new Date(item.created_at).toLocaleString('es-CL') : '—'}
            </p>
          </div>
          <div className="grid gap-2 text-sm text-slate-700">
            <Link
              href="https://oficinajudicialvirtual.pjud.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-white px-3 py-2 text-[12px] font-medium text-sky-700 shadow-sm transition hover:border-sky-300 hover:text-sky-800"
            >
              Oficina Judicial Virtual
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700">
              <User2 size={14} /> Lead: {item.lead?.short_code ?? '—'}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <BadgeCheck size={16} className="text-slate-600" /> Información del caso
              </div>
              <EstadoPill estado={estado} />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-700">
                Estado procesal
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {ESTADOS.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-slate-700">
                Abogado asignado
                <select
                  value={abogadoId}
                  onChange={(e) => setAbogadoId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Sin asignar</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

                <label className="mt-4 block text-sm text-slate-700">
                  Resumen / estrategia
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describe la situación actual, acuerdos con el cliente y próximos pasos."
                    className="mt-1 w-full min-h-28 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-100"
                  />
                </label>

                <label className="block text-sm text-slate-700">
                  Notas internas
                  <textarea
                    value={notaInterna}
                    onChange={(e) => setNotaInterna(e.target.value)}
                    placeholder="Usa este espacio para bitácora interna, acuerdos, pendientes, etc."
                    className="mt-1 w-full min-h-24 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-100"
                  />
                </label>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => void saveCase()}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1f2d5c] via-[#3358ff] to-[#2bb8d6] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-50"
              >
                Guardar cambios
              </button>
              <span className="text-xs text-slate-500">Última edición por {abogadoName || 'coord. sin asignar'}</span>
            </div>
          </section>

          {/* Eventos */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ClipboardList size={16} className="text-slate-600" /> Bitácora procesal
            </h3>
            <div className="space-y-3">
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-700 sm:flex-row sm:items-center">
                <select
                  value={evType}
                  onChange={(e) => setEvType(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-48"
                >
                  {EVENT_TYPES.map((ev) => (
                    <option key={ev} value={ev}>
                      {ev.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                <textarea
                  value={evDetail}
                  onChange={(e) => setEvDetail(e.target.value)}
                  placeholder="Detalle del hito o gestión"
                  className="h-16 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <button
                  type="button"
                  onClick={() => addEvent()}
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Registrar
                </button>
              </div>

              {events.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Aún no se registran hitos para este caso.
                </p>
              ) : (
                <ul className="space-y-3">
                  {events.map((ev) => (
                    <li key={ev.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                      <div className="flex items-center justify-between text-[12px] text-slate-500">
                        <span className="font-semibold text-slate-900">{ev.type.replace('_', ' ')}</span>
                        <span>{ev.event_date ? new Date(ev.event_date).toLocaleString('es-CL') : '—'}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{ev.detail}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <User2 size={16} className="text-slate-600" /> Datos del cliente
            </h3>
            <dl className="space-y-3 text-sm text-slate-700">
              <InfoRow label="Nombre" value={item.lead?.name ?? '—'} />
              <InfoRow label="Código lead" value={item.lead?.short_code ?? '—'} />
              <InfoRow label="Abogado asignado" value={abogadoName || 'Sin asignar'} />
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Building2 size={16} className="text-slate-600" /> Recursos para el abogado
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Plantillas de escritos: demanda, contestación, recurso.</li>
              <li>• Enlaces a jurisprudencia reciente.</li>
              <li>• Directorio de peritos y notarios sugeridos.</li>
              <li>• Política de comunicación con clientes LexMatch.</li>
            </ul>
          </section>

          <AttachmentsCard
            ownerId={id}
            ownerType="case"
            alsoFromLeadId={item.lead_id ?? undefined}
            title="Documentos del caso"
            description="Agrega minutas, escritos y respaldo compartido con el equipo."
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
