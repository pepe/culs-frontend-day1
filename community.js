// Community counts: how many visits the garden had, and how many people
// liked each herb. The numbers are shared by all visitors, so they are kept
// on a free online counter service (Abacus) and read with fetch().
//
// This file only ADDS things to the page. If the counter service cannot be
// reached, nothing is shown and the rest of the site works as before.

const counterService = "https://abacus.jasoncameron.dev";
const counterNamespace = "little-herb-garden-herbs-lavender";

// Ask the service for a number. "hit" adds 1 and returns the new total,
// "get" only reads it. A counter nobody has used yet answers 404, which means 0.
async function counter(action, key) {
  const response = await fetch(`${counterService}/${action}/${counterNamespace}/${key}`);

  if (response.status === 404) {
    return 0;
  }

  if (!response.ok) {
    throw new Error(`Counter service answered ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

// ---------- Pop-up notifications ----------

// A small message in the bottom corner that disappears by itself.
// Screen readers announce it too (role="status").
function popup(message) {
  let area = document.querySelector("#popups");
  if (!area) {
    area = document.createElement("div");
    area.id = "popups";
    area.className = "popups";
    document.body.append(area);
  }

  const note = document.createElement("div");
  note.className = "popup";
  note.setAttribute("role", "status");

  const text = document.createElement("p");
  text.textContent = message;

  const close = document.createElement("button");
  close.type = "button";
  close.className = "popup-close";
  close.textContent = "×";
  close.setAttribute("aria-label", "Close notification");
  close.addEventListener("click", () => note.remove());

  note.append(text, close);
  area.append(note);

  // Fade out after 5 seconds.
  setTimeout(() => {
    note.classList.add("popup-hide");
    setTimeout(() => note.remove(), 400);
  }, 5000);
}

// ---------- Visits: shown in the footer ----------

async function showVisits() {
  const footer = document.querySelector("footer");
  if (!footer) return;

  const line = document.createElement("p");
  line.className = "community-count";
  line.setAttribute("role", "status");
  footer.append(line);

  try {
    // Count each visitor once per browser session, not on every reload.
    let counted = false;
    try {
      counted = sessionStorage.getItem("garden-visit-counted") === "yes";
    } catch (error) {
      // Storage blocked: just read the number.
      counted = true;
    }

    const visits = await counter(counted ? "get" : "hit", "visits");

    try {
      sessionStorage.setItem("garden-visit-counted", "yes");
    } catch (error) {
      // Ignore: storage may be blocked.
    }

    line.textContent = visits === 1
      ? "👀 1 visit to the garden so far"
      : `👀 ${visits} visits to the garden so far`;

    // Welcome pop-up, once per visit.
    if (!counted) {
      popup(`👋 Welcome! You are visitor number ${visits}.`);
    }
  } catch (error) {
    console.error("Could not load the visit counter.", error);
    line.remove();
  }
}

// ---------- Likes: shown in the herb dialog ----------

function likeText(likes) {
  return likes === 1
    ? "♥ 1 person likes this herb"
    : `♥ ${likes} people like this herb`;
}

// Show the like count under the favorite button whenever a herb dialog opens.
async function showLikes(button) {
  const id = button.dataset.favoriteId;

  const line = document.createElement("p");
  line.className = "community-count";
  line.dataset.likesFor = id;
  line.setAttribute("aria-live", "polite");
  button.after(line);

  try {
    const likes = await counter("get", `like-${id}`);
    if (line.isConnected) line.textContent = likeText(likes);
  } catch (error) {
    console.error("Could not load the like counter.", error);
    line.remove();
  }
}

// app.js builds the dialog. Watch it, and add the like count when a new
// favorite button appears.
const dialogContentArea = document.querySelector("#herb-dialog-content");

if (dialogContentArea) {
  new MutationObserver(() => {
    const button = dialogContentArea.querySelector("[data-favorite-id]");
    // Each new dialog has a new button; mark it so we only ask once.
    if (button && !button.dataset.likesShown) {
      button.dataset.likesShown = "yes";
      showLikes(button);
    }
  }).observe(dialogContentArea, { childList: true });
}

// When someone adds a herb to their favorites, add 1 to the shared count.
// (Removing a favorite does not lower it: the count only goes up.)
document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-favorite-id]");
  if (!button || button.getAttribute("aria-pressed") !== "true") return;

  const id = button.dataset.favoriteId;
  const line = document.querySelector(`[data-likes-for="${id}"]`);

  const herbName = document.querySelector("#herb-dialog-title")?.textContent || id;

  try {
    const likes = await counter("hit", `like-${id}`);
    if (line?.isConnected) line.textContent = likeText(likes);
    popup(likes === 1 ? `♥ ${herbName} now has 1 like` : `♥ ${herbName} now has ${likes} likes`);
  } catch (error) {
    console.error("Could not save the like.", error);
    popup(`Your like for ${herbName} could not be saved right now.`);
  }
});

showVisits();
