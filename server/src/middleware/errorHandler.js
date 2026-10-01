import { config } from '../config/index.js';

/**
 * Anything that reaches here is a bug, not a handled case.
 *
 * `next` is unused but must stay: Express identifies error middleware by
 * arity, and a three-argument function is treated as ordinary middleware
 * and never called for errors at all.
 */
export function errorHandler(error, req, res, next) {
  const status = error.status ?? 500;

  if (status >= 500) {
    console.error(`${req.method} ${req.originalUrl} failed:`, error);
  }

  res.status(status).json({
    error:
      status >= 500 && config.isProduction
        ? 'Something went wrong on our side. Please try again.'
        : error.message,
  });
}

/** Unmatched /api/* paths. Anything else falls through to the front end. */
export function apiNotFound(req, res) {
  res.status(404).json({ error: `No such endpoint: ${req.method} ${req.originalUrl}` });
}

export default errorHandler;
