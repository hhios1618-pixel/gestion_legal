import "./globals.css";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import Chatbot from "@/app/components/Chatbot";
import RouteGate from "@/app/components/RouteGate";
// ⚠️ Si tienes otra burbuja (WhatsApp/Tawk/Chatwoot), impórtala aquí también
// import WhatsAppBubble from "@/app/components/WhatsAppBubble";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "DeudasCero — Sal de DICOM con respaldo legal",
  description:
    "Soluciones legales para eliminar DICOM y ordenar tus deudas, con trazabilidad y asesoría experta.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className + " bg-white text-slate-900"}>
        {children}

        {/* ⛔️ NO mostrar chat en dashboard ni en la pantalla de login */}
        <RouteGate
          blacklist={[
            { type: 'startsWith', value: '/dashboard' },
            { type: 'equals', value: '/admin-login' },
          ]}
        >
          <Chatbot />
          {/* <WhatsAppBubble /> */}
        </RouteGate>
      </body>
    </html>
  );
}