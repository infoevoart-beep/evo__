import { Reveal } from './Reveal';

/**
 * The two-column "label + heading / supporting paragraph" block that opens
 * most sections. `layout` maps to the original .sh-head / .cui-head /
 * .gal-head / .pill-head rules.
 */
export function SectionHead({ layout = 'cui-head', label, title, children, motion = 'flat' }) {
  return (
    <Reveal className={layout} motion={motion}>
      <div>
        <span className="lab">{label}</span>
        <h2>{title}</h2>
      </div>
      {children ? (typeof children === 'string' ? <p>{children}</p> : children) : null}
    </Reveal>
  );
}

export default SectionHead;
