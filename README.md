# PARCE-LAB Website

Website for the Planning, Autonomy, and Reliable Control for Embodied-Systems Lab at Virginia Commonwealth University, built with React, React Router, and Vite.

## Pages

- Home
- Research
- People
- Publications
- Facilities & Robots
- Teaching
- Join PARCE-LAB
- Contact
- News

## Development

Requires Node.js 20 or newer.

```
npm install
npm run dev       # local dev server with hot reload at http://localhost:5173/webpage/
npm run build     # production build into dist/
npm run preview   # serve the production build at http://localhost:4173/webpage/
```

## Editing content

See [MANUAL.md](MANUAL.md) for step-by-step instructions and templates for adding news, publications, people, and more. For the branching workflow (feature, bugfix, hotfix, dev, qa, main), pull requests, and releases, see [DEVELOPER.md](DEVELOPER.md).

- Publications: `src/data/publications.js`. Representative figures are stored in `public/assets/images/figures/`.
- News: `src/data/news.js`.
- Email, profile links, menu, and footer links: `src/data/site.js`.
- Page text: `src/pages/`.
- Lab member photos and CVs: one folder per person in `public/assets/people/` (see the README there).
- Other images: `public/assets/images/`.

## Deployment on GitHub Pages

The site is served from this repository (`PARCE-Lab/webpage`) as a GitHub Pages project site at `https://parce-lab.github.io/webpage/`, so Vite builds with `base: '/webpage/'` (see `vite.config.js`). Pushing to `main` (or `master`) runs `.github/workflows/deploy.yml`, which builds the site and publishes it. In the repository settings, under **Pages → Build and deployment → Source**, select **GitHub Actions**. If the repository is ever renamed or moved to a custom domain, update `base` in `vite.config.js` and the absolute URLs in `index.html`, `public/sitemap.xml`, `public/robots.txt`, and `src/data/site.js`.
