import { useMemo, useState } from 'react';
import { photos } from '../data/site';
import { galleryFilters, galleryOrder } from '../data/content';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { SectionHead } from '../components/SectionHead';
import { ClosingBand } from '../components/Bands';
import { Lightbox } from '../components/Lightbox';
import { Reveal } from '../components/Reveal';
import { Picture } from '../components/Picture';

export default function Gallery() {
  useDocumentTitle(
    'Gallery',
    'The lodge, the smoker, the table and the light over the valley — photographs from Hillsedge Beragala.'
  );

  const [filter, setFilter] = useState('all');
  const [lightbox, setLightbox] = useState(null);

  const visible = useMemo(
    () =>
      galleryOrder
        .map((key) => photos[key])
        .filter((photo) => filter === 'all' || photo.category === filter),
    [filter]
  );

  return (
    <>
      <section className="sec gal scene gal-top" id="top">
        <div className="wrap">
          <SectionHead layout="gal-head" label="Gallery" title="See it, smell it, stay a while.">
            The lodge, the smoker, the table and the light over the valley — the drive up included.
            Tap any photo to open it full size.
          </SectionHead>

          <div className="chips" role="tablist" aria-label="Filter photographs">
            {galleryFilters.map(({ id, label }) => (
              <button
                type="button"
                role="tab"
                aria-selected={filter === id}
                className={`chip ${filter === id ? 'on' : ''}`.trim()}
                key={id}
                onClick={() => {
                  setFilter(id);
                  // The viewer addresses photos by position in the filtered
                  // wall, so a filter change would otherwise strand it.
                  setLightbox(null);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="gal gal-wall-sec">
        <div className="wrap">
          <div className="gwall">
            {visible.map((photo, index) => (
              <Reveal
                as="figure"
                motion="up"
                key={photo.src}
                delay={`${Math.min(index, 6) * 0.05}s`}
              >
                <button
                  type="button"
                  className="gwall-btn"
                  onClick={() => setLightbox(index)}
                  aria-label={`Open “${photo.caption}” full size`}
                >
                  <Picture
                    photo={photo}
                    sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
                  />
                  <figcaption>{photo.caption}</figcaption>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ClosingBand
        label="Photos Don't Do The Air Justice"
        title="The valley changes with the light. Come and watch it happen."
        actions={[
          { to: '/visit', variant: 'fill', children: 'Reserve a table' },
          { to: '/smokehouse', variant: 'ghost', children: 'Meet the smokehouse' },
        ]}
      />

      <Lightbox
        photos={visible}
        index={lightbox}
        onNavigate={setLightbox}
        onClose={() => setLightbox(null)}
      />
    </>
  );
}
