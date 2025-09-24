// src/app/components/EvalLeadForm.tsx
"use client";

import { useRef, useState } from "react";

export default function EvalLeadForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [loading, setLoading] = useState(false);
  const [okShortCode, setOkShortCode] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    // ⚠️ Guardamos la referencia ANTES de cualquier await
    const form = formRef.current;
    if (!form) return;

    const fd = new FormData(form);
    const payload = {
      name: (fd.get("name") as string | null)?.trim() || null,
      email: (fd.get("email") as string | null)?.trim() || null,
      phone: (fd.get("phone") as string | null)?.trim() || null,
      motivo: (fd.get("motivo") as string | null)?.trim() || null,
      // coherente con tus constraints:
      source: "form",
      channel: "landing",
      status: "nuevo",
    };

    try {
      const r = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await r.json(); // leemos SIEMPRE el body para poder tomar short_code o error

      if (!r.ok) {
        throw new Error(json?.error || "Error creando lead");
      }

      // OK
      const sc: string | undefined = json?.item?.short_code;
      setOkShortCode(sc ?? "—");

      // ✅ Reset sin usar e.currentTarget
      form.reset();
    } catch (e: any) {
      setErr(e?.message ?? "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-slate-700">
            Nombre completo*
            <input
              name="name"
              required
              placeholder="Ej. Juan Pérez"
              className="mt-1 w-full rounded-md border border-[#dbe3ff] bg-white px-3 py-2 text-slate-900 outline-none focus:border-[#3358ff]"
            />
          </label>
          <label className="text-sm text-slate-700">
            Email
            <input
              type="email"
              name="email"
              placeholder="tunombre@correo.com"
              className="mt-1 w-full rounded-md border border-[#dbe3ff] bg-white px-3 py-2 text-slate-900 outline-none focus:border-[#3358ff]"
            />
          </label>
        </div>

        <label className="text-sm text-slate-700">
          Teléfono
          <input
            name="phone"
            placeholder="+56 9 1234 5678"
            className="mt-1 w-full rounded-md border border-[#dbe3ff] bg-white px-3 py-2 text-slate-900 outline-none focus:border-[#3358ff]"
          />
        </label>

        <label className="text-sm text-slate-700">
          Cuéntanos brevemente tu situación
          <textarea
            name="motivo"
            rows={4}
            placeholder="Ej. divorcio de común acuerdo en Ñuñoa, arriendo impago en Viña, despido injustificado."
            className="mt-1 w-full rounded-md border border-[#dbe3ff] bg-white px-3 py-2 text-slate-900 outline-none focus:border-[#3358ff]"
          />
        </label>

        {/* feedback de error inline */}
        {err && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-rose-800 text-sm">
            {err}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#1f2d5c] via-[#3358ff] to-[#2bb8d6] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:scale-105 disabled:opacity-60"
          >
            {loading ? "Enviando…" : "Enviar solicitud"}
          </button>
          <span className="text-xs text-slate-500">
            * Con nombre y un canal de contacto comenzamos el matching.
          </span>
        </div>
      </form>

      {/* Modal de éxito */}
      {okShortCode && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">¡Solicitud enviada!</h3>
            <p className="mt-2 text-slate-700">
              ¡Gracias! Tu solicitud fue enviada. Código de seguimiento:{" "}
              <span className="font-mono font-semibold">{okShortCode}</span>. Te contactaremos pronto.
            </p>
            <div className="mt-5 text-right">
              <button
                onClick={() => setOkShortCode(null)}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
