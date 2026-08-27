import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../test/render';
import Gallery from './Gallery';
import { photos } from '../data/site';
import { galleryFilters } from '../data/content';

const photoButtons = () => screen.getAllByRole('button', { name: /^Open “/ });

describe('Gallery', () => {
  it('shows every photograph before any filter is applied', () => {
    renderWithRouter(<Gallery />);
    expect(photoButtons()).toHaveLength(Object.keys(photos).length);
  });

  it('narrows the wall to the chosen category', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Gallery />);

    await user.click(screen.getByRole('tab', { name: 'The Table' }));

    const expected = Object.values(photos).filter((p) => p.category === 'table');
    expect(photoButtons()).toHaveLength(expected.length);
    for (const photo of expected) {
      expect(screen.getByAltText(photo.alt)).toBeInTheDocument();
    }
  });

  it('marks the active filter for assistive technology', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Gallery />);

    expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'true');

    await user.click(screen.getByRole('tab', { name: 'Views & Nature' }));

    expect(screen.getByRole('tab', { name: 'Views & Nature' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'false');
  });

  it('restores the full wall when All is chosen again', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Gallery />);

    await user.click(screen.getByRole('tab', { name: 'The Smokehouse' }));
    await user.click(screen.getByRole('tab', { name: 'All' }));

    expect(photoButtons()).toHaveLength(Object.keys(photos).length);
  });

  it('offers a filter for every category in use, and no empty ones', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Gallery />);

    for (const { id, label } of galleryFilters) {
      if (id === 'all') continue;
      await user.click(screen.getByRole('tab', { name: label }));
      expect(photoButtons().length, label).toBeGreaterThan(0);
    }

    const used = new Set(Object.values(photos).map((p) => p.category));
    const offered = new Set(galleryFilters.map((f) => f.id).filter((id) => id !== 'all'));
    expect(offered).toStrictEqual(used);
  });

  it('opens a photograph in the lightbox and closes it on Escape', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Gallery />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(photoButtons()[0]);

    const dialog = screen.getByRole('dialog', { name: 'Enlarged photo' });
    expect(dialog).toBeInTheDocument();
    expect(document.body).toHaveStyle({ overflow: 'hidden' });

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body).not.toHaveStyle({ overflow: 'hidden' });
  });
});
