import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { config } from '../config/index.js';

/**
 * Bookings, appended as JSON Lines.
 *
 * One line per reservation, append-only: a half-written line can only ever
 * damage the record being written, and the file stays readable with `tail`
 * without any tooling. A restaurant takes a handful of bookings a day, so a
 * database would be a dependency to install, back up and secure in exchange
 * for nothing. Swap this module if that ever stops being true — nothing
 * outside it knows how the records are stored.
 */
async function ensureDirectory(file) {
  await mkdir(path.dirname(file), { recursive: true });
}

export async function saveReservation(reservation) {
  const record = {
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
    ...reservation,
  };

  await ensureDirectory(config.reservationsFile);
  await appendFile(config.reservationsFile, `${JSON.stringify(record)}\n`, 'utf8');
  return record;
}

/** Every stored booking, oldest first. Used by the tests and for exports. */
export async function listReservations() {
  try {
    const raw = await readFile(config.reservationsFile, 'utf8');
    return raw
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

export default { saveReservation, listReservations };
