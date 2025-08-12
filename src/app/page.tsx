import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ComoSaberDicom from "./components/ComoSaberDicom"; // <-- 1. Importamos el nuevo componente
import TrustBar from "./components/TrustBar";
import SocialProof from "./components/SocialProof";
import Benefits from "./components/Benefits";
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
        {/* --- 2. Aquí añadimos la nueva sección --- */}
        <ComoSaberDicom /> 
        {/* ----------------------------------------- */}
        <TrustBar />
        <SocialProof />
        <Benefits />
        <ResultsGrid />
        <Guarantee />
        <FAQPreview />
      </main>
      <Footer />
    </>
  );
}