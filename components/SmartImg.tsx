'use client';

import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import { FALLBACK_IMG } from '@/lib/data';

type SmartImgProps = ImgHTMLAttributes<HTMLImageElement>;

/**
 * Filet de sécurité : si une image Unsplash ne charge pas,
 * on la remplace automatiquement par une photo fiable.
 */
export default function SmartImg({ src, alt = '', ...rest }: SmartImgProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <img
      src={failed || !src ? FALLBACK_IMG : src}
      alt={alt}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
