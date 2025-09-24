'use client';

import { MouseEvent } from 'react';

export default function BotonAbrirChat() {
  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    // Señal directa al widget (si está montado en el layout)
    try {
      localStorage.setItem('LEX_OPEN', '1'); // pista opcional
      window.dispatchEvent(new CustomEvent('open-lex-chat'));
    } catch {}
    // Fallback por si el listener no está: abre home con ?chat=1
    setTimeout(() => {
      // Si el widget ya se abrió, no navegamos
      if ((window as any).__LEX_OPENED__) return;
      window.location.href = '/?chat=1';
    }, 40);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#1f2d5c] via-[#3358ff] to-[#2bb8d6] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:scale-105"
    >
      Hablar con el equipo LexMatch
    </button>
  );
}
