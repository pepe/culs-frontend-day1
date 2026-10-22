// Two small extras that only ADD to the page:
// 1. Filter buttons: All / Annual / Perennial (works together with the search box)
// 2. "Herb of the day" button: opens the same herb for everyone, all day

// ---------- 1. Filter: All / Annual / Perennial ----------

const herbCards = document.querySelector("#herbs-list");
const herbCount = document.querySelector("#herbs .count");
const herbSearch = document.querySelector("#herb-search");
let lifeFilter = "all"; // application state: which filter is chosen

function applyLifeFilter() {
  if (!herbCards || !herbCount) return;

  const cards = [...herbCards.children];
  let visible = 0;

  cards.forEach((item) => {
    const life = item.querySelector(".life")?.textContent.trim().toLowerCase();
    const show = lifeFilter === "all" || life === lifeFilter;
    item.hidden = !show;
    if (show) visible += 1;
  });

  // With "All", app.js already wrote the right text.
  if (lifeFilter === "all") return;

  const query = (herbSearch?.value || "").trim();
  const kind = `${lifeFilter} herb${visible === 1 ? "" : "s"}`;

  if (visible === 0) {
    herbCount.textContent = query
      ? `No ${lifeFilter} herb matches "${query}". Try another name.`
      : `No ${lifeFilter} herbs grow here.`;
  } else {
    herbCount.textContent = query
      ? `${visible} ${kind} match${visible === 1 ? "es" : ""} "${query}".`
      : `${visible} ${kind} grow${visible === 1 ? "s" : ""} here.`;
  }
}

function buildFilterButtons() {
  const search = document.querySelector("#herbs .search");
  if (!search) return;

  const group = document.createElement("div");
  group.className = "life-filter";
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", "Show herbs by life cycle");

  [["all", "All"], ["annual", "Annual"], ["perennial", "Perennial"]].forEach(([value, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.dataset.life = value;
    button.setAttribute("aria-pressed", String(value === lifeFilter));

    button.addEventListener("click", () => {
      lifeFilter = value;
      group.querySelectorAll("button").forEach((other) => {
        other.setAttribute("aria-pressed", String(other.dataset.life === lifeFilter));
      });

      if (lifeFilter === "all" && herbSearch) {
        // Let app.js redraw the list and its count, as if the search changed.
        herbSearch.dispatchEvent(new Event("input"));
      } else {
        applyLifeFilter();
      }
    });

    group.append(button);
  });

  search.after(group);
}

buildFilterButtons();

// app.js rebuilds the cards (at the start and on every search).
// Each time it does, apply the filter again.
if (herbCards) {
  new MutationObserver(applyLifeFilter).observe(herbCards, { childList: true });
}

// ---------- 2. Herb of the day ----------

async function buildHerbOfTheDay() {
  const intro = document.querySelector(".intro > div");
  if (!intro) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "favorite-button herb-of-the-day";
  button.textContent = "🎲 Herb of the day";
  intro.append(button);

  button.addEventListener("click", async () => {
    try {
      const response = await fetch("data/herbs.json");
      if (!response.ok) throw new Error(`Could not load herbs: ${response.status}`);
      const herbs = await response.json();

      // The same herb for everyone on the same day: day number modulo herb count.
      const dayNumber = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
      const herb = herbs[dayNumber % herbs.length];

      // Focus returns to this button when the herb dialog is closed (see app.js).
      if (typeof dialogOpener !== "undefined") dialogOpener = button;

      // Let the #hash router open the herb.
      location.hash = herb.id;

      if (typeof popup === "function") {
        popup(`🌿 Today's herb: ${herb.name}!`);
      }
    } catch (error) {
      console.error(error);
      if (typeof popup === "function") {
        popup("The herb of the day could not be loaded. Is the server running?");
      }
    }
  });
}

buildHerbOfTheDay();
