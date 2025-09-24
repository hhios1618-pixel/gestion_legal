// src/app/components/TrustBar.tsx

"use client";

import { motion, Variants } from 'framer-motion';
import { Scale, FileSignature, Timer } from 'lucide-react';

const trustPillars = [
  {
    icon: Scale,
    title: "Profesionales auditados",
    description: "Verificamos experiencia, referencias y capacidad operativa de cada estudio antes de incorporarlo a la red LexMatch."
  },
  {
    icon: FileSignature,
    title: "Mandatos bajo LexMatch",
    description: "Firmas propuestas con honorarios, entregables y SLA visibles. Nuestro equipo monitorea cada compromiso." 
  },
  {
    icon: Timer,
    title: "Respuesta garantizada",
    description: "Si un estudio se retrasa, LexMatch interviene, escala o reasigna. Tu caso nunca se queda sin seguimiento." 
  }
];

// Variantes para el contenedor principal
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
};

// Variantes para los elementos de texto y el sello
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

// Variantes para las tarjetas de pilares
const pillarCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

// Variantes para las líneas conectoras
const lineVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.8, ease: [0.6, 0.01, -0.05, 0.95], delay: 0.5 } }
};

export default function TrustBar() {
  return (
    <section className="bg-[#0f1b38] py-24 text-white sm:py-32">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto max-w-5xl px-6 lg:px-8"
      >
        {/* --- NUEVO BLOQUE DE ENCABEZADO --- */}
        <motion.div variants={itemVariants} className="text-center mb-20">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                La garantía operativa de LexMatch
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Procesos diseñados para que tu asunto legal avance con visibilidad total. Nosotros centralizamos la comunicación, el estudio se concentra en la estrategia.
            </p>
        </motion.div>
        {/* --- FIN DEL NUEVO BLOQUE --- */}

        <div className="relative grid grid-cols-1 items-center gap-y-16 lg:grid-cols-3 lg:gap-x-16">
          <PillarCard pillar={trustPillars[0]} alignment="right" />
          
          <div className="relative flex justify-center items-center h-full">
            <motion.div variants={lineVariants} className="absolute right-1/2 top-1/2 h-0.5 w-1/2 origin-right bg-gradient-to-l from-blue-500/80 to-slate-700 hidden lg:block" />
            
            <motion.div variants={itemVariants} className="relative z-10 grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl shadow-blue-500/20 ring-1 ring-slate-700">
              <Scale className="h-12 w-12 text-blue-400" />
            </motion.div>
            
            <motion.div variants={lineVariants} className="absolute left-1/2 top-1/2 h-0.5 w-1/2 origin-left bg-gradient-to-r from-blue-500/80 to-slate-700 hidden lg:block" />
          </div>

          <PillarCard pillar={trustPillars[1]} alignment="left" />
          {/* Ajuste para el tercer pilar para mejor alineación en todas las vistas */}
          <div className="lg:col-start-2 lg:flex lg:justify-center">
            <PillarCard pillar={trustPillars[2]} alignment="center" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function PillarCard({ pillar, alignment }: { pillar: typeof trustPillars[0], alignment: 'left' | 'right' | 'center' }) {
  const Icon = pillar.icon;
  const textAlign = alignment === 'right' ? 'lg:text-right' : (alignment === 'center' ? 'text-center' : 'lg:text-left');
  const itemsAlign = alignment === 'right' ? 'lg:items-end' : (alignment === 'center' ? 'items-center' : 'lg:items-start');

  return (
    <motion.div variants={pillarCardVariants} className={`group relative flex flex-col items-center ${itemsAlign}`}>
      <div className="grid h-16 w-16 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[#3358ff] group-hover:to-[#2bb8d6] group-hover:ring-[#9fb2ff]">
        <Icon className="h-8 w-8 text-[#9fb2ff] transition-colors group-hover:text-white" />
      </div>
      <h3 className={`mt-6 text-lg font-bold text-white ${textAlign}`}>{pillar.title}</h3>
      <p className={`mt-2 text-slate-300 ${textAlign}`}>{pillar.description}</p>
    </motion.div>
  );
}
