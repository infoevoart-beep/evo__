import express from 'express';
import compression from 'compression';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { config } from './config/index.js';
import { security } from './middleware/security.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, apiNotFound } from './middleware/errorHandler.js';

/**
 * Builds the Express app without starting it, so the tests can drive it
 * through supertest without binding a port.
 */
export function createApp() {
  const app = express();

  // Behind a proxy, req.ip is the proxy unless we say how many to look past.
  // Left at 0 by default: trusting a header nobody set lets a client spoof
  // its address and walk around the rate limiter.
  app.set('trust proxy', config.trustProxy);
  app.disable('x-powered-by');

  app.use(security);
  app.use(compression());
  // A booking is a few hundred bytes; the cap is to stop a large body being
  // parsed before anything else gets a chance to reject it.
  app.use(express.json({ limit: '32kb' }));

  app.use('/api', apiRouter);
  app.use('/api', apiNotFound);

  if (config.serveClient) {
    const clientDir = config.clientDir;

    if (existsSync(clientDir)) {
      // Hashed filenames, so these can be cached indefinitely. index.html is
      // served separately below and must not be, or a deploy strands people
      // on asset URLs that no longer exist.
      app.use(
        '/assets',
        express.static(path.join(clientDir, 'assets'), {
          immutable: true,
          maxAge: '1y',
        })
      );

      app.use(express.static(clientDir, { index: false, maxAge: '1h' }));

      // Client-side routing: anything not matched above is a route in the
      // app, so the shell answers with 200 rather than a 404.
      app.get('*', (req, res) => {
        res.set('Cache-Control', 'public, max-age=0, must-revalidate');
        res.sendFile(path.join(clientDir, 'index.html'));
      });
    } else {
      console.warn(
        `[server] SERVE_CLIENT is on but ${clientDir} does not exist. ` +
          'Run "npm run build" first, or set SERVE_CLIENT=false to run the API alone.'
      );
    }
  }

  app.use(errorHandler);

  return app;
}

export default createApp;
