import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

/**
 * The booking endpoint writes to disk and is unauthenticated, so it is the
 * one place worth capping. A real guest books once; ten in fifteen minutes
 * from one address is somebody testing how the form behaves.
 */
export const reservationLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Too many booking attempts. Please try again shortly, or call us.',
  },
});

export default reservationLimiter;
