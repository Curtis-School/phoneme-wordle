# Phoneme Wordle

A frontend **activity builder** for Speech Pathology teachers. It lets a teacher
preview two phoneme-based classroom activities — a **Wordle** and a **Word
Search** — and export each as a single, self-contained, playable `.html` file
that runs offline with no dependencies.

Built for La Trobe **CSE3CWA (Cloud Web Apps), Assessment 1**. This assessment is **frontend only** and each activity is currently locked to one puzzle drawn from a bundled dataset.
Picking a difficulty tier or a target phoneme comes in Assessment 2, when the
backend lands. The only persisted state is three preference cookies.

## Features

- **Phoneme Wordle** — guess the hidden word using phoneme tiles rather than
  letters. Standard green / yellow / grey feedback, applied to phoneme identity.
  Includes an on-screen phoneme keyboard, physical `Enter` / `Backspace`
  support, a New round reset, and a teacher-facing answer key.
- **Phoneme Word Search** — drag across a generated grid to find every word
  containing the target sound. Progress meter, Reveal answers toggle, and a
  Shuffle grid button that re-seeds the generator for a fresh layout.
- **Settings** — light/dark theme, whether tiles show the IPA symbol or the
  English letter at rest, and whether phoneme hint tooltips appear. All three
  are read server-side, so the page renders correctly on first paint with no
  flash of the wrong theme.
- **Phoneme hints** — every tile and key carries a hover tooltip, e.g. `/θ/` →
  "TH (as in thin)". The symbol not shown at rest is revealed on hover.
- **Single-file HTML export** — one click produces a fully self-contained
  `.html` (inline CSS/JS, system fonts, zero external requests) that plays by
  double-click, offline, and mirrors the settings shown in the builder.
- **Accessible & responsive** — semantic landmarks, `role="status"` live
  regions, visible focus, and a layout that adapts from wide nav tabs to a
  hamburger menu.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Server Components, Server
  Actions)
- React 19
- TypeScript (strict)
- [Tailwind CSS 4](https://tailwindcss.com)

No runtime dependencies beyond these.

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
app/
  layout.tsx            # reads the theme cookie, sets <html data-theme>
  page.tsx              # home — activity picker
  about/                # unit + author details
  wordle/               # Wordle builder
  word-search/          # Word Search builder
  settings/             # theme, tile display, tooltips
  globals.css           # theme tokens + Tailwind theme mapping

components/
  layout/               # Header, Footer, NavBar, HamburgerMenu
  ui/                   # Card, PageShell
  phoneme/PhonemeTile   # the shared tile (IPA ⇄ English, tone, tooltip)
  wordle/               # WordleGame, WordleBoard, PhonemeKeyboard, ExportButton
  wordsearch/           # WordSearchActivity, WordSearchGame, WordSearchClues,
                        # ExportButton

lib/
  types.ts              # shared domain types (Phoneme, WordleConfig, …)
  site.ts               # site metadata + nav links
  phoneme.ts            # phonemeHint() — the tooltip string
  wordle.ts             # keyboard construction + guess evaluation
  wordsearch.ts         # seeded grid generation + selection matching
  settings.ts           # cookie names, defaults, validation/normalisation
  settings-cookie.ts    # server-side cookie reads
  settings-actions.ts   # Server Actions that write the cookies
  data/
    phoneme-word-list.json   # single source of truth
    index.ts                 # typed accessors over the dataset
  html-export/          # config → self-contained playable .html
    shell.ts                 # document skeleton, base styles, escaping
    wordle-template.ts       # Wordle markup + inlined vanilla-JS game
    word-search-template.ts  # Word Search markup + inlined vanilla-JS game
    download.ts              # Blob → download
```

## Data

`lib/data/phoneme-word-list.json` covers the 43-phoneme Australian English
inventory, 90 pre-built Wordle words (30 per difficulty tier — easy is 3
sounds, medium 4, hard 5), and one Word Search word pool per phoneme.
Components read it only through the typed accessors in `lib/data/index.ts`.

Assessment 1 uses a fixed slice of that dataset: the first easy Wordle word and
the first Word Search config. The rest of the dataset is already in place for
the Assessment 2 backend, which will drive the selection dynamically.

## Settings and persistence

Preferences are stored in three cookies (one year, `SameSite=Lax`), written by
Server Actions in `lib/settings-actions.ts` and read on the server in
`lib/settings-cookie.ts`:

| Cookie           | Values             | Effect                                      |
| ---------------- | ------------------ | ------------------------------------------- |
| `theme`          | `light` \| `dark`  | Sets `<html data-theme>` for the whole app   |
| `symbol_display` | `ipa` \| `english` | Which symbol tiles show at rest              |
| `tooltips`       | `on` \| `off`      | Whether hint tooltips are attached to tiles  |

All three are baked into exported HTML files, so an export matches what the
teacher previewed.
