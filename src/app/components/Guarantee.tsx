"use client";

import Link from "next/link";
// 1. Importa el tipo `Variants` junto con `motion`
import { motion, Variants } from "framer-motion";
import { ShieldCheck, ArrowRight } from "lucide-react";

// 2. Aplica el tipo `Variants` a la constante
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// 3. Aplica el tipo `Variants` aquí también
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut", // Ahora TypeScript entenderá esto correctamente
    },
  },
};

export default function Guarantee() {
  return (
    <section className="bg-[#eef1f9] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="relative mx-auto grid max-w-2xl grid-cols-1 items-center gap-x-16 gap-y-12 rounded-3xl border border-[#d9e1ff] bg-white/90 p-8 shadow-[0_26px_60px_rgba(15,23,42,0.08)] backdrop-blur lg:max-w-none lg:grid-cols-2 lg:p-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <ShieldCheck className="absolute -top-10 -left-10 h-28 w-28 text-[#dbe3ff]" />

          <div className="relative">
            <motion.p
              variants={itemVariants}
              className="font-semibold uppercase tracking-[0.45em] text-[#1f2d5c]"
            >
              NUESTRO COMPROMISO
            </motion.p>
            <motion.h2
              variants={itemVariants}
              className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            >
              Operaciones legales custodiadas por LexMatch
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="mt-4 text-lg text-slate-600"
            >
              Somos tu punto de contacto único: damos seguimiento a agendas, entregables y SLA. Si el estudio asignado no avanza, intervenimos, reasignamos y preservamos la trazabilidad con el respaldo de LexMatch.
            </motion.p>
          </div>

          <motion.div
            variants={itemVariants}
            className="flex w-full justify-start lg:justify-end"
          >
            <Link
              href="/evaluacion"
              className="group flex w-full items-center justify-center gap-x-3 rounded-full bg-gradient-to-r from-[#1f2d5c] via-[#3358ff] to-[#2bb8d6] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 ease-in-out hover:scale-105 sm:w-auto"
            >
              Habla con el equipo LexMatch
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
