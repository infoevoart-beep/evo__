import { useEffect, useRef } from 'react';

/**
 * Gentle vertical drift on a hero image. Disabled for reduced-motion users
 * and on coarse-pointer (touch) devices, where the effect costs battery and
 * fights native scrolling.
 */
export function useParallax(strength = 26) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (reduce || coarse) return undefined;

    let ticking = false;

    const frame = () => {
      ticking = false;
      const vh = window.innerHeight;
      const rect = node.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > vh + 200) return;
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      node.style.transform = `scale(1.1) translate3d(0, ${(progress * strength).toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(frame);
    };

    frame();
    document.addEventListener('scroll', onScroll, { passive: true });
    return () => document.removeEventListener('scroll', onScroll);
  }, [strength]);

  return ref;
}

export default useParallax;
