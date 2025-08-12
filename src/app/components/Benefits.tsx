// src/app/components/Benefits.tsx

"use client";

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Scale, Handshake, ShieldCheck, FileCheck, ArrowRight, BarChart, Clock, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { PieChart } from 'react-minimal-pie-chart';

// 1. ESTRUCTURA DE DATOS ENRIQUECIDA (sin cambios en los tipos)
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
    title: "Defensa por Prescripción",
    desc: "Nuestra principal especialidad. Argumentamos legalmente ante tribunales para que se declare prescrita la acción de cobro, extinguiendo la obligación de forma definitiva y permanente.",
    icon: Scale,
    metrics: { complexity: "Alta", time: "3-6 Meses", success: "98%" },
    cta: "Evaluar caso para Prescripción"
  },
  {
    title: "Negociación Estratégica",
    desc: "Representamos tus intereses ante los acreedores para alcanzar acuerdos de pago convenientes, con condonaciones de intereses y plazos que se ajusten a tu realidad.",
    icon: Handshake,
    metrics: { complexity: "Media", time: "1-2 Meses", success: "95%" },
    cta: "Iniciar una Negociación"
  },
  {
    title: "Defensa en Juicios",
    desc: "Si ya enfrentas una demanda, nuestro equipo de litigantes interviene con defensas y tercerías para proteger tu patrimonio y buscar la mejor resolución posible.",
    icon: ShieldCheck,
    metrics: { complexity: "Alta", time: "Variable", success: "92%" },
    cta: "Solicitar Defensa Judicial"
  },
  {
    title: "Aclaración y Rectificación",
    desc: "Un proceso rápido y eficiente para corregir información errónea o deudas ya pagadas que aún afectan negativamente tus registros comerciales.",
    icon: FileCheck,
    metrics: { complexity: "Baja", time: "30 Días", success: "100%" },
    cta: "Rectificar mis Registros"
  },
];

// --- Componente Principal ---
export default function Benefits() {
  const [selected, setSelected] = useState(0);
  const activeMethod = METHODS.find((_, index) => index === selected)!; // Asegurado por el índice
  const ActiveIcon = activeMethod.icon;

  const getChartData = (metrics: Method["metrics"]) => {
    return [
      { title: 'Complejidad', value: metrics.complexity === 'Alta' ? 3 : metrics.complexity === 'Media' ? 2 : 1, color: '#3b82f6' },
      { title: 'Tiempo', value: metrics.time.includes('-') ? 2 : metrics.time.includes('Variable') ? 1 : 3, color: '#22c55e' },
      { title: 'Éxito', value: parseFloat(metrics.success.replace('%', '')) / 33.33, color: '#a855f7' },
    ];
  };

  const chartData = getChartData(activeMethod.metrics);

  return (
    <section className="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
      <div className="absolute inset-0 bg-grid-slate-800 [mask-image:linear-gradient(to_bottom,white_10%,transparent_100%)]"></div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-7xl px-6 lg:px-8"
      >
        {/* Encabezado */}
        <div className="text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-400">Nuestra Metodología</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Caminos estratégicos hacia tu libertad financiera
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Cada caso es único. Selecciona una de nuestras estrategias para conocer en detalle cómo podemos devolverte la tranquilidad que mereces.
          </p>
        </div>

        {/* --- Interfaz Interactiva --- */}
        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">

          {/* Panel de Selección de Métodos (Diseño Vertical) */}
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

          {/* Panel de Visualización Principal */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }}
                exit={{ opacity: 0, y: -30, transition: { duration: 0.3, ease: "easeIn" } }}
                className="relative h-full w-full rounded-2xl bg-slate-800/50 p-8 shadow-2xl ring-1 ring-white/10 backdrop-blur-lg flex flex-col"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                    <ActiveIcon className="h-8 w-8" />
                  </div>
                </div>

                <h3 className="mt-6 text-2xl font-bold text-white">{activeMethod.title}</h3>
                <p className="mt-3 text-slate-300 leading-relaxed">{activeMethod.desc}</p>

                {/* Gráfico Radial */}
                <div className="mt-8 flex justify-center items-center">
                  <div className="relative w-32 h-32">
                    <PieChart
                      data={chartData}
                      lineWidth={10}
                      startAngle={-90}
                      label={({ dataEntry }) => dataEntry.title}
                      labelPosition={115}
                      labelStyle={{
                        fontSize: '5px',
                        fill: 'white'
                      }}
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                      <p className="text-xs text-slate-400">Métricas</p>
                    </div>
                  </div>
                  <div className="ml-6 space-y-2">
                    <MetricItem icon={BrainCircuit} label="Complejidad" value={activeMethod.metrics.complexity} />
                    <MetricItem icon={Clock} label="Tiempo Estimado" value={activeMethod.metrics.time} />
                    <MetricItem icon={BarChart} label="Tasa de Éxito" value={activeMethod.metrics.success} />
                  </div>
                </div>

                <div className="mt-auto">
                  <Link href="/evaluacion" className="wow-button primary-button group">
                    {activeMethod.cta}
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
      <style jsx global>{`
        .bg-grid-slate-800 {
          background-image: linear-gradient(white 1px, transparent 1px), linear-gradient(to right, white 1px, transparent 1px);
          background-size: 4rem 4rem;
          opacity: 0.05;
          animation: pan 20s linear infinite;
        }
        @keyframes pan {
          from { background-position: 0 0; }
          to { background-position: 4rem 0; }
        }
        .wow-button { display: inline-flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 0.75rem 1.5rem; font-weight: 600; border-radius: 0.5rem; transition: all 0.3s ease; }
        .primary-button { background-color: white; color: #020617; }
        .primary-button:hover { background-color: #e2e8f0; transform: scale(1.02); }
      `}</style>
    </section>
  );
}

// --- Sub-componentes (sin cambios significativos en su lógica) ---

function MethodSelector({ method, isSelected, onClick }: { method: Method, isSelected: boolean, onClick: () => void }) {
  const Icon = method.icon;
  return (
    <motion.button
      onClick={onClick}
      animate={isSelected ? "active" : "inactive"}
      className="relative flex w-full items-center gap-4 rounded-xl p-4 text-left transition-colors duration-300"
    >
      <motion.div
        className="absolute inset-0 rounded-xl"
        variants={{
          active: { backgroundColor: "rgba(30, 41, 59, 0.7)", scale: 1.02 },
          inactive: { backgroundColor: "rgba(30, 41, 59, 0.2)", scale: 1 }
        }}
      />
      <div className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${isSelected ? 'bg-blue-600' : 'bg-slate-700'}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="relative z-10">
        <h4 className={`font-semibold transition-colors duration-300 ${isSelected ? 'text-white' : 'text-slate-200'}`}>{method.title}</h4>
        <p className={`mt-1 text-sm leading-snug transition-colors duration-300 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
          {method.desc.substring(0, 60)}...
        </p>
      </div>
    </motion.button>
  );
}

function MetricItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-slate-400" />
      <p className="text-sm font-medium text-slate-400">{label}: <span className="font-semibold text-white">{value}</span></p>
    </div>
  );
}