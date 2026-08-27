import { useEffect } from 'react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { Picture } from './Picture';

export function Lightbox({ photo, onClose }) {
  useBodyScrollLock(Boolean(photo));

  useEffect(() => {
    if (!photo) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [photo, onClose]);

  if (!photo) return null;

  return (
    <div
      className="lbox on"
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged photo"
      onClick={onClose}
    >
      <button type="button" className="x" aria-label="Close" onClick={onClose}>
        ×
      </button>
      <Picture photo={photo} priority sizes="min(1200px, 94vw)" />
    </div>
  );
}

export default Lightbox;
