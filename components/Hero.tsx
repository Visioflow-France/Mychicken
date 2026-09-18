'use client';

import { useEffect, useRef } from 'react';

/* ---------- Braises animées du hero ---------- */
function useEmbers(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cv = canvasRef.current;
    if (!cv || reduceMotion) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let W: number, H: number;
    let raf = 0;
    const fit = () => {
      W = cv.width = cv.offsetWidth;
      H = cv.height = cv.offsetHeight;
    };
    fit();
    window.addEventListener('resize', fit);

    const spawn = (init: boolean) => ({
      x: Math.random() * W,
      y: init ? Math.random() * H : H + 10,
      r: 0.8 + Math.random() * 2,
      v: 0.25 + Math.random() * 0.7,
      drift: Math.random() * Math.PI * 2,
      vd: 0.005 + Math.random() * 0.02,
      a: 0.2 + Math.random() * 0.5,
      tw: Math.random() * Math.PI * 2,
    });

    const P = Array.from({ length: Math.min(44, Math.floor(window.innerWidth / 22)) }, () =>
      spawn(true)
    );

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of P) {
        p.y -= p.v;
        p.drift += p.vd;
        p.tw += 0.05;
        if (p.y < -12) Object.assign(p, spawn(false));
        const x = p.x + Math.sin(p.drift) * 14;
        const al = p.a * (0.55 + 0.45 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.arc(x, p.y, p.r, 0, 7);
        ctx.fillStyle = `rgba(255,${150 + Math.round(60 * Math.sin(p.tw))},20,${al})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', fit);
    };
  }, [canvasRef]);
}

const TICKER_ITEMS = [
  'Poulet mijoté',
  'Sauces maison',
  'Livraison dès 25\u00a0€',
  'Frites maison',
  '3 pilons à 2,50\u00a0€',
  '1 saucisse à 1,50\u00a0€',
  'Menu familial',
];

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEmbers(canvasRef);

  return (
    <>
      {/* Hero — photo poulet rôti + braises */}
      <div className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-veil" aria-hidden="true" />
        <canvas ref={canvasRef} className="ember-canvas" aria-hidden="true" />
        <div className="hero-content">
          <p className="hero-kicker">
            Maison fondée à <b>Persan</b> — Cuisine ouverte 7j/7
          </p>
          <h1 className="hero-title">
            My <em>Chicken</em>
          </h1>
          <div className="hero-rule" aria-hidden="true">
            <i />
          </div>
          <p className="hero-tagline">
            Le vrai goût du poulet mijoté, des frites maison et des sauces préparées chaque jour dans notre cuisine.
          </p>
          <div className="hero-actions">
            <a href="#carte" className="btn btn-solid">Découvrir la carte</a>
            <a href="tel:+33751565951" className="btn btn-ghost">07.51.56.59.51</a>
          </div>
        </div>
        <div className="hero-info">
          <span>📍 Avenue Jacques Vogt, <b>Persan</b></span>
          <span>🛵 Livraison dès <b>25&nbsp;€</b></span>
          <span>🕒 7j/7 · <b>11h–14h / 18h–22h30</b></span>
        </div>
      </div>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span className="tick-item">{item}</span>
              <span className="tick-sep" />
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
