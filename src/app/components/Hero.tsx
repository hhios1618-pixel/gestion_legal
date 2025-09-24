"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0c1733]">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 z-0 h-full w-full object-cover opacity-20"
      >
        <source src="/1_1.mp4" type="video/mp4" />
      </video>

      <div className="pointer-events-none absolute z-10">
        <div className="absolute w-[60vw] h-[50vh] top-[15vh] left-[10vw] rounded-full bg-[#3358ff] opacity-25 blur-[90px]" />
        <div className="absolute w-[55vw] h-[55vh] bottom-[12vh] right-[8vw] rounded-full bg-[#2bb8d6] opacity-25 blur-[110px]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_480px_at_50%_-120px,rgba(246,164,76,0.15),transparent)]" />
      </div>

      <div className="relative z-20 mx-auto flex w-full max-w-7xl justify-start px-6 py-20 text-white md:py-24">
        <div className="max-w-3xl text-left">
          <p className="mb-4 font-semibold tracking-[0.35em] text-xs text-[#9fb2ff] uppercase">
          LEXMATCH | OPERACIONES LEGALES
        </p>
          <h1 className="text-4xl font-bold leading-tight text-slate-100 md:text-[3.75rem] md:leading-[1.1]">
            Tu equipo de coordinación legal on-demand.
          </h1>
          <h2 className="mt-3 text-xl font-medium leading-snug text-[#c5d0ff] md:text-2xl">
            Conectamos a tus clientes y estudios jurídicos en una sola plataforma, asegurando respuestas, agendas y entregables con la garantía LexMatch.
          </h2>

          <p className="mt-8 max-w-2xl text-base leading-relaxed text-[#d7defb] md:text-lg">
            Nuestro equipo de coordinación legal valida tu requerimiento, selecciona estudios verificados y monitorea cada interacción. Tú conversas en un solo canal y LexMatch garantiza seguimiento, SLA de respuesta y documentación centralizada.
          </p>

          <div className="mt-10 grid w-full max-w-lg gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#cbd6ff] sm:grid-cols-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center backdrop-blur">
              Empresas y contratos
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center backdrop-blur">
              Familia y patrimonios
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center backdrop-blur">
              Laboral y cumplimiento
            </div>
          </div>

          <div className="mt-12">
            <Link
              href="/evaluacion"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-[#152345] shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
            >
              Agendar coordinación con LexMatch
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
