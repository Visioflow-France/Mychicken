import type { Metadata, Viewport } from 'next';
import ReactDOM from 'react-dom';
import { Cormorant_Garamond, Montserrat, Caveat, Dancing_Script } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cart';
import { ToastProvider } from '@/lib/toast';
import { MenuProvider } from '@/lib/menu-store';
import { LocationProvider } from '@/lib/location-store';
import ServiceWorker from '@/components/ServiceWorker';

/* Photo « bois brûlé » des sections — AVIF (119 Ko) chargée en priorité ;
   le JPEG reste le fallback CSS pour les navigateurs sans AVIF. */
function preloadBackground() {
  ReactDOM.preload('/fond-bois.avif', { as: 'image', fetchPriority: 'high' });
}

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

/* Écritures du footer — logo script & note manuscrite */
const script = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-dancing',
  display: 'swap',
});

const handwriting = Caveat({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-caveat',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#26150B',
};

export const metadata: Metadata = {
  title: 'My CHICKEN — Saint-Mard & Persan | Poulet braisé, menus & livraison',
  description:
    'My CHICKEN : poulet braisé, menus généreux, sauces maison et livraison dès 25 €. Saint-Mard (ZAC de la Fontaine du Berger) et Persan (Av. Jacques Vogt) — ouvert 7j/7, 11h30–21h30.',
  manifest: '/manifest.webmanifest',
  applicationName: 'My Chicken',
  icons: {
    icon: [
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icon-180.png', sizes: '180x180', type: 'image/png' }],
    shortcut: [{ url: '/favicon.ico' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'My Chicken' },
  openGraph: {
    title: 'My CHICKEN — Saint-Mard & Persan',
    description:
      'Poulet braisé, frites maison, sauces préparées chaque jour. À emporter ou livré dès 25 €.',
    type: 'website',
    locale: 'fr_FR',
    images: [{ url: '/icon-512.png', width: 512, height: 512, alt: 'My Chicken — logo officiel' }],
  },
  twitter: {
    card: 'summary',
    title: 'My CHICKEN — Saint-Mard & Persan',
    description: 'Poulet braisé, menus généreux, livraison dès 25 €.',
    images: ['/icon-512.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  preloadBackground();
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable} ${script.variable} ${handwriting.variable}`}>
      <body>
        <ToastProvider>
          <MenuProvider>
            <LocationProvider>
              <CartProvider>
                {children}
                <ServiceWorker />
              </CartProvider>
            </LocationProvider>
          </MenuProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
