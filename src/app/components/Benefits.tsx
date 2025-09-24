// src/app/components/Benefits.tsx

"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Handshake, ShieldCheck, FileCheck, ArrowRight, BarChart, Clock, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { PieChart } from 'react-minimal-pie-chart';

// Estructura de datos
type Method = {
  title: string;
  desc: string;
  icon: React.ElementType;
  metrics: {
    complexity: string;
    time: string;
    success: string;
  };
  cta: string;
};

const METHODS: Method[] = [
  {
    title: "Familia y personas",
    desc: "Abogados especializados en mediaciones, acuerdos parentales y sucesiones, con coordinación emocionalmente responsable y reportes LexMatch.",
    icon: Scale,
    metrics: { complexity: "Alta", time: "30-90 Días", success: "94%" },
    cta: "Solicitar propuesta familiar"
  },
  {
    title: "Empresas y contratos",
    desc: "Redacción, revisión y negociación de contratos comerciales con equipos que explican riesgos y compromisos en lenguaje claro.",
    icon: Handshake,
    metrics: { complexity: "Media", time: "15-60 Días", success: "95%" },
    cta: "Fortalecer mi operación"
  },
  {
    title: "Laboral y talento",
    desc: "Representación de trabajadores y asesoría a empleadores con matrices de cumplimiento, prevención y defensa estratégica.",
    icon: ShieldCheck,
    metrics: { complexity: "Alta", time: "Variable", success: "91%" },
    cta: "Evaluar apoyo laboral"
  },
  {
    title: "Litigios estratégicos",
    desc: "Acciones judiciales y acuerdos extrajudiciales con equipos que coordinan peritajes, minutas y audiencias sin que pierdas visibilidad.",
    icon: FileCheck,
    metrics: { complexity: "Media", time: "45-120 Días", success: "88%" },
    cta: "Diseñar plan de litigio"
  },
];

