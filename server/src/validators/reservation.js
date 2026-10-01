/** Mirrors the options the booking form offers. */
export const GUEST_OPTIONS = ['1–2', '3–4', '5–8', '9–15', '16+ (group)'];
export const SITTING_OPTIONS = ['Lunch', 'Afternoon', 'Sunset', 'Dinner'];

const MAX = { name: 120, message: 2000 };

/** `YYYY-MM-DD`, and a real date — 2026-02-31 parses but is not a day. */
function parseDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10) === value ? date : null;
}

/** Today at UTC midnight, so "today" is still bookable all day. */
function todayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * Validates a booking and returns the clean version.
 *
 * Never trust the browser: the front end checks the same rules so the guest
 * gets a fast answer, but anything can POST here, so the rules are enforced
 * again and the stored record is built field by field from known keys rather
 * than from whatever the request happened to contain.
 */
export function validateReservation(input) {
  const errors = {};
  const body = input && typeof input === 'object' ? input : {};

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) errors.name = 'Please tell us who the table is for.';
  else if (name.length > MAX.name) errors.name = `Please keep the name under ${MAX.name} characters.`;

  const date = parseDate(body.date);
  if (!body.date) errors.date = 'Please choose a date.';
  else if (!date) errors.date = 'That date is not valid.';
  else if (date < todayUtc()) errors.date = 'Please choose today or a later date.';

  const guests = typeof body.guests === 'string' ? body.guests : '';
  if (!GUEST_OPTIONS.includes(guests)) errors.guests = 'Please choose a party size.';

  const time = typeof body.time === 'string' ? body.time : '';
  if (!SITTING_OPTIONS.includes(time)) errors.time = 'Please choose a sitting.';

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (message.length > MAX.message) {
    errors.message = `Please keep the note under ${MAX.message} characters.`;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: { name, guests, date: body.date, time, message: message || null },
  };
}

export default validateReservation;
