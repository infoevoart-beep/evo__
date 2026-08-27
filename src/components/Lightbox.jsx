import { useEffect } from 'react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

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
      <img src={photo.src} alt={photo.alt} />
    </div>
  );
}

export default Lightbox;
