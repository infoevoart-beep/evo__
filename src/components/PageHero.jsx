import { useParallax } from '../hooks/useParallax';
import { Button } from './Button';

/**
 * The hero at the top of every page. The home page uses the tall variant
 * with an info card; inner pages use `short`. Previously each page carried
 * its own near-identical copy of this markup.
 */
export function PageHero({
  photo,
  label,
  title,
  intro,
  short = false,
  actions = [],
  card = null,
  metaLeft,
  metaRight,
  scrollTo,
  scrollLabel = 'Scroll',
  id = 'top',
}) {
  const imgRef = useParallax();

  return (
    <section className={`hero ${short ? 'short' : ''}`.trim()} id={id}>
      <div className="stage">
        <figure className="frame">
          <img
            ref={short ? imgRef : null}
            className={short ? 'par-img' : undefined}
            src={photo.src}
            alt={photo.alt}
            fetchPriority="high"
          />
          <div className="veil" aria-hidden="true" />
          <div className="copy">
            <span className="lab">{label}</span>
            <h1>{title}</h1>
            {intro && <p>{intro}</p>}
            {actions.length > 0 && (
              <div className="hero-btns">
                {actions.map((action) => (
                  <Button key={action.children} {...action} />
                ))}
              </div>
            )}
          </div>

          {card && (
            <aside className="card">
              {card.rows.map(({ label: key, value }) => (
                <div className="row" key={key}>
                  <span>{key}</span>
                  <b>{value}</b>
                </div>
              ))}
              {card.action}
            </aside>
          )}
        </figure>

        <div className="meta">
          <span className="lab">{metaLeft}</span>
          <span className="lab m2">{metaRight}</span>
          {scrollTo && (
            <a href={scrollTo} className="scroll lab">
              {scrollLabel} <i aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

export default PageHero;
