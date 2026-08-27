import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button } from '../components/Button';

export default function NotFound() {
  useDocumentTitle('Page not found');

  return (
    <section className="sec state not-found">
      <div className="wrap">
        <span className="lab">Error 404</span>
        <h2>That page has drifted off down the valley.</h2>
        <div className="rule" />
        <div className="cta-btns not-found-actions">
          <Button to="/" variant="fill">
            Back to home
          </Button>
          <Button to="/visit" variant="dark">
            Visit &amp; reserve
          </Button>
        </div>
      </div>
    </section>
  );
}
