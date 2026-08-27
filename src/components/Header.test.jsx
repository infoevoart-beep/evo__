import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';
import { renderWithRouter } from '../test/render';
import { Header } from './Header';
import { navLinks } from '../data/site';

describe('Header', () => {
  it('lists every route in both the desktop menu and the mobile sheet', () => {
    renderWithRouter(<Header />);
    const desktop = screen.getByRole('navigation', { name: 'Primary' });
    const mobile = screen.getByRole('navigation', { name: 'Mobile' });

    for (const { label, sheetLabel } of navLinks) {
      expect(within(desktop).getByRole('link', { name: label })).toBeInTheDocument();
      expect(within(mobile).getByText(sheetLabel, { exact: false })).toBeInTheDocument();
    }
  });

  it('marks the current route as active', () => {
    renderWithRouter(<Header />, { route: '/cuisine' });
    const desktop = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(desktop).getByRole('link', { name: 'Cuisine' })).toHaveClass('active');
    expect(within(desktop).getByRole('link', { name: 'About' })).not.toHaveClass('active');
  });

  it('opens the sheet and locks the page behind it', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Header />);

    const burger = screen.getByRole('button', { name: 'Open menu' });
    expect(burger).toHaveAttribute('aria-expanded', 'false');

    await user.click(burger);

    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(document.body).toHaveStyle({ overflow: 'hidden' });
  });

  it('closes the sheet on Escape and releases the page', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Header />);

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.keyboard('{Escape}');

    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(document.body).not.toHaveStyle({ overflow: 'hidden' });
  });

  it('keeps the closed sheet out of the tab order and the a11y tree', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Header />);
    const sheet = document.getElementById('nav-sheet');

    expect(sheet).toHaveAttribute('inert');

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(sheet).not.toHaveAttribute('inert');
  });
});
