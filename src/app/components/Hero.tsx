"use client";

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';

// --- Variantes para el nuevo enfoque tipográfico ---
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.5,
    },
  },
};

const lineVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: [0.2, 0.65, 0.3, 0.9],
    },
  },
};

const paragraphVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 1, // Aparece después del titular
      duration: 1,
      ease: 'easeOut',
    },
  },
};

export default function Hero() {
  return (
    <>
      <section className="relative flex h-screen items-center justify-center overflow-hidden bg-slate-900">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 z-0 h-full w-full object-cover opacity-20"
          // El video ahora es más sutil, un lienzo, no el protagonista.
        >
          <source src="/1_1.mp4" type="video/mp4" />
        </video>
        
        {/* La aurora sigue aportando atmósfera */}
        <div className="aurora-container pointer-events-none absolute z-10">
          <div className="aurora-beam aurora-beam-1"></div>
          <div className="aurora-beam aurora-beam-2"></div>
        </div>

        {/* Contenido Central: El enfoque en la Tipografía */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-20 flex max-w-4xl flex-col p-6 text-white"
        >
          {/* Nivel 1: Pre-título */}
          <motion.div variants={lineVariants}>
            <p className="mb-4 font-semibold tracking-widest text-slate-300">
              DEUDASCERO | ABOGADOS
            </p>
          </motion.div>
          
          {/* Nivel 2: Titular con Jerarquía Interna */}
          <motion.h1
            variants={lineVariants}
            className="text-5xl font-bold !leading-tight text-slate-100 md:text-7xl"
          >
            Claridad legal.
          </motion.h1>
          <motion.h1
            variants={lineVariants}
            className="text-5xl font-bold !leading-tight text-slate-300 md:text-7xl"
          >
            Libertad financiera.
          </motion.h1>

          {/* Nivel 3: Párrafo */}
          <motion.p
            variants={paragraphVariants}
            className="mt-8 max-w-2xl text-lg font-light leading-relaxed text-slate-300 md:text-xl"
          >
            Somos un estudio de abogados especialista en la eliminación de deudas complejas y la restauración de su historial crediticio. Deje que nuestra experiencia trace su camino hacia la tranquilidad.
          </motion.p>
          
          {/* Nivel 4: Llamado a la Acción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="mt-12"
          >
            <Link href="/evaluacion" className="final-button">
              Iniciar mi Evaluación Gratuita
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* CSS redefinido para la elegancia */}
      <style jsx global>{`
        .aurora-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
          filter: blur(80px); // Menos blur para que sea más definido
          opacity: 0.8;
        }
        .aurora-beam {
          position: absolute;
          opacity: 0.3;
          border-radius: 9999px;
          animation: aurora-flow 25s infinite linear;
        }
        .aurora-beam-1 {
          width: 60vw; height: 50vh; top: 15vh; left: 10vw;
          background: #007cf0;
        }
        .aurora-beam-2 {
          width: 50vw; height: 50vh; bottom: 15vh; right: 10vw;
          background: #00dfd8; animation-delay: -8s;
        }
        @keyframes aurora-flow {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(1); }
        }

        .final-button {
          background-color: rgba(255, 255, 255, 0.95);
          color: #0d1a3e; /* Un azul muy oscuro y serio */
          padding: 1rem 2rem;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255,255,255,0.4);
        }
        .final-button:hover {
          transform: translateY(-2px);
          background-color: #ffffff;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255,255,255,0.4);
        }
      `}</style>
    </>
  );
}

////////////////////para cambio de nombre/////