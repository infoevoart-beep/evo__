import { Link } from 'react-router-dom';
import { photos, site } from '../data/site';
import { settingPoints, hierarchyTiers, greetings } from '../data/content';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { PageHero } from '../components/PageHero';
import { SplitFeature } from '../components/SplitFeature';
import { StatementBand, ClosingBand } from '../components/Bands';
import { Reveal } from '../components/Reveal';

export default function About() {
  useDocumentTitle(
    'About — Mountain Dining Destination, Beragala',
    'A dining destination on the Beragala–Haputale hill road in Sri Lanka\'s tea country. How the smokehouse, the setting and nine kitchens fit together.',
    { brandSuffix: false }
  );

  return (
    <>
      <PageHero
        short
        photo={photos.sunsetValley}
        label="About Hillsedge"
        title={
          <>
            A destination,
            <br />
            <em>not a stop.</em>
          </>
        }
        intro="On the Beragala–Haputale hill road, on an escarpment above the valleys — built from timber, stone and thatch, and built to be remembered."
        metaLeft="Beragala · Badulla District"
        metaRight="Sri Lanka Hill Country"
        scrollTo="#setting"
        scrollLabel="Read on"
      />

      <StatementBand
        className="scene"
        label="The Short Version"
        title={
          <>
            Most places can offer food. Hillsedge offers an <em>experience around it</em>.
          </>
        }
      />

      <section className="sec scene section-flush-top light-sec" id="setting">
        <SplitFeature
          photo={photos.timberThatch}
          label="The Setting"
          title="Built into the hillside, not dropped onto it."
          paragraphs={[
            'A tall open-sided lodge with a soaring thatched roof sits on the escarpment, with open-air dining, landscaped pathways and views that change with the light — mist in the morning, gold at sunset, lantern-light after dark.',
            'The building and the landscape are part of what you come for. They are not a backdrop to the meal.',
          ]}
          items={settingPoints}
        />
      </section>

      <section className="sec pill-sec scene">
        <div className="wrap">
          <Reveal className="pill-head" motion="flat">
            <span className="lab">How It Fits Together</span>
            <h2>One destination, one signature, nine kitchens.</h2>
          </Reveal>

          <div className="stack">
            {hierarchyTiers.map(({ level, title, text, link, feature }, index) => (
              <Reveal
                className={`tier ${feature ? 't1' : ''}`.trim()}
                motion="up"
                delay={`${0.05 + index * 0.13}s`}
                key={title}
              >
                <span className="n">{level}</span>
                <h3>{title}</h3>
                <p>
                  {text}{' '}
                  {link && (
                    <Link to={link.to} className="inline-link">
                      {link.label} &rarr;
                    </Link>
                  )}
                </p>
                {index < hierarchyTiers.length - 1 && (
                  <span className="arrow" aria-hidden="true">
                    &darr;
                  </span>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec visit scene">
        <div className="wrap split">
          <Reveal className="sp-text on-dark" motion="left">
            <span className="lab lab-glow">Everyone At The Table</span>
            <h2>A wide table, on purpose.</h2>
            <p>
              Hill-country travellers arrive from everywhere — the Ella and Haputale circuit brings
              visitors from China, the UK, India, France, Germany, Italy, Russia, Switzerland, the
              Czech Republic, Pakistan, Norway, Malaysia and the Middle East, alongside Sri Lankan
              families on weekend drives.
            </p>
            <p>
              Nine cuisines means a family, a couple, a tour group and a food-focused traveller can
              all eat well at the same table — while the smokehouse still gives the place one
              identity everybody remembers.
            </p>
          </Reveal>

          <Reveal motion="right">
            <div className="hello">
              {greetings.map((word) => (
                <span key={word}>{word}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <ClosingBand
        label="The Core Message"
        title={`${site.name} is where mountain nature meets smoke and flavour.`}
        actions={[
          { to: '/cuisine', variant: 'fill', children: 'Explore the cuisine' },
          { to: '/visit', variant: 'ghost', children: 'Plan your visit' },
        ]}
      />
    </>
  );
}
