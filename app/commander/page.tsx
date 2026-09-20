import type { Metadata } from 'next';
import CartSection from '@/components/CartSection';

export const metadata: Metadata = {
  title: 'Commander — My CHICKEN | Votre panier',
  description:
    'Commandez chez My CHICKEN : sur place, à emporter ou livré dès 25 € à Persan et les communes alentour.',
};

export default function CommanderPage() {
  return <CartSection />;
}
