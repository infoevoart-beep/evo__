import '@testing-library/jest-dom/vitest';

/**
 * jsdom implements neither of the observers the scroll choreography uses, so
 * they are stubbed here: IntersectionObserver reports everything as visible,
 * which is what `prefers-reduced-motion` does in a real browser too.
 */
class VisibleIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe(target) {
    this.callback([{ target, isIntersecting: true }], this);
  }

  unobserve() {}

  disconnect() {}
}

globalThis.IntersectionObserver = VisibleIntersectionObserver;

globalThis.matchMedia ??= (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent: () => false,
});

globalThis.scrollTo ??= () => {};
Element.prototype.scrollIntoView ??= () => {};
