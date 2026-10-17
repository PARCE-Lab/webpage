# PARCE-LAB Website: Developer Manual

How the code is organized, how branches work, and how a change travels from your computer to the public site.

To add news, publications, or people without touching code, see [MANUAL.md](MANUAL.md).

## Contents

1. [Setup](#1-setup)
2. [Branching model](#2-branching-model)
3. [Branch naming](#3-branch-naming)
4. [Workflows](#4-workflows)
5. [Pull requests](#5-pull-requests)
6. [Commit messages](#6-commit-messages)
7. [Checks before every pull request](#7-checks-before-every-pull-request)
8. [Deployment](#8-deployment)
9. [Project structure and conventions](#9-project-structure-and-conventions)
10. [Recommended GitHub settings](#10-recommended-github-settings)

---

## 1. Setup

You need Node.js 20 or newer and Git.

```
git clone https://github.com/PARCE-Lab/webpage.git
cd webpage
npm install
npm run dev        # http://localhost:5173/webpage/
```

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload at http://localhost:5173/webpage/ |
| `npm run build` | Production build into `dist/` (also creates `dist/404.html` for GitHub Pages) |
| `npm run preview` | Serves the production build at http://localhost:4173/webpage/ |

There is no linter or test suite. `npm run build` is the required check (section 7).

---

## 2. Branching model

```
 hotfix/* ───────────────────────────────┐
                                         ▼
 main  ●────────────────────────●────────●───────▶  public site (auto-deploy)
        ▲                       ▲        │
 qa    ●───────────────●────────┘        │          review before release
        ▲               ▲                │
 dev   ●──────●────────●┘◀───────────────┘ (hotfix merged back)
        ▲      ▲
 feature/*   bugfix/*                               your work
```

### Long-lived branches

| Branch | Purpose | Who merges into it | Deployed? |
|---|---|---|---|
| `main` | Production: exactly what is on https://parce-lab.github.io/webpage/ | Only `qa` (releases) and `hotfix/*` | **Yes**, automatically on every push |
| `qa` | Release candidate. The lab reviews the site here before it goes public. | Only `dev` | No; review it locally (section 4.3) |
| `dev` | Integration: finished features and fixes come together here. | `feature/*`, `bugfix/*`, and `main` after a hotfix | No |

Never commit directly to `main`, `qa`, or `dev`. Changes reach them only through pull requests.

### Short-lived branches

| Prefix | Use it for | Branch from | Merge into |
|---|---|---|---|
| `feature/` | New pages, sections, components, or content | `dev` | `dev` |
| `bugfix/` | Fixing something wrong that is **not yet** on the public site | `dev` | `dev` |
| `hotfix/` | Urgent fix for something broken **on the public site** | `main` | `main`, then `main` → `dev` |

Delete short-lived branches after they are merged.

---

## 3. Branch naming

`<prefix>/<short-description-in-kebab-case>`. Lowercase, words separated by hyphens, no spaces or accents.

| Good | Avoid |
|---|---|
| `feature/keyword-graph` | `feature/KeywordGraph`, `my-branch` |
| `feature/add-kenneth-profile` | `feature/changes`, `feature/david` |
| `bugfix/people-photo-crop` | `fix`, `bugfix/fix` |
| `hotfix/broken-cv-link` | `hotfix/urgent!!!` |

The name should say what the branch does, so the branch list stays readable.

---

## 4. Workflows

Always start from an up-to-date base branch.

### 4.1 Feature or bugfix

```
git checkout dev
git pull
git checkout -b feature/latest-publication-card     # or bugfix/...

# work, commit often
git add -A
git commit -m "Add latest publication card to Home"

npm run build                                         # must succeed (section 7)
git push -u origin feature/latest-publication-card
```

Then on GitHub, open a pull request **into `dev`** (section 5). After it is merged:

```
git checkout dev
git pull
git branch -d feature/latest-publication-card
```

If `dev` moved on while you were working, bring those changes in before opening the pull request:

```
git checkout feature/latest-publication-card
git merge dev            # resolve any conflicts, then build again
```

### 4.2 Release: `dev` → `qa` → `main`

When `dev` has a set of changes ready to go public:

1. Open a pull request **`dev` → `qa`** and merge it.
2. **Review `qa`.** Check out `qa`, run `npm run build && npm run preview`, and go through the checklist in section 7 on every page. Ideally Dr. Cardona reviews too.
3. If something is wrong, fix it with a `bugfix/*` branch into `dev`, then merge `dev` → `qa` again.
4. Open a pull request **`qa` → `main`** and merge it. This publishes the site (section 8).

### 4.3 Hotfix: something is broken on the public site

```
git checkout main
git pull
git checkout -b hotfix/broken-cv-link

# smallest possible fix
git commit -am "Fix CV link on People page"
npm run build
git push -u origin hotfix/broken-cv-link
```

1. Open a pull request **`hotfix/broken-cv-link` → `main`** and merge it. The fix deploys immediately.
2. Bring the fix back to the other branches, so the next release doesn't undo it: open a pull request **`main` → `dev`** and merge it. If `qa` currently holds a release, also merge `main` → `qa`.

Keep hotfixes small: only the fix, with no new features or clean-ups.

---

## 5. Pull requests

- **Target branch:** `feature/*` and `bugfix/*` go into `dev`, `dev` goes into `qa`, `qa` and `hotfix/*` go into `main`. Double-check the **base** branch on GitHub before creating the pull request.
- **Title:** a short summary in the imperative, like a commit message: "Add Facilities page photos".
- **Description:** what changed, why, and how you checked it. Include screenshots for visual changes, on desktop and phone width.
- **Size:** one topic per pull request. Small pull requests get reviewed and merged faster.
- **Review:** at least one other lab member approves before merging into `qa` or `main`. Merges into `dev` can be self-merged for small changes if the team agrees.
- **Merge method:** use **Create a merge commit** for `dev` → `qa` → `main` and hotfix back-merges, so the branches share history. For `feature/*` and `bugfix/*` into `dev`, either merge or **Squash and merge** is fine; pick one as a team and stay consistent.

---

## 6. Commit messages

```
Add keyword graph to the Research page

- Optional body explaining what and why, wrapped at ~72 characters
- Bullet points are fine
```

- **First line:** imperative mood ("Add", "Fix", "Update", "Remove"), at most about 65 characters, no period at the end.
- **Scope:** one logical change per commit. Don't mix a content update with an unrelated code change.
- **Secrets:** never commit secrets or personal data that should not be public. Everything in this repository is public, including its history.

---

## 7. Checks before every pull request

1. `npm run build` finishes with `✓ built` and no errors.
2. `npm run preview`, then click through every page you touched at http://localhost:4173/webpage/:
   - text, images, and figures appear, and enlargeable figures open
   - links work, including links to sections such as `/research#formal`
   - the layout works at phone width (about 390 px) as well as on desktop
   - the browser console (F12) shows no red errors
3. New images are WebP, sized for display, and have alt text (see MANUAL.md section 9).
4. If you added a page, it is in `src/App.jsx`, `src/data/site.js` (menu and footer), and `public/sitemap.xml`.

---

## 8. Deployment

- The site is a GitHub Pages **project site** served at **https://parce-lab.github.io/webpage/**.
- Every push to `main` runs `.github/workflows/deploy.yml`: it installs dependencies, runs `npm run build`, and publishes `dist/`. Follow it in the repository's **Actions** tab. A green check means the site is live, usually within two minutes.
- Pushes to `dev`, `qa`, and other branches do **not** deploy.
- **First-time setup:** Settings → Pages → Source = **GitHub Actions** (needs admin rights on the repository).
- **Rolling back:** revert the bad merge on `main` (`git revert -m 1 <merge-commit>` through a hotfix branch and pull request). The previous version deploys again.

---

## 9. Project structure and conventions

```
src/
  main.jsx            entry point: router (basename = /webpage), Motion config
  App.jsx             routes
  components/         Layout, Header, Footer, Lightbox, KeywordGraph, motion helpers…
  pages/              one file per page
  data/               content: news.js, publications.js, research.js, site.js
  utils/asset.js      asset() helper for the /webpage/ base path
  styles.css          single global stylesheet
public/               copied as-is to the site (images, CVs, favicons, sitemap)
.github/workflows/    deploy.yml
```

The key rules (more detail in `CLAUDE.md`):

- **Base path.** The site lives under `/webpage/` (`base` in `vite.config.js`).
  - Write file paths root-style (`/assets/images/x.webp`) and pass them through `asset()` wherever they become an `<img src>` or a file `href`. `<Zoomable>` already does this.
  - Router links (`<Link to="/research">`) need nothing extra.
- **Content belongs in the data files** (`src/data/*.js`) or in the lists at the top of a page, not scattered through the components.
- **Styles** go in `src/styles.css`. Use the design tokens in `:root` (`--ink`, `--gold`, `--muted`, `--line`, …) instead of new colors, and the existing breakpoints (1120px, 760px, 460px).
- **Animation** uses the helpers in `components/motion.jsx` (`Reveal`, `Stagger`, `StaggerItem`). Respect reduced motion: the site already wraps everything in `MotionConfig reducedMotion="user"`.
- **Accessibility:** every image needs `alt` text (empty `alt=""` only for decoration), every interactive element must work with the keyboard, and don't use color as the only signal.
- **Dependencies:** add new npm packages only when necessary. Install with `npm install <pkg>` so `package-lock.json` is updated, and commit both files.

---

## 10. Recommended GitHub settings

Repository admins can enforce this workflow under **Settings → Branches → Add branch ruleset** (or "branch protection rules"):

| Branch | Recommended rules |
|---|---|
| `main` | Require a pull request before merging, with 1 approval. Block force pushes and deletion. |
| `qa` | Require a pull request before merging. Block force pushes and deletion. |
| `dev` | Require a pull request before merging. Block force pushes. |

Also enable **Settings → General → Automatically delete head branches**, so merged `feature/*`, `bugfix/*`, and `hotfix/*` branches are cleaned up.
