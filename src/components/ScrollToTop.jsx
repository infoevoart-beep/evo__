import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Routing between pages should land at the top, but an in-page hash link
 * (#reserve, #process…) should still scroll to its target.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname, hash]);

  return null;
}

export default ScrollToTop;
