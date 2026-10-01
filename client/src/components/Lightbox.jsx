import { useCallback, useEffect, useRef } from 'react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { Picture } from './Picture';

/** Everything inside the dialog that can hold focus, in tab order. */
const FOCUSABLE = 'button';

/**
 * Full-screen photo viewer for the gallery.
 *
 * `index` addresses into `photos` so the viewer can step through the wall as
 * it is currently filtered; `null` closes it. Wrapping at both ends means the
 * arrows never dead-end, which matters most on a phone where they are the
 * only way through.
 */
export function Lightbox({ photos = [], index = null, onClose, onNavigate }) {
  const open = index !== null && index >= 0 && index < photos.length;
  const photo = open ? photos[index] : null;

  const dialogRef = useRef(null);
  // The element that opened the viewer, so focus can go back to the thumbnail
  // the guest actually clicked rather than the top of the page.
  const openerRef = useRef(null);

  useBodyScrollLock(open);

  const step = useCallback(
    (delta) => {
      if (!open || photos.length < 2) return;
      onNavigate((index + delta + photos.length) % photos.length);
    },
    [open, index, photos.length, onNavigate]
  );

  // Remember the opener while it is still focused, and restore it on close.
  useEffect(() => {
    if (!open) return undefined;
    openerRef.current = document.activeElement;
    dialogRef.current?.focus();

    return () => {
      const opener = openerRef.current;
      openerRef.current = null;
      if (opener?.isConnected) opener.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          step(-1);
          break;
        case 'ArrowRight':
          step(1);
          break;
        case 'Tab': {
          // A modal must not leak focus to the page behind it, and jsdom and
          // real browsers agree on nothing here except explicit wrapping.
          const stops = dialogRef.current?.querySelectorAll(FOCUSABLE);
          if (!stops?.length) break;
          const first = stops[0];
          const last = stops[stops.length - 1];
          const active = document.activeElement;

          if (event.shiftKey && (active === first || active === dialogRef.current)) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            first.focus();
          }
          break;
        }
        default:
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, step]);

  if (!open) return null;

  const many = photos.length > 1;
  // The backdrop closes on click; anything meaningful inside it must not.
  const keepOpen = (event) => event.stopPropagation();

  return (
    <div
      className="lbox on"
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged photo"
      ref={dialogRef}
      tabIndex={-1}
      onClick={onClose}
    >
      <button type="button" className="x" aria-label="Close" onClick={onClose}>
        ×
      </button>

      {many && (
        <button
          type="button"
          className="lb-nav lb-prev"
          aria-label="Previous photo"
          onClick={(event) => {
            keepOpen(event);
            step(-1);
          }}
        >
          ‹
        </button>
      )}

      <figure className="lb-figure" onClick={keepOpen}>
        <Picture photo={photo} priority sizes="min(1200px, 94vw)" />
        <figcaption>
          <span>{photo.caption}</span>
          {many && (
            <span className="lb-count">
              {index + 1} / {photos.length}
            </span>
          )}
        </figcaption>
      </figure>

      {many && (
        <button
          type="button"
          className="lb-nav lb-next"
          aria-label="Next photo"
          onClick={(event) => {
            keepOpen(event);
            step(1);
          }}
        >
          ›
        </button>
      )}
    </div>
  );
}

export default Lightbox;
