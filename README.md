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
npm run dev       # local dev server with hot reload at http://localhost:5173
npm run build     # production build into dist/
npm run preview   # serve the production build at http://localhost:4173
```

## Editing content

See [MANUAL.md](MANUAL.md) for step-by-step instructions and templates for adding news, publications, people, and more.

- Publications: `src/data/publications.js`. Representative figures are stored in `public/assets/images/figures/`.
- News: `src/data/news.js`.
- Email, profile links, menu, and footer links: `src/data/site.js`.
- Page text: `src/pages/`.
- Lab member photos and CVs: one folder per person in `public/assets/people/` (see the README there).
- Other images: `public/assets/images/`.

## Deployment on GitHub Pages

For the organization site, use the repository `PARCE-Lab/PARCE-Lab.github.io`. Pushing to `main` (or `master`) runs `.github/workflows/deploy.yml`, which builds the site and publishes it. In the repository settings, under **Pages → Build and deployment → Source**, select **GitHub Actions**. The site address will be `https://parce-lab.github.io`.
