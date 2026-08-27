/**
 * The site's routes, in navigation order.
 *
 * Deliberately free of imports so the build scripts can read it directly —
 * `scripts/generate-seo.mjs` derives sitemap.xml from this list, which is what
 * stops the sitemap drifting out of step with the router.
 */
export const navLinks = [
  { to: '/', label: 'Home', sheetLabel: 'Home', index: '01', priority: '1.0' },
  { to: '/about', label: 'About', sheetLabel: 'About', index: '02', priority: '0.8' },
  { to: '/smokehouse', label: 'Smokehouse', sheetLabel: 'Smokehouse', index: '03', priority: '0.8' },
  { to: '/cuisine', label: 'Cuisine', sheetLabel: 'Cuisine', index: '04', priority: '0.8' },
  { to: '/gallery', label: 'Gallery', sheetLabel: 'Gallery', index: '05', priority: '0.7' },
  { to: '/visit', label: 'Visit', sheetLabel: 'Visit & Reserve', index: '06', priority: '0.9' },
];

/**
 * Where the site is served from in production. This is the one place to
 * change it — the sitemap and robots.txt are generated from it, and
 * everything in the app derives absolute URLs from the live origin instead.
 */
export const PRODUCTION_ORIGIN = 'https://hillsedgeberagala.com';

export default navLinks;
