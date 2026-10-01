import { describe, expect, it } from 'vitest';
import { photos, navLinks, footerColumns, shareImage, site, socialLinks } from './site';
import { images } from './images';
import { galleryOrder, homeGalleryKeys, cuisines, faqs, routes } from './content';

describe('photographs', () => {
  it('every photograph resolves to a real asset', () => {
    for (const [key, photo] of Object.entries(photos)) {
      expect(photo.src, key).toBeTruthy();
      expect(photo.width, key).toBeGreaterThan(0);
      expect(photo.height, key).toBeGreaterThan(0);
    }
  });

  it('every photograph carries alt text and a caption', () => {
    for (const [key, photo] of Object.entries(photos)) {
      expect(photo.alt, key).toMatch(/\S/);
      expect(photo.caption, key).toMatch(/\S/);
    }
  });

  it('offers a responsive WebP ladder, widest last', () => {
    for (const [key, photo] of Object.entries(photos)) {
      const widths = photo.srcSet
        .split(',')
        .map((candidate) => Number(candidate.trim().split(' ')[1].replace('w', '')));

      expect(widths.length, key).toBeGreaterThan(0);
      expect(widths, key).toStrictEqual([...widths].sort((a, b) => a - b));
      // Never upscaled past the source.
      expect(Math.max(...widths), key).toBeLessThanOrEqual(photo.width);
    }
  });

  it('no photograph is defined twice under different keys', () => {
    const sources = Object.values(photos).map((photo) => photo.src);
    expect(new Set(sources).size).toBe(sources.length);
  });

  it('uses every image that exists, and every image it uses exists', () => {
    expect(new Set(Object.keys(photos))).toStrictEqual(new Set(Object.keys(images)));
  });
});

describe('page content references', () => {
  it('the gallery lists every photograph exactly once', () => {
    expect(new Set(galleryOrder)).toStrictEqual(new Set(Object.keys(photos)));
    expect(galleryOrder.length).toBe(new Set(galleryOrder).size);
  });

  it("the home page's gallery teaser points at real photographs", () => {
    for (const key of homeGalleryKeys) expect(photos[key], key).toBeDefined();
  });
});

describe('navigation', () => {
  it('numbers the mobile sheet in order, with no gaps', () => {
    expect(navLinks.map((link) => link.index)).toStrictEqual([
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
    ]);
  });

  it('points every internal footer link at a real route', () => {
    const known = new Set(navLinks.map((link) => link.to));
    for (const column of footerColumns) {
      for (const link of column.links) {
        if (!link.to) continue;
        expect(known, link.label).toContain(link.to.split('#')[0]);
      }
    }
  });
});

describe('outbound links', () => {
  it('renders no social icon that goes nowhere', () => {
    for (const link of socialLinks) {
      expect(link.href, link.label).toMatch(/^https:\/\//);
    }
  });

  it('leaves out unconfigured profiles rather than linking to nothing', () => {
    const labels = socialLinks.map((link) => link.label);
    expect(new Set(labels).size).toBe(labels.length);
    // WhatsApp is derived from the phone number, so it is always present.
    expect(labels).toContain('WhatsApp');
  });

  it('never points a footer link at a placeholder href', () => {
    for (const column of footerColumns) {
      for (const link of column.links) {
        if (link.href) expect(link.href, link.label).not.toBe('#');
      }
    }
  });
});

describe('social sharing', () => {
  it('has a real image with alt text for link previews', () => {
    expect(shareImage.src).toBeTruthy();
    expect(shareImage.alt).toMatch(/\S/);
  });
});

describe('site details', () => {
  it('uses one telephone number everywhere', () => {
    expect(site.phone.href).toBe('tel:+94742373394');
    expect(site.whatsapp).toBe('94742373394');
  });

  it('has the full set of copy the pages expect', () => {
    expect(cuisines).toHaveLength(9);
    expect(faqs.length).toBeGreaterThan(0);
    expect(routes).toHaveLength(3);
  });

  it('states service hours as a pair, or not at all', () => {
    const { opens, closes } = site.serviceHours;
    expect(Boolean(opens)).toBe(Boolean(closes));
    for (const time of [opens, closes]) {
      if (time) expect(time).toMatch(/^\d{2}:\d{2}$/);
    }
  });
});
