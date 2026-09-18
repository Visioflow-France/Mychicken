import Reveal from './Reveal';
import SmartImg from './SmartImg';

export default function InfoBand() {
  return (
    /* Infos pratiques — photo restaurant en fond */
    <div className="section band">
      <div className="container">
        <div className="s-head">
          <span className="eyebrow">
            <span className="n">02</span>On vous attend — ou on vient à vous
          </span>
          <h2 className="s-title">
            Infos <em>pratiques</em>
          </h2>
          <span className="orn" aria-hidden="true">
            <i />
          </span>
        </div>
        <div className="grid grid-3">
          <Reveal className="info-card">
            <span className="info-ring">
              <SmartImg
                src="https://images.unsplash.com/photo-1600854401200-3dc4631766b6?auto=format&fit=crop&w=400&q=70"
                alt="Livraison à domicile en scooter"
                loading="lazy"
              />
            </span>
            <h3>Livraison à domicile</h3>
            <p>
              On vous livre à Persan et les communes alentour <strong>dès 25&nbsp;€ d&apos;achat</strong>.
              Chaud, croustillant, directement chez vous&nbsp;!
            </p>
          </Reveal>
          <Reveal className="info-card">
            <span className="info-ring">
              <SmartImg
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=70"
                alt="Notre restaurant à Persan"
                loading="lazy"
              />
            </span>
            <h3>Venez nous voir</h3>
            <p>
              <strong>Avenue Jacques Vogt</strong>, 95340 Persan.
              <br />
              Sur place ou à emporter, l&apos;accueil est toujours souriant.
            </p>
          </Reveal>
          <Reveal className="info-card">
            <span className="info-ring">
              <SmartImg
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=400&q=70"
                alt="Commande par téléphone"
                loading="lazy"
              />
            </span>
            <h3>Commandez par téléphone</h3>
            <p>
              <a href="tel:+33751565951">07.51.56.59.51</a>
              <br />
              Ouvert 7j/7 · 11h–14h / 18h–22h30
            </p>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
