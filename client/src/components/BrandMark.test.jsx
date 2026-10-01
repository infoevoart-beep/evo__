import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { BrandMarkSprite, BrandMark } from './BrandMark';
import { brandMarkPaths } from '../data/brandMarkPaths';

describe('BrandMarkSprite', () => {
  it('renders every path in the artwork', () => {
    // The artwork repeats one path verbatim; keying on the path data would
    // silently drop it, so this guards the whole mark rather than a count.
    const { container } = render(<BrandMarkSprite />);
    expect(container.querySelectorAll('#hsArt path')).toHaveLength(brandMarkPaths.length);
  });

  it('exposes the sprite under the id the logos reference', () => {
    const { container } = render(<BrandMarkSprite />);
    expect(container.querySelector('#hsArt')).toBeInTheDocument();
  });
});

describe('BrandMark', () => {
  it('crops to the crest for the header and shows the full mark in the footer', () => {
    const { container: lockup } = render(<BrandMark variant="lockup" />);
    const { container: full } = render(<BrandMark variant="full" />);

    expect(lockup.querySelector('svg')).toHaveAttribute('viewBox', '446 174 363 538');
    expect(full.querySelector('svg')).toHaveAttribute('viewBox', '144 172 1000 756');
  });

  it('points at the shared sprite rather than inlining the artwork again', () => {
    const { container } = render(<BrandMark />);
    expect(container.querySelector('use')).toHaveAttribute('href', '#hsArt');
    expect(container.querySelectorAll('path')).toHaveLength(0);
  });
});
