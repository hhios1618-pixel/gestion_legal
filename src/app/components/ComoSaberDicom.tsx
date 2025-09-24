// src/app/components/ComoSaberDicom.tsx

"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Users,
  CalendarClock,
  ChevronDown,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

const STEPS = [
  {
    icon: FileText,
    title: 'Cuéntanos qué necesitas',
    description:
      'Completa un breve formulario con el contexto, urgencia y documentos claves. Nuestro equipo de coordinación revisa la información y te confirma los próximos pasos en minutos.',
  },
  {
    icon: Users,
    title: 'Proponemos a los especialistas correctos',
    description:
      'Buscamos en nuestra red de estudios verificados la mejor combinación entre experiencia, disponibilidad y estilo de comunicación. Recibes opciones claras en un tablero comparativo.',
  },
  {
    icon: CalendarClock,
    title: 'Coordinamos y hacemos seguimiento',
    description:
      'Agendas, entregables y comunicación pasan por LexMatch. Si un estudio se demora, intervenimos, escalamos o reasignamos para que nada se detenga.',
  },
] as const;

const FAQS = [
  {
    q: '¿Qué tipo de asuntos pueden gestionar?',
    a: 'Trabajamos contratos comerciales, gobierno corporativo, familia, inmobiliario, laboral, compliance, litigios y más. Nuestro equipo identifica al especialista indicado para cada caso.',
  },
  {
    q: '¿Cómo verifican a los estudios de la red?',
    a: 'Revisamos colegiatura activa, casos patrocinados, referencias y capacidad operativa. Además, todos firman nuestro código de servicio, confidencialidad y tiempos de respuesta.',
  },
  {
    q: '¿Puedo trabajar 100% en línea?',
    a: 'Sí. Reuniones, firma de mandatos, envío de documentos y seguimiento se realizan en la plataforma LexMatch. Las instancias presenciales quedan a tu criterio.',
  },
  {
    q: '¿Quién administra la comunicación?',
    a: 'Nuestro equipo coordina mensajes, recordatorios y entregables. Si necesitas ayuda, tienes un canal directo con nuestro staff de coordinación para resolver cualquier duda.',
  },
] as const;

const HIGHLIGHT_POINTS = [
  'Respuestas garantizadas por nuestro equipo en menos de 6 horas hábiles.',
  'Escalamiento y reasignación cuando un estudio no responde a tiempo.',
  'Documentación, minutas y avances resguardados en tu panel LexMatch.',
] as const;

export default function ComoSaberDicom() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="relative bg-[#f5f7fb] py-24 sm:py-32">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(900px_320px_at_20%_0%,rgba(51,88,255,0.12),transparent_70%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#1f2d5c]">
              Acompañamiento LexMatch
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Así te guiamos durante todo el proceso
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Queremos que entiendas cada etapa y te sientas acompañado desde el primer contacto. Mientras los estudios se concentran en la estrategia jurídica, nosotros cuidamos la experiencia, los tiempos y la comunicación.
            </p>

            <div className="mt-10 space-y-4">
              {STEPS.map((step, index) => (
                <StepCard key={step.title} step={step} index={index + 1} />
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-3xl bg-[#1b2f8a] p-8 text-white shadow-[0_32px_70px_rgba(24,40,113,0.35)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_10%_0%,rgba(51,88,255,0.35),transparent_70%)]" aria-hidden />
            <div className="relative">
              <h3 className="text-2xl font-semibold">Equipo LexMatch</h3>
              <p className="mt-3 text-base leading-relaxed text-[#e0e6ff]">
                Nuestro equipo de coordinación conversa contigo, cuida cada interacción con los estudios y te reporta avances claros. Siempre sabrás quién hace qué y para cuándo.
              </p>

              <ul className="mt-8 space-y-3 text-sm text-[#f0f3ff]">
                {HIGHLIGHT_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2bb8d6]" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-2xl border border-white/20 bg-white/12 p-5 text-sm text-[#dfe4ff]">
                <p className="font-medium text-white">Coordinación supervisada</p>
                <p className="mt-1 leading-relaxed">
                  Más de 120 estudios y abogados senior con SLA auditados por LexMatch. Si la gestión se detiene, reasignamos y mantenemos cada avance documentado.
                </p>
              </div>

              <p className="mt-6 text-sm text-[#cbd6ff]">
                Estamos conectados por chat, correo y teléfono para resolver cualquier duda. Tu experiencia siempre tiene un nombre y un equipo detrás.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="mt-16">
          <h3 className="text-xl font-semibold text-slate-900">Preguntas frecuentes</h3>
          <p className="mt-2 text-sm text-slate-600">
            Información clara para decidir con tranquilidad. Si necesitas algo más, nuestro equipo de coordinación está a un mensaje de distancia.
          </p>
          <div className="mt-6 rounded-2xl border border-[#dbe3ff] bg-white shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
            {FAQS.map((faq, index) => (
              <FaqAccordionItem
                key={faq.q}
                faq={faq}
                isOpen={openFaq === index}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type Step = (typeof STEPS)[number];

function StepCard({ step, index }: { step: Step; index: number }) {
  const Icon = step.icon;
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-[#dbe3ff] bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] hover:shadow-[0_24px_55px_rgba(15,23,42,0.08)] transition-shadow">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef1f9] text-[#3358ff]">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1f2d5c]">
          Paso {index}
        </span>
        <h3 className="mt-2 text-lg font-semibold text-[#0b1424]">{step.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#4c5a74]">{step.description}</p>
      </div>
    </div>
  );
}

function FaqAccordionItem({
  faq,
  isOpen,
  onClick,
}: {
  faq: { q: string; a: string };
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-[#e2e6f2] last:border-b-0">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-base font-semibold text-[#0b1424]">{faq.q}</span>
        <ChevronDown
          className={`h-5 w-5 text-[#3358ff] transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto' },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm leading-6 text-[#4c5a74]">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
