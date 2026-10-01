import { useEffect, useState } from 'react';

/** True once the page has scrolled past `offset` — drives the sticky header. */
export function useScrolled(offset = 40) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset);
    onScroll();
    document.addEventListener('scroll', onScroll, { passive: true });
    return () => document.removeEventListener('scroll', onScroll);
  }, [offset]);

  return scrolled;
}

export default useScrolled;
