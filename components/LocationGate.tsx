'use client';

import { useEffect, useMemo, useState } from 'react';
import Icon from './Icon';
import { useLocationCtx } from '@/lib/location-store';
import type { RestaurantLocation } from '@/lib/data';

/* ================================================================
   Parcours d'entrée — « Où commandez-vous ? »
   Étape 1 : Livraison ou À emporter.
   Étape 2 : code postal (ou position actuelle géolocalisée).
   • Livraison couverte → entrée directe chez le resto qui livre.
   • À emporter → proposition du resto le plus proche (choix libre).
   Le choix est mémorisé ; pour en changer il faut refaire le parcours
   (bouton « Changer de restaurant » de la barre permanente).
   ================================================================ */

type Step = 'mode' | 'postal';

const distanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const r = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
};

export default function LocationGate() {
  const { gateOpen, closeGate, choose, locations, findByPostal, setEntryMode } = useLocationCtx();
  const [step, setStep] = useState<Step>('mode');
  const [mode, setMode] = useState<'delivery' | 'pickup'>('delivery');
  const [cp, setCp] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [verdict, setVerdict] = useState<
    | { kind: 'covered'; loc: RestaurantLocation }
    | { kind: 'notCovered' }
    | null
  >(null);

  useEffect(() => {
    if (gateOpen) {
      setStep('mode');
      setCp('');
      setCoords(null);
      setVerdict(null);
      setGeoError('');
    }
  }, [gateOpen]);

  /* Verrouille TOTALEMENT le scroll tant que la popup est ouverte :
     ni en arrière-plan ni en premier plan, la page reste statique.
     Sur iOS, overflow:hidden sur body ne suffit pas (le doigt fait
     défiler quand même) → body passe en position:fixed, et la position
     de défilement est restituée à la fermeture. Le 1er plan est bloqué
     côté CSS (touch-action:none + overflow:hidden sur la carte). */
  useEffect(() => {
    if (!gateOpen) return;
    const scrollY = window.scrollY;
    const { body } = document;
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    return () => {
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
      body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [gateOpen]);

  /* Restaurant le plus proche : par GPS si fourni, sinon par
     département du code postal (95 → Persan, 77 → Saint-Mard). */
  const ordered = useMemo(() => {
    const withPos = locations.filter((l) => typeof l.lat === 'number');
    if (coords && withPos.length === locations.length) {
      return [...locations].sort(
        (a, b) => distanceKm(coords.lat, coords.lng, a.lat!, a.lng!) - distanceKm(coords.lat, coords.lng, b.lat!, b.lng!)
      );
    }
    if (/^95/.test(cp)) return [...locations].sort((a) => (a.postal.startsWith('95') ? -1 : 1));
    if (/^77/.test(cp)) return [...locations].sort((a) => (a.postal.startsWith('77') ? -1 : 1));
    return locations;
  }, [locations, coords, cp]);

  if (!gateOpen) return null;

  const useMyLocation = () => {
    setGeoError('');
    if (!('geolocation' in navigator)) {
      setGeoError('Géolocalisation non disponible sur cet appareil');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        try {
          // Code postal par géocodage inverse (OpenStreetMap, sans clé)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=16`,
            { headers: { Accept: 'application/json' } }
          );
          const data = (await res.json()) as { address?: { postcode?: string } };
          const pc = (data.address?.postcode || '').replace(/\D/g, '').slice(0, 5);
          if (pc.length === 5) setCp(pc);
          else setGeoError('Position trouvée mais code postal inconnu — saisissez-le ci-dessus');
        } catch {
          /* pas de reverse geocoding → on garde juste les coordonnées */
        }
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        // Message précis selon la cause réelle du refus
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError(
            'Position refusée par le navigateur — autorisez la localisation pour ce site (icône cadenas près de l’adresse), ou entrez votre code postal'
          );
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGeoError('Position indisponible (GPS coupé ?) — entrez votre code postal');
        } else if (err.code === err.TIMEOUT) {
          setGeoError('Délai dépassé pour obtenir la position — réessayez ou entrez votre code postal');
        } else {
          setGeoError('Géolocalisation impossible — entrez votre code postal');
        }
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
    );
  };

  const check = () => {
    if (mode === 'delivery') {
      const loc = findByPostal(cp);
      setVerdict(loc ? { kind: 'covered', loc } : { kind: 'notCovered' });
    } else {
      setVerdict(null);
    }
  };

  const enter = (loc: RestaurantLocation) => {
    setEntryMode(mode === 'delivery' ? 'delivery' : 'takeaway');
    choose(loc.id);
  };

  return (
    <div className="lg-overlay" role="dialog" aria-modal="true" aria-label="Choisir votre restaurant">
      <div className="lg-card">
        <span className="lg-badge" aria-hidden="true">
          <Icon name="pin" size={18} />
        </span>
        <h2>Bienvenue chez My Chicken&nbsp;!</h2>

        {step === 'mode' && (
          <>
            <p className="lg-sub">Deux restaurants, la même gourmandise. Comment souhaitez-vous commander&nbsp;?</p>
            <div className="lg-mode-choice">
              <button
                className="lg-mode"
                onClick={() => {
                  setMode('delivery');
                  setStep('postal');
                }}
              >
                <Icon name="scooter" size={22} />
                <b>Livraison</b>
                <span>Livré chez vous dès 25&nbsp;€</span>
              </button>
              <button
                className="lg-mode"
                onClick={() => {
                  setMode('pickup');
                  setStep('postal');
                }}
              >
                <Icon name="bag" size={22} />
                <b>À emporter</b>
                <span>Prêt à récupérer au comptoir</span>
              </button>
            </div>
            <button className="lg-skip" onClick={closeGate}>
              Continuer sans choisir
            </button>
          </>
        )}

        {step === 'postal' && (
          <>
            <p className="lg-sub">
              {mode === 'delivery'
                ? 'Entrez votre code postal — on vérifie tout de suite si on vous livre.'
                : 'Entrez votre code postal — on vous propose le restaurant le plus proche.'}
            </p>

            <div className="lg-cp-row">
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{5}"
                minLength={5}
                maxLength={5}
                autoComplete="postal-code"
                enterKeyHint="go"
                value={cp}
                onChange={(e) => {
                  /* Un code postal français : 5 chiffres exactement —
                     ni moins (bouton bloqué), ni plus (coupé à 5). */
                  setCp(e.target.value.replace(/\D/g, '').slice(0, 5));
                  setVerdict(null);
                  setCoords(null);
                }}
                placeholder="Code postal"
                aria-label="Votre code postal (5 chiffres)"
                onKeyDown={(e) => e.key === 'Enter' && cp.length === 5 && check()}
              />
              <button className="btn btn-solid" onClick={check} disabled={cp.length !== 5}>
                Vérifier
              </button>
            </div>
            {cp.length > 0 && cp.length < 5 && (
              <p className="lg-cp-hint" aria-live="polite">
                Code postal à 5 chiffres — encore {5 - cp.length} chiffre{5 - cp.length > 1 ? 's' : ''}
              </p>
            )}
            <button className="lg-geoloc" onClick={useMyLocation} disabled={locating}>
              <Icon name="pin" size={14} /> {locating ? 'Localisation…' : 'Utiliser ma position actuelle'}
            </button>
            {geoError && <p className="lg-geo-err">{geoError}</p>}

            {/* Livraison : verdict du code postal */}
            {mode === 'delivery' && verdict?.kind === 'covered' && (
              <div className="lg-result ok">
                <Icon name="check" size={15} strokeWidth={2.4} />
                <div>
                  <b>Bonne nouvelle — on vous livre&nbsp;!</b>
                  <p>
                    Livraison assurée par <b>My Chicken {verdict.loc.city}</b> ({verdict.loc.address}) dès{' '}
                    {verdict.loc.minDelivery}&nbsp;€ d&apos;achat.
                  </p>
                  <button className="btn btn-solid lg-continue" onClick={() => enter(verdict.loc)}>
                    Commander chez My Chicken {verdict.loc.city} <Icon name="arrowRight" size={14} strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            )}
            {mode === 'delivery' && verdict?.kind === 'notCovered' && (
              <div className="lg-result ko">
                <Icon name="close" size={15} strokeWidth={2.4} />
                <div>
                  <b>Dommage — ce code postal n&apos;est pas encore livré.</b>
                  <p>
                    Vous pouvez commander à emporter dans l&apos;un de nos restaurants, ou nous appeler pour en savoir
                    plus.
                  </p>
                </div>
              </div>
            )}

            {/* À emporter : les deux restos, le plus proche en premier */}
            {mode === 'pickup' && (cp.length === 5 || coords) && (
              <div className="lg-choices">
                {ordered.map((l, i) => (
                  <button key={l.id} className="lg-choice" onClick={() => enter(l)}>
                    {i === 0 && <span className="lg-nearest">Le plus proche</span>}
                    <span className="lg-city">{l.city}</span>
                    <span className="lg-addr">
                      {l.address}, {l.postal} {l.city}
                    </span>
                    <span className="lg-hours">{l.hours}</span>
                    <span className="lg-go">
                      Commander ici <Icon name="arrowRight" size={14} strokeWidth={2.2} />
                    </span>
                  </button>
                ))}
              </div>
            )}

            <button className="lg-back" onClick={() => setStep('mode')}>
              ← Retour
            </button>
          </>
        )}
      </div>
    </div>
  );
}
