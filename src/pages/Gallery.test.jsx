import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';
import { renderWithRouter } from '../test/render';
import Gallery from './Gallery';
import { photos } from '../data/site';
import { galleryFilters, galleryOrder } from '../data/content';

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

  it('opens the photograph that was actually clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Gallery />);

    const third = galleryOrder[2];
    await user.click(photoButtons()[2]);

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByAltText(photos[third].alt)).toBeInTheDocument();
  });

  it('steps through the wall with the arrow keys, wrapping at both ends', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Gallery />);

    const order = galleryOrder.map((key) => photos[key]);
    await user.click(photoButtons()[0]);
    const dialog = () => screen.getByRole('dialog');

    await user.keyboard('{ArrowRight}');
    expect(within(dialog()).getByAltText(order[1].alt)).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');
    expect(within(dialog()).getByAltText(order[0].alt)).toBeInTheDocument();

    // Back past the first photo lands on the last one rather than dead-ending.
    await user.keyboard('{ArrowLeft}');
    expect(within(dialog()).getByAltText(order.at(-1).alt)).toBeInTheDocument();

    await user.keyboard('{ArrowRight}');
    expect(within(dialog()).getByAltText(order[0].alt)).toBeInTheDocument();
  });

  it('steps through the wall with the on-screen arrows', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Gallery />);

    const order = galleryOrder.map((key) => photos[key]);
    await user.click(photoButtons()[0]);

    await user.click(screen.getByRole('button', { name: 'Next photo' }));
    expect(within(screen.getByRole('dialog')).getByAltText(order[1].alt)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Previous photo' }));
    expect(within(screen.getByRole('dialog')).getByAltText(order[0].alt)).toBeInTheDocument();
  });

  it('stays open when the photograph itself is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Gallery />);

    await user.click(photoButtons()[0]);
    await user.click(within(screen.getByRole('dialog')).getByAltText(photos[galleryOrder[0]].alt));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes when the backdrop around the photograph is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Gallery />);

    await user.click(photoButtons()[0]);
    await user.click(screen.getByRole('dialog'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('returns focus to the thumbnail it was opened from', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Gallery />);

    const opener = photoButtons()[1];
    await user.click(opener);
    expect(opener).not.toHaveFocus();

    await user.keyboard('{Escape}');

    expect(opener).toHaveFocus();
  });

  it('navigates within the filtered wall, not the whole set', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Gallery />);

    await user.click(screen.getByRole('tab', { name: 'The Table' }));
    const shown = galleryOrder
      .map((key) => photos[key])
      .filter((photo) => photo.category === 'table');

    await user.click(photoButtons()[0]);
    await user.keyboard('{ArrowRight}');

    expect(within(screen.getByRole('dialog')).getByAltText(shown[1].alt)).toBeInTheDocument();
  });

  it('closes the viewer when the filter changes beneath it', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Gallery />);

    await user.click(photoButtons()[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'The Smokehouse' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
