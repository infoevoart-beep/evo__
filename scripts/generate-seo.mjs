/**
 * Writes public/sitemap.xml and public/robots.txt from the router's own route
 * list, so neither can drift out of step with the site.
 *
 *   npm run seo
 *
 * The production origin lives in src/data/routes.js — change it there.
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { navLinks, PRODUCTION_ORIGIN } from '../src/data/routes.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const today = new Date().toISOString().slice(0, 10);

const urls = navLinks
  .map(
    ({ to, priority }) => `  <url>
    <loc>${PRODUCTION_ORIGIN}${to === '/' ? '/' : to}</loc>
    <lastmod>${today}</lastmod>
    <priority>${priority}</priority>
  </url>`
  )
  .join('\n');

await writeFile(
  path.join(publicDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
);

await writeFile(
  path.join(publicDir, 'robots.txt'),
  `User-agent: *
Allow: /

Sitemap: ${PRODUCTION_ORIGIN}/sitemap.xml
`
);

console.log(`sitemap.xml (${navLinks.length} routes) and robots.txt written for ${PRODUCTION_ORIGIN}`);
