import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ComoSaberDicom from "./components/ComoSaberDicom";
import TrustBar from "./components/TrustBar";
import SocialProof from "./components/SocialProof";
import Benefits from "./components/Benefits"; // Este es 'Metodología'
import ResultsGrid from "./components/ResultsGrid";
import Guarantee from "./components/Guarantee";
import FAQPreview from "./components/FAQPreview";
import Footer from "./components/Footer";

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
    </>
  );
}