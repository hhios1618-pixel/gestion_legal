"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';

export type Matter = {
  id: string;
  title: string;
  summary: string;
  timing: string;
  documents: string[];
};

function openChatWithPrefill(title?: string) {
  try {
    if (title) localStorage.setItem('LEX_PREFILL', title);
    window.dispatchEvent(new CustomEvent('open-lex-chat', { detail: title }));
    (window as any).__LEX_OPENED__ = true;
  } catch {}
}

export default function MatterModal({ matter, open, onOpenChange }: { matter: Matter | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl border border-[#dbe3ff] bg-white/95 shadow-[0_30px_70px_rgba(15,23,42,0.18)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-[#0b1424]">{matter?.title}</DialogTitle>
          <DialogDescription className="text-sm text-[#4c5a74]">
            Te contamos cómo abordamos este tipo de situaciones y qué necesitamos para empezar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-3 text-sm text-[#4c5a74]">
          <div>
            <p className="font-medium text-[#1f2d5c]">¿Qué hacemos por ti?</p>
            <p className="mt-1 leading-relaxed">{matter?.summary}</p>
          </div>
          <div className="rounded-xl bg-[#eef1f9] p-3 text-sm">
            <p className="font-medium text-[#1f2d5c]">Tiempo estimado de coordinación</p>
            <p className="mt-1 text-[#4c5a74]">{matter?.timing}</p>
          </div>
          <div>
            <p className="font-medium text-[#1f2d5c]">Documentos o datos recomendados</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-[#4c5a74]">
              {matter?.documents.map((doc) => (
                <li key={doc}>{doc}</li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => {
              openChatWithPrefill(matter?.title);
              onOpenChange(false);
            }}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1f2d5c] via-[#3358ff] to-[#2bb8d6] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:scale-105"
          >
            Iniciar mi proceso ahora
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
