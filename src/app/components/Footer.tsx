"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Phone, Mail, Clock, Linkedin, ShieldCheck, X } from "lucide-react";

export default function Footer() {
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    const original = document.body.style.overflow;
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = original;
    }
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Cerrar con tecla ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Cerrar al hacer click fuera
  const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  return (
    <footer className="bg-white">
      {/* 1. Sección de Llamada a la Acción (CTA) */}
      <div className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:flex lg:items-center lg:justify-between lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            ¿Listo para dar el primer paso?
            <br />
            <span className="text-blue-700">Recupere su tranquilidad financiera.</span>
          </h2>
          <div className="mt-8 flex items-center gap-x-6 lg:mt-0 lg:flex-shrink-0">
            <Link
              href="/evaluacion"
              className="rounded-md bg-blue-700 px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Iniciar Evaluación Gratuita
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Contenido Principal del Footer */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-4 xl:gap-8">
          {/* Columna de la Marca */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-extrabold tracking-tight text-slate-900">
              DEUDASCERO
            </Link>
            <p className="text-sm leading-6 text-slate-600">
              Defensa legal experta para la eliminación de deudas. Seriedad, claridad y resultados garantizados.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-slate-500 hover:text-blue-700" aria-label="LinkedIn">
                <Linkedin className="h-6 w-6" />
              </Link>
            </div>
          </div>

          {/* Columnas de Links */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-3 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h4 className="text-sm font-semibold leading-6 text-slate-900">Recursos</h4>
                <ul role="list" className="mt-4 space-y-3">
                  <li>
                    <Link href="/casos-de-exito" className="text-sm leading-6 text-slate-600 hover:text-blue-700">
                      Casos de Éxito
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="text-sm leading-6 text-slate-600 hover:text-blue-700">
                      Blog Jurídico
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="text-sm leading-6 text-slate-600 hover:text-blue-700">
                      Preguntas Frecuentes
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h4 className="text-sm font-semibold leading-6 text-slate-900">Legal</h4>
                <ul role="list" className="mt-4 space-y-3">
                  <li>
                    <Link href="/terminos" className="text-sm leading-6 text-slate-600 hover:text-blue-700">
                      Términos y Condiciones
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacidad" className="text-sm leading-6 text-slate-600 hover:text-blue-700">
                      Política de Privacidad
                    </Link>
                  </li>
                  <li>
                    <Link href="/sobre-nosotros" className="text-sm leading-6 text-slate-600 hover:text-blue-700">
                      Sobre el Estudio
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="md:grid md:grid-cols-1 md:gap-8">
              <div>
                <h4 className="text-sm font-semibold leading-6 text-slate-900">Contacto Directo</h4>
                <ul role="list" className="mt-4 space-y-4">
                  <li className="flex items-start gap-3">
                    <Phone className="h-5 w-5 flex-shrink-0 text-slate-500 mt-0.5" />
                    <span className="text-sm leading-6 text-slate-600">+56 9 0000 0000</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Mail className="h-5 w-5 flex-shrink-0 text-slate-500 mt-0.5" />
                    <span className="text-sm leading-6 text-slate-600">contacto@deudascero.cl</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="h-5 w-5 flex-shrink-0 text-slate-500 mt-0.5" />
                    <span className="text-sm leading-6 text-slate-600">Lunes a Viernes: 9:00 – 18:00 hrs</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Enlace para abrir el modal legal */}
        <div className="mt-10">
          <button
            onClick={() => {
              setAccepted(false);
              setOpen(true);
            }}
            className="text-xs text-slate-500 underline underline-offset-4 hover:text-blue-700"
          >
            Aviso legal y privacidad
          </button>
        </div>
      </div>

      {/* 3. Barra de Copyright */}
      <div className="border-t border-slate-200 bg-white py-8">
        <p className="text-center text-xs leading-5 text-slate-500">
          © {new Date().getFullYear()} DeudasCero SpA. Todos los derechos reservados.
        </p>
      </div>

      {/* MODAL LEGAL */}
      {open && (
        <div
          onMouseDown={onBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xl"
          aria-labelledby="legal-title"
          role="dialog"
          aria-modal="true"
        >
          <div
            ref={dialogRef}
            onMouseDown={(e) => e.stopPropagation()}
            className="relative mx-4 w-full max-w-3xl rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-2xl transition-all"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur">
                <ShieldCheck className="h-5 w-5 text-white/90" />
              </div>
              <h2 id="legal-title" className="text-base font-semibold text-white">
                Documento de Uso de Formulario y Política de Privacidad
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="ml-auto rounded-md p-2 text-white/70 hover:bg-white/10 hover:text-white focus-visible:outline-none"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body (scrollable) */}
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5 text-sm leading-relaxed text-white/90">
              <Section n="1. Objeto">
                Este documento regula el uso del formulario de contacto/disposición de datos personales disponible en el
                sitio web <strong>www.deudascero.cl</strong> (en adelante, el “Sitio”), así como el tratamiento y
                protección de los datos personales proporcionados por los usuarios conforme a la legislación vigente en
                Chile.
              </Section>

              <Section n="2. Consentimiento Informado">
                Al completar y enviar el formulario del Sitio, el usuario declara haber leído, comprendido y aceptado
                expresamente los términos establecidos en este documento, otorgando su consentimiento libre, específico,
                informado e inequívoco para el tratamiento de sus datos personales.
              </Section>

              <Section n="3. Finalidad del Tratamiento de Datos">
                <ul className="list-disc pl-6 marker:text-white/60">
                  <li>Responder consultas, solicitudes de información o contacto.</li>
                  <li>Enviar comunicaciones relacionadas con nuestros servicios y actividades.</li>
                  <li>Fines administrativos y de gestión interna.</li>
                  <li>Cumplimiento de obligaciones legales o contractuales.</li>
                </ul>
              </Section>

              <Section n="4. Derechos de los Usuarios">
                De acuerdo con la Ley N° 19.628 sobre Protección de la Vida Privada, el usuario podrá ejercer en
                cualquier momento los siguientes derechos:
                <ul className="mt-2 list-disc pl-6 marker:text-white/60">
                  <li>
                    <strong>Derecho de acceso:</strong> Conocer qué datos suyos han sido almacenados y cómo se utilizan.
                  </li>
                  <li>
                    <strong>Derecho de rectificación:</strong> Solicitar la modificación de datos incorrectos, inexactos
                    o desactualizados.
                  </li>
                  <li>
                    <strong>Derecho de cancelación o eliminación:</strong> Pedir la eliminación de sus datos cuando
                    estime que no están siendo tratados conforme a la ley.
                  </li>
                  <li>
                    <strong>Derecho de oposición:</strong> Rechazar el uso de sus datos para determinados fines.
                  </li>
                </ul>
                Las solicitudes para ejercer estos derechos deberán dirigirse al correo electrónico:
                <span className="whitespace-nowrap"> <strong>[privacidad@tusitio.cl]</strong></span>, indicando
                claramente la petición y adjuntando copia de su cédula de identidad.
              </Section>

              <Section n="5. Obligaciones del Usuario">
                <ul className="list-disc pl-6 marker:text-white/60">
                  <li>Entregar información veraz, actualizada y completa.</li>
                  <li>No suplantar la identidad de terceros.</li>
                  <li>Utilizar el formulario para fines lícitos y autorizados.</li>
                </ul>
              </Section>

              <Section n="6. Protección y Seguridad de los Datos">
                Nuestra empresa declara que los datos personales proporcionados serán tratados con estricta
                confidencialidad y protegidos mediante medidas técnicas, administrativas y organizativas adecuadas para
                garantizar su seguridad e impedir el acceso, uso o divulgación no autorizada. Nos comprometemos a no
                vender, arrendar ni compartir la información con terceros, salvo obligación legal o requerimiento de
                autoridad competente.
              </Section>

              <Section n="7. Almacenamiento y Plazo de Conservación">
                Los datos serán almacenados únicamente durante el tiempo necesario para cumplir con los fines para los
                que fueron recolectados, o mientras exista una relación activa con el usuario, salvo que la ley exija un
                plazo mayor.
              </Section>

              <Section n="8. Modificaciones a este Documento">
                Nos reservamos el derecho de modificar este documento en cualquier momento. Las modificaciones serán
                publicadas en el Sitio, y se considerarán vigentes desde su publicación.
              </Section>

              <Section n="9. Legislación Aplicable y Jurisdicción">
                Este documento se rige por la legislación chilena, en particular por la Ley N° 19.628 sobre Protección
                de la Vida Privada, la Ley N° 21.096 sobre delitos informáticos y otras normas relacionadas. Cualquier
                controversia derivada de este documento será sometida a los tribunales ordinarios de justicia de la
                ciudad de Santiago, Región Metropolitana.
              </Section>
            </div>

            {/* Footer sticky del modal */}
            <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t border-white/10 bg-white/5 px-6 py-4 backdrop-blur">
              <label className="flex items-center gap-3 text-xs text-white/80">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/30 bg-white/10"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                />
                He leído y acepto este documento.
              </label>
              <button
                onClick={() => setOpen(false)}
                disabled={!accepted}
                className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
                  accepted
                    ? "bg-blue-700 hover:bg-blue-800"
                    : "bg-slate-600/60 cursor-not-allowed"
                }`}
              >
                Aceptar y continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}

// --- Subcomponente para secciones del documento ---
function Section({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="mb-2 text-sm font-semibold text-white">{n}</h3>
      <div className="space-y-2 text-white/90">{children}</div>
    </section>
  );
}
