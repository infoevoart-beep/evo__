import { afterEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
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

describe('ReservationForm', () => {
  it('sends the guest to the right WhatsApp number', async () => {
    const user = userEvent.setup();
    const handoff = captureHandoff();
    render(<ReservationForm />);

    await user.click(screen.getByRole('button', { name: /send on whatsapp/i }));

    const { url } = handoff();
    expect(url.origin + url.pathname).toBe(`https://wa.me/${site.whatsapp}`);
  });

  it('carries the details the guest filled in', async () => {
    const user = userEvent.setup();
    const handoff = captureHandoff();
    render(<ReservationForm />);

    await user.type(screen.getByLabelText('Name'), 'Priya');
    await user.selectOptions(screen.getByLabelText('Guests'), '5–8');
    await user.selectOptions(screen.getByLabelText('Time'), 'Sunset');
    await user.type(screen.getByLabelText(/anything we should know/i), 'One vegan');

    await user.click(screen.getByRole('button', { name: /send on whatsapp/i }));

    const { message } = handoff();
    expect(message).toContain('Name: Priya');
    expect(message).toContain('Guests: 5–8');
    expect(message).toContain('Sitting: Sunset');
    expect(message).toContain('Notes: One vegan');
  });

  it('marks empty fields rather than sending a blank line', async () => {
    const user = userEvent.setup();
    const handoff = captureHandoff();
    render(<ReservationForm />);

    await user.click(screen.getByRole('button', { name: /send on whatsapp/i }));

    const { message } = handoff();
    expect(message).toContain('Name: —');
    expect(message).toContain('Date: —');
    // Nothing to say means no Notes line at all.
    expect(message).not.toContain('Notes:');
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
