import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * Point the reservation store at a throwaway file.
 *
 * Config reads the environment once at import time, so this must run before
 * anything imports it — hence the dynamic imports in the tests.
 */
export async function withTempStore() {
  const dir = await mkdtemp(path.join(tmpdir(), 'hillsedge-'));
  process.env.RESERVATIONS_FILE = path.join(dir, 'reservations.jsonl');
  return () => rm(dir, { recursive: true, force: true });
}

/** A booking that should always be accepted. */
export function validBooking(overrides = {}) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 3);
  return {
    name: 'Priya',
    guests: '3–4',
    date: date.toISOString().slice(0, 10),
    time: 'Sunset',
    message: '',
    ...overrides,
  };
}
