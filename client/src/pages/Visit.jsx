import { photos, site, socialLinks } from '../data/site';
import { visitFacts, routes, reservePoints, faqs, nearbyLandmarks } from '../data/content';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { PageHero } from '../components/PageHero';
import { SectionHead } from '../components/SectionHead';
import { ClosingBand } from '../components/Bands';
import { MapPanel, FactList } from '../components/MapPanel';
import { ReservationForm } from '../components/ReservationForm';
import { Reveal } from '../components/Reveal';
import { Button } from '../components/Button';

export default function Visit() {
  useDocumentTitle(
    'Restaurant near Diyaluma Falls & Haputale — Hillsedge',
    'Where to eat between Ella and Haputale — on the A4 at Beragala, about 21 km from Diyaluma Falls. Directions, hours, coach parking and table reservations.',
    { brandSuffix: false }
  );

  return (
    <>
      <PageHero
        short
        photo={photos.litPathway}
        label="Visit & Reserve"
        title={
          <>
            Find us above
            <br />
            <em>the clouds.</em>
          </>
        }
        intro="On the Beragala–Haputale hill road in Sri Lanka's tea country — an easy stop between Ella, Bandarawela, Nuwara Eliya and the south coast."
        metaLeft={site.coordinates}
        metaRight={site.hours}
        scrollTo="#reserve"
        scrollLabel="Reserve"
      />

      <section className="sec visit scene" id="location">
        <div className="wrap vg">
          <Reveal motion="left">
            <span className="lab lab-glow">Where We Are</span>
            <h2>Beragala, Badulla District.</h2>
            <p className="lede">
              Kalupahana Waththa, Bathgoda, Haldummulla 90180. The signboard sits right on the road
              — turn in and follow the lit path up to the lodge.
            </p>
            <FactList facts={visitFacts} />
            <div className="cta-btns cta-btns-start">
              <Button href={site.mapsUrl} variant="fill">
                Open in Google Maps
              </Button>
            </div>
          </Reveal>
          <MapPanel />
        </div>
      </section>

      <section className="sec scene light-sec">
        <div className="wrap">
          <SectionHead layout="cui-head" label="Getting Here" title="However you're travelling.">
            Beragala sits at the junction of the A4 and A23, which puts Hillsedge on the natural
            route between the hill country and the south.
          </SectionHead>

          <Reveal className="routes" motion="up">
            {routes.map(({ from, title, text, duration }) => (
              <div className="route" key={title}>
                <div className="k">{from}</div>
                <h3>{title}</h3>
                <p>{text}</p>
                <div className="d">{duration}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="sec cui scene" id="nearby">
        <div className="wrap">
          <SectionHead
            layout="cui-head"
            label="What's Nearby"
            title="The waterfalls, the viewpoints, and us in the middle."
          >
            Beragala sits between most of the hill country&apos;s best-known stops. Distances are by
            road and the times allow for mountain driving — nothing here is as quick as the
            kilometres suggest.
          </SectionHead>

          <Reveal className="nearby" motion="up">
            {nearbyLandmarks.map(({ name, also, distance, time, text }) => (
              <div className="near" key={name}>
                <h3>{name}</h3>
                {also && <div className="near-also">{also}</div>}
                <p>{text}</p>
                <div className="near-meta">
                  <span>{distance}</span>
                  <span>{time}</span>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="sec visit scene" id="reserve">
        <div className="wrap split">
          <Reveal className="sp-text on-dark" motion="left">
            <span className="lab lab-glow">Reserve A Table</span>
            <h2>Book ahead for sunset.</h2>
            <p>
              Walk-ins are welcome, but the sunset sitting and larger groups fill up — especially at
              weekends and through the season. Send us the details and we&apos;ll confirm by
              message.
            </p>
            <div className="sp-list">
              {reservePoints.map(({ key, text }) => (
                <div key={text}>
                  <b>{key}</b>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal motion="right">
            <ReservationForm />
          </Reveal>
        </div>
      </section>

      <section className="sec visit scene section-flush-top">
        <div className="wrap">
          <Reveal className="contact-grid" motion="up">
            <div className="cbox">
              <div className="k">Call or message</div>
              <a href={site.phone.href}>{site.phone.label}</a>
              <span className="cbox-note">WhatsApp available on the same number</span>
            </div>
            <div className="cbox">
              <div className="k">Email</div>
              <a href={`mailto:${site.email}`}>{site.email}</a>
              <span className="cbox-note">Group and partnership enquiries welcome</span>
            </div>
            <div className="cbox">
              <div className="k">Find us online</div>
              {socialLinks.map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer">
                  {label}
                </a>
              ))}
              <span className="cbox-note">Message us for the quickest reply</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="sec cui scene sand-sec">
        <div className="wrap">
          <SectionHead layout="cui-head" label="Before You Come" title="Good to know.">
            A few things guests ask most often. Anything else, send us a message and we&apos;ll
            answer directly.
          </SectionHead>

          <Reveal className="faq" motion="up">
            {faqs.map(({ q, a }) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>

      <ClosingBand
        label="See You On The Hill"
        title="Turn in at the signboard and follow the path up."
        actions={[
          { href: site.mapsUrl, variant: 'fill', children: 'Get directions' },
          { to: '/gallery', variant: 'ghost', children: 'See the place' },
        ]}
      />
    </>
  );
}
