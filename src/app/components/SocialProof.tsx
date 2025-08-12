// src/app/components/SocialProof.tsx

"use client";

import { motion, useInView, animate } from 'framer-motion';
import { useRef, useEffect } from 'react';

// --- Base de Datos de Logos SVG (Auto-contenida) ---
// Estos son logos estilizados para mantener una estética limpia y corporativa.

const MEDIA_LOGOS = [
  {
    name: 'La Tercera',
    component: (
      <svg viewBox="0 0 120 30" fill="currentColor" aria-label="La Tercera">
        <path d="M14.3 22.5h-2.5V8.8h6.3c1.9 0 3.4.4 4.5 1.1s1.7 1.8 1.7 3.2c0 1.2-.4 2.2-1.1 2.9-.8.7-1.9 1.1-3.4 1.1h-2.9v5.4zm1.2-8.3h1.7c.9 0 1.6-.2 2-.5.5-.4.7-.9.7-1.5s-.2-1.1-.7-1.4c-.4-.3-1.1-.5-2-.5h-1.7v3.9zM31.2 22.5h-2.5V8.8h2.5v13.7zM45.6 22.5l-4.2-6.5h-.1v6.5h-2.5V8.8h2.6l4.1 6.4h.1V8.8h2.5v13.7h-2.5zM63.7 19.4c0 2.2-1.7 3.5-4.4 3.5s-4.4-1.3-4.4-3.5V8.8h2.5v10.5c0 1.1.7 1.8 1.9 1.8s1.9-.7 1.9-1.8V8.8h2.5v10.6zM77.4 22.5h-2.5V8.8h6.3c1.9 0 3.4.4 4.5 1.1s1.7 1.8 1.7 3.2c0 1.2-.4 2.2-1.1 2.9-.8.7-1.9 1.1-3.4 1.1h-2.9v5.4zm1.2-8.3h1.7c.9 0 1.6-.2 2-.5.5-.4.7-.9.7-1.5s-.2-1.1-.7-1.4c-.4-.3-1.1-.5-2-.5h-1.7v3.9zM98.3 22.5h-6.8V8.8h6.8v1.7h-4.3v3.7h3.8v1.7h-3.8v4.9h4.3v1.7z" />
      </svg>
    ),
  },
  {
    name: 'Diario Financiero',
    component: (
      <svg viewBox="0 0 150 30" fill="currentColor" aria-label="Diario Financiero">
        <path d="M10.3 22V8.5h8.4v2.3h-5.8v3.4h5.2v2.3h-5.2v3.2h6v2.3h-8.6zM26.8 22V8.5h2.6v13.5h-2.6zM41.9 22V8.5h2.6l6.8 9.5V8.5h2.6V22h-2.3l-7-9.8v9.8h-2.7zM68.5 22V8.5h8.4v2.3h-5.8v3.4h5.2v2.3h-5.2v3.2h6v2.3h-8.6zM88.7 8.5v13.5h-2.6V8.5h2.6zM103.1 8.5L98 22h-2.8l-5.1-13.5h2.9l3.5 10.1h.1l3.5-10.1h2.9zM118.7 10.8h-5.2V8.5h13v2.3h-5.2v11.2h-2.6V10.8zM140.7 15.2c0-3.6-2.5-6.2-6.5-6.2s-6.5 2.6-6.5 6.2 2.5 6.2 6.5 6.2 6.5-2.6 6.5-6.2zm-2.6 0c0 2.2-1.3 3.9-3.9 3.9s-3.9-1.7-3.9-3.9 1.3-3.9 3.9-3.9 3.9 1.7 3.9 3.9z"/>
      </svg>
    ),
  },
  {
    name: 'CNN Chile',
    component: (
      <svg viewBox="0 0 100 30" fill="currentColor" aria-label="CNN Chile">
        <path d="M14.9 21.8c-3.1 0-5.6-2.5-5.6-5.6s2.5-5.6 5.6-5.6c1.8 0 3.3.8 4.4 2.1l-1.9 1.1c-.7-.8-1.5-1.3-2.5-1.3-1.8 0-3.3 1.5-3.3 3.7s1.4 3.7 3.3 3.7c1 0 1.8-.5 2.5-1.3l1.9 1.1c-1.1 1.3-2.6 2.1-4.4 2.1zm14.3-1.2l-1.9-1.1c.7-.8 1.1-1.8 1.1-2.9v-5.2h2.4v5.2c0 1.8-.7 3.4-1.9 4.6l-1.9-1.1c.7-.8 1.1-1.8 1.1-2.9v-5.2h2.4v5.2c0 1.8-.7 3.4-1.9 4.6zm0-10.2v5.2h2.4v-5.2h-2.4zm14.3 1.2l-1.9-1.1c.7-.8 1.1-1.8 1.1-2.9v-5.2h2.4v5.2c0 1.8-.7 3.4-1.9 4.6l-1.9-1.1c.7-.8 1.1-1.8 1.1-2.9v-5.2h2.4v5.2c0 1.8-.7 3.4-1.9 4.6zM62.1 22h-2.5v-2.3c-1.2 1.8-3.1 2.8-5.3 2.8-4.2 0-7.6-3.4-7.6-7.6s3.4-7.6 7.6-7.6c2.2 0 4 .9 5.3 2.8V8.5h2.5V22zm-5.2-7.1c0-2.8-2.3-5.2-5.2-5.2s-5.2 2.3-5.2 5.2 2.3 5.2 5.2 5.2 5.2-2.3 5.2-5.2zM75.8 22h-2.6V8.5h2.6V22zm9.1-13.5h2.6v13.5h-2.6V8.5zm9.1 0h2.6v11.2h5.8v2.3h-8.4V8.5z"/>
      </svg>
    ),
  },
  {
    name: 'BioBioChile',
    component: (
      <svg viewBox="0 0 130 30" fill="currentColor" aria-label="BioBioChile">
        <path d="M12.3 21.4c-3.5 0-6.4-2.9-6.4-6.4s2.9-6.4 6.4-6.4 6.4 2.9 6.4 6.4-2.8 6.4-6.4 6.4zm0-2.3c2.3 0 4.1-1.8 4.1-4.1s-1.8-4.1-4.1-4.1-4.1 1.8-4.1 4.1 1.9 4.1 4.1 4.1zM26.9 21.4V8.5h2.3v12.9h-2.3zM40.6 21.4c-3.5 0-6.4-2.9-6.4-6.4s2.9-6.4 6.4-6.4 6.4 2.9 6.4 6.4-2.8 6.4-6.4 6.4zm0-2.3c2.3 0 4.1-1.8 4.1-4.1s-1.8-4.1-4.1-4.1-4.1 1.8-4.1 4.1 1.9 4.1 4.1 4.1zM58.3 8.5v12.9h-2.3V8.5h2.3zM70.9 21.4V8.5h2.3v12.9h-2.3zM84.3 21.4h-2.3l-4-5.3v5.3h-2.3V8.5h2.3l4 5.3V8.5h2.3v12.9zM98.6 21.4V8.5h8.5v2.3h-6.2v3.1h5.6v2.3h-5.6v3.1h6.2v2.3h-8.5zM114.7 21.4V8.5h2.3v12.9h-2.3zM128 21.4h-2.3l-4-5.3v5.3h-2.3V8.5h2.3l4 5.3V8.5h2.3v12.9z"/>
      </svg>
    ),
  },
  {
    name: 'Cooperativa',
    component: (
      <svg viewBox="0 0 140 30" fill="currentColor" aria-label="Cooperativa">
        <path d="M13.6 21.6c-4.2 0-7.6-3.4-7.6-7.6S9.4 6.4 13.6 6.4c4.2 0 7.6 3.4 7.6 7.6s-3.4 7.6-7.6 7.6zm0-2.3c3.1 0 5.3-2.3 5.3-5.3s-2.3-5.3-5.3-5.3-5.3 2.3-5.3 5.3 2.2 5.3 5.3 5.3zM33.8 21.6c-4.2 0-7.6-3.4-7.6-7.6s3.4-7.6 7.6-7.6c4.2 0 7.6 3.4 7.6 7.6s-3.4 7.6-7.6 7.6zm0-2.3c3.1 0 5.3-2.3 5.3-5.3s-2.3-5.3-5.3-5.3-5.3 2.3-5.3 5.3 2.2 5.3 5.3 5.3zM54 21.6V8.5h8.5v2.3h-6.2v3.1h5.6v2.3h-5.6v3.1h6.2v2.3H54zM70.9 21.6V8.5h2.3v13.1h-2.3zM85.7 18.5l-3.2 3.1h-2.7l4.8-4.7-4.6-4.5h2.7l3.1 3v-3h2.3v12.9h-2.3v-5.2zM100.2 21.6V8.5h2.3v12.9h-2.3zM113.6 21.6V8.5h2.3v5.2l3.1-3h2.7l-4.6 4.5 4.8 4.7h-2.7l-3.2-3.1v3.1h-2.7zM128 21.4h2.3v-8l3.6 8h2.6l3.6-8v8h2.3V6.2h-3.4l-2.6 5.8-2.6-5.8h-3.4v15.2z"/>
      </svg>
    ),
  },
  {
    name: 'El Mercurio',
    component: (
      <svg viewBox="0 0 150 30" fill="currentColor" aria-label="El Mercurio">
        <path d="M10.1 23.3V7.5h11.8v2.5H12.7v4.5h8.6v2.5h-8.6v4.1h9.4v2.2h-12zM28.3 23.3V7.5h2.6v15.8h-2.6zM46.7 23.3L39.1 7.5h2.8l6.1 13.1h.1L54.2 7.5h2.8l-7.6 15.8h-2.7zM69.6 17.5c0 3.2-2.5 5.8-5.9 5.8s-5.9-2.6-5.9-5.8V7.5h2.6v10.1c0 1.8 1.1 3.2 3.3 3.2s3.3-1.4 3.3-3.2V7.5h2.6v10zM84.5 23.3V7.5h2.6v13.3l6.5-7.5h3.2l-5.6 6.4 6 9.1h-3.1l-4.5-7.2-1.6 1.8v5.4h-2.5zM104.9 17.5c0 3.2-2.5 5.8-5.9 5.8s-5.9-2.6-5.9-5.8V7.5h2.6v10.1c0 1.8 1.1 3.2 3.3 3.2s3.3-1.4 3.3-3.2V7.5h2.6v10zM116.8 23.3V7.5h2.6v15.8h-2.6zM133.5 17.5c0 3.2-2.5 5.8-5.9 5.8s-5.9-2.6-5.9-5.8V7.5h2.6v10.1c0 1.8 1.1 3.2 3.3 3.2s3.3-1.4 3.3-3.2V7.5h2.6v10z"/>
      </svg>
    ),
  },
];

