// src/app/components/ResultsGrid.tsx

"use client";

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { CheckCircle, Scale, Archive, FileText, Plus, Minus } from 'lucide-react';

// --- 1. Definiciones de Tipos (Completas y Seguras) ---
type CaseStatus = "success" | "resolved" | "closed";

type CaseResult = {
  caseId: string;
  headline: string;
  summary: string;
  detail: string;
  timeline: string;
  status: CaseStatus;
  metric: string;
};

type StatusConfig = {
  label: string;
  color: string;
  bg: string;
  icon: React.ElementType;
};

// --- 2. Datos de Casos (Completos) ---
const CASES: CaseResult[] = [
  {
    caseId: "CL-2025-FAM-021",
    headline: "Plan parental homologado",
    summary: "Concierge LexMatch coordinó mediación familiar y homologación en tribunal de Santiago.",
    detail:
      "La clienta ingresó su caso por custodia compartida. LexMatch presentó dos estudios verificados, se eligió un equipo experto en mediaciones sensibles y se calendarizaron sesiones virtuales. Tras tres reuniones, se logró un acuerdo integral y el tribunal homologó el plan parental en 37 días.",
    timeline: "37 Días",
    status: "success",
    metric: "Acuerdo homologado"
  },
  {
    caseId: "CL-2025-ARR-014",
    headline: "Desalojo con restitución",
    summary: "Dueña de departamento recupera inmueble y LexMatch controla el plan de pagos.",
    detail:
      "El estudio propuesto por LexMatch presentó demanda de terminación y medida precautoria. Nuestro equipo documentó daños, gestionó el comparendo virtual y supervisó el calendario de pagos. El arrendatario restituyó el inmueble y se pactó pago en cuotas monitoreadas.",
    timeline: "52 Días",
    status: "resolved",
    metric: "Inmueble recuperado"
  },
  {
    caseId: "CL-2024-LAB-088",
    headline: "Indemnización laboral completa",
    summary: "Trabajador despedido obtiene indemnización completa con seguimiento LexMatch.",
    detail:
      "Se asignó un estudio laboral con disponibilidad inmediata en Valparaíso. LexMatch coordinó la confección de la demanda y reunió antecedentes en la plataforma. En audiencia se pactó indemnización por años de servicio con recargo del 30% y regularización de cotizaciones.",
    timeline: "41 Días",
    status: "closed",
    metric: "Pago 130%"
  },
];

// --- 3. Configuración de Estilos (Completa y Tipada) ---
const statusConfig: Record<CaseStatus, StatusConfig> = {
  success: { label: "Entrega completada", color: "text-[#4ade80]", bg: "bg-[#4ade80]/15", icon: CheckCircle },
  resolved: { label: "Caso resuelto", color: "text-[#60a5fa]", bg: "bg-[#60a5fa]/15", icon: Scale },
  closed: { label: "Cierre con seguimiento", color: "text-[#a78bfa]", bg: "bg-[#a78bfa]/15", icon: Archive }
};

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

// --- Componente Principal ---
export default function ResultsGrid() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <section className="bg-[#101a3b] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-base font-semibold uppercase tracking-[0.35em] text-[#8fa2ff]">Casos reales LexMatch</h2>
          <p className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            De la solicitud al resultado coordinado
          </p>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#b9c5ff]">
            Historias de clientes que delegaron la operación legal en LexMatch. Muestra cómo combinamos especialistas, tecnología y un equipo de coordinación que asegura respuestas y escalamiento oportuno.
          </p>
        </motion.div>

        {/* Línea de Tiempo Interactiva */}
        <div className="mt-20">
          <div className="relative">
            {/* La línea de tiempo horizontal */}
            <div className="absolute top-5 left-0 h-0.5 w-full bg-white/10"></div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="relative grid grid-cols-1 gap-12 lg:grid-cols-3"
            >
              {CASES.map((caseItem, index) => (
                <TimelineItem
                  key={caseItem.caseId}
                  caseData={caseItem}
                  isExpanded={expandedIndex === index}
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Sub-componente para cada item de la Línea de Tiempo ---
function TimelineItem({ caseData, isExpanded, onClick }: { caseData: CaseResult, isExpanded: boolean, onClick: () => void }) {
  const config = statusConfig[caseData.status];
  const Icon = config.icon;

  return (
    <motion.div variants={itemVariants} className="relative flex flex-col items-start">
      {/* Nodo en la línea de tiempo */}
      <div className="relative z-10">
        <div className={`grid h-10 w-10 place-items-center rounded-full ${isExpanded ? 'bg-gradient-to-br from-[#3358ff] to-[#2bb8d6]' : 'bg-white/10 ring-4 ring-[#101a3b]'}`}>
          <Icon className={`h-5 w-5 ${isExpanded ? 'text-white' : 'text-[#8fa2ff]'}`} />
        </div>
      </div>

      {/* Tarjeta de Contenido */}
      <motion.div 
        layout
        className="mt-6 w-full rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-xl"
        transition={{ layout: { duration: 0.4, ease: "easeOut" } }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">{caseData.headline}</h3>
            <button onClick={onClick} className="flex-shrink-0 grid h-7 w-7 place-items-center rounded-full bg-white/10 text-[#8fa2ff] transition-all hover:bg-white/20 hover:text-white">
              {isExpanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </button>
          </div>
          
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: '1.5rem' }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="border-t border-white/15 pt-6">
                  <p className="text-[#e2e6f2]">{caseData.detail}</p>
                  <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg bg-[#101a3b]/60 p-4 ring-1 ring-white/15">
                    <div>
                      <p className="text-xs text-[#9fb2ff]">Plazo resolución</p>
                      <p className="font-semibold text-white">{caseData.timeline}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9fb2ff]">Resultado clave</p>
                      <p className="font-semibold text-white">{caseData.metric}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
