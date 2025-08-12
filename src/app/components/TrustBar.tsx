// src/app/components/TrustBar.tsx

"use client";

import { motion, Variants } from 'framer-motion';
import { Scale, FileSignature, Timer } from 'lucide-react';

const trustPillars = [
  {
    icon: Scale,
    title: "Respaldo Jurídico Integral",
    description: "Cada estrategia es diseñada y ejecutada por un equipo de abogados expertos en derecho de deudas."
  },
  {
    icon: FileSignature,
    title: "Contratos y Acuerdos Formales",
    description: "Toda nuestra relación y gestión se formaliza por escrito, garantizando transparencia y seguridad."
  },
  {
    icon: Timer,
    title: "Trazabilidad del Caso 24/7",
    description: "Acceso a nuestra plataforma digital para monitorear el avance de tu caso en tiempo real, cuando lo necesites."
  }
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

const lineVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.8, ease: [0.6, 0.01, -0.05, 0.95] } }
};

export default function TrustBar() {
  return (
    <section className="bg-slate-900 text-white py-20 sm:py-28">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto max-w-5xl px-6 lg:px-8"
      >
        <div className="relative grid grid-cols-1 items-center gap-y-16 lg:grid-cols-3 lg:gap-x-16">
          {/* Nodo Izquierdo */}
          <PillarCard pillar={trustPillars[0]} alignment="right" />
          
          {/* Sello Central y Líneas */}
          <div className="relative flex justify-center items-center h-full">
            {/* Línea Izquierda */}
            <motion.div variants={lineVariants} className="absolute right-1/2 top-1/2 h-0.5 w-1/2 origin-right bg-gradient-to-l from-blue-500/80 to-slate-700 hidden lg:block" />
            
            <motion.div variants={itemVariants} className="relative z-10 grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl shadow-blue-500/20 ring-1 ring-slate-700">
              <Scale className="h-12 w-12 text-blue-400" />
            </motion.div>
            
            {/* Línea Derecha */}
            <motion.div variants={lineVariants} className="absolute left-1/2 top-1/2 h-0.5 w-1/2 origin-left bg-gradient-to-r from-blue-500/80 to-slate-700 hidden lg:block" />
          </div>

          {/* Nodos Derecho y Central (en mobile) */}
          <PillarCard pillar={trustPillars[1]} alignment="left" />
          <div className="lg:hidden">
            <PillarCard pillar={trustPillars[2]} alignment="left" />
          </div>
        </div>
         <div className="hidden lg:grid grid-cols-3 mt-8">
            <div></div>
             <PillarCard pillar={trustPillars[2]} alignment="center" />
            <div></div>
        </div>
      </motion.div>
    </section>
  );
}

function PillarCard({ pillar, alignment }: { pillar: typeof trustPillars[0], alignment: 'left' | 'right' | 'center' }) {
  const Icon = pillar.icon;
  const textAlign = alignment === 'right' ? 'text-right' : (alignment === 'center' ? 'text-center' : 'text-left');
  const itemsAlign = alignment === 'right' ? 'items-end' : (alignment === 'center' ? 'items-center' : 'items-start');

  return (
    <motion.div variants={itemVariants} className={`group relative flex flex-col ${itemsAlign}`}>
      <div className="grid h-16 w-16 place-items-center rounded-xl bg-slate-800 ring-1 ring-slate-700 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-900/50 group-hover:ring-blue-500">
        <Icon className="h-8 w-8 text-slate-300 transition-colors group-hover:text-white" />
      </div>
      <h3 className="mt-6 text-lg font-bold text-slate-100">{pillar.title}</h3>
      <p className={`mt-2 text-slate-400 ${textAlign}`}>{pillar.description}</p>
    </motion.div>
  );
}