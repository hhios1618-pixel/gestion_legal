import Link from "next/link";
import { Phone, Mail, Clock, Linkedin } from "lucide-react";

export default function Footer() {
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
              DEUDACERO
            </Link>
            <p className="text-sm leading-6 text-slate-600">
              Defensa legal experta para la eliminación de deudas. Seriedad, claridad y resultados garantizados.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-slate-500 hover:text-blue-700">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-6 w-6" />
              </Link>
              {/* Agrega aquí otros íconos de redes sociales si es necesario */}
            </div>
          </div>
          
          {/* Columnas de Links */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-3 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h4 className="text-sm font-semibold leading-6 text-slate-900">Recursos</h4>
                <ul role="list" className="mt-4 space-y-3">
                  <li><Link href="/casos-de-exito" className="text-sm leading-6 text-slate-600 hover:text-blue-700">Casos de Éxito</Link></li>
                  <li><Link href="/blog" className="text-sm leading-6 text-slate-600 hover:text-blue-700">Blog Jurídico</Link></li>
                  <li><Link href="/faq" className="text-sm leading-6 text-slate-600 hover:text-blue-700">Preguntas Frecuentes</Link></li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h4 className="text-sm font-semibold leading-6 text-slate-900">Legal</h4>
                <ul role="list" className="mt-4 space-y-3">
                  <li><Link href="/terminos" className="text-sm leading-6 text-slate-600 hover:text-blue-700">Términos y Condiciones</Link></li>
                  <li><Link href="/privacidad" className="text-sm leading-6 text-slate-600 hover:text-blue-700">Política de Privacidad</Link></li>
                   <li><Link href="/sobre-nosotros" className="text-sm leading-6 text-slate-600 hover:text-blue-700">Sobre el Estudio</Link></li>
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
                    <span className="text-sm leading-6 text-slate-600">contacto@deudacero.cl</span>
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
      </div>

      {/* 3. Barra de Copyright */}
      <div className="border-t border-slate-200 bg-white py-8">
        <p className="text-center text-xs leading-5 text-slate-500">
          © {new Date().getFullYear()} DeudaCero SpA. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}