import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Montserrat } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cart';
import { ToastProvider } from '@/lib/toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollTop from '@/components/ScrollTop';

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-garamond',
  display: 'swap',
});

const sans = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#170B05',
};

export const metadata: Metadata = {
  title: 'My CHICKEN — Fast-food à Persan | Poulet mijoté, menus & livraison',
  description:
    "My CHICKEN à Persan : poulet mijoté, menus généreux, sauces maison et livraison dès 25 €. Avenue Jacques Vogt — 07.51.56.59.51.",
  openGraph: {
    title: 'My CHICKEN — Fast-food à Persan',
    description:
      'Poulet mijoté 24h, frites maison, sauces préparées chaque jour. Sur place, à emporter ou livré dès 25 €.',
    type: 'website',
    locale: 'fr_FR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <ToastProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <ScrollTop />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
