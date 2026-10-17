# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Website for PARCE-LAB (Planning, Autonomy, and Reliable Control for Embodied-Systems Lab) at Virginia Commonwealth University. React 19 + React Router 8 (declarative mode, imported from `react-router`) + Motion 14 (`motion/react`, formerly Framer Motion) + Vite 8, plain JavaScript/JSX. No linter or test suite.

## Commands

```
npm run dev       # dev server, http://localhost:5173
npm run build     # vite build, then scripts/spa-fallback.js copies dist/index.html → dist/404.html
npm run preview   # serve dist/ at http://localhost:4173
```

On this Windows machine Node lives in `C:\Program Files\nodejs`; a shell started before Node was installed may need it prepended to `PATH`.

## Deployment

GitHub Pages for `PARCE-Lab/PARCE-Lab.github.io`, served at `https://parce-lab.github.io` (site root, so Vite `base` is `/`). `.github/workflows/deploy.yml` builds and deploys on push to `main` or `master`; Pages source must be set to "GitHub Actions". GitHub Pages can't rewrite URLs, so deep links such as `/research` load through the `404.html` copy of the app, and React Router takes over from there.

## Architecture

- `src/App.jsx` defines all routes under `components/Layout.jsx` (header, footer, scroll-progress bar, back-to-top button, lightbox provider, page transitions). To add a page, add a route there, add it to `NAV_ITEMS` and/or `FOOTER_EXPLORE` in `src/data/site.js`, and add the URL to `public/sitemap.xml`.
- Page transitions: `Layout` wraps the outlet in `<AnimatePresence mode="wait">` keyed by pathname; `FrozenOutlet` keeps the outgoing page rendering its own route while it exits. The `Page` wrapper resets scroll when the new page mounts, or jumps to the element whose id matches the URL hash (e.g. `/research#formal` — the Research thrust ids are `formal`, `planning`, `interaction`, `aerial`, linked from the Home cards).
- `pages/NotFound.jsx` also redirects legacy static-site URLs (`/research.html` → `/research`).
- Each page renders `<Seo title description />`. React 19 hoists its `<title>`/`<meta>` tags into `<head>`. Site-wide meta (og:image etc.) is in the root `index.html`.
- Active menu item styling relies on `NavLink` setting `aria-current="page"`, which `styles.css` targets.
- Content lives in data modules: `src/data/research.js` (research thrusts, also counted on Home), `src/data/publications.js` (array of `{year, type: 'journal'|'conference'|'software', title, authors, venue, link?, image?, imageAlt?, featured?}`, newest first; `type` must match `FILTERS` in `pages/Publications.jsx`; `featured` is currently unused), `src/data/news.js` (`summary` is the short Home-page wording), `src/data/site.js` (contact info, external URLs, nav/footer). People, research thrusts, and other copy are arrays at the top of each page component.
- Static files (images, robots.txt, sitemap.xml, .nojekyll) are in `public/` and referenced with root-absolute paths like `/assets/images/...`. Each lab member has a folder `public/assets/people/<first-last>/` holding `photo.png|jpg` and optionally `cv.pdf`.

## Styling and animation

- `src/styles.css` is the single global stylesheet (imported in `main.jsx`). Design tokens live in `:root`, and responsive breakpoints are at 1120px, 760px, and 460px.
- `src/main.jsx` wraps the app in `<MotionConfig reducedMotion="user">`, so Motion skips transform animations for reduced-motion users. CSS-only animations (hero badge float, mobile menu) have their own `prefers-reduced-motion` rules.
- `components/motion.jsx` holds the shared helpers: `Reveal` (fade-up on first scroll into view, `as` picks the tag), `Stagger` + `StaggerItem` (children animate in sequence; `lift` adds a spring hover, `variant="pop"` scales in), and `AnimatedNumber` (counts to `value` when in view and re-animates when it changes).
- `components/Lightbox.jsx`: `<Zoomable src alt caption />` renders a button-wrapped image that opens in a full-screen overlay (Esc/backdrop closes, focus returns to the image).
- Publications: year groups and cards use `layout="position"` inside `AnimatePresence mode="popLayout"`, so filtering animates smoothly. The active filter background is a shared `layoutId="filter-pill"` element. Containers of popLayout children need `position: relative`.
- Hero badges float with a CSS `translate` keyframe so it composes with Motion's `transform`; don't switch it to `transform`.

## Notes

- `public/assets/images/figures/` contains three figures not used on any page: `catl-planning-pipeline.png`, `heterogeneous-team-environment.png`, `partial-satisfaction-ast.png`.
- The pre-React static site is in git history (`master` before the React migration on `feature/optional-react`).
