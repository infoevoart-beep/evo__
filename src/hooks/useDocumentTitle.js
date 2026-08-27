import { useEffect } from 'react';
import { site } from '../data/site';

/** Keeps the tab title in step with the route. */
export function useDocumentTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} — ${site.name}` : `${site.name} — Mountain Smokehouse & Dining Experience`;

    if (!description) return;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', description);
  }, [title, description]);
}

export default useDocumentTitle;
