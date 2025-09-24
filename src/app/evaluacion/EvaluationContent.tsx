"use client";

import { useState } from 'react';
import EvalLeadForm from '@/app/evaluacion/EvalLeadForm';
import BotonAbrirChat from './BotonAbrirChat';
import MatterModal, { Matter } from '@/app/evaluacion/MatterModal';

const MATTERS: Matter[] = [
  {
    id: 'pension-alimentos',
    title: 'Demanda por pensión de alimentos',
    summary:
      'Analizamos la demanda, revisamos pagos anteriores y coordinamos audiencias para negociar o presentar defensas sólidas según tu situación.',
    timing: 'Coordinación inicial en 48 horas. Seguimiento semanal durante el proceso judicial.',
    documents: ['Citación o demanda', 'Comprobantes de pago anteriores', 'Información de ingresos y gastos'],
  },
  {
    id: 'embargo',
    title: 'Embargo o retención de bienes',
    summary:
      'Levantamos la información del embargo, evaluamos alternativas de tercería o acuerdos y definimos un plan para proteger tu patrimonio.',
    timing: 'Evaluación urgente en 24 horas. Plan de acción acordado dentro de los siguientes 3 días hábiles.',
    documents: ['Notificación de embargo', 'Listado de bienes afectados', 'Contacto del receptor o tribunal'],
  },
  {
    id: 'divorcio',
    title: 'Divorcio de común acuerdo',
    summary:
      'Coordinamos la redacción de acuerdos, agenda con mediador y presentación del convenio ante el tribunal para cerrar el proceso sin conflictos.',
    timing: 'Preparación de documentos en 5 a 7 días. Homologación en tribunal entre 30 y 45 días.',
    documents: ['Acta de matrimonio', 'Certificado de nacimiento de hijos', 'Borrador de acuerdos (si existe)'],
  },
  {
    id: 'despido-injustificado',
    title: 'Despido injustificado o autodespido',
    summary:
      'Revisamos la documentación laboral, calculamos indemnizaciones y representamos tu caso para lograr un acuerdo favorable o demandar.',
    timing: 'Coordinación y cálculo en 72 horas. Audiencia de conciliación según agenda del tribunal laboral.',
    documents: ['Carta de despido o renuncia', 'Liquidaciones de sueldo', 'Contrato y anexos'],
  },
  {
    id: 'arriendo-impago',
    title: 'Arriendo impago o término anticipado',
    summary:
      'Definimos la estrategia para recuperar la propiedad, gestionar la deuda y, si corresponde, ejecutar garantías o medidas precautorias.',
    timing: 'Notificación y coordinación legal en 5 días. Restitución según tribunal (30–60 días).',
    documents: ['Contrato de arriendo', 'Pagos pendientes', 'Inventario o acta de entrega'],
  },
  {
    id: 'creacion-empresa',
    title: 'Constitución de empresa y pactos',
    summary:
      'Seleccionamos al estudio adecuado para definir tipo societario, redactar estatutos y pactos entre socios con tiempos rápidos.',
    timing: 'Borrador de estatutos en 7 días. Inscripción y timbraje entre 10 y 15 días.',
    documents: ['Datos de socios', 'Actividad comercial', 'Acuerdos preliminares'],
  },
  {
    id: 'marca',
    title: 'Registro y defensa de marca',
    summary:
      'Evaluamos la viabilidad de la marca, presentamos la solicitud y respondemos oposiciones para proteger tu identidad comercial.',
    timing: 'Presentación inicial en 72 horas. Seguimiento mensual hasta resolución de INAPI (4–6 meses).',
    documents: ['Nombre y logo', 'Clasificación de productos o servicios', 'Uso actual o futuro de la marca'],
  },
  {
    id: 'accidente',
    title: 'Accidente o responsabilidad civil',
    summary:
      'Recolectamos antecedentes, coordinamos peritajes y estructuramos la demanda o defensa para buscar una indemnización justa.',
    timing: 'Revisión inicial en 5 días. Demanda o acuerdo en 30–60 días.',
    documents: ['Parte policial o constatación de lesiones', 'Comprobantes de gastos médicos', 'Fotografías o videos del hecho'],
  },
  {
    id: 'compliance',
    title: 'Cumplimiento normativo y compliance',
    summary:
      'Asignamos un equipo que diagnostica riesgos, crea políticas internas y capacita a tu organización para cumplir la normativa vigente.',
    timing: 'Diagnóstico en 3 semanas. Implementación según tamaño de la empresa (1–3 meses).',
    documents: ['Organigrama y estructura', 'Políticas actuales', 'Reportes de auditorías previas'],
  },
  {
    id: 'herencias',
    title: 'Herencias y posesión efectiva',
    summary:
      'Gestionamos la posesión efectiva, acuerdos entre herederos y regularización de bienes para cerrar el proceso sin conflictos.',
    timing: 'Ingreso de antecedentes en 10 días. Resolución del Registro Civil en 30–45 días promedio.',
    documents: ['Certificado de defunción', 'Certificados de nacimiento de herederos', 'Listado de bienes y deudas'],
  },
];

