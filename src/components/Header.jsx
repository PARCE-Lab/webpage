import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { useMotionValueEvent, useScroll } from 'motion/react';
import { NAV_ITEMS } from '../data/site.js';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24));

  // Close the mobile menu after navigating.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-wrap">
        <Link className="brand" to="/">
          <img src="/assets/images/parce-lab-mark.png" alt="" />
          <span className="brand-copy">
            <strong>PARCE-LAB</strong>
            <span>Planning · Autonomy · Reliable Control</span>
          </span>
        </Link>
        <button
          className="menu-toggle"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? '×' : '☰'}
        </button>
        <nav id="primary-nav" className={`nav-links${open ? ' open' : ''}`} aria-label="Primary navigation">
          {NAV_ITEMS.map(({ to, label, cta }, i) => (
            // NavLink sets aria-current="page" on the active item, which the CSS styles.
            // --i staggers the links when the mobile menu opens.
            <NavLink key={to} to={to} end={to === '/'} className={cta ? 'nav-cta' : undefined} style={{ '--i': i }}>
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
