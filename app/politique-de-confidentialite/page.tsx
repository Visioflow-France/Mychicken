import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de confidentialité — My CHICKEN',
  description:
    'Politique de confidentialité My CHICKEN : données collectées, finalités, durées de conservation, sous-traitants et vos droits (RGPD).',
};

export default function ConfidentialitePage() {
  return (
    <>
      <div className="page-head">
        <span className="eyebrow">Informations légales</span>
        <h1 className="page-title">
          Politique de <em>confidentialité</em>
        </h1>
        <p className="page-sub">Vos données, nos engagements (RGPD).</p>
      </div>
      <div className="container legal">
        <article>
          <h2>Responsable du traitement</h2>
          <p>
            Les données personnelles collectées sur le site My CHICKEN (ci-après « le Site »)
            sont traitées sous la responsabilité de <strong>MY CHICKEN</strong>, SASU au capital
            de 1&nbsp;000&nbsp;€, siège social 2 rue de la Belle Étoile, 77230 Longperrier,
            immatriculée au RCS de Meaux sous le numéro 928&nbsp;281&nbsp;278.
          </p>
          <p>
            Contact&nbsp;: <a href="tel:+33751565951">07&nbsp;51&nbsp;56&nbsp;59&nbsp;51</a> ou
            via la page <a href="/contact">Contact</a>.
          </p>

          <h2>Données collectées et finalités</h2>
          <ul>
            <li>
              <strong>Lors d&apos;une commande</strong>&nbsp;: nom (facultatif), numéro de
              téléphone, adresse de livraison (pour les commandes livrées) et note éventuelle.
              Ces données sont indispensables à la préparation, à la livraison et au suivi de
              votre commande. Base légale&nbsp;: exécution du contrat.
            </li>
            <li>
              <strong>Données de transaction</strong>&nbsp;: montant, articles commandés, statut
              de la commande. Elles servent à la gestion des commandes et aux obligations
              comptables. Base légale&nbsp;: exécution du contrat et obligation légale.
            </li>
            <li>
              <strong>Données bancaires</strong>&nbsp;: elles sont traitées exclusivement par
              notre prestataire de paiement Stripe et ne sont jamais transmises ni conservées par
              MY CHICKEN.
            </li>
          </ul>

          <h2>Durées de conservation</h2>
          <p>
            Les données de commande sont conservées pendant la durée nécessaire à leur
            traitement, puis archivées pendant la durée des obligations comptables et légales
            applicables (en particulier 10&nbsp;ans pour les pièces comptables), sauf demandes
            légitimes de suppression antérieure.
          </p>

          <h2>Destinataires et sous-traitants</h2>
          <p>
            Les données sont destinées uniquement à l&apos;équipe du restaurant. Elles peuvent
            être transmises à nos prestataires techniques agissant en qualité de sous-traitants&nbsp;:
          </p>
          <ul>
            <li>
              <strong>Stripe</strong> — paiement en ligne sécurisé (données de transaction)&nbsp;;
            </li>
            <li>
              <strong>Google (Firebase)</strong> — hébergement de la carte et des commandes&nbsp;;
            </li>
            <li>
              <strong>Vercel Inc.</strong> — hébergement du Site.
            </li>
          </ul>
          <p>
            Certains de ces prestataires sont établis aux États-Unis&nbsp;; les transferts sont
            encadrés par les garanties appropriées prévues par le RGPD (notamment le Data Privacy
            Framework UE-États-Unis et les clauses contractuelles types).
          </p>

          <h2>Cookies et autres traceurs</h2>
          <p>
            Le Site n&apos;utilise <strong>aucun cookie publicitaire, de mesure d&apos;audience
            ou de pistage</strong>. Seul un stockage local technique (localStorage) conserve
            temporairement votre panier sur votre appareil&nbsp;: il est strictement nécessaire
            au fonctionnement de la commande et n&apos;est soumis à aucun consentement. Vous
            pouvez l&apos;effacer à tout moment en vidant les données de navigation de votre
            navigateur.
          </p>

          <h2>Vos droits</h2>
          <p>
            Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits
            d&apos;accès, de rectification, d&apos;effacement, de limitation, d&apos;opposition
            et de portabilité de vos données, ainsi que du droit de définir des directives
            relatives à leur sort après votre décès. Pour les exercer, contactez-nous au{' '}
            <a href="tel:+33751565951">07&nbsp;51&nbsp;56&nbsp;59&nbsp;51</a> ou directement au
            restaurant. Vous pouvez également introduire une réclamation auprès de la{' '}
            <strong>CNIL</strong> (<a href="https://www.cnil.fr" rel="noopener noreferrer" target="_blank">www.cnil.fr</a>).
          </p>

          <h2>Sécurité et mise à jour</h2>
          <p>
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour
            protéger vos données (chiffrement des échanges, accès restreints, recours à des
            prestataires reconnus). La présente politique peut être amenée à évoluer&nbsp;:{' '}
            sa dernière version est toujours consultable sur cette page.
          </p>

          <p className="upd">Dernière mise à jour&nbsp;: septembre 2026.</p>
        </article>
      </div>
    </>
  );
}
