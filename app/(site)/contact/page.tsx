import type { Metadata } from 'next';
import Contact from '@/components/Contact';

export const metadata: Metadata = {
  title: 'Contact — My CHICKEN Persan | Adresse, horaires & téléphone',
  description:
    'My CHICKEN à Persan : Avenue Jacques Vogt, ouvert 7j/7 de 11h à 14h et 18h à 22h30. Commandez au 07.51.56.59.51.',
};

export default function ContactPage() {
  return <Contact />;
}
