import { useEffect, useState } from 'react';
import { useLocation, useOutlet } from 'react-router';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import { LightboxProvider } from './Lightbox.jsx';

// Wraps each page for the enter/exit transition. Because AnimatePresence runs in
// "wait" mode, a page mounts only after the previous one has faded out, so this
// is also the right moment to reset scroll (or jump to the URL's #anchor).
function Page({ children }) {
  const { pathname, hash } = useLocation();
  const [ownPath] = useState(pathname);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (pathname !== ownPath) return; // this page is on its way out
    const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
    const behavior = mounted ? 'smooth' : 'instant';
    if (target) target.scrollIntoView({ behavior });
    else if (!mounted) window.scrollTo({ top: 0, behavior: 'instant' });
    setMounted(true);
  }, [pathname, hash]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Keeps rendering the route it was created with, so the outgoing page
// doesn't switch to the new page's content while it animates out.
function FrozenOutlet() {
  const outlet = useOutlet();
  const [frozen] = useState(outlet);
  return frozen;
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}

function BackToTop() {
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);
  useMotionValueEvent(scrollY, 'change', (y) => setShow(y > 900));

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          className="back-to-top"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.92 }}
        >
          ↑
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  return (
    <LightboxProvider>
      <ScrollProgress />
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        <AnimatePresence mode="wait" initial={false}>
          <Page key={pathname}>
            <FrozenOutlet />
          </Page>
        </AnimatePresence>
      </main>
      <Footer />
      <BackToTop />
    </LightboxProvider>
  );
}
