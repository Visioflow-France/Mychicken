/* Layout du site client : navbar flottante, bandeau promo, footer…
   L'admin (/admin) et les routes API n'héritent PAS de ce décor. */
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollTop from '@/components/ScrollTop';
import LocationGate from '@/components/LocationGate';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PromoBanner />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <ScrollTop />
      <LocationGate />
    </>
  );
}
