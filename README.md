# Phoneme Wordle

A frontend **activity builder** for Speech Pathology teachers. It lets a teacher
configure and preview two phoneme-based classroom activities — a **Wordle** and
a **Word Search** — and export each as a single, self-contained, playable
`.html` file that runs offline with no dependencies.

Built for La Trobe **CSE3CWA (Cloud Web Apps), Assessment 1**. This assessment
is **frontend only**: no database and no dynamic word lists (those come in
Assessment 2). Theme preference is the only persisted state, stored in a cookie.

## Features

- **Wordle builder** — pick a difficulty tier; the target is drawn from a pool
  of pre-built phoneme words. Guesses are made of phoneme tiles (not letters),
  with standard green/yellow/grey feedback applied to phoneme identity.
- **Word Search builder** — pick a target phoneme; ~5 English words containing
  that sound are placed on a generated grid.
- **Phoneme hints** — every phoneme shows an accessible tooltip on hover *and*
  focus, e.g. `/θ/` → "TH (as in thin)".
- **Single-file HTML export** — one Generate click produces one fully
  self-contained `.html` (inline CSS/JS, system fonts, zero external requests)
  that plays by double-click, offline.
- **Light/dark theme** — persisted in a cookie and applied server-side, so there
  is no flash of the wrong theme on load.
- **Accessible & responsive** — semantic landmarks, keyboard support, visible
  focus, and a layout that adapts from wide nav tabs to a hamburger menu.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router)
- TypeScript (strict)
- [Tailwind CSS 4](https://tailwindcss.com)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint
```

## Project structure

```
app/                # App Router routes: Home, About, Wordle, Word Search, Settings
components/         # UI: layout chrome, phoneme controls, activity builders
lib/
  types.ts          # shared domain types (Phoneme, WordleConfig, …)
  theme.ts          # theme constants + cookie helpers
  data/
    phoneme-word-list.json   # single source of truth (43 phonemes, word pools)
    index.ts                 # typed accessors over the dataset
  html-export/      # config → self-contained playable .html
```

The dataset covers the 43-phoneme Australian English inventory, 90 pre-built
Wordle words (30 per difficulty tier), and one Word Search word pool per
phoneme. Components read it only through the typed accessors in
`lib/data/index.ts`.
