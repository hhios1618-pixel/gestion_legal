// src/app/components/Navbar.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

// --- Datos de los enlaces de navegación ---
const navLinks = [
  { title: "Metodología", id: "metodologia" },
  { title: "Resultados", id: "resultados" },
  { title: "Garantía", id: "garantia" },
  { title: "Preguntas", id: "faq" },
  { title: "Contacto", id: "contacto" }, // Asumimos que el footer tendrá id="contacto"
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);
    
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  const handleScrollTo = (id: string) => {
    setIsMenuOpen(false); // Cierra el menú al hacer clic
    const element = document.getElementById(id);
    if (element) {
      const navbarHeight = 64; // La altura del navbar (h-16 = 4rem = 64px)
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // --- LÓGICA DE COLOR DINÁMICO ---
  // Determina el color del texto basado en si se ha hecho scroll o si el menú móvil está abierto
  const logoColor = scrolled || isMenuOpen ? 'text-white' : 'text-slate-900';
  const linkColor = scrolled || isMenuOpen ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900';
  const mobileIconColor = isMenuOpen ? 'text-white' : (scrolled ? 'text-white' : 'text-slate-900');

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 border-b
        ${scrolled || isMenuOpen
          ? "bg-slate-900/80 backdrop-blur-lg border-white/10 shadow-lg" 
          : "bg-transparent border-transparent"
        }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* CORRECCIÓN: El color del logo ahora es dinámico */}
        <Link href="/" className={`text-xl font-extrabold tracking-tight transition-colors duration-300 ${logoColor}`}>
          DEUDASCERO
        </Link>

        {/* Navegación de Escritorio */}
        <nav className="hidden items-center gap-8 text-sm md:flex">
          {navLinks.map((link) => (
            <button 
              key={link.id} 
              onClick={() => handleScrollTo(link.id)}
              // CORRECCIÓN: El color de los links ahora es dinámico
              className={`font-medium transition-colors duration-300 ${linkColor}`}
            >
              {link.title}
            </button>
          ))}
        </nav>

        {/* CTA Escritorio */}
        <Link
          href="/evaluacion"
          className="hidden rounded-lg bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-transform hover:scale-105 md:block"
        >
          Evaluación Gratuita
        </Link>
        
        {/* Botón de Menú Móvil */}
        <div className="md:hidden">
          {/* CORRECCIÓN: El color del ícono ahora es dinámico */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`transition-colors duration-300 ${mobileIconColor}`}>
            <span className="sr-only">Abrir menú</span>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Panel de Menú Móvil */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            // El fondo oscuro se activa al abrir el menú, por lo que los links claros siempre serán visibles
            className="absolute left-0 top-16 h-[calc(100vh-4rem)] w-full bg-slate-900 md:hidden"
          >
            <nav className="flex flex-col items-center gap-8 pt-10 text-lg">
              {navLinks.map((link) => (
                <button 
                  key={link.id} 
                  onClick={() => handleScrollTo(link.id)}
                  className="font-medium text-slate-300 transition-colors hover:text-white"
                >
                  {link.title}
                </button>
              ))}
              <Link
                href="/evaluacion"
                className="mt-6 rounded-lg bg-white px-8 py-3 font-semibold text-slate-900 shadow-sm"
              >
                Evaluación Gratuita
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}