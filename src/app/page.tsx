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
  title: "DeudasCero — Defensa legal y evaluación sin costo",
  description:
    "Defensa legal experta para eliminar deudas. Cada caso se evalúa de forma particular. Agenda tu evaluación.",
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />

        {/* Los IDs deben coincidir con los del Navbar */}
        <ComoSaberDicom />
        <TrustBar />
        <SocialProof />

        <section id="metodologia">
          <Benefits />
        </section>

        <section id="resultados">
          <ResultsGrid />
        </section>

        <section id="garantia">
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