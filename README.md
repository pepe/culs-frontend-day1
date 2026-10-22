# Ivan Budko(rabochiyclasss)
# The Little Herb Garden

A responsive single-page web application (SPA) displaying garden herbs, built using vanilla web technologies (HTML, CSS, JavaScript) without any external frameworks or libraries.

---

## Project Structure

```text
├── index.html         # Application shell (header, views container, footer)
├── style.css          # Layout, color scheme, focus states, and responsive styling
├── app.js             # Client-side router, view renderer, and accessibility logic
├── data/
│   ├── herbs.json     # Registry list used to render the catalog
│   ├── basil.json     # Individual herb data files
│   ├── chamomile.json
│   ├── chives.json
│   ├── lavender.json
│   ├── rosemary.json
│   ├── sage.json
│   ├── spearmint.json
│   └── thyme.json
├── images/
│   ├── logo.svg       # Site logo and favicon
│   └── garden.png     # Hero picture for the intro section
└── README.md          # Project documentation
```

---
## What you need

- a GitHub account
- Git
- an editor
- a browser (Firefox recommended)
- [Node.js](https://nodejs.org/) (the LTS version), which brings `npx`

## Get your copy

1. **Fork** this repository to your GitHub account.
2. **Clone your fork**, not this repository:

   ```sh
   git clone https://github.com/<your-name>/culs-frontend-day1.git
   cd culs-frontend-day1
   ```

## Run it

Start a small web server in the project folder:

```sh
npx serve
```

The first time, `npx` asks whether to install `serve`. Answer `y`.

Then open the address it prints, usually <http://localhost:3000>.
Stop the server with `Ctrl+C`.

Do not open `index.html` by double-clicking it. A `file://` page is not the Web.

## Your mission

Something is wrong. Several things, in fact.

1. Inspect before you change anything: the page, the Console, the Network panel, the Inspector.
2. Pick one problem and find out why it happens.
3. Fix it, reload, verify.
4. Commit that one fix, with a message that says what you fixed.
5. Repeat.

You are done when:

- the Console shows no unexplained errors
- the Network panel shows no missing files
- every link on the page goes where it says
- `git status` is clean, and `git push` has sent your commits to GitHub


## Features & Usage

1. **Catalog Overview & Filtering (`#herbs`):**
   - Displays all herbs as interactive cards.
   - Includes real-time search filtering (`#herb-search`) by herb name, Latin name, or culinary use, and a lifecycle dropdown filter (`#herb-filter`) backed by client-side state.
2. **Dynamic Detail View (`#<herb>`):**
   - Loads specific herb data on demand via `fetch()` without full-page reloads.
3. **Graceful Error Handling:**
   - Displays dedicated recovery cards when an unknown herb hash is entered (404), when a data file is missing, or when the server is unreachable, offering a clear way back to the catalog.
4. **Dark Mode Theme Toggle (`#theme-toggle`):**
   - Switches between light and dark color schemes directly from the header and saves the user's preference in `localStorage`.

---

## How Routing Works

The site runs as a client-side Single Page Application (SPA) driven by the URL hash. `app.js` listens to the `hashchange` event:

| URL Hash | Rendered View | Source |
| :--- | :--- | :--- |
| `index.html` or `#herbs` | Full catalog list | Fetches `data/herbs.json` |
| `#visit` / `#about` | Section anchor navigation | In-page sections |
| `#<herb>` (e.g. `#sage`) | Dynamic herb detail view | Fetches `data/<herb>.json` |

---

## Herb Data Format (`data/<id>.json`)

All individual herbs must follow this schema:

```json
{
  "name": "Sage",
  "latin": "Salvia officinalis",
  "use": "Butter sauces and tea.",
  "life": "perennial"
}
```

### Adding a New Herb
1. Create a lowercase file in `data/` matching the herb name (e.g., `data/oregano.json`).
2. Populate the JSON with `name`, `latin`, `use`, and `life`.
3. Add the herb entry to `data/herbs.json` so it appears in the catalog list.

---

## Accessibility (a11y)

- **Keyboard Navigation:** Fully navigable with `Tab` and `Shift+Tab`. Pressing `Escape` while inside any herb detail view returns immediately to the main catalog.
- **Focus Management:** Focus shifts directly to the detail view heading upon navigation and restores to the previously selected card upon return.
- **High-Contrast Focus Indicators:** All interactive elements feature visible `:focus-visible` styling.
- **Semantic Structure:** Landmarks (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`) ensure clear structure for assistive technologies.
- **Responsive Layout:** CSS Grid and Flexbox reflow cleanly down to narrow mobile screens (320px).

---

## Deploying on GitHub Pages

1. Push all commits to the `main` branch:
   ```bash
   git push origin main
   ```
2. On GitHub, navigate to **Settings** → **Pages**.
3. Under **Build and deployment** → **Branch**, select `main` and root `/(root)`.
4. Click **Save**. The live site will publish within 1–2 minutes.
