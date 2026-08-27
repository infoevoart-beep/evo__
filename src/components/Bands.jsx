import { Reveal } from './Reveal';
import { Button } from './Button';

/** Centred "short version" statement, optionally with the hairline rule. */
export function StatementBand({ label, title, rule = true, children, className = '' }) {
  return (
    <section className={`sec state ${className}`.trim()}>
      <div className="wrap">
        <Reveal motion="flat">
          <span className="lab">{label}</span>
          <h2>{title}</h2>
          {rule && <div className="rule" />}
        </Reveal>
        {children}
      </div>
    </section>
  );
}

/** The ember-coloured closing band that ends every inner page. */
export function ClosingBand({ label, title, actions = [] }) {
  return (
    <section className="sec band">
      <Reveal className="wrap" motion="flat">
        <span className="lab">{label}</span>
        <h2>{title}</h2>
        {actions.length > 0 && (
          <div className="cta-btns">
            {actions.map((action) => (
              <Button key={action.children} {...action} />
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
}

/** Full-bleed photographic call to action (home page). */
export function PhotoCta({ photo, label, title, actions = [] }) {
  return (
    <section className="cta">
      <img loading="lazy" src={photo.src} alt={photo.alt} />
      <Reveal className="cta-in" motion="flat">
        <span className="lab">{label}</span>
        <h2>{title}</h2>
        <div className="cta-btns">
          {actions.map((action) => (
            <Button key={action.children} {...action} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
