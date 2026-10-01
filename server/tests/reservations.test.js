import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { validBooking, withTempStore } from './helpers.js';

let app;
let listReservations;
let cleanup;

beforeAll(async () => {
  cleanup = await withTempStore();
  process.env.SERVE_CLIENT = 'false';
  // Generous, so the validation tests are not throttled by each other.
  process.env.RATE_LIMIT_MAX = '1000';
  const [{ createApp }, store] = await Promise.all([
    import('../src/app.js'),
    import('../src/services/reservationStore.js'),
  ]);
  app = createApp();
  listReservations = store.listReservations;
});

afterAll(() => cleanup());

const post = (body) => request(app).post('/api/reservations').send(body);

describe('POST /api/reservations', () => {
  it('accepts a complete booking and returns its id', async () => {
    const res = await post(validBooking({ name: 'Nuwan' })).expect(201);

    expect(res.body.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(Date.parse(res.body.receivedAt)).not.toBeNaN();
    expect(res.body.message).toMatch(/confirm/i);
  });

  it('persists what was booked', async () => {
    const booking = validBooking({ name: 'Ayesha', guests: '5–8', message: 'One vegan' });
    const { body } = await post(booking).expect(201);

    const stored = (await listReservations()).find((r) => r.id === body.id);
    expect(stored).toMatchObject({
      name: 'Ayesha',
      guests: '5–8',
      date: booking.date,
      time: 'Sunset',
      message: 'One vegan',
    });
  });

  it('stores no note rather than an empty string', async () => {
    const { body } = await post(validBooking({ message: '   ' })).expect(201);
    const stored = (await listReservations()).find((r) => r.id === body.id);
    expect(stored.message).toBeNull();
  });

  it('trims the name', async () => {
    const { body } = await post(validBooking({ name: '  Priya  ' })).expect(201);
    const stored = (await listReservations()).find((r) => r.id === body.id);
    expect(stored.name).toBe('Priya');
  });
});

describe('POST /api/reservations — rejections', () => {
  it('requires a name and a date', async () => {
    const res = await post({ guests: '1–2', time: 'Lunch' }).expect(422);
    expect(res.body.errors.name).toMatch(/who the table is for/i);
    expect(res.body.errors.date).toMatch(/choose a date/i);
  });

  it('refuses a date in the past', async () => {
    const res = await post(validBooking({ date: '2020-01-01' })).expect(422);
    expect(res.body.errors.date).toMatch(/today or a later date/i);
  });

  it('refuses a date that does not exist', async () => {
    const res = await post(validBooking({ date: '2030-02-31' })).expect(422);
    expect(res.body.errors.date).toMatch(/not valid/i);
  });

  it('refuses a party size or sitting it does not offer', async () => {
    const res = await post(validBooking({ guests: '400', time: 'Breakfast' })).expect(422);
    expect(res.body.errors.guests).toBeDefined();
    expect(res.body.errors.time).toBeDefined();
  });

  it('caps the note instead of storing whatever is sent', async () => {
    const res = await post(validBooking({ message: 'x'.repeat(5000) })).expect(422);
    expect(res.body.errors.message).toMatch(/under 2000/i);
  });

  it('ignores fields it did not ask for', async () => {
    const { body } = await post(
      validBooking({ id: 'forged', receivedAt: '1999-01-01T00:00:00Z', admin: true })
    ).expect(201);

    const stored = (await listReservations()).find((r) => r.id === body.id);
    expect(stored.id).not.toBe('forged');
    expect(stored.receivedAt).not.toMatch(/^1999/);
    expect(stored.admin).toBeUndefined();
  });

  it('rejects a body that is not a JSON object', async () => {
    // express.json() is strict, so a bare JSON primitive never reaches the
    // handler. 400 is right: the request is malformed, not merely invalid.
    await request(app)
      .post('/api/reservations')
      .set('Content-Type', 'application/json')
      .send('"just a string"')
      .expect(400);
  });

  it('rejects a body that is not JSON at all', async () => {
    await request(app)
      .post('/api/reservations')
      .set('Content-Type', 'application/json')
      .send('{ not json')
      .expect(400);
  });

  it('does not accept a booking over GET', async () => {
    await request(app).get('/api/reservations').expect(404);
  });
});

describe('rate limiting', () => {
  it('stops a flood of booking attempts', async () => {
    process.env.RATE_LIMIT_MAX = '3';
    process.env.RATE_LIMIT_WINDOW_MS = '60000';
    // Config reads the environment once, at import time, and a query-string
    // import would still resolve config to the instance already cached.
    // Only a registry reset gets the new limit read.
    vi.resetModules();
    const { createApp } = await import('../src/app.js');
    const limited = createApp();

    const codes = [];
    for (let i = 0; i < 5; i++) {
      const res = await request(limited).post('/api/reservations').send(validBooking());
      codes.push(res.status);
    }

    expect(codes.filter((c) => c === 201)).toHaveLength(3);
    expect(codes.filter((c) => c === 429)).toHaveLength(2);
  });
});
