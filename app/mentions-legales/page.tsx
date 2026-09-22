import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales — My CHICKEN',
  description: 'Mentions légales du site My CHICKEN : éditeur, directeur de publication, hébergeur et propriété intellectuelle.',
};

export default function MentionsLegalesPage() {
  return (
    <>
      <div className="page-head">
        <span className="eyebrow">Informations légales</span>
        <h1 className="page-title">
          Mentions <em>légales</em>
        </h1>
        <p className="page-sub">Éditeur, hébergement et propriété intellectuelle du site.</p>
      </div>
      <div className="container legal">
        <article>
          <h2>Éditeur du site</h2>
          <p>
            Le site <strong>My CHICKEN</strong> (ci-après « le Site ») est édité par{' '}
            <strong>MY CHICKEN</strong>, société par actions simplifiée unipersonnelle (SASU) au
            capital de <strong>1&nbsp;000&nbsp;€</strong>, dont le siège social est situé au{' '}
            <strong>2 rue de la Belle Étoile, 77230 Longperrier</strong>, immatriculée au registre
            du commerce et des sociétés de Meaux sous le numéro{' '}
            <strong>928&nbsp;281&nbsp;278</strong> (n° de TVA intracommunautaire&nbsp;:{' '}
            <strong>FR36928281278</strong>).
          </p>
          <p>
            Directeur de la publication&nbsp;: <strong>M. Jaouad EL MERRAOUI</strong>, président.
          </p>
          <p>
            Téléphone&nbsp;: <a href="tel:+33751565951">07&nbsp;51&nbsp;56&nbsp;59&nbsp;51</a>{' '}
            (restaurant&nbsp;: Avenue Jacques Vogt, 95340 Persan — ouvert 7j/7).
          </p>

          <h2>Hébergement du site</h2>
          <p>
            Le Site est hébergé par <strong>Vercel Inc.</strong>, 440 N Barranca Ave #4133, Covina,
            CA&nbsp;91723, États-Unis — <a href="https://vercel.com" rel="noopener noreferrer" target="_blank">vercel.com</a>.
          </p>

          <h2>Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des éléments du Site (textes, visuels, logo, marques, structure,
            code) est protégé par le droit de la propriété intellectuelle. Toute reproduction,
            représentation ou exploitation, totale ou partielle, sans autorisation écrite
            préalable de MY CHICKEN est interdite et constituerait une contrefaçon sanctionnée
            par les articles L.335-2 et suivants du code de la propriété intellectuelle.
          </p>

          <h2>Médiation de la consommation</h2>
          <p>
            Conformément à l&apos;article L.612-1 du code de la consommation, en cas de litige
            non résolu à l&apos;amiable, le client consommateur peut recourir gratuitement à un
            médiateur de la consommation. Les coordonnées du médiateur dont relève la société
            peuvent être obtenues sur simple demande au{' '}
            <a href="tel:+33751565951">07&nbsp;51&nbsp;56&nbsp;59&nbsp;51</a>.
          </p>

          <h2>Signalement et signalement illicite</h2>
          <p>
            Pour toute question ou signalement relatif au Site, vous pouvez nous contacter par
            téléphone au <a href="tel:+33751565951">07&nbsp;51&nbsp;56&nbsp;59&nbsp;51</a> ou via
            la page <a href="/contact">Contact</a>.
          </p>

          <p className="upd">Dernière mise à jour&nbsp;: septembre 2026.</p>
        </article>
      </div>
    </>
  );
}
