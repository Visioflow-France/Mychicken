import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Featured from '@/components/Featured';
import InfoBand from '@/components/InfoBand';
import Values from '@/components/Values';
import MenuSection from '@/components/MenuSection';
import Story from '@/components/Story';
import Contact from '@/components/Contact';
import CartSection from '@/components/CartSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />

      {/* ================= ACCUEIL ================= */}
      <section id="accueil">
        <Hero />
        <Featured />
        <InfoBand />
        <Values />
      </section>

      {/* ================= LA CARTE ================= */}
      <section id="carte">
        <MenuSection />
      </section>

      {/* ================= NOTRE HISTOIRE ================= */}
      <section id="histoire">
        <Story />
      </section>

      {/* ================= CONTACT ================= */}
      <section id="contact">
        <Contact />
      </section>

      {/* ================= PANIER ================= */}
      <section id="panier">
        <CartSection />
      </section>

      <Footer />
    </>
  );
}
