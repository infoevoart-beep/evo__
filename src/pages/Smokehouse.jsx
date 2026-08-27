import { photos } from '../data/site';
import { smokehouseSteps, builtByHandPoints, firstVisitPoints } from '../data/content';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { PageHero } from '../components/PageHero';
import { SectionHead } from '../components/SectionHead';
import { SplitFeature } from '../components/SplitFeature';
import { StatementBand, ClosingBand } from '../components/Bands';
import { Reveal } from '../components/Reveal';
import { Button } from '../components/Button';

export default function Smokehouse() {
  useDocumentTitle(
    'Smokehouse',
    'Hardwood, hours and charcoal. Inside the hand-built smokers that give Hillsedge Beragala its name.'
  );

  return (
    <>
      <PageHero
        short
        photo={photos.smoker}
        label="Hillsedge Smoke Lovers"
        title={
          <>
            The smoker is
            <br />
            <em>the signature.</em>
          </>
        }
        intro="Hand-built, hardwood-fed and always working. Not equipment hidden in a kitchen — the reason the place is called what it is."
        metaLeft="Hardwood · Charcoal · Patience"
        metaRight="Low and slow, every day"
        scrollTo="#process"
        scrollLabel="The process"
      />

      <StatementBand
        className="scene"
        label="Why It Matters"
        title={
          <>
            You smell it <em>long before</em> you see the plate.
          </>
        }
      />

      <section className="sec smoke-sec on-dark scene" id="process">
        <div className="wrap">
          <SectionHead
            layout="sh-head"
            label="The Process"
            title={
              <>
                Wood, time, <em>charcoal</em>.
              </>
            }
          >
            Four stages, none of them hurried. The smokehouse sets the pace for the entire kitchen,
            and everything else on the menu is timed around it.
          </SectionHead>

          <Reveal className="steps" motion="up">
            {smokehouseSteps.map(({ number, title, text }) => (
              <div className="step" key={number}>
                <span className="sn">{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="sec scene light-sec">
        <SplitFeature
          photo={photos.afterDark}
          portrait
          label="Built By Hand"
          title="Made for this hillside."
          paragraphs={[
            'The smokers were built rather than bought — steel chambers, offset boxes and chimneys sized for the volume this kitchen actually cooks, standing in the open where guests walk past them.',
            'Keeping them visible is deliberate. The smoke drifting across the terrace at dusk does more for the place than any sign could.',
          ]}
          items={builtByHandPoints}
        />
      </section>

      <section className="sec visit scene">
        <SplitFeature
          reverse
          onDark
          photo={photos.goldenHourTable}
          label="What To Order"
          labelTone="glow"
          title="If it's your first time."
          paragraphs={[
            'Start with something from the smoker, add a charcoal-grilled plate for the table, and let the rest of the menu fill in around it. Groups are best served by a sharing platter and a spread of sides.',
          ]}
          items={firstVisitPoints}
        >
          <Button to="/cuisine" variant="ghost" className="split-action">
            See the full menu range
          </Button>
        </SplitFeature>
      </section>

      <ClosingBand
        label="The Signature"
        title="Hardwood, hours and charcoal. That's the whole trick."
        actions={[
          { to: '/visit', variant: 'fill', children: 'Reserve a table' },
          { to: '/gallery', variant: 'ghost', children: 'See the place' },
        ]}
      />
    </>
  );
}
