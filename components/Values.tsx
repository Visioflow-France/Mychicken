import Reveal from './Reveal';
import SmartImg from './SmartImg';

const VALUES = [
  {
    num: 'I.',
    title: 'Poulet mijoté',
    desc: 'Mariné 24h dans nos épices puis mijoté lentement, pour un moelleux incomparable.',
    img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=70',
    alt: 'Poulet mijoté',
  },
  {
    num: 'II.',
    title: 'Sauces maison',
    desc: 'De la sauce verte à la samouraï, toutes préparées dans notre cuisine.',
    img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=70',
    alt: 'Épices et sauces maison',
  },
  {
    num: 'III.',
    title: 'Frites fraîches',
    desc: 'Coupées et cuites maison, tous les jours. Jamais de congelé.',
    img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=70',
    alt: 'Frites fraîches maison',
  },
  {
    num: 'IV.',
    title: 'Fait avec amour',
    desc: 'Une équipe de famille qui met du cœur dans chaque commande.',
    img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=70',
    alt: 'Cuisine faite avec amour',
  },
];

export default function Values() {
  return (
    /* Engagements — médaillons photo */
    <div className="section container">
      <div className="s-head">
        <span className="eyebrow">
          <span className="n">03</span>Notre philosophie
        </span>
        <h2 className="s-title">
          Nos <em>engagements</em>
        </h2>
        <p className="s-sub">La qualité avant tout.</p>
        <span className="orn" aria-hidden="true">
          <i />
        </span>
      </div>
      <div className="values">
        {VALUES.map((v) => (
          <Reveal className="value" key={v.num}>
            <span className="value-ring">
              <SmartImg src={v.img} alt={v.alt} loading="lazy" />
            </span>
            <span className="value-num">{v.num}</span>
            <h3>{v.title}</h3>
            <p>{v.desc}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
