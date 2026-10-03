'use client';

import { useEffect } from 'react';

/* Enregistre le service worker (PWA installable, cache des assets) */
export default function ServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* échec silencieux : le site fonctionne sans */
      });
    }
  }, []);
  return null;
}
