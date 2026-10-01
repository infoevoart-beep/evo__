import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(here, '../..');
const repoRoot = path.resolve(serverRoot, '..');

const bool = (value, fallback) =>
  value === undefined ? fallback : /^(1|true|yes|on)$/i.test(value);

const int = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/**
 * Every environment-dependent value, read once.
 *
 * Reading `process.env` at import time rather than at the call site means a
 * missing or malformed variable surfaces when the process starts, not on the
 * first request that happens to need it.
 */
export const config = {
  env: process.env.NODE_ENV ?? 'development',
  get isProduction() {
    return this.env === 'production';
  },

  port: int(process.env.PORT, 4000),
  host: process.env.HOST ?? '0.0.0.0',

  /** Where `npm run build` leaves the front end. */
  clientDir: process.env.CLIENT_DIR ?? path.join(repoRoot, 'client', 'dist'),

  /** Serve the built front end as well as the API. Off, you have an API only. */
  serveClient: bool(process.env.SERVE_CLIENT, true),

  /** Reservations are appended here as JSON Lines. */
  reservationsFile:
    process.env.RESERVATIONS_FILE ?? path.join(serverRoot, 'data', 'reservations.jsonl'),

  rateLimit: {
    windowMs: int(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: int(process.env.RATE_LIMIT_MAX, 10),
  },

  /*
   * Behind a proxy (nginx, a platform router, Cloudflare) Express sees the
   * proxy's address on every request, which would make the rate limiter
   * treat all visitors as one client. Set TRUST_PROXY to the number of
   * proxies in front of this process.
   */
  trustProxy: int(process.env.TRUST_PROXY, 0),
};

export default config;
