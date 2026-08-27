import manifest from '../assets/images/generated/manifest.json';

/**
 * Every photograph, resolved once at build time and keyed in camelCase
 * (`after-dark.jpg` → `images.afterDark`).
 *
 * The full-size JPEG is the fallback source; `npm run images` derives the WebP
 * ladder beside it and Vite fingerprints both. Because both sets are globbed,
 * adding a photograph means dropping the file in and re-running that script —
 * nothing here needs editing.
 *
 * @typedef {object} ImageAsset
 * @property {string} src     full-size JPEG, used as the fallback
 * @property {number} width   intrinsic width, so the browser can reserve space
 * @property {number} height  intrinsic height
 * @property {string} srcSet  the WebP ladder, ready for `<source srcset>`
 */

const originals = import.meta.glob('../assets/images/*.{jpg,jpeg,png}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const webp = import.meta.glob('../assets/images/generated/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

const basename = (filePath) => filePath.slice(filePath.lastIndexOf('/') + 1);
const camelCase = (name) => name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

/** `after-dark-480.webp` → grouped under `after-dark` at width 480. */
const ladders = {};
for (const [filePath, url] of Object.entries(webp)) {
  const match = basename(filePath).match(/^(.+)-(\d+)\.webp$/);
  if (!match) continue;
  (ladders[match[1]] ??= []).push({ width: Number(match[2]), url });
}
for (const ladder of Object.values(ladders)) ladder.sort((a, b) => a.width - b.width);

/** @type {Record<string, ImageAsset>} */
export const images = {};

for (const [filePath, url] of Object.entries(originals)) {
  const name = basename(filePath).replace(/\.[^.]+$/, '');
  const meta = manifest[name] ?? {};

  images[camelCase(name)] = {
    src: url,
    width: meta.width,
    height: meta.height,
    srcSet: (ladders[name] ?? []).map(({ url: u, width }) => `${u} ${width}w`).join(', '),
  };
}

export default images;
