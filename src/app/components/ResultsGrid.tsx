// src/app/components/ResultsGrid.tsx

"use client";

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { CheckCircle, Scale, Archive, FileText } from 'lucide-react';

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
    caseId: "CL-2024-0812",
    headline: "Prescripción Extintiva de Deuda", 
    summary: "Se argumentó la prescripción de la acción de cobro ante tribunales.",
    detail: "Tras analizar los plazos legales, se interpuso una demanda de prescripción extintiva contra la entidad acreedora. El tribunal acogió nuestros argumentos, emitiendo una sentencia favorable que declaró la deuda como legalmente incobrable. Se procedió a oficiar al Boletín Comercial para la eliminación permanente y definitiva del registro, liberando al cliente de toda obligación.",
    timeline: "45 Días Hábiles",
    status: "success",
    metric: "Deuda Extinguida"
  },
  { 
    caseId: "CL-2024-0745",
    headline: "Acuerdo en Juicio Ejecutivo", 
    summary: "Negociación directa con abogados de la parte demandante.",
    detail: "En pleno proceso de cobranza judicial, nuestro equipo de litigantes tomó contacto directo con los abogados del acreedor. Se presentó una contrapropuesta sólida, resultando en un acuerdo de pago con una condonación del 72% de la deuda total, incluyendo intereses y costas procesales. El acuerdo fue ratificado judicialmente, cerrando el caso de forma favorable.",
    timeline: "28 Días Hábiles",
    status: "resolved",
    metric: "72% Condonación"
  },
  { 
    caseId: "CL-2024-0691",
    headline: "Abandono del Procedimiento", 
    summary: "Se solicitó el archivo de la causa por inactividad del acreedor.",
    detail: "Se realizó un seguimiento exhaustivo de la causa judicial, detectando inactividad procesal por parte del demandante por un período superior al legal. Se redactó y presentó un escrito solicitando el abandono del procedimiento, el cual fue acogido por el tribunal, resultando en el archivo definitivo de la causa y el cese completo de la acción de cobro.",
    timeline: "60 Días Hábiles",
    status: "closed",
    metric: "Caso Archivado"
  },
];

// --- 3. Configuración de Estilos (Completa y Tipada) ---
const statusConfig: Record<CaseStatus, StatusConfig> = {
  success: { label: "Éxito Total", color: "text-green-400", bg: "bg-green-500/10", icon: CheckCircle },
  resolved: { label: "Resuelto Favorablemente", color: "text-blue-400", bg: "bg-blue-500/10", icon: Scale },
  closed: { label: "Caso Cerrado", color: "text-indigo-400", bg: "bg-indigo-500/10", icon: Archive }
};

const panelVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2, ease: 'easeIn' } }
};

// --- Componente Principal ---
export default function ResultsGrid() {
  const [selected, setSelected] = useState(0);
  const activeCase = CASES[selected];
  const activeConfig = statusConfig[activeCase.status];
  const ActiveIcon = activeConfig.icon;

  return (
    <section className="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
      <div className="absolute inset-0 bg-grid-slate-800 [mask-image:linear-gradient(to_bottom,white_5%,transparent_50%)]"></div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-blue-400">Resultados Verificables</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Nuestro Historial de Expedientes
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            La transparencia es un pilar de nuestra firma. Explore una selección de nuestros casos para entender la rigurosidad y la eficacia de nuestro trabajo legal.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Panel de Selección de Expedientes */}
          <div className="flex flex-col gap-2 lg:col-span-4">
            {CASES.map((caseItem, index) => (
              <CaseSelector 
                key={caseItem.caseId} 
                caseData={caseItem} 
                isSelected={selected === index} 
                onClick={() => setSelected(index)}
              />
            ))}
          </div>

          {/* Panel de Visualización del Expediente */}
          <div className="lg:col-span-8">
            <div className="relative h-full w-full rounded-2xl bg-slate-800/50 p-8 shadow-2xl ring-1 ring-white/10 backdrop-blur-lg">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selected}
                  variants={panelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-400">Expediente N°: {activeCase.caseId}</p>
                      <h3 className="mt-1 text-xl font-bold text-white">{activeCase.headline}</h3>
                    </div>
                    <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${activeConfig.bg} ${activeConfig.color}`}>
                        <ActiveIcon className="h-4 w-4" />
                        {activeConfig.label}
                    </div>
                  </div>
                  
                  <div className="mt-6 border-t border-white/10 pt-6">
                    <h4 className="font-semibold text-slate-200">Análisis del Fallo</h4>
                    <p className="mt-2 text-slate-300 leading-relaxed">{activeCase.detail}</p>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-6 border-t border-white/10 pt-6">
                    <div>
                      <p className="text-sm text-slate-400">Plazo de Resolución</p>
                      <p className="mt-1 font-semibold text-white">{activeCase.timeline}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Resultado Clave</p>
                      <p className="mt-1 font-semibold text-white">{activeCase.metric}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 border-t border-white/10 pt-6">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-slate-500" />
                      <p className="text-sm text-slate-400">Toda la documentación y sentencias de este caso están debidamente archivadas y disponibles para consulta de nuestros clientes.</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Sub-componente para el Selector de Casos ---
function CaseSelector({ caseData, isSelected, onClick }: { caseData: CaseResult, isSelected: boolean, onClick: () => void }) {
  const config = statusConfig[caseData.status];
  const Icon = config.icon;
  return (
    <motion.button
      onClick={onClick}
      className={`relative w-full rounded-lg p-4 text-left transition-colors duration-200 ring-1 ${isSelected ? 'bg-blue-900/50 ring-blue-500' : 'bg-slate-800/50 ring-transparent hover:bg-slate-800/80'}`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${config.bg}`}>
          <Icon className={`h-4 w-4 ${config.color}`} />
        </div>
        <div>
          <p className="font-semibold text-white">{caseData.headline}</p>
          <p className="text-sm text-slate-400">{caseData.summary}</p>
        </div>
      </div>
    </motion.button>
  );
}