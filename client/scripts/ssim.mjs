import sharp from 'sharp';

/**
 * Mean structural similarity between two images, on the luma plane over 8x8
 * windows — the standard formulation, stepped by 4px because a denser grid
 * does not change the verdict and doubles the cost.
 *
 * Used to compare encoders rather than to report an absolute score: PSNR
 * punishes AVIF for the perceptual shaping that is the point of it, and would
 * have us reject formats that look identical.
 */
export async function ssim(bufA, bufB, width) {
  const opts = { width, fit: 'inside' };
  const [a, b] = await Promise.all([
    sharp(bufA).resize(opts).greyscale().raw().toBuffer({ resolveWithObject: true }),
    sharp(bufB).resize(opts).greyscale().raw().toBuffer({ resolveWithObject: true }),
  ]);

  const W = a.info.width;
  const H = a.info.height;
  if (b.info.width !== W || b.info.height !== H) return NaN;

  const A = a.data;
  const B = b.data;
  const C1 = (0.01 * 255) ** 2;
  const C2 = (0.03 * 255) ** 2;
  const win = 8;

  let total = 0;
  let count = 0;

  for (let y = 0; y + win <= H; y += 4) {
    for (let x = 0; x + win <= W; x += 4) {
      let meanA = 0;
      let meanB = 0;
      for (let j = 0; j < win; j++) {
        for (let i = 0; i < win; i++) {
          const k = (y + j) * W + x + i;
          meanA += A[k];
          meanB += B[k];
        }
      }
      const n = win * win;
      meanA /= n;
      meanB /= n;

      let varA = 0;
      let varB = 0;
      let cov = 0;
      for (let j = 0; j < win; j++) {
        for (let i = 0; i < win; i++) {
          const k = (y + j) * W + x + i;
          const da = A[k] - meanA;
          const db = B[k] - meanB;
          varA += da * da;
          varB += db * db;
          cov += da * db;
        }
      }
      varA /= n - 1;
      varB /= n - 1;
      cov /= n - 1;

      total +=
        ((2 * meanA * meanB + C1) * (2 * cov + C2)) /
        ((meanA * meanA + meanB * meanB + C1) * (varA + varB + C2));
      count++;
    }
  }

  return total / count;
}

export default ssim;