// --- Componente Principal ---
export default function Benefits() {
  const [selected, setSelected] = useState(0);
  const activeMethod = METHODS[selected];
  const ActiveIcon = activeMethod.icon;

  const getChartData = (metrics: Method["metrics"]) => {
    // Lógica simple para visualizar datos cualitativos en un gráfico
    const complexityValue = { 'Alta': 3, 'Media': 2, 'Baja': 1 }[metrics.complexity] || 1;
    const timeValue = {
      '3-6 Meses': 3,
      '1-2 Meses': 2,
      '30 Días': 1,
      '30-90 Días': 2,
      '15-60 Días': 2,
      '45-120 Días': 3,
      'Variable': 1,
    }[metrics.time] || 1;
    const successValue = parseFloat(metrics.success) / 100 * 3;
    
    return [
      { title: 'Complejidad', value: complexityValue, color: '#3358ff' },
      { title: 'Tiempo', value: timeValue, color: '#2bb8d6' },
      { title: 'Éxito', value: successValue, color: '#f6a44c' },
    ];
  };
  
  const chartData = getChartData(activeMethod.metrics);

  return (
    <section className="relative overflow-hidden bg-[#0c1733] py-24 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(1100px_600px_at_10%_-20%,rgba(51,88,255,0.22),transparent),radial-gradient(900px_520px_at_80%_120%,rgba(43,184,214,0.18),transparent)]"></div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-7xl px-6 lg:px-8"
      >
        <div className="text-center">
          <h2 className="text-base font-semibold uppercase tracking-[0.4em] text-[#9fb2ff]">Servicios LexMatch</h2>
          <p className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Expertos legales con coordinación garantizada
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#cbd6ff]">
            Seleccionamos firmas con la mezcla correcta de experiencia, disponibilidad y habilidades comunicacionales. Cada especialidad cuenta con métricas y seguimiento directo del equipo LexMatch.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
          <div className="flex flex-col gap-2">
            {METHODS.map((method, index) => (
              <MethodSelector
                key={method.title}
                method={method}
                isSelected={selected === index}
                onClick={() => setSelected(index)}
              />
            ))}
          </div>
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }}
                exit={{ opacity: 0, y: -30, transition: { duration: 0.3, ease: "easeIn" } }}
                className="relative flex h-full w-full flex-col rounded-2xl bg-white/8 p-8 shadow-[0_28px_60px_rgba(10,16,32,0.45)] ring-1 ring-white/15 backdrop-blur-xl"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#3358ff] to-[#2bb8d6] text-white shadow-lg">
                      <ActiveIcon className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-white">{activeMethod.title}</h3>
                  <p className="mt-3 text-[#e2e6f2] leading-relaxed">{activeMethod.desc}</p>
                </div>
                
                <div className="my-8 flex-grow flex items-center justify-center gap-6 md:gap-12">
                  <div className="relative h-32 w-32 md:h-36 md:w-36">
                    <PieChart
                      data={chartData}
                      lineWidth={15}
                      startAngle={-90}
                      animate
                      animationDuration={1000}
                      animationEasing="ease-out"
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-center">
                       <p className="text-xs font-semibold text-[#9fb2ff]">Métricas</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <MetricItem icon={BrainCircuit} label="Complejidad" value={activeMethod.metrics.complexity} color="#3358ff" />
                    <MetricItem icon={Clock} label="Tiempo estimado" value={activeMethod.metrics.time} color="#2bb8d6" />
                    <MetricItem icon={BarChart} label="Casos exitosos" value={activeMethod.metrics.success} color="#f6a44c" />
                  </div>
                </div>

                {/* --- DIV DEL BOTÓN CORREGIDO --- */}
                <div className="mt-auto text-center md:text-left">
                  {/* Clases ajustadas para un botón más pequeño */}
                  <Link href="/evaluacion" className="wow-button-small primary-button group">
                    {activeMethod.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* --- ESTILOS DEL BOTÓN CORREGIDO --- */}
      <style jsx global>{`
        .wow-button-small { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.625rem 1.25rem; font-weight: 600; border-radius: 999px; transition: all 0.3s ease; font-size: 0.875rem; }
        .primary-button { background-image: linear-gradient(135deg, #ffffff, #dfe6ff); color: #1f2d5c; box-shadow: 0 12px 30px rgba(18, 31, 70, 0.35); }
        .primary-button:hover { background-image: linear-gradient(135deg, #ffffff, #cfd9ff); transform: scale(1.03); }
      `}</style>
    </section>
  );
}

// --- Sub-componentes ---

function MethodSelector({ method, isSelected, onClick }: { method: Method, isSelected: boolean, onClick: () => void }) {
  const Icon = method.icon;
  return (
    <motion.button
      onClick={onClick}
      animate={isSelected ? "active" : "inactive"}
      className="relative flex w-full items-start gap-4 rounded-xl p-4 text-left transition-colors duration-300"
    >
      <motion.div
        className="absolute inset-0 rounded-xl"
        variants={{
          active: { backgroundColor: "rgba(255,255,255,0.12)", scale: 1.02 },
          inactive: { backgroundColor: "rgba(255,255,255,0.04)", scale: 1 }
        }}
      />
      <div className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${isSelected ? 'bg-gradient-to-br from-[#3358ff] to-[#2bb8d6]' : 'bg-white/10'}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="relative z-10">
        <h4 className={`font-semibold transition-colors duration-300 ${isSelected ? 'text-white' : 'text-[#cbd6ff]'}`}>{method.title}</h4>
        <p className={`mt-1 text-sm leading-snug transition-colors duration-300 ${isSelected ? 'text-[#e2e6f2]' : 'text-[#9fb2ff]'}`}>
          {method.desc.substring(0, 60)}...
        </p>
      </div>
    </motion.button>
  );
}

function MetricItem({ icon: Icon, label, value, color }: { icon: React.ElementType, label: string, value: string, color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
      <p className="text-sm font-medium text-slate-400">{label}: <span className="font-semibold text-white">{value}</span></p>
    </div>
  );
}
