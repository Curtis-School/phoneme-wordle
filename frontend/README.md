# Phoneme Wordle

A frontend **activity builder** for Speech Pathology teachers: preview two
phoneme-based classroom activities — a **Wordle** and a **Word Search** — and
export each as a single self-contained `.html` file that plays offline.

Built for La Trobe **CSE3CWA**. Assessment 2 replaces Assessment 1's bundled
dataset with [`phoneme-api`](https://github.com/Curtis-School/phoneme-api), so
every puzzle is generated from the database on each request.

## Features

- **Phoneme Wordle** — guess the hidden word using phoneme tiles instead of
  letters, with green/yellow/grey feedback on phoneme identity. On-screen
  keyboard, `Enter`/`Backspace`, New round, and a teacher-facing answer key.
- **Phoneme Word Search** — drag across a generated grid to find every word
  containing the target sound. Progress meter, Reveal answers, Shuffle grid.
- **Settings** — theme, IPA-vs-English tiles at rest, and hint tooltips. Read
  server-side, so first paint is correct with no theme flash.
- **Phoneme hints** — tooltips like `/θ/` → "TH (as in thin)"; the symbol not
  shown at rest is revealed on hover.
- **Single-file export** — inline CSS/JS, system fonts, zero external requests;
  mirrors the settings shown in the builder.
- **Accessible & responsive** — semantic landmarks, live regions, visible
  focus, nav tabs collapsing to a hamburger menu.

## Tech stack

Next.js 16 (App Router, Server Components, Server Actions), React 19,
TypeScript (strict), Tailwind CSS 4. No other runtime dependencies.

## Getting started

Start the activity API first — the builder pages have no bundled content. In
`phoneme-api`, run `npm run dev` (or `docker compose up`); it listens on **3001**.

```bash
npm install
cp .env.example .env.local   # API_BASE_URL=http://localhost:3001
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If the API is down, the
builder pages say so and explain how to start it rather than failing.

`npm run build` / `npm run start` / `npm run lint` are the other scripts.

## Project structure

```
app/         routes: home, wordle, word-search, settings, about + globals.css
components/  layout/, ui/, phoneme/, wordle/, wordsearch/
lib/
  types.ts settings*.ts site.ts phoneme.ts icons.tsx
  wordle.ts wordsearch.ts   guess evaluation, seeded grid generation
  g2p.ts                    spelling -> sounds, as a correctable draft
  *-actions.ts              Server Actions (words, activities, settings)
  api/                      server-only client + per-page data loaders
  html-export/              config -> self-contained playable .html
```

## Data

Everything comes from `phoneme-api`, fetched on the server only — `API_BASE_URL`
never reaches the browser and there is no CORS to configure. `lib/api/client.ts`
is marked `server-only`, so an accidental client import is a build error.

| Call | Used for |
| --- | --- |
| `GET /api/activities?type=` | The saved configurations a builder page can render. |
| `GET /api/activities/:id` | Reopening a saved activity from the activities dialog. |
| `PATCH /api/activities/:id` | Writing an edited activity back over the one it was opened from. |
| `GET /api/activities/:id/generate` | A playable `WordleConfig` / `WordSearchConfig`. |
| `GET /api/phonemes` | Keyboard keys, word-search fillers, the sound picker. |
| `POST /api/words` | Creating a word from the sound picker. |
| `GET`/`PATCH` `/api/word-lists/:id` | Adding that word to a difficulty's list. |

`generate` is drawn fresh each request, so reloading `/wordle` gives a different
word from the activity's list. A word search returns the `seed` the API used;
handing that to `generateWordSearch` reproduces both the word selection and the
grid, since both sides run the same `mulberry32` PRNG.

Every call sets `cache: "no-store"` — Next's default would fetch once during
`next build` and serve that one puzzle forever.

## Opening a saved activity

Clicking a row in the saved-activities dialog navigates to `?activity=<id>`, which both
pages also accept directly. A word search opened that way loads the activity's own sound,
word list and seed, so it reproduces the puzzle as saved rather than the sound's default
list. Edit the clues, shuffle the grid, then Save — the dialog offers to update that
activity in place, or to branch off a new one and leave the original alone. Changing the
difficulty or drawing a new sound drops the parameter, which is how you leave the activity.

## Difficulty

The Wordle's selector switches between saved activities via
`?difficulty=easy|medium|hard`, each with its own word list:

| Difficulty | Word length | Guesses |
| --- | --- | --- |
| easy | 3 sounds | 5 |
| medium | 4 sounds | 6 |
| hard | 5 sounds | 7 |

Length and list travel together, so difficulty is a *selection*, not a setting:
patching one activity's `wordLength` returns `409 UNSATISFIABLE`, because its
list holds no word of the new length.

## Choosing the word

The answer key carries two controls. **Reload** draws another random word from
the difficulty's list. **Edit** opens a builder where sounds appear as you type:

```
snake          ->  /s/ /n/ /æɪ/ /k/     4 of 4 sounds — ready.
                    s   n   a_e   k
```

## Settings and persistence

Three cookies (one year, `SameSite=Lax`), written by Server Actions in
`lib/settings-actions.ts` and read on the server in `lib/settings-cookie.ts`:

| Cookie | Values | Effect |
| --- | --- | --- |
| `theme` | `light` \| `dark` | Sets `<html data-theme>` for the whole app |
| `symbol_display` | `ipa` \| `english` | Which symbol tiles show at rest |
| `tooltips` | `on` \| `off` | Whether hint tooltips are attached to tiles |

All three are baked into exported HTML files, so an export matches what the
teacher previewed.
