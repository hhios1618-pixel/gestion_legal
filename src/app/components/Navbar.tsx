"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition border-b
        ${scrolled ? "bg-white/90 backdrop-blur border-slate-200 shadow-sm" : "bg-[#f8f9fa] border-transparent"}
      `}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="font-extrabold tracking-tight text-slate-900">
          DEUDAS CERO
        </Link>

        <nav className="hidden gap-8 text-sm text-slate-700 md:flex">
          <Link href="/casos" className="hover:text-slate-900">Casos</Link>
          <Link href="/legal" className="hover:text-slate-900">Legal</Link>
          <Link href="/faq" className="hover:text-slate-900">FAQ</Link>
          <Link href="/contacto" className="hover:text-slate-900">Contacto</Link>
        </nav>

        <Link
          href="/evaluacion"
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
        >
          Verificar ahora
        </Link>
      </div>
    </header>
  );
}