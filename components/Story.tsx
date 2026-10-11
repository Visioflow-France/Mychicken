'use client';

import Link from 'next/link';
import Reveal from './Reveal';
import SmartImg from './SmartImg';
import { useLocationCtx } from '@/lib/location-store';

/* Page « Notre histoire » — elle suit le restaurant choisi :
   - restaurant sélectionné → l'histoire est racontée pour CETTE maison
     (ville, adresse, seuil de livraison de la fiche) ;
   - pas encore de choix (« Continuer sans choisir » ou 1re visite avant
     le parcours) → version générale, valable pour les DEUX restaurants.
   Les deux visuels restent identiques dans tous les cas. */
export default function Story() {
  const { current, locationId, locations } = useLocationCtx();
  const chosen = locationId !== null;

  /* Où le parfum du premier service se répand : la ville de la maison
     choisie, ou simplement le quartier tant qu'on n'a pas choisi. */
  const scent = chosen ? current.city : 'le quartier';

  /* Seuil de livraison affiché : celui de la maison choisie, ou le plus
     bas des deux pour la version générale. */
  const minDel = chosen
    ? current.minDelivery
    : Math.min(...locations.map((l) => l.minDelivery));

  /* La timeline se termine par l'adresse de la maison choisie, ou par
     les deux adresses quand aucun restaurant n'est sélectionné. */
  const todayTitle = chosen ? `My CHICKEN à ${current.city}` : 'My CHICKEN près de chez vous';
  const todayText = chosen ? (
    <>
      {current.address}, 7j/7. À emporter, ou livré chez vous dès {minDel}&nbsp;€.
    </>
  ) : (
    <>
      Deux restaurants, une seule recette&nbsp;: {locations.map((l) => `${l.address} à ${l.city}`).join(', et ')}.
      7j/7, à emporter ou livré chez vous dès {minDel}&nbsp;€.
    </>
  );

  return (
    <>
      <div className="section after-nav">
        <div className="container">
        <Reveal as="p" className="story-intro">
          «&nbsp;Tout a commencé dans une cuisine de famille, autour d&apos;une recette de poulet
          mijoté transmise de génération en génération.&nbsp;»
        </Reveal>

        <div className="chapter">
          <Reveal as="figure" className="chapter-fig">
            <div className="frame">
              {/* Affiche portrait : ratio natif pour ne rien rogner
                 (le cadre par défaut de la page est 4:3). */}
              <SmartImg
                src="/photos/histoire-1.jpg"
                alt="L'affiche My Chicken — le chef et son poulet grillé à la braise"
                loading="lazy"
                sizes="(max-width:919px) 92vw, 440px"
                style={{ aspectRatio: '754 / 1024' }}
              />
            </div>
          </Reveal>
          <div className="chapter-text">
            <Reveal>
              <span className="eyebrow">Chapitre premier</span>
              <h3>La recette de la famille</h3>
              <p className="dropcap">
                Chez nous, on ne choisit pas un poulet au hasard. Chaque volée est sélectionnée avec
                soin, puis confiée à notre marinade — vingt-quatre heures d&apos;épices, de patience
                et de savoir-faire — avant d&apos;être mijotée lentement, comme à la maison.
              </p>
              <p>
                C&apos;est cette lenteur qui fait tout le goût&nbsp;: une peau dorée, une chair
                fondante, ce parfum qui embaume {scent} dès l&apos;ouverture.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="chapter rev">
          <Reveal as="figure" className="chapter-fig">
            <div className="frame">
              {/* Visuel 3:2 avec logo et slogan : ratio natif, rien coupé. */}
              <SmartImg
                src="/photos/histoire-2.jpg"
                alt="Poulet braisé, frites maison et sauces préparées chez nous"
                loading="lazy"
                sizes="(max-width:919px) 92vw, 440px"
                style={{ aspectRatio: '1536 / 1024' }}
              />
            </div>
          </Reveal>
          <div className="chapter-text">
            <Reveal>
              <span className="eyebrow">Chapitre deuxième</span>
              <h3>Le goût de l&apos;artisanat</h3>
              <p className="dropcap">
                Frites coupées et cuites maison chaque jour, sauces préparées dans notre cuisine —
                de la verte à la samouraï —, rien de congelé, rien de prêt-à-réchauffer.
              </p>
              <p>
                Une équipe de famille qui met du cœur dans chaque commande, du premier pilon du
                service jusqu&apos;au dernier menu familial de la soirée.
              </p>
            </Reveal>
          </div>
        </div>

        <Reveal className="timeline">
          <div className="tl-item">
            <span className="tl-when">Le début</span>
            <h4>Une idée de famille</h4>
            <p>Envie de partager le vrai poulet mijoté de nos grands-mères avec tout le quartier.</p>
          </div>
          <div className="tl-item">
            <span className="tl-when">Puis</span>
            <h4>La recette s&apos;affine</h4>
            <p>
              La marinade 24h, les frites fraîches, les sauces maison : la signature My CHICKEN est
              née.
            </p>
          </div>
          <div className="tl-item">
            <span className="tl-when">Aujourd&apos;hui</span>
            <h4>{todayTitle}</h4>
            <p>{todayText}</p>
          </div>
        </Reveal>

        <Reveal as="blockquote" className="big-quote">
          Ici, chaque poulet est préparé comme à la maison — avec du temps, du feu et du cœur.
          <footer>
            {chosen ? `L'équipe My CHICKEN ${current.city}` : `Les équipes My CHICKEN — ${locations.map((l) => l.city).join(' & ')}`}
          </footer>
        </Reveal>

        <div className="story-cta">
          <Reveal>
            <Link href="/la-carte" className="btn btn-solid">
              Goûter la différence
            </Link>
          </Reveal>
        </div>
        </div>
      </div>
    </>
  );
}
