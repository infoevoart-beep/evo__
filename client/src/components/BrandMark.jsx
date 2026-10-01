import { brandMarkPaths } from '../data/brandMarkPaths';

/**
 * Rendered once, at the root of the app. Every logo on the site is a
 * lightweight `<use>` reference into this sprite.
 */
export function BrandMarkSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <g id="hsArt">
          {/* Keyed by index, not by `d`: the artwork repeats one path
              verbatim, and keying on the data made React drop it. The list is
              static and never reorders, so the index is a stable identity. */}
          {brandMarkPaths.map((d, index) => (
            <path key={index} fillRule="nonzero" fill="currentColor" d={d} />
          ))}
        </g>
      </defs>
    </svg>
  );
}

/**
 * `variant="lockup"` crops to the crest for the header; `variant="full"`
 * shows the whole mark for the footer.
 */
export function BrandMark({ variant = 'lockup', className = '' }) {
  const viewBox = variant === 'full' ? '144 172 1000 756' : '446 174 363 538';
  return (
    <svg className={`mark ${className}`.trim()} viewBox={viewBox} aria-hidden="true">
      <use href="#hsArt" />
    </svg>
  );
}

export default BrandMark;
