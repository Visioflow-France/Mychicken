import Link from 'next/link';
import Reveal from './Reveal';
import SmartImg from './SmartImg';

export default function Story() {
  return (
    <>
      <div className="page-head">
        <div
          className="ph-bg"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=65')",
          }}
          aria-hidden="true"
        />
        <span className="eyebrow">Notre histoire</span>
        <h1 className="page-title">
          Une maison, <em>une famille</em>
        </h1>
        <p className="page-sub">Trois générations autour du même feu.</p>
        <span className="orn" aria-hidden="true">
          <i />
        </span>
      </div>

      <div className="section">
        <div className="container">
        <Reveal as="p" className="story-intro">
          «&nbsp;Tout a commencé dans une cuisine de famille, autour d&apos;une recette de poulet
          mijoté transmise de génération en génération.&nbsp;»
        </Reveal>

        <div className="chapter">
          <Reveal as="figure" className="chapter-fig">
            <div className="frame">
              <SmartImg
                src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=900&q=70"
                alt="Épices et marinade de la maison"
                loading="lazy"
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
                fondante, ce parfum qui embaume toute l&apos;avenue dès l&apos;ouverture.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="chapter rev">
          <Reveal as="figure" className="chapter-fig">
            <div className="frame">
              <SmartImg
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=70"
                alt="Cuisine maison, préparation du jour"
                loading="lazy"
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
            <h4>My CHICKEN à Persan</h4>
            <p>Avenue Jacques Vogt, 7j/7. Sur place, à emporter, ou livré chez vous dès 25&nbsp;€.</p>
          </div>
        </Reveal>

        <Reveal as="blockquote" className="big-quote">
          Ici, chaque poulet est préparé comme à la maison — avec du temps, du feu et du cœur.
          <footer>L&apos;équipe My CHICKEN</footer>
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