export default function EvaluationContent() {
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const handleMatterClick = (matter: Matter) => {
    setSelectedMatter(matter);
    setOpenModal(true);
  };

  return (
    <>
      {/* Cintillo/hero corporativo */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_80%_-20%,#D1FAE5_0%,transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_400px_at_-10%_20%,#E0E7FF_0%,transparent_60%)]" />
        <div className="mx-auto max-w-6xl px-6 py-12 sm:py-14">
          <p className="text-xs font-semibold tracking-[0.4em] text-[#1f2d5c]">
            LEXMATCH | COORDINACIÓN LEGAL
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            Describe tu caso legal
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">
            Comparte los antecedentes clave y archivos relevantes. En menos de 6 horas hábiles te enviaremos propuestas de estudios verificados y nuestro equipo se mantendrá como punto de contacto único.
          </p>

          {/* Mini KPIs / confianza */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dbe3ff] bg-[#eef1f9] px-3 py-1 text-[#1f2d5c]">
              <svg width="16" height="16" viewBox="0 0 24 24" className="fill-current">
                <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              Matching en &lt;6h hábiles
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dbe3ff] bg-white px-3 py-1 text-[#1f2d5c]">
              Datos cifrados
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dbe3ff] bg-white px-3 py-1 text-[#1f2d5c]">
              Seguimiento en dashboard
            </span>
          </div>
        </div>
      </section>

      {/* Materias destacadas */}
      <section className="mx-auto max-w-6xl px-6 pb-8">
        <div className="rounded-3xl border border-[#dbe3ff] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#1f2d5c]">¿Qué necesitas resolver?</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Selecciona una materia y te guiamos paso a paso</h2>
              <p className="mt-1 text-sm text-slate-600">Cada botón abre un resumen con alcance, tiempos y documentos recomendados.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MATTERS.map((matter) => (
              <button
                key={matter.id}
                onClick={() => handleMatterClick(matter)}
                className="group flex items-center justify-between rounded-2xl border border-[#dbe3ff] bg-white px-4 py-4 text-left shadow-[0_10px_25px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-[#3358ff] hover:shadow-[0_16px_32px_rgba(15,23,42,0.1)]"
              >
                <div>
                  <p className="font-semibold text-[#1f2d5c]">{matter.title}</p>
                  <p className="mt-1 text-xs text-slate-500">Haz clic para ver cómo lo abordamos</p>
                </div>
                <span className="rounded-full bg-[#eef1f9] px-3 py-1 text-xs font-semibold text-[#3358ff] transition group-hover:bg-[#3358ff] group-hover:text-white">
                  Ver detalle
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section
            className="lg:col-span-2 rounded-2xl border border-[#dbe3ff] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
            aria-labelledby="form-title"
          >
            <h2 id="form-title" className="mb-4 text-sm font-semibold text-slate-900">
              Datos principales
            </h2>
            <EvalLeadForm />
            <p className="mt-3 text-xs text-slate-500">
              * Con nombre y un canal de contacto podemos iniciar el matching.
            </p>
          </section>

          <aside className="lg:sticky lg:top-6 h-fit rounded-2xl border border-[#dbe3ff] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <h3 className="text-lg font-semibold text-slate-900">¿Necesitas ayuda inmediata?</h3>
            <p className="mt-2 text-slate-600">
              Conversa con un <span className="font-semibold text-slate-900">coordinador LexMatch</span> por chat y recibe recomendaciones mientras completas el formulario.
            </p>
            <div className="mt-4">
              <BotonAbrirChat />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              También puedes completar el formulario y coordinaremos por tu correo o teléfono.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#3358ff]" />
                Red de estudios y abogados verificados en Chile
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#3358ff]" />
                Reuniones virtuales o presenciales según tu preferencia
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#3358ff]" />
                Gestión de documentos y avances en un solo panel
              </li>
            </ul>
          </aside>
        </div>

        <div className="mt-10 rounded-2xl border border-[#dbe3ff] bg-[#eef1f9] p-5">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Mencionados por</p>
          <div className="mt-4 grid grid-cols-2 items-center gap-6 opacity-80 sm:grid-cols-4">
            <div className="h-8 rounded bg-white/60 backdrop-blur-sm" />
            <div className="h-8 rounded bg-white/60 backdrop-blur-sm" />
            <div className="h-8 rounded bg-white/60 backdrop-blur-sm" />
            <div className="h-8 rounded bg-white/60 backdrop-blur-sm" />
          </div>
        </div>

        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[#dbe3ff] bg-white p-4 text-sm text-slate-700">
            <div className="mb-1 text-base font-semibold text-slate-900">Matching curado</div>
            <p className="text-slate-600">
              Seleccionamos abogados por experiencia específica, disponibilidad y zona cuando es relevante.
            </p>
          </div>
          <div className="rounded-xl border border-[#dbe3ff] bg-white p-4 text-sm text-slate-700">
            <div className="mb-1 text-base font-semibold text-slate-900">Transparencia total</div>
            <p className="text-slate-600">
              Recibes propuestas comparables con honorarios, etapas y responsables antes de firmar.
            </p>
          </div>
          <div className="rounded-xl border border-[#dbe3ff] bg-white p-4 text-sm text-slate-700">
            <div className="mb-1 text-base font-semibold text-slate-900">Documentos protegidos</div>
            <p className="text-slate-600">
              Almacena mandatos, minutas y comprobantes en un entorno cifrado con auditoría.
            </p>
          </div>
        </section>

        <section className="mt-10 overflow-hidden rounded-2xl border border-[#dbe3ff] bg-gradient-to-br from-white via-[#eef1f9] to-white p-6 sm:p-8">
          <div className="grid items-center gap-6 sm:grid-cols-2">
            <div>
              <h4 className="text-xl font-semibold text-slate-900">¿Listo para dar el primer paso?</h4>
              <p className="mt-2 text-slate-600">
                Completa el formulario o abre el chat para que un coordinador te guíe en tiempo real.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="#form-title"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#1f2d5c] via-[#3358ff] to-[#2bb8d6] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:scale-105"
                >
                  Completar evaluación
                </a>
                <div className="inline-flex">
                  <BotonAbrirChat />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[#dbe3ff] bg-white/80 p-4 text-sm text-slate-700 backdrop-blur-sm">
              <p className="font-semibold text-slate-900">Nuestra promesa</p>
              <p className="mt-1 text-slate-600">
                Te entregaremos opciones claras para elegir. Si necesitas cambiar de abogado o ajustar el alcance, mantenemos toda la documentación y trazabilidad activa.
              </p>
            </div>
          </div>
        </section>
      </section>

      <MatterModal matter={selectedMatter} open={openModal} onOpenChange={setOpenModal} />
    </>
  );
}
