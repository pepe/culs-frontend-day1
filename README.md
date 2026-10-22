# The Little Herb Garden

Group **Herbs-Lavender** · *Internet Technologies – Client Side* (CZU Prague, 2026)
Live site: https://nardahgit.github.io/culs-frontend-day1/

## Team

| Participant | GitHub | Main work |
|---|---|---|
| **Fiderana Nardah Mamelphina** (group leader) | `nardahGit` | Led the group: split the tasks, tested and merged everyone's commits, final push and GitHub Pages. Fixed the broken Day 1 starter (file paths, unclosed tag, id mismatches, `herb.json` → `herbs.json`, error message); merged Beqa's lavender page; restyled the site (`style.css`: header, navigation, cards, footer, focus); made the herb cards links. Final polish: the **herb quiz** (`interest.js`), removed the separate React menu link so `index.html` is the main page, wrote this README and `group.md`. |
| **Selinah** (Magadeline Ndlovu in `group.md`) | `selinah3005` | JSON data for all 8 herbs and its format, photos, `#hash` router with friendly errors, herb search, Wikipedia summary, shared visits and likes (`community.js`), "Herb of the day" and annual / perennial filter (`extras.js`), connected Beqa's React version and burger menu. Latest: final fixes (burger menu on small screens, herb colour themes in the dialog, lavender parts, accessibility), removed old React build files, applied Monika's dialog design. |
| **Beqa Davitashvili** | `beqdavita` | Lavender page with clickable plant explorer, herb details dialog, favorites, React version 2.0 (`react/`), burger menu (`menu.js`). |
| **Monika Tasheva** (Monica) | `Monika`, `monica` | CSS design. Latest: colour theme for every herb in `data/<id>.json`, lavender illustration, formatted React herb CSS, close-button design, smaller photo and two-column tips in the herb pop-up, task list in `group.md`. |

## Goal

A small website where a visitor can see eight garden herbs, search and filter
them, read about one, save favorites and **test what they learned in a short
quiz**. Plain HTML, CSS and JavaScript, so a beginner can read and change it.

## Problem and solution

| Problem | Solution |
|---|---|
| The starter page was "broken on purpose": no styles, no herbs (wrong paths, unclosed tag, wrong ids) | Fixed on Day 1, with an error message if loading fails |
| Only lavender had its own page | One page for all herbs; each card opens a dialog with its own address (`index.html#basil`) |
| Texts were written inside the code | One JSON file per herb in one format (`data/<id>.json`) |
| Visitors could only read | Search, filters, favorites, Wikipedia summary, visit and like counts, and a quiz per herb |

## How it works

1. `app.js` loads `data/herbs.json` with `fetch()` and draws the herb cards.
2. Search, **All / Annual / Perennial** and **Herb of the day** (`extras.js`) narrow or pick herbs.
3. A card click sets the address to `#<id>`; the router loads `data/<id>.json` and opens a dialog in the herb's colours. An unknown id shows a friendly message.
4. **♡ Favorites** are saved in `localStorage`. `community.js` shows shared visit and like counts.
5. **🌿 I'm interested** opens the quiz: 5 questions built from the herb's own JSON (life cycle, origin, blooms, height, likes), instant right / wrong feedback, then a score with a message: 🏆 *Congratulations!* (5/5), 🌿 *Well done!* (3–4), 🌱 *Try again!* (0–2). **Try again** gives new questions; the best score is remembered.

## Tech stack and why

| Technology | Why |
|---|---|
| HTML5 (`<dialog>`) | semantic page; dialogs keep keyboard focus and close with Escape |
| CSS3 (variables, grid, flexbox) | one variable set re-colours each herb; responsive without a framework |
| Plain JavaScript, `fetch`, async/await | the course topic; small and readable for beginners |
| JSON | content is separate from code; the quiz reads the same data |
| `localStorage` | keeps favorites and scores without a server |
| React + Vite (`react/`) | a second, component-based version to compare |
| Wikipedia API, Abacus counter | free public services, no own server |
| Git, GitHub, GitHub Pages | teamwork, history and free hosting |

## Run it

```sh
npx serve
```

Open the address it prints (usually <http://localhost:3000>). Do not double-click
`index.html`: `fetch()` needs a web server. Try `index.html#basil`.

## Files

```text
index.html     the only page          style.css    the design
app.js         herbs, router, dialog, favorites, Wikipedia
community.js   shared visits and likes     interest.js   the quiz
extras.js      filter, herb of the day     menu.js       burger menu
data/          herbs.json + <id>.json      images/ videos/
react/         React source (Vite)         herb-profiles/ built React version
group.md       who did what
```

## Herb data format

`data/herbs.json` lists all herbs. Every herb has `data/<id>.json` with:
`id`, `name`, `latin`, `family`, `life` (`annual` / `perennial`), `description`,
`quickFacts` (5 × `{label, value}`: Life cycle, Origin, Blooms, Height, Likes),
`uses` and `growingTips` (`{title, text}`), and optional `theme`
(`{light, dark}`), `image`, `parts` and `video`.

To add a herb: create `data/<id>.json` and add its `id` to `data/herbs.json`.
It gets a card, an address, colours and a quiz automatically.

The React version is in `react/` and built in `herb-profiles/`
(open `herb-profiles/react/`; `cd react && npm install && npm run build` to rebuild).
It is not linked from the menu.
