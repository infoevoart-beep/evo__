import { Reveal } from './Reveal';

/**
 * The two-column "label + heading / supporting paragraph" block that opens
 * most sections. `layout` maps to the original .sh-head / .cui-head /
 * .gal-head / .pill-head rules.
 *
 * `as="h1"` is for a page that opens on a section head rather than a hero —
 * the gallery — so that every indexed page has exactly one first-level
 * heading. The styling is identical either way.
 */
export function SectionHead({
  layout = 'cui-head',
  label,
  title,
  children,
  motion = 'flat',
  as: Heading = 'h2',
}) {
  return (
    <Reveal className={layout} motion={motion}>
      <div>
        <span className="lab">{label}</span>
        <Heading>{title}</Heading>
      </div>
      {children ? (typeof children === 'string' ? <p>{children}</p> : children) : null}
    </Reveal>
  );
}

export default SectionHead;
