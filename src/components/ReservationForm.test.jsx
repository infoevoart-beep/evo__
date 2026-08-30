import { afterEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReservationForm } from './ReservationForm';
import { site } from '../data/site';

/** Captures the URL the form hands to WhatsApp, and decodes the message. */
function captureHandoff() {
  const open = vi.fn();
  vi.stubGlobal('open', open);
  return () => {
    expect(open).toHaveBeenCalledOnce();
    const url = new URL(open.mock.calls[0][0]);
    return { url, message: decodeURIComponent(url.search.replace('?text=', '')) };
  };
}

afterEach(() => vi.unstubAllGlobals());

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

/** Fills in the two fields the form insists on. */
async function fillRequired(user, { name = 'Priya', date = soon() } = {}) {
  await user.type(screen.getByLabelText('Name'), name);
  fireEvent.change(screen.getByLabelText('Date'), { target: { value: date } });
}

const submit = (user) =>
  user.click(screen.getByRole('button', { name: /send on whatsapp/i }));

describe('ReservationForm', () => {
  it('sends the guest to the right WhatsApp number', async () => {
    const user = userEvent.setup();
    const handoff = captureHandoff();
    render(<ReservationForm />);

    await fillRequired(user);
    await submit(user);

    const { url } = handoff();
    expect(url.origin + url.pathname).toBe(`https://wa.me/${site.whatsapp}`);
  });

  it('carries the details the guest filled in', async () => {
    const user = userEvent.setup();
    const handoff = captureHandoff();
    render(<ReservationForm />);

    const date = soon(3);
    await fillRequired(user, { date });
    await user.selectOptions(screen.getByLabelText('Guests'), '5–8');
    await user.selectOptions(screen.getByLabelText('Time'), 'Sunset');
    await user.type(screen.getByLabelText(/anything we should know/i), 'One vegan');

    await submit(user);

    const { message } = handoff();
    expect(message).toContain('Name: Priya');
    expect(message).toContain('Guests: 5–8');
    expect(message).toContain(`Date: ${date}`);
    expect(message).toContain('Sitting: Sunset');
    expect(message).toContain('Notes: One vegan');
  });

  it('omits the notes line when there is nothing to say', async () => {
    const user = userEvent.setup();
    const handoff = captureHandoff();
    render(<ReservationForm />);

    await fillRequired(user);
    await submit(user);

    expect(handoff().message).not.toContain('Notes:');
  });

  it('refuses to hand over a booking with no name or date', async () => {
    const user = userEvent.setup();
    const open = vi.fn();
    vi.stubGlobal('open', open);
    render(<ReservationForm />);

    await submit(user);

    expect(open).not.toHaveBeenCalled();
    expect(screen.getByText(/please tell us who the table is for/i)).toBeInTheDocument();
    expect(screen.getByText(/please choose a date/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true');
    // Focus lands on the first field that needs attention.
    expect(screen.getByLabelText('Name')).toHaveFocus();
  });

  it('rejects a date in the past', async () => {
    const user = userEvent.setup();
    const open = vi.fn();
    vi.stubGlobal('open', open);
    render(<ReservationForm />);

    await fillRequired(user, { date: soon(-2) });
    await submit(user);

    expect(open).not.toHaveBeenCalled();
    expect(screen.getByText(/today or a later date/i)).toBeInTheDocument();
  });

  it('will not let the date picker offer a past day', () => {
    render(<ReservationForm />);
    expect(screen.getByLabelText('Date')).toHaveAttribute('min', soon(0));
  });

  it('clears an error as soon as the guest fixes the field', async () => {
    const user = userEvent.setup();
    captureHandoff();
    render(<ReservationForm />);

    await submit(user);
    expect(screen.getByText(/please tell us who the table is for/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText('Name'), 'Priya');

    expect(screen.queryByText(/please tell us who the table is for/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Name')).not.toHaveAttribute('aria-invalid');
  });

  it('suppresses the browser\'s own form submission', async () => {
    const user = userEvent.setup();
    captureHandoff();
    render(<ReservationForm />);

    // React handles the event at the root, so only a listener on document —
    // which the event reaches last — sees the final defaultPrevented state.
    const seen = [];
    const spy = (event) => seen.push(event.defaultPrevented);
    document.addEventListener('submit', spy);

    await user.click(screen.getByRole('button', { name: /send on whatsapp/i }));
    document.removeEventListener('submit', spy);

    expect(seen).toStrictEqual([true]);
  });
});
