import Hero from '@/components/Hero';
import Featured from '@/components/Featured';
import InfoBand from '@/components/InfoBand';
import Values from '@/components/Values';

export default function Home() {
  return (
    <>
      {/* ================= ACCUEIL ================= */}
      <Hero />
      <Featured />
      <InfoBand />
      <Values />
    </>
  );
}
