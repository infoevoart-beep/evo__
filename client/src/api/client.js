/**
 * Thin wrapper over the reservations endpoint.
 *
 * The API is served from the same origin as the app in production, and the
 * Vite dev server proxies /api through to it, so a relative path is correct
 * in both. VITE_API_BASE_URL exists for the case where the two are split
 * across hosts.
 */
const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

/** The server took longer than this, so stop waiting and offer WhatsApp. */
const TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  constructor(message, { status, errors } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    /** Field-keyed messages, when the server rejected the contents. */
    this.errors = errors ?? null;
  }
}

export async function createReservation(booking, { signal } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  signal?.addEventListener('abort', () => controller.abort(), { once: true });

  let response;
  try {
    response = await fetch(`${BASE}/api/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
      signal: controller.signal,
    });
  } catch (error) {
    // Offline, DNS failure, CORS, or our own timeout — indistinguishable
    // from here, and the guest needs the same answer for all of them.
    throw new ApiError(
      error.name === 'AbortError'
        ? 'That took too long. Please try again, or send it on WhatsApp.'
        : 'We could not reach the kitchen. Please try again, or send it on WhatsApp.'
    );
  } finally {
    clearTimeout(timeout);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // A proxy or error page returned something that is not JSON.
  }

  if (!response.ok) {
    throw new ApiError(payload?.error ?? 'We could not save that booking.', {
      status: response.status,
      errors: payload?.errors,
    });
  }

  return payload;
}

export default createReservation;
