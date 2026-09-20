import type { Metadata } from 'next';
import Story from '@/components/Story';

export const metadata: Metadata = {
  title: 'Notre Histoire — My CHICKEN | Une maison, une famille',
  description:
    "Trois générations autour du même feu : la recette du poulet mijoté My CHICKEN, marinée 24h, préparée chaque jour à Persan.",
};

export default function NotreHistoirePage() {
  return <Story />;
}
