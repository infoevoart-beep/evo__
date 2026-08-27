/**
 * Derives responsive WebP variants from the full-size photographs in
 * src/assets/images.
 *
 *   npm run images
 *
 * Output lands in src/assets/images/generated/ and is picked up automatically
 * by src/data/images.js — nothing needs registering by hand. Re-running is
 * cheap: a variant is only rebuilt when its source is newer.
 */
import { readdir, mkdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'src/assets/images');
const outDir = path.join(srcDir, 'generated');

/** Rendered widths that matter: phone, retina phone / tablet, desktop. */
const WIDTHS = [480, 960, 1440];

/** Tried in order until the WebP is smaller than the source it replaces. */
const QUALITY_LADDER = [72, 64, 56];

const isStale = async (source, target) => {
  if (!existsSync(target)) return true;
  const [a, b] = await Promise.all([stat(source), stat(target)]);
  return a.mtimeMs > b.mtimeMs;
};

await mkdir(outDir, { recursive: true });

const files = (await readdir(srcDir)).filter((f) => /\.(jpe?g|png)$/i.test(f));
const manifest = {};
let written = 0;

for (const file of files) {
  const source = path.join(srcDir, file);
  const name = path.parse(file).name;
  const meta = await sharp(source).metadata();

  // Never upscale: an 800px original gets no 1440px variant.
  const widths = WIDTHS.filter((w) => w < meta.width);
  widths.push(meta.width);

  manifest[name] = { width: meta.width, height: meta.height, widths };

  const sourceBytes = (await stat(source)).size;

  for (const width of widths) {
    const target = path.join(outDir, `${name}-${width}.webp`);
    if (!(await isStale(source, target))) continue;

    // At full width WebP does not always beat an already well-compressed
    // JPEG, so step the quality down until it does. Downscaled tiers are a
    // fraction of the size either way and take the first setting.
    let buffer;
    for (const quality of QUALITY_LADDER) {
      buffer = await sharp(source)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality, effort: 6 })
        .toBuffer();
      if (width < meta.width || buffer.length < sourceBytes) break;
    }

    await writeFile(target, buffer);
    written += 1;
  }
}

await writeFile(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const total = Object.values(manifest).reduce((n, m) => n + m.widths.length, 0);
console.log(`${files.length} sources -> ${total} variants (${written} written this run)`);