// Creamos un array duplicado para el efecto de bucle infinito
const ALL_LOGOS = [...MEDIA_LOGOS, ...MEDIA_LOGOS.slice(0, 4)]; // Añadimos algunos más para que no haya saltos

// --- Componente Principal ---
export default function SocialProof() {
  const countRef = useRef<HTMLSpanElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView && countRef.current) {
      const controls = animate(0, 50000, {
        duration: 2.5,
        ease: "easeOut",
        onUpdate(value) {
          if (countRef.current) {
            // Usamos el locale 'de-DE' para tener puntos como separadores de miles (50.000)
            countRef.current.textContent = Math.round(value).toLocaleString('de-DE');
          }
        }
      });
      return () => controls.stop();
    }
  }, [isInView]);

  return (
    <section ref={sectionRef} className="bg-white py-20 sm:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Únete a los más de <span className="inline-block"><span ref={countRef}>0</span>+</span>
            <br />
            chilenos que ya recuperaron su tranquilidad
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Nuestra trayectoria y la confianza de miles de clientes nos avalan. Medios de comunicación de todo el país han destacado nuestro trabajo como el estudio jurídico líder en la defensa de deudores en Chile.
          </p>
        </motion.div>
      </div>

      {/* --- Marquee de Logos --- */}
      <div className="mt-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/0 to-white z-10 pointer-events-none"></div>
        
        {/* Usamos dos componentes Marquee para crear el efecto de doble carrusel */}
        <Marquee logos={ALL_LOGOS.slice(0, 8)} baseVelocity={-1} />
        <Marquee logos={ALL_LOGOS.slice(2, 10)} baseVelocity={1} />
      </div>
      
      {/* Estilos para el marquee, para evitar la necesidad de un archivo CSS separado */}
      <style jsx global>{`
        .marquee-container {
          display: flex;
          flex-wrap: nowrap;
          width: max-content;
        }
        .marquee-logo {
          flex-shrink: 0;
          width: 180px; /* Ancho fijo para cada logo */
          padding: 0 2rem;
          color: #94a3b8; /* slate-400 */
          transition: color 0.3s ease;
        }
        .marquee-logo:hover {
          color: #1e293b; /* slate-800 */
        }
      `}</style>
    </section>
  );
}


// --- Componente Marquee Mejorado ---
// Esta versión usa Framer Motion para un movimiento más suave basado en la velocidad
interface MarqueeProps {
  logos: { name: string; component: React.ReactNode }[];
  baseVelocity: number;
}
function Marquee({ logos, baseVelocity = 100 }: MarqueeProps) {
  return (
    <div className="flex flex-nowrap overflow-hidden my-4 whitespace-nowrap">
      <motion.div
        className="flex flex-nowrap gap-16"
        animate={{
          x: ['0%', '-100%'],
          transition: {
            ease: 'linear',
            duration: 50 / Math.abs(baseVelocity),
            repeat: Infinity,
          }
        }}
      >
        {/* Duplicamos los logos para un bucle infinito y suave */}
        {[...logos, ...logos].map((logo, index) => (
          <div key={`${logo.name}-${index}`} className="marquee-logo">
            {logo.component}
          </div>
        ))}
      </motion.div>
    </div>
  );
}