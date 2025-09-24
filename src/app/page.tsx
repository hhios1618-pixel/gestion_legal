// src/app/page.tsx
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ComoSaberDicom from "./components/ComoSaberDicom";
import TrustBar from "./components/TrustBar";
import SocialProof from "./components/SocialProof";
import Benefits from "./components/Benefits"; // 'Metodología'
import ResultsGrid from "./components/ResultsGrid";
import Guarantee from "./components/Guarantee";
import FAQPreview from "./components/FAQPreview";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot"; // 👈 flotante

export const metadata = {
  title: "LexMatch — Plataforma de coordinación legal",
  description:
    "Conecta tus asuntos legales con estudios verificados en Chile. LexMatch coordina respuestas, documentación y avances desde un solo panel.",
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />

        {/* Los IDs deben coincidir con los del Navbar */}
        <section id="como-funciona">
          <ComoSaberDicom />
        </section>

        <TrustBar />
        <SocialProof />

        <section id="especialidades">
          <Benefits />
        </section>

        <section id="casos">
          <ResultsGrid />
        </section>

        <section id="confianza">
          <Guarantee />
        </section>

        <section id="faq">
          <FAQPreview />
        </section>
      </main>

      <footer id="contacto">
        <Footer />
      </footer>

      {/* Bot flotante (abre ventana de chat conectada a /api/chat) */}
      <Chatbot />
    </>
  );
}
