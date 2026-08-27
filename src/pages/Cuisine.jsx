import { photos } from '../data/site';
import { cuisines, sundownerPoints } from '../data/content';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { PageHero } from '../components/PageHero';
import { SectionHead } from '../components/SectionHead';
import { SplitFeature } from '../components/SplitFeature';
import { ClosingBand } from '../components/Bands';
import { Reveal } from '../components/Reveal';
import { Button } from '../components/Button';

export default function Cuisine() {
  useDocumentTitle(
    'Cuisine',
    'Nine kitchens under one thatched roof — Sri Lankan heritage cooking, slow-smoked meats, continental grills and more.'
  );

  return (
    <>
      <PageHero
        short
        photo={photos.smoker}
        label="The Cuisine"
        title={
          <>
            Nine kitchens.
            <br />
            <em>One smokehouse.</em>
          </>
        }
        intro="Sri Lankan heritage cooking, slow-smoked meats, continental grills and a menu wide enough for the whole table."
        metaLeft="Lunch & dinner, daily"
        metaRight="Group menus on request"
        scrollTo="#smokehouse"
        scrollLabel="Start here"
      />

      <section className="sec smoke-sec on-dark scene" id="smokehouse">
        <Reveal className="wrap sh-head sh-head-flush" motion="flat">
          <div>
            <span className="lab">Start Here</span>
            <h2>
              Everything is timed around the <em>smoker</em>.
            </h2>
          </div>
          <div>
            <p>
              Hardwood, hours and charcoal set the pace for the whole kitchen — the rest of the menu
              is built around what comes off the smoker.
            </p>
            <Button to="/smokehouse" variant="ghost">
              Inside the smokehouse
            </Button>
          </div>
        </Reveal>
      </section>

      <section className="sec cui scene" id="menu">
        <div className="wrap">
          <SectionHead layout="cui-head" label="The Full Range" title="Kitchen by kitchen.">
            Nine kitchens under one thatched roof, so a family, a couple, a tour group and a
            food-focused traveller can all eat well together.
          </SectionHead>

          <Reveal className="menu-list" motion="up">
            {cuisines.map(({ number, title, text, tags }) => (
              <div className="dish" key={number}>
                <span className="num">{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <div className="tags">
                    {tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="sec visit scene">
        <SplitFeature
          onDark
          portrait
          photo={photos.deckDinner}
          label="Before & After"
          labelTone="glow"
          title="Come early. Stay for the light."
          paragraphs={[
            'Drinks on the open deck as the valley turns gold, then dinner under lantern-light with the smokehouse still working behind you. Sunset seating is the one to book ahead for.',
          ]}
          items={sundownerPoints}
        />
      </section>

      <ClosingBand
        label="Ordering For A Group?"
        title="Tell us the table and we'll build the menu around the smokehouse."
        actions={[
          { to: '/visit#reserve', variant: 'fill', children: 'Reserve a table' },
          { to: '/about', variant: 'ghost', children: 'About Hillsedge' },
        ]}
      />
    </>
  );
}
