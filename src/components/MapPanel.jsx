import { site } from '../data/site';
import { Reveal } from './Reveal';

/** Embedded Google map. Shared by the home page and the visit page. */
export function MapPanel({ motion = 'right' }) {
  return (
    <Reveal className="mapbox" motion={motion}>
      <span className="pin">{site.name}</span>
      <iframe
        loading="lazy"
        title={`Map showing ${site.name}`}
        src={site.mapEmbedUrl}
        allowFullScreen
      />
    </Reveal>
  );
}

/** Definition-style list of location facts. */
export function FactList({ facts }) {
  return (
    <div className="facts">
      {facts.map(({ key, value }) => (
        <div className="fact" key={key}>
          <div className="k">{key}</div>
          <div className="v">
            {String(value)
              .split('\n')
              .map((line, index, all) => (
                <span key={line}>
                  {line}
                  {index < all.length - 1 && <br />}
                </span>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
