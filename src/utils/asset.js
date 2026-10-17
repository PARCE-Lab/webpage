// The site is served from a sub-path (vite.config.js `base`, e.g. /webpage/ on GitHub Pages).
// Content files keep root-style paths like '/assets/images/x.webp'; pass them through
// asset() wherever they become an <img src> or file link. Full URLs and paths that
// already include the base are returned unchanged.
const BASE = import.meta.env.BASE_URL;

export function asset(path) {
  if (!path || !path.startsWith('/') || path.startsWith(BASE)) return path;
  return BASE + path.slice(1);
}
