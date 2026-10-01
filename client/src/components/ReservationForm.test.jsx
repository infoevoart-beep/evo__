import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ReservationForm } from './ReservationForm';
import { site } from '../data/site';

/**
 * A local calendar date `daysFromNow` away, as `YYYY-MM-DD`. Built from the
 * local parts rather than `toISOString`, which would shift the day for any
 * timezone behind UTC and make these tests fail only in some places.
 */
function soon(daysFromNow = 1) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Stands in for the API. */
function mockFetch(response) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok ?? true,
    status: response.status ?? 201,
    json: async () => response.body ?? {},
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** Fills in the two fields the form insists on. */
async function fillRequired(user, { name = 'Priya', date = soon() } = {}) {
  await user.type(screen.getByLabelText('Name'), name);
  fireEvent.change(screen.getByLabelText('Date'), { target: { value: date } });
}

const submit = (user) => user.click(screen.getByRole('button', { name: /request a table/i }));

beforeEach(() => {
  vi.stubGlobal('open', vi.fn());
});

afterEach(() => vi.unstubAllGlobals());

describe('ReservationForm — sending', () => {
  it('posts the booking to the API', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch({ body: { id: 'abc', message: 'ok' } });
    render(<ReservationForm />);

    const date = soon(3);
    await fillRequired(user, { date });
    await user.selectOptions(screen.getByLabelText('Guests'), '5–8');
    await user.selectOptions(screen.getByLabelText('Time'), 'Sunset');
    await user.type(screen.getByLabelText(/anything we should know/i), 'One vegan');
    await submit(user);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/reservations');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toStrictEqual({
      name: 'Priya',
      guests: '5–8',
      date,
      time: 'Sunset',
      message: 'One vegan',
    });
  });

  it('confirms to the guest once the booking is accepted', async () => {
    const user = userEvent.setup();
    mockFetch({ body: { id: 'abc' } });
    render(<ReservationForm />);

    await fillRequired(user, { name: 'Nuwan' });
    await submit(user);

    expect(await screen.findByText(/thank you, nuwan/i)).toBeInTheDocument();
    // The form is gone, so the same booking cannot be sent twice.
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
  });

  it('disables the form while the request is in flight', async () => {
    const user = userEvent.setup();
    let release;
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise((resolve) => { release = resolve; }))
    );
    render(<ReservationForm />);

    await fillRequired(user);
    await submit(user);

    expect(await screen.findByRole('button', { name: /sending/i })).toBeDisabled();
    expect(screen.getByLabelText('Name')).toBeDisabled();

    release({ ok: true, status: 201, json: async () => ({ id: 'x' }) });
    await screen.findByText(/thank you/i);
  });
});

describe('ReservationForm — validation', () => {
  it('refuses to send a booking with no name or date', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch({});
    render(<ReservationForm />);

    await submit(user);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText(/please tell us who the table is for/i)).toBeInTheDocument();
    expect(screen.getByText(/please choose a date/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveFocus();
  });

  it('rejects a date in the past without asking the server', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch({});
    render(<ReservationForm />);

    await fillRequired(user, { date: soon(-2) });
    await submit(user);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText(/today or a later date/i)).toBeInTheDocument();
  });

  it('will not let the date picker offer a past day', () => {
    render(<ReservationForm />);
    expect(screen.getByLabelText('Date')).toHaveAttribute('min', soon(0));
  });

  it('clears an error as soon as the guest fixes the field', async () => {
    const user = userEvent.setup();
    mockFetch({});
    render(<ReservationForm />);

    await submit(user);
    expect(screen.getByText(/please tell us who the table is for/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText('Name'), 'Priya');

    expect(screen.queryByText(/please tell us who the table is for/i)).not.toBeInTheDocument();
  });

  it('shows the server\'s own objections against the right fields', async () => {
    const user = userEvent.setup();
    mockFetch({
      ok: false,
      status: 422,
      body: { error: 'Some details need checking.', errors: { date: 'That date is not valid.' } },
    });
    render(<ReservationForm />);

    await fillRequired(user);
    await submit(user);

    expect(await screen.findByText(/that date is not valid/i)).toBeInTheDocument();
  });
});

describe('ReservationForm — when the API cannot be reached', () => {
  it('says so and keeps the details on screen', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    render(<ReservationForm />);

    await fillRequired(user, { name: 'Priya' });
    await submit(user);

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not reach/i);
    // Nothing is lost — the guest can retry or switch to WhatsApp.
    expect(screen.getByLabelText('Name')).toHaveValue('Priya');
  });

  it('offers WhatsApp as the way through', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    render(<ReservationForm />);

    await fillRequired(user);
    await submit(user);
    await screen.findByRole('alert');

    await user.click(screen.getByRole('button', { name: /whatsapp/i }));

    expect(window.open).toHaveBeenCalledOnce();
    const url = new URL(window.open.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe(`https://wa.me/${site.whatsapp}`);
  });
});

describe('ReservationForm — WhatsApp', () => {
  it('carries the details the guest filled in', async () => {
    const user = userEvent.setup();
    mockFetch({});
    render(<ReservationForm />);

    const date = soon(2);
    await fillRequired(user, { name: 'Ayesha', date });
    await user.selectOptions(screen.getByLabelText('Guests'), '9–15');
    await user.click(screen.getByRole('button', { name: /whatsapp/i }));

    const message = decodeURIComponent(
      new URL(window.open.mock.calls[0][0]).search.replace('?text=', '')
    );
    expect(message).toContain('Name: Ayesha');
    expect(message).toContain('Guests: 9–15');
    expect(message).toContain(`Date: ${date}`);
  });

  it('does not post to the API', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch({});
    render(<ReservationForm />);

    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: /whatsapp/i }));

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
