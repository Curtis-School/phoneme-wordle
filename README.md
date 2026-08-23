# Phoneme Wordle

A frontend **activity builder** for Speech Pathology teachers. It lets a teacher
preview two phoneme-based classroom activities — a **Wordle** and a **Word
Search** — and export each as a single, self-contained, playable `.html` file
that runs offline with no dependencies.

Built for La Trobe **CSE3CWA (Cloud Web Apps)**. Assessment 1 delivered the
builder against a bundled dataset; **Assessment 2** replaces that dataset with
[`phoneme-api`](https://github.com/Curtis-School/phoneme-api), so every puzzle
is now generated from the database on each request. Display preferences remain
in three cookies.

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

The activity API must be running first — the builder pages have no bundled
content of their own. In `phoneme-api`, run `npm run dev` (or
`docker compose up`); it listens on **3001**.

```bash
npm install
cp .env.example .env.local   # API_BASE_URL=http://localhost:3001
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If the API is down the
builder pages say so and explain how to start it, rather than failing.

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
  ui/                   # Card, PageShell, ApiErrorNotice
  phoneme/PhonemeTile   # the shared tile (IPA ⇄ English, tone, tooltip)
  wordle/               # WordleGame, WordleBoard, PhonemeKeyboard, ExportButton,
                        # DifficultySelector, WordControls, WordBuilder
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
  word-actions.ts       # Server Action that saves a built word
  g2p.ts                # spelling -> sounds, as a correctable draft
  api/
    types.ts                 # the shapes phoneme-api returns
    client.ts                # server-only fetch wrapper + endpoint calls
    builder.ts               # loads a builder page's data, or explains why it can't
  html-export/          # config → self-contained playable .html
    shell.ts                 # document skeleton, base styles, escaping
    wordle-template.ts       # Wordle markup + inlined vanilla-JS game
    word-search-template.ts  # Word Search markup + inlined vanilla-JS game
    download.ts              # Blob → download
```

## Data

Every phoneme, word and activity comes from `phoneme-api`. The builder fetches
on the server only, so `API_BASE_URL` never reaches the browser and there is no
CORS to configure; `lib/api/client.ts` is marked `server-only` so an accidental
client import is a build error rather than a leak.

| Call | Used for |
| --- | --- |
| `GET /api/activities?type=` | The saved configurations a builder page can render. |
| `GET /api/activities/:id/generate` | A playable config — `WordleConfig` / `WordSearchConfig` verbatim. |
| `GET /api/phonemes` | Keyboard keys, word-search fillers, and the sound picker. |
| `POST /api/words` | Creating a word from the sound picker. |
| `GET`/`PATCH` `/api/word-lists/:id` | Adding that word to a difficulty's list. |

`generate` is drawn fresh on every request, so **reloading `/wordle` gives a
different word** from the activity's word list — the fixed puzzle of Assessment
1 is gone. A word search comes back with the `seed` the API used, and handing
that to `generateWordSearch` reproduces both the word selection and the grid,
because both sides run the same `mulberry32` PRNG.

Add `?activity=<id>` to `/wordle` or `/word-search` to render a specific saved
activity; without it the first one of that type is used. Every call sets
`cache: "no-store"` — Next's default would otherwise fetch once during
`next build` and serve that one puzzle forever.

## Difficulty

The Wordle's difficulty selector switches between saved activities via
`?difficulty=easy|medium|hard`, each with its own word list:

| Difficulty | Word length | Guesses | List |
| --- | --- | --- | --- |
| easy | 3 sounds | 5 | easy Wordle words |
| medium | 4 sounds | 6 | medium Wordle words |
| hard | 5 sounds | 7 | hard Wordle words |

Length and list travel together, so difficulty is a *selection*, not a setting:
patching one activity's `wordLength` would return `409 UNSATISFIABLE`, because
its list holds no word of the new length.

## Choosing the word

The answer key carries two controls. **Reload** draws another random word from the
difficulty's list. **Edit** opens a builder where the sounds appear as you type:

```
snake          ->  /s/ /n/ /æɪ/ /k/     4 of 4 sounds — ready.
                    s   n   a_e   k
```

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
