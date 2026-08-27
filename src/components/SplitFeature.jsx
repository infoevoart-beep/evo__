import { Reveal } from './Reveal';

/**
 * Image on one side, text on the other. Used five times across the site;
 * `reverse` flips the order on desktop and `onDark` switches the palette.
 */
export function SplitFeature({
  photo,
  portrait = false,
  label,
  labelTone = 'ember',
  title,
  paragraphs = [],
  items = [],
  onDark = false,
  reverse = false,
  children,
}) {
  const media = (
    <Reveal as="figure" className="sp-media" motion={reverse ? 'right' : 'left'}>
      <img
        loading="lazy"
        style={portrait ? { aspectRatio: '3 / 4' } : undefined}
        src={photo.src}
        alt={photo.alt}
      />
      <figcaption>{photo.caption}</figcaption>
    </Reveal>
  );

  const text = (
    <Reveal
      className={`sp-text ${onDark ? 'on-dark' : ''}`.trim()}
      motion={reverse ? 'left' : 'right'}
    >
      <span className={`lab lab-${labelTone}`}>{label}</span>
      <h2>{title}</h2>
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {items.length > 0 && (
        <div className="sp-list">
          {items.map(({ key, text: line }) => (
            <div key={line}>
              <b>{key}</b>
              <span>{line}</span>
            </div>
          ))}
        </div>
      )}
      {children}
    </Reveal>
  );

  return (
    <div className={`wrap split ${reverse ? 'rev' : ''}`.trim()}>
      {reverse ? (
        <>
          {text}
          {media}
        </>
      ) : (
        <>
          {media}
          {text}
        </>
      )}
    </div>
  );
}

export default SplitFeature;
