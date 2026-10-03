import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions générales de vente — My CHICKEN',
  description:
    'CGV My CHICKEN : produits, prix, commande, paiement, livraison, rétractation, garanties et médiation.',
};

export default function CgvPage() {
  return (
    <>
      <div className="page-head">
        <span className="eyebrow">Informations légales</span>
        <h1 className="page-title">
          Conditions générales <em>de vente</em>
        </h1>
        <p className="page-sub">Les règles qui encadrent vos commandes en ligne.</p>
      </div>
      <div className="container legal">
        <article>
          <h2>Article 1 — Objet et champ d&apos;application</h2>
          <p>
            Les présentes conditions générales de vente (CGV) régissent les ventes de produits de
            restauration réalisées par <strong>MY CHICKEN</strong>, SASU au capital de{' '}
            1&nbsp;000&nbsp;€, dont le siège social est situé 2 rue de la Belle Étoile, 77230
            Longperrier, immatriculée au RCS de Meaux sous le numéro 928&nbsp;281&nbsp;278 (ci-après
            « le Vendeur »), par l&apos;intermédiaire de son site internet (ci-après « le Site »),
            par téléphone ou au comptoir du restaurant situé Avenue Jacques Vogt, 95340 Persan.
            Toute commande implique l&apos;acceptation sans réserve des présentes CGV.
          </p>

          <h2>Article 2 — Produits</h2>
          <p>
            Les produits proposés à la vente sont des préparations de restauration rapide sans
            alcool&nbsp;: poulet mijoté, accompagnements, boissons et desserts. Les produits sont
            destinés à une consommation immédiate. Les photographies et descriptions de la carte
            sont données à titre indicatif et n&apos;ont pas de valeur contractuelle. La
            disponibilité des produits peut varier en cours de journée&nbsp;: en cas
            d&apos;indisponibilité, le Vendeur en informe le client avant la préparation de la
            commande et peut proposer un remplacement ou le remboursement du produit manquant.
          </p>

          <h2>Article 3 — Prix</h2>
          <p>
            Les prix sont indiqués en euros, toutes taxes comprises (TTC), frais de livraison en
            sus le cas échéant. Le prix payable par le client correspond au montant total affiché
            lors de la validation de la commande. Le Vendeur se réserve le droit de modifier ses
            prix à tout moment&nbsp;; les produits sont facturés au tarif en vigueur au moment de
            la commande.
          </p>

          <h2>Article 4 — Commande</h2>
          <p>Le client peut commander de trois façons&nbsp;:</p>
          <ul>
            <li>
              <strong>En ligne sur le Site</strong>&nbsp;: le client sélectionne ses produits,
              choisit son mode de consommation (sur place, à emporter ou livraison), renseigne
              les informations nécessaires puis valide sa commande. Un numéro de commande lui est
              attribué.
            </li>
            <li>
              <strong>Par téléphone</strong> au 07&nbsp;51&nbsp;56&nbsp;59&nbsp;51, aux horaires
              d&apos;ouverture (7j/7, 11h–14h et 18h–22h30).
            </li>
            <li>
              <strong>Sur place</strong>, au comptoir du restaurant.
            </li>
          </ul>
          <p>
            La commande est ferme et définitive une fois le paiement validé (ou, pour une commande
            téléphonique, une fois confirmée par le restaurant). Le Vendeur se réserve le droit de
            refuser toute commande présentant un caractère anormal ou frauduleux.
          </p>

          <h2>Article 5 — Paiement</h2>
          <p>
            Le paiement s&apos;effectue, selon le cas&nbsp;:
          </p>
          <ul>
            <li>
              <strong>par carte bancaire</strong>, via la plateforme sécurisée Stripe (le Vendeur
              n&apos;a jamais accès aux données bancaires du client)&nbsp;;
            </li>
            <li>
              <strong>par téléphone</strong>&nbsp;: le restaurant rappelle le client pour
              confirmer la commande et arrêter les modalités de règlement.
            </li>
          </ul>
          <p>
            La commande n&apos;est préparée qu&apos;après encaissement ou confirmation
            téléphonique.
          </p>

          <h2>Article 6 — Livraison</h2>
          <p>
            La livraison à domicile est proposée à Persan et dans les communes limitrophes, pour
            toute commande atteignant le montant minimum affiché sur le Site (25&nbsp;€
            d&apos;achat, hors frais). Des frais de livraison sont facturés en complément,
            conformément au tarif affiché au moment de la commande. Le délai indicatif de
            livraison est communiqué au client lors de la confirmation&nbsp;; il peut varier selon
            l&apos;affluence. Le client s&apos;assure d&apos;être joignable et présent à
            l&apos;adresse indiquée. Pour les commandes à emporter ou sur place, le client est
            informé du créneau de retrait ou de service.
          </p>

          <h2>Article 7 — Droit de rétractation</h2>
          <p>
            Conformément à l&apos;article L.221-28 5° du code de la consommation, le droit de
            rétractation ne s&apos;applique pas aux denrées alimentaires périssables destinées à
            une consommation immédiate. Les produits vendus sur le Site, préparés à la commande,
            ne sont donc pas échangeables ni remboursables après préparation, sauf erreur du
            Vendeur, produit non conforme ou manquant.
          </p>

          <h2>Article 8 — Allergènes</h2>
          <p>
            La liste des allergènes présents dans nos préparations est disponible sur demande,
            au comptoir du restaurant ou par téléphone au{' '}
            <a href="tel:+33751565951">07&nbsp;51&nbsp;56&nbsp;59&nbsp;51</a>. Il appartient au
            client de se signaler en cas d&apos;allergie ou d&apos;intolérance alimentaire avant
            la commande.
          </p>

          <h2>Article 9 — Garanties légales</h2>
          <p>
            Indépendamment de la commercialisation des produits, le Vendeur reste soumis aux
            garanties légales de conformité (articles L.217-3 et suivants du code de la
            consommation) et à la garantie des vices cachés (articles 1641 et suivants du code
            civil), dans les conditions prévues par la loi.
          </p>

          <h2>Article 10 — Responsabilité</h2>
          <p>
            La responsabilité du Vendeur ne saurait être engagée pour un manquement imputable au
            client (adresse erronée, téléphone injoignable, absence lors de la livraison), pour
            un cas de force majeure ou pour les interruptions du Site dues à des opérations de
            maintenance.
          </p>

          <h2>Article 11 — Service client et médiation</h2>
          <p>
            Pour toute question ou réclamation, le client peut contacter le service client au{' '}
            <a href="tel:+33751565951">07&nbsp;51&nbsp;56&nbsp;59&nbsp;51</a> ou via la page{' '}
            <a href="/contact">Contact</a>. À défaut de résolution amiable, le client
            consommateur peut recourir gratuitement à un médiateur de la consommation
            conformément à l&apos;article L.612-1 du code de la consommation, dont les
            coordonnées sont disponibles sur simple demande auprès du restaurant. Il peut
            également s&apos;adresser à la plateforme européenne de règlement en ligne des
            litiges.
          </p>

          <h2>Article 12 — Droit applicable</h2>
          <p>
            Les présentes CGV sont soumises au droit français. En cas de litige, et à défaut de
            résolution amiable, compétence est attribuée aux tribunaux français conformément aux
            règles de compétence applicables.
          </p>

          <p className="upd">Dernière mise à jour&nbsp;: septembre 2026.</p>
        </article>
      </div>
    </>
  );
}
