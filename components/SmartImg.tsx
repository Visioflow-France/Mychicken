'use client';

import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import { FALLBACK_IMG } from '@/lib/data';
import variants from '@/lib/photo-variants.json';

type SmartImgProps = ImgHTMLAttributes<HTMLImageElement>;

/* Largeurs disponibles par photo (générées par scripts/optimize-photos.mjs) :
   /photos/plat.jpg → plat-480 / -800 / -1200 en .webp ET .jpg, la dernière
   largeur étant le fichier plein. Les URL externes (Storage, Unsplash…) ne
   figurent pas dans le manifeste et passent telles quelles. */
const MANIFEST = variants as Record<string, number[]>;

/* Taille d'affichage par défaut : une carte produit (grille 1 colonne sur
   mobile, 2–3 colonnes ensuite, conteneur max 1180px). Les contextes plus
   petits (vignettes panier / bulle d'ajout) passent leur propre `sizes`. */
const DEFAULT_SIZES = '(max-width:639px) 92vw, (max-width:999px) 46vw, 32vw';

/**
 * Image « intelligente » :
 * 1. responsive — <picture> WebP + JPEG : le navigateur ne télécharge que la
 *    largeur utile à l'écran (mobile comme ordinateur) ;
 * 2. filet de sécurité — si l'image ne charge pas, on la remplace
 *    automatiquement par une photo fiable.
 */
export default function SmartImg({ src, alt = '', sizes, ...rest }: SmartImgProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || !src) {
    return <img src={FALLBACK_IMG} alt={alt} {...rest} />;
  }

  /* Le manifeste ne couvre que les photos locales ; les URL externes
     (et le cas improbable d'un Blob) passent par le <img> simple. */
  if (typeof src !== 'string') {
    return <img src={src} alt={alt} sizes={sizes} {...rest} />;
  }
  const widths = MANIFEST[src];
  if (!widths) {
    return <img src={src} alt={alt} sizes={sizes} {...rest} />;
  }

  const base = src.replace(/\.jpg$/, '');
  const full: number = widths[widths.length - 1];
  const sizeAttr = sizes ?? DEFAULT_SIZES;

  /* La plus grande largeur correspond au fichier de base lui-même
     (plat.jpg / plat.webp), les autres aux fichiers suffixés -480/-800/-1200. */
  const srcsetOf = (ext: string) =>
    widths
      .map((w: number) => `${w === full ? (ext === 'webp' ? `${base}.webp` : src) : `${base}-${w}.${ext}`} ${w}w`)
      .join(', ');

  return (
    <picture>
      <source type="image/webp" srcSet={srcsetOf('webp')} sizes={sizeAttr} />
      <img
        src={src}
        srcSet={srcsetOf('jpg')}
        sizes={sizeAttr}
        alt={alt}
        onError={() => setFailed(true)}
        {...rest}
      />
    </picture>
  );
}
