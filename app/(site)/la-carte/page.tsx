import type { Metadata } from 'next';
import MenuSection from '@/components/MenuSection';

export const metadata: Metadata = {
  title: 'La Carte — My CHICKEN | Menus, poulet mijoté & sauces maison',
  description:
    'Découvrez la carte My CHICKEN à Persan : menus signature, poulet mijoté 24h, frites fraîches, sauces maison et desserts.',
};

export default function LaCartePage() {
  return <MenuSection />;
}
