/**
 * Derives responsive WebP variants (and a compressed JPEG fallback) from the
 * full-size photographs in src/assets/images.
 *
 *   npm run images
 *
 * Output lands in src/assets/images/generated/ and is picked up automatically
 * by src/data/images.js — nothing needs to be registered by hand. Re-running
 * is safe: existing variants are skipped unless the source is newer.
 */
import { readdir, mkdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(fileURLToPath(import.meta.url), '../..');
const srcDir = path.join(root, 'src/assets/images');
const outDir = path.join(srcDir, 'generated');

/** Rendered widths that matter: phone, tablet/retina phone, desktop. */
const WIDTHS = [480, 960, 1440];

const isNewer = async (source, target) => {
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

  // Never upscale: a 800px original gets no 1440px variant.
  const widths = WIDTHS.filter((w) => w <= meta.width);
  if (widths.length === 0 || widths.at(-1) !== meta.width) widths.push(meta.width);

  manifest[name] = { width: meta.width, height: meta.height, widths };

  for (const width of widths) {
    const target = path.join(outDir, `${name}-${width}.webp`);
    if (!(await isNewer(source, target))) continue;
    await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 76, effort: 5 })
      .toFile(target);
    written += 1;
  }
}

await writeFile(
  path.join(outDir, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`
);

const total = Object.values(manifest).reduce((n, m) => n + m.widths.length, 0);
console.log(`${files.length} sources → ${total} variants (${written} written this run)`);
