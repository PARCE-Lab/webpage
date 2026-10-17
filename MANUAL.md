# PARCE-LAB Website Manual

How to update the content of the lab website: news, publications, people, research, and contact details. You don't need to know React. Most updates mean editing a list in one file and copying the format of the entries already there.

## Contents

1. [Before you start](#1-before-you-start)
2. [Where everything lives](#2-where-everything-lives)
3. [Add news](#3-add-news)
4. [Add a publication](#4-add-a-publication)
5. [Add or update a lab member](#5-add-or-update-a-lab-member)
6. [Update research thrusts and the keyword graph](#6-update-research-thrusts-and-the-keyword-graph)
7. [Update contact details and links](#7-update-contact-details-and-links)
8. [Other pages](#8-other-pages)
9. [Images and files](#9-images-and-files)
10. [Check your changes and publish](#10-check-your-changes-and-publish)
11. [Common mistakes](#11-common-mistakes)

---

## 1. Before you start

You need [Node.js](https://nodejs.org) 20 or newer and Git. Open a terminal in the project folder and run, once:

```
npm install
```

Then start the local preview:

```
npm run dev
```

Open http://localhost:5173/webpage/. The page refreshes by itself every time you save a file, so you can see each change as you make it. Stop the preview with `Ctrl + C`.

---

## 2. Where everything lives

| To change… | Edit this file |
|---|---|
| News | `src/data/news.js` |
| Publications | `src/data/publications.js` |
| Students (Ph.D. and undergraduate) | `src/pages/People.jsx`, lists at the top |
| Principal investigator text | `src/pages/People.jsx`, "Principal Investigator" section |
| Photos and CVs of lab members | `public/assets/people/<first-last>/` |
| Research thrusts and keywords | `src/data/research.js` |
| Keyword-graph connections | `src/data/research.js`, `keywordLinks` |
| Email, Google Scholar, LinkedIn, CV link | `src/data/site.js` |
| Menu and footer links | `src/data/site.js` |
| Facilities, Teaching, Join, Contact text | `src/pages/<Page>.jsx` |
| Figures for publications and research | `public/assets/images/figures/` |

---

## 3. Add news

Open `src/data/news.js`. News items are listed **newest first**, so add the new item at the **top** of the list, right after `export const news = [`.

Copy this template:

```js
  {
    date: 'October 2026',
    category: 'Lab',
    title: 'One-sentence headline ending with a period.',
    summary: 'Optional shorter headline for the Home page.',
    body: [
      'First paragraph: what happened, who was involved, and where.',
      'Optional second paragraph with context or what comes next.',
    ],
    image: '/assets/images/figures/your-figure.png',
    imageAlt: 'Short description of the image for screen readers',
    links: [
      { label: 'Publications', to: '/publications' },
      { label: 'Read the article', to: 'https://doi.org/...' },
    ],
  },
```

| Field | Required | Notes |
|---|---|---|
| `date` | Yes | Written as you want it shown, e.g. `'October 2026'` or `'2025'`. |
| `category` | Recommended | One of `Lab`, `Publication`, `Award`, `People`, `Event`. |
| `title` | Yes | The headline. Must be different from every other news title. |
| `summary` | No | Shorter headline used on the Home page. If omitted, the title is used. |
| `body` | No | A list of paragraphs, each in quotes and followed by a comma. |
| `image`, `imageAlt` | No | A figure shown to the right of the text. Put the file in `public/assets/images/figures/` first. |
| `links` | No | Buttons under the text. `to` can be a page on this site (`/people`, `/research#formal`) or a full web address starting with `https://`. |

The **Home page** shows the 3 newest items automatically. The **News page** shows all of them.

**Writing tips:** keep a formal third-person tone ("PARCE-LAB presents…", "Gustavo A. Cardona received…"), write the full names of people and venues, and only state facts you can confirm.

---

## 4. Add a publication

Open `src/data/publications.js`. Publications are listed **newest first**. Add the new entry at the top of its year.

Template:

```js
  {
    "year": 2026,
    "type": "journal",
    "title": "Full Title of the Paper",
    "authors": "A. Author, G. A. Cardona, and B. Author",
    "venue": "Journal or Conference Name, volume, pages",
    "link": "https://doi.org/...",
    "image": "/assets/images/figures/your-figure.png",
    "imageAlt": "Short description of the figure"
  },
```

| Field | Required | Notes |
|---|---|---|
| `year` | Yes | A number, without quotes: `2026`. |
| `type` | Yes | Exactly one of `"journal"`, `"conference"`, or `"software"`. These match the filter buttons on the Publications page. |
| `title` | Yes | The paper title. |
| `authors` | Yes | In the format already used: initials, then last name, with "and" before the last author. |
| `venue` | Yes | Journal or conference, plus volume and pages if known. |
| `link` | No | DOI, publisher page, or arXiv. Adds a link to the paper. |
| `image`, `imageAlt` | No | A representative figure shown next to the entry. |

This file uses double quotes (`"`) around field names and values. Keep that style, and don't forget the comma between entries.

When a new paper comes out, consider also adding a news item for it (section 3).

---

## 5. Add or update a lab member

### 5.1 Create the member's folder

Each person has a folder in `public/assets/people/`, named in lowercase with hyphens:

```
public/assets/people/
├── placeholder.svg        robot image used when someone has no photo
├── gustavo-cardona/       photo.webp, cv.pdf
├── david-paez/
├── kenneth-white/
└── timothy-wondree/
```

For a new member, create a folder like `public/assets/people/jane-doe/`. Inside it, use these exact file names:

- `photo.webp` (or `photo.jpg`): a portrait, preferably square, about 800 px wide (see section 9 for converting)
- `cv.pdf`: optional

If a folder only contains a `.gitkeep` file, it's waiting for that person's photo. Delete `.gitkeep` once you add the photo.

### 5.2 Add the person to the People page

Open `src/pages/People.jsx`. Near the top there are two lists: `graduateStudents` (Ph.D. and master's) and `undergraduateStudents`. Add the person to the right list:

```js
  {
    name: 'Jane Doe',
    role: 'Ph.D. Student · Mechanical and Nuclear Engineering',
    bio: 'Jane is a Ph.D. student in the Department of Mechanical and Nuclear Engineering at Virginia Commonwealth University. Her research focuses on …',
    photo: '/assets/people/jane-doe/photo.jpg',
    email: 'doej@vcu.edu',
    scholar: 'https://scholar.google.com/citations?user=...',
    cv: '/assets/people/jane-doe/cv.pdf',
    linkedin: 'https://www.linkedin.com/in/...',
  },
```

| Field | Required | Notes |
|---|---|---|
| `name`, `role`, `bio` | Yes | Shown on the card. |
| `photo` | No | Without it, the card shows the robot placeholder. |
| `email`, `scholar`, `cv`, `linkedin` | No | Each one turns its button on. Missing ones are shown greyed out and can't be clicked. |
| `note` | No | Shows a "Profile in progress." line. **Remove it** once the profile is complete. |

To **update** someone, edit their entry. To **remove** someone (for example, after graduation), delete their whole `{ … },` block. Their folder can stay.

### 5.3 Principal investigator

Dr. Cardona's text is written directly in the "Principal Investigator" section of `src/pages/People.jsx`. His email, Google Scholar, LinkedIn, and CV links come from `src/data/site.js` (section 7). The Home page shows the same photo.

---

## 6. Update research thrusts and the keyword graph

Open `src/data/research.js`.

**Research thrusts** (`thrusts`): each thrust has:
- `id`: used in links such as `/research#formal`. Don't change existing ids.
- `short`: the label in the keyword graph
- `title`, `text`
- `image`, `alt`, `caption`
- `tags`: the keywords

Editing `tags` changes both the keyword chips and the graph.

**Keyword graph connections** (`keywordLinks`): each line connects two keywords from different thrusts:

```js
  { a: 'Weighted STL', b: 'Partial satisfaction', why: 'One sentence explaining the connection.' },
```

`a` and `b` must match a tag **exactly**, including capitals and dashes. Otherwise the line is silently skipped. The `why` text appears when a visitor hovers over either keyword.

---

## 7. Update contact details and links

Open `src/data/site.js`:

- `EMAIL`: the lab contact email, used on People, Contact, Join, and the footer
- `CV_URL`, `SCHOLAR_URL`, `LINKEDIN_URL`: Dr. Cardona's profile buttons
- `DEPARTMENT_URL`: the link to the VCU department
- `NAV_ITEMS`: the top menu, in order
- `FOOTER_EXPLORE`: the footer links

---

## 8. Other pages

The Facilities, Teaching, Join, and Contact pages keep their text inside the page file itself (`src/pages/Facilities.jsx`, etc.). Lists such as `platforms` in Facilities or `areas` in Teaching are at the top of each file. Edit the text between quotes and leave the rest unchanged.

**Adding a completely new page** needs some code changes: a route in `src/App.jsx`, a menu entry in `src/data/site.js`, and a line in `public/sitemap.xml`. Ask whoever maintains the code, or follow `CLAUDE.md`.

---

## 9. Images and files

- **Location:** everything in `public/` is published as-is. A file at `public/assets/images/figures/robot.png` is referenced in the code as `/assets/images/figures/robot.png`, without `public`. Don't add `/webpage` yourself: the site adds it automatically.
- **File names:** lowercase, with hyphens and no spaces, e.g. `catenary-robot.jpg`.
- **Size:** keep each image under about 150 KB and no wider than 1600 px (800 px for portraits). Big files make the site slow, especially on phones.
- **Format:** prefer `.webp`; it is several times smaller than `.png` or `.jpg` at the same quality. Convert with a free tool such as https://squoosh.app (choose WebP, quality 80–90, and resize). `.jpg` is fine for small photos.
- **Link preview image:** `public/assets/images/og-image.jpg` (1200×630) is the picture shown when the site is shared on LinkedIn, Slack, etc. Replace it with the same size and name to change it.
- **Always write an `alt` / `imageAlt` description.** It's read aloud for visitors who can't see the image.

---

## 10. Check your changes and publish

1. **Preview locally.** With `npm run dev` running, check every page you touched at http://localhost:5173/webpage/. Also check a narrow window (phone size).
2. **Run the production build**, which catches errors the preview can miss:
   ```
   npm run build
   ```
   It must end with `✓ built`. If it shows an error, it names the file and line; usually it's a missing comma or quote.
3. **Commit** on your working branch with a clear message, for example:
   ```
   git add -A
   git commit -m "Add news: paper accepted at ICRA 2027"
   git push
   ```
4. **Go live.** The public site at https://parce-lab.github.io/webpage/ is rebuilt automatically whenever changes reach the `main` branch. Merge your branch through a pull request on GitHub, then check the **Actions** tab: a green check means the site was updated, usually within two minutes.

---

## 11. Common mistakes

| Symptom | Likely cause |
|---|---|
| Blank page or a red error in the preview | Missing comma between entries, or a missing closing quote or bracket. Look at the line you last edited. |
| Text with an apostrophe breaks the file | In files using single quotes, write `’` (typographic apostrophe) or `\'` instead of `'`. For example, `'the lab’s research'`. |
| Image doesn't appear | The path is wrong. It must start with `/assets/...` (no `public`) and match the file name exactly, including capitals and the extension. |
| A keyword-graph line is missing | `a` or `b` in `keywordLinks` doesn't exactly match a tag. |
| Publication doesn't show under a filter | `type` isn't exactly `"journal"`, `"conference"`, or `"software"`. |
| Two news items behave strangely | Two news items have the same `title`. Titles must be unique. |
| Change not on the live site | It hasn't reached `main` yet, or the deploy failed. Check the Actions tab on GitHub. |
