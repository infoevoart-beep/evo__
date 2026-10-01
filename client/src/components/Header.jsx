import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { navLinks, site } from '../data/site';
import { useScrolled } from '../hooks/useScrolled';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { BrandMark } from './BrandMark';

export function Header() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled(40);
  const location = useLocation();

  useBodyScrollLock(open);

  // Close the sheet whenever navigation happens.
  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <>
      <header className={[scrolled ? 'stuck' : '', open ? 'menu-open' : ''].filter(Boolean).join(' ') || undefined}>
        <div className="wrap nav">
          <Link to="/" className="lockup" aria-label={`${site.name} — home`}>
            <BrandMark variant="lockup" />
            <span className="lk-txt">
              <b>HILLSEDGE</b>
              <s>BERAGALA</s>
            </span>
          </Link>

          <nav className="menu" aria-label="Primary">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'}>
                {label}
              </NavLink>
            ))}
          </nav>

          <Link to="/visit" className="btn b-fill nav-cta">
            Reserve <i aria-hidden="true">&rarr;</i>
          </Link>

          <button
            type="button"
            className={`burger ${open ? 'on' : ''}`.trim()}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="nav-sheet"
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* `inert` rather than `hidden`: it keeps the links out of the tab
          order and the accessibility tree without display:none, which would
          skip the reveal transition. */}
      <div
        id="nav-sheet"
        className={`sheet ${open ? 'on' : ''}`.trim()}
        {...(open ? {} : { inert: '' })}
      >
        <nav aria-label="Mobile">
          {navLinks.map(({ to, sheetLabel, index }) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {sheetLabel} <em>{index}</em>
            </NavLink>
          ))}
        </nav>
        <div className="sf">{site.region}</div>
      </div>
    </>
  );
}

export default Header;
