import { Router } from 'express';
import { reservationLimiter } from '../middleware/rateLimit.js';
import { validateReservation } from '../validators/reservation.js';
import { saveReservation } from '../services/reservationStore.js';

export const reservationsRouter = Router();

/**
 * Take a table booking.
 *
 * 422 rather than 400 for a well-formed request whose contents fail the
 * rules: the body parsed fine, the booking is the problem, and the client
 * renders `errors` against its fields.
 */
reservationsRouter.post('/reservations', reservationLimiter, async (req, res, next) => {
  const result = validateReservation(req.body);

  if (!result.ok) {
    return res.status(422).json({
      error: 'Some details need checking.',
      errors: result.errors,
    });
  }

  try {
    const saved = await saveReservation(result.value);
    return res.status(201).json({
      id: saved.id,
      receivedAt: saved.receivedAt,
      message: 'Thank you — we have your request and will confirm by message.',
    });
  } catch (error) {
    return next(error);
  }
});

export default reservationsRouter;
