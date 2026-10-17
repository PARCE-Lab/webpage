# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Website for PARCE-LAB (Planning, Autonomy, and Reliable Control for Embodied-Systems Lab) at Virginia Commonwealth University. React 19 + React Router 8 (declarative mode, imported from `react-router`) + Motion 14 (`motion/react`, formerly Framer Motion) + Vite 8, plain JavaScript/JSX. No linter or test suite.

## Commands

```
npm run dev       # dev server, http://localhost:5173/webpage/
npm run build     # vite build, then scripts/spa-fallback.js copies dist/index.html → dist/404.html
npm run preview   # serve dist/ at http://localhost:4173/webpage/
```

On this Windows machine Node lives in `C:\Program Files\nodejs`; a shell started before Node was installed may need it prepended to `PATH`.

## Deployment

GitHub Pages project site for `PARCE-Lab/webpage`, served at `https://parce-lab.github.io/webpage/` (Vite `base` is `/webpage/`; `BrowserRouter` gets it as `basename` in `main.jsx`). The repo name is fixed by the lab, so keep the sub-path. Absolute URLs with `/webpage/` also live in `index.html` (og tags), `public/sitemap.xml`, `public/robots.txt`, and `SITE_URL` in `src/data/site.js`. `.github/workflows/deploy.yml` builds and deploys on push to `main` or `master`; Pages source must be set to "GitHub Actions". GitHub Pages can't rewrite URLs, so deep links such as `/research` load through the `404.html` copy of the app, and React Router takes over from there.

Branching follows `DEVELOPER.md`: `feature/*` and `bugfix/*` branch from and merge into `dev`; releases go `dev` → `qa` → `main` via pull requests; `hotfix/*` branches from `main`, merges into `main`, then `main` is merged back into `dev`. Never commit directly to `main`, `qa`, or `dev`; only pushes to `main` deploy.

## Architecture

- `src/App.jsx` defines all routes under `components/Layout.jsx` (header, footer, scroll-progress bar, back-to-top button, lightbox provider, page transitions). To add a page, add a route there, add it to `NAV_ITEMS` and/or `FOOTER_EXPLORE` in `src/data/site.js`, and add the URL to `public/sitemap.xml`.
- Page transitions: `Layout` wraps the outlet in `<AnimatePresence mode="wait">` keyed by pathname; `FrozenOutlet` keeps the outgoing page rendering its own route while it exits. The `Page` wrapper resets scroll when the new page mounts, or jumps to the element whose id matches the URL hash (e.g. `/research#formal` — the Research thrust ids are `formal`, `planning`, `interaction`, `aerial`, linked from the Home cards).
- `pages/NotFound.jsx` also redirects legacy static-site URLs (`/research.html` → `/research`).
- Each page renders `<Seo title description />`. React 19 hoists its `<title>`/`<meta>` tags into `<head>`. Site-wide meta is in the root `index.html`; link-preview crawlers don't run JS, so the og:/twitter: tags there (and `assets/images/og-image.jpg`, 1200×630) are what shared links show.
- Active menu item styling relies on `NavLink` setting `aria-current="page"`, which `styles.css` targets.
- Content lives in data modules: `src/data/research.js` (research thrusts, also counted on Home), `src/data/publications.js` (array of `{year, type: 'journal'|'conference'|'software', title, authors, venue, link?, image?, imageAlt?, featured?}`, newest first; `type` must match `FILTERS` in `pages/Publications.jsx`; `featured` is currently unused), `src/data/news.js` (`summary` is the short Home-page wording), `src/data/site.js` (contact info, external URLs, nav/footer). People, research thrusts, and other copy are arrays at the top of each page component.
- Static files (images, robots.txt, sitemap.xml, .nojekyll) are in `public/`. Data files and components write them root-style (`/assets/images/...`), and every place one becomes an `<img src>` or file `href` must wrap it in `asset()` from `src/utils/asset.js`, which prepends the base (`Zoomable` already does). Router `<Link to="/...">` paths need no wrapping. Each lab member has a folder `public/assets/people/<first-last>/` holding `photo.webp|jpg` and optionally `cv.pdf`. Images are WebP sized for display (originals are in git history); favicons are `public/favicon-32.png` and `public/apple-touch-icon.png`.

## Styling and animation

- `src/styles.css` is the single global stylesheet (imported in `main.jsx`). Design tokens live in `:root`, and responsive breakpoints are at 1120px, 760px, and 460px.
- `src/main.jsx` wraps the app in `<MotionConfig reducedMotion="user">`, so Motion skips transform animations for reduced-motion users. CSS-only animations (hero badge float, mobile menu) have their own `prefers-reduced-motion` rules.
- `components/motion.jsx` holds the shared helpers: `Reveal` (fade-up on first scroll into view, `as` picks the tag), `Stagger` + `StaggerItem` (children animate in sequence; `lift` adds a spring hover, `variant="pop"` scales in), and `AnimatedNumber` (counts to `value` when in view and re-animates when it changes).
- `components/Logo.jsx`: `<LabLogo />` (full lockup) and `<LabMark />` (robot-and-person illustration), inline SVG paths traced from the original artwork with a transparent background. Black parts use `currentColor`, so the logo follows the text color of its section (white in the footer and `.section-dark`); gold parts use `--logo-accent`. Standalone copies for slides and posters, in dark and `-white` variants, are in `public/assets/images/logo/`. `index.html` and `html` set `color-scheme: only light` to ask phone browsers not to auto-darken the site.
- `components/Lightbox.jsx`: `<Zoomable src alt caption />` renders a button-wrapped image that opens in a full-screen overlay (Esc/backdrop closes, focus returns to the image).
- Publications: year groups and cards use `layout="position"` inside `AnimatePresence mode="popLayout"`, so filtering animates smoothly. The active filter background is a shared `layoutId="filter-pill"` element. Containers of popLayout children need `position: relative`.
- Hero badges float with a CSS `translate` keyframe so it composes with Motion's `transform`; don't switch it to `transform`.

## Notes

- `public/assets/images/figures/` contains three figures not used on any page: `catl-planning-pipeline.webp`, `heterogeneous-team-environment.webp`, `partial-satisfaction-ast.webp`.
- The pre-React static site is in git history (`master` before the React migration on `feature/optional-react`).
