import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { asset } from '../utils/asset.js';
import { AnimatePresence, motion } from 'motion/react';

const LightboxContext = createContext(() => {});

// Wrap the app once; any <Zoomable> inside can then open its image full-screen.
export function LightboxProvider({ children }) {
  const [image, setImage] = useState(null);
  const close = useCallback(() => setImage(null), []);

  return (
    <LightboxContext.Provider value={setImage}>
      {children}
      <AnimatePresence>{image && <Overlay image={image} onClose={close} />}</AnimatePresence>
    </LightboxContext.Provider>
  );
}

function Overlay({ image, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const opener = document.activeElement;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <motion.div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <button ref={closeRef} className="lightbox-close" aria-label="Close image" onClick={onClose}>×</button>
      <motion.figure
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.88, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        <img src={image.src} alt={image.alt} />
        {image.caption && <figcaption>{image.caption}</figcaption>}
      </motion.figure>
    </motion.div>
  );
}

// An image that opens in the lightbox when clicked.
export function Zoomable({ src: path, alt, caption, ...imgProps }) {
  const open = useContext(LightboxContext);
  const src = asset(path);
  return (
    <button type="button" className="zoom-trigger" aria-label={`Enlarge image: ${alt}`} onClick={() => open({ src, alt, caption })}>
      <img src={src} alt={alt} {...imgProps} />
    </button>
  );
}
