"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ShieldCheck, HelpCircle } from "lucide-react";

// Contenido mejorado
const faqs = [
  {
    q: "¿Cuánto tarda la asignación de un abogado?",
    a: "Entre 2 y 6 horas hábiles. Validamos disponibilidad, especialidad y posibles conflictos de interés antes de enviar propuestas para que elijas.",
  },
  {
    q: "¿Debo pagar algo para recibir propuestas?",
    a: "No. La recopilación de antecedentes y el matching inicial no tienen costo. Solo contratas cuando aceptas la propuesta del abogado.",
  },
  {
    q: "¿Puedo cambiar de profesional si no estoy conforme?",
    a: "Sí. Nuestro equipo de soporte reasigna tu caso y protege el trabajo ya realizado. Conservamos bitácoras y documentos en el panel para evitar retrabajos.",
  },
  {
    q: "¿Qué seguridad tiene mi información?",
    a: "Utilizamos cifrado en tránsito y en reposo, controles de acceso y registro de auditoría. Todos los abogados firman acuerdos de confidencialidad y secreto profesional.",
  },
];

// Subcomponente para cada fila del acordeón
function AccordionItem({
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
        <span className="text-base font-semibold text-slate-800">{faq.q}</span>
        <ChevronDown
          className={`h-5 w-5 text-[#3358ff] transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
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
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-base text-slate-600">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPreview() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-3 lg:gap-8 lg:px-8">
        {/* Columna de Título y Contexto */}
        <div className="lg:col-span-1">
          <HelpCircle className="h-10 w-10 text-[#3358ff]" />
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Respuestas Claras
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Entendemos lo que significa delegar tu operación legal. Aquí respondemos las preguntas clave con la transparencia que guía cada caso LexMatch.
          </p>
           <Link
              href="/faq"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1f2d5c] via-[#3358ff] to-[#2bb8d6] px-5 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105"
            >
              Ver todas las preguntas
              <span aria-hidden="true">→</span>
            </Link>
        </div>

        {/* Columna de Preguntas Frecuentes */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-[#dbe3ff] bg-white shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                faq={faq}
                isOpen={openIndex === i}
                onClick={() => handleToggle(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
