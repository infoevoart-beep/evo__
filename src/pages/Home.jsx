import { Link } from 'react-router-dom';
import { photos, site } from '../data/site';
import { pillars, homeStats, homeCuisineCards, homeGalleryKeys, homeFacts } from '../data/content';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { PageHero } from '../components/PageHero';
import { SectionHead } from '../components/SectionHead';
import { StatementBand, PhotoCta } from '../components/Bands';
import { MapPanel, FactList } from '../components/MapPanel';
import { Reveal } from '../components/Reveal';
import { Button } from '../components/Button';
import { PillarIcon } from '../components/PillarIcon';
import { Picture } from '../components/Picture';

export default function Home() {
  useDocumentTitle(
    null,
    'A mountain smokehouse and dining destination in Beragala, Sri Lanka. Slow smoke, handcrafted flavour and hill-country views.'
  );

  return (
    <>
      <PageHero
        id="home"
        photo={photos.pathDusk}
        label={site.region}
        title={
          <>
            Slow smoke.
            <br />
            <em>Mountain air.</em>
          </>
        }
        intro="A mountain smokehouse and dining destination where handcrafted flavour, rustic timber architecture and hill-country views come together."
        actions={[
          { to: '/visit', variant: 'fill', children: 'Reserve a table' },
          { to: '/smokehouse', variant: 'ghost', children: 'Meet the smokehouse' },
        ]}
        card={{
          rows: [
            { label: 'Open', value: site.hours },
            { label: 'Setting', value: 'Open-air, hill views' },
            { label: 'Kitchen', value: 'Smokehouse & 8 more' },
          ],
          action: (
            <Link to="/visit" className="go">
              Reserve <i aria-hidden="true">&rarr;</i>
            </Link>
          ),
        }}
        metaLeft="Smoke · Flavour · Nature"
        metaRight={site.coordinates}
        scrollTo="#experience"
      />

      <StatementBand
        className="scene"
        label="The Hillsedge Experience"
        title={
          <>
            Where mountain nature meets <em>smoke and flavour</em>.
          </>
        }
      >
        <Reveal className="stats" motion="up">
          {homeStats.map(({ value, label }) => (
            <div className="stat" key={label}>
              <b>{value}</b>
              <span>{label}</span>
            </div>
          ))}
        </Reveal>
      </StatementBand>

      <section className="sec smoke-sec scene" id="experience">
        <div className="wrap">
          <SectionHead
            layout="sh-head"
            label="The Signature"
            title={
              <>
                Hillsedge <em>Smoke Lovers</em>
              </>
            }
          >
            Our traditional smokers are not decoration. They are the heart of the kitchen — where
            cuts rest low and slow over hardwood until the flavour is deep enough to carry the
            Hillsedge name.
          </SectionHead>

          <Reveal as="figure" className="sh-photo" motion="up">
            <Picture photo={photos.smoker} sizes="(max-width: 1280px) 100vw, 1200px" />
            <figcaption>The Hillsedge smoker — hardwood-fed, hand-built, always working</figcaption>
          </Reveal>

          <Reveal className="section-action" motion="flat">
            <Button to="/smokehouse" variant="ghost">
              Meet the smokehouse
            </Button>
          </Reveal>
        </div>
      </section>

      <section className="sec pill-sec scene">
        <div className="wrap">
          <Reveal className="pill-head" motion="flat">
            <span className="lab">Brand Personality</span>
            <h2>Five things you&apos;ll feel here.</h2>
          </Reveal>
          <Reveal className="pill-grid" motion="up">
            {pillars.map(({ icon, title, text }) => (
              <div className="pill" key={title}>
                <PillarIcon name={icon} />
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="sec cui scene">
        <div className="wrap">
          <SectionHead layout="cui-head" label="Culinary Identity" title="A table without borders.">
            From heritage Sri Lankan rice &amp; curry to Italian, Indian and Chinese favourites —
            with the smokehouse running through everything we serve.
          </SectionHead>

          <Reveal className="cui-grid" motion="up">
            {homeCuisineCards.map(({ tag, title, text, highlight }) => (
              <div className={`cui-card ${highlight ? 'hi' : ''}`.trim()} key={title}>
                <span className="t">{tag}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </Reveal>

          <Reveal className="section-action" motion="flat">
            <Button to="/cuisine" variant="dark">
              All nine cuisines
            </Button>
          </Reveal>
        </div>
      </section>

      <section className="sec gal scene">
        <div className="wrap">
          <SectionHead layout="gal-head" label="The Atmosphere" title="A look around.">
            Waterfalls on the drive up, a lodge that glows after dark, and a table set above the
            clouds.
          </SectionHead>

          <Reveal className="mos trio" motion="up">
            {homeGalleryKeys.map((key) => (
              <figure key={key}>
                <Picture photo={photos[key]} sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw" />
                <figcaption>{photos[key].caption}</figcaption>
              </figure>
            ))}
          </Reveal>

          <Reveal className="section-action" motion="flat">
            <Button to="/gallery" variant="ghost">
              View the full gallery
            </Button>
          </Reveal>
        </div>
      </section>

      <section className="sec visit scene" id="visit">
        <div className="wrap vg">
          <Reveal motion="left">
            <span className="lab">Plan Your Visit</span>
            <h2>
              Find us <em>above</em> the clouds.
            </h2>
            <p className="lede">
              Hillsedge sits on the Beragala–Haputale hill road in Sri Lanka&apos;s tea country — an
              easy stop between Ella, Bandarawela, Nuwara Eliya and the south coast.
            </p>
            <FactList facts={homeFacts} />
            <div className="hero-btns">
              <Button href={site.mapsUrl} variant="fill">
                Get directions
              </Button>
              <Button to="/visit#reserve" variant="ghost">
                Reserve a table
              </Button>
            </div>
          </Reveal>
          <MapPanel />
        </div>
      </section>

      <PhotoCta
        photo={photos.signboard}
        label="You'll know it when you see it"
        title={
          <>
            Come for the food. <em>Stay for the feeling.</em>
          </>
        }
        actions={[
          { to: '/visit', variant: 'fill', children: 'Reserve a table' },
          { to: '/gallery', variant: 'ghost', children: 'See the place' },
        ]}
      />
    </>
  );
}
