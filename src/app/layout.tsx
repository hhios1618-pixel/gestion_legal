export const metadata = {
  title: "DeudasCero — Sal de DICOM con respaldo legal",
  description: "Soluciones legales para eliminar DICOM y ordenar tus deudas, con trazabilidad y asesoría experta.",
};

import "./globals.css";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className + " bg-white text-slate-900"}>
        {children}
      </body>
    </html>
  );
}