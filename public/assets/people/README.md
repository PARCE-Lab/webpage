# Lab member files

One folder per lab member, named after the person in lowercase with hyphens
(for example `gustavo-cardona/`). Use the same file names in every folder:

- `photo.webp` (or `photo.jpg`): portrait shown on the People page, about 800 px wide
- `cv.pdf`: CV, if the member has one

Members without a photo show `placeholder.svg` (in this folder) automatically.

Folders that only hold `.gitkeep` are waiting for that member's files; delete
`.gitkeep` once a photo is added.

Files are served from `/assets/people/<folder>/<file>`, e.g.
`/assets/people/gustavo-cardona/photo.webp`. To show a student's photo, set
`photo: '/assets/people/<folder>/photo.jpg'` on their entry in
`src/pages/People.jsx`.
