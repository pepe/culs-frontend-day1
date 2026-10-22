import { useEffect, useRef, useState } from "react";
import logoUrl from "../../images/Logo.svg?url";

const herbFiles = import.meta.glob("../../data/*.json", {
  eager: true,
  import: "default",
});
const imageFiles = import.meta.glob("../../images/*.{jpg,jpeg,png,svg}", {
  eager: true,
  import: "default",
  query: "?url",
});
// The start page: one folder up in development (react/), two folders up in the built site (herb-profiles/react/).
const gardenHome = import.meta.env.DEV ? "../index.html" : "../../index.html";
const favoritesKey = "little-herb-garden-favorites";
const herbThemes = {
  basil: "basil",
  spearmint: "spearmint",
  rosemary: "rosemary",
  thyme: "thyme",
  lavender: "lavender",
  sage: "sage",
  chamomile: "chamomile",
  chives: "chives",
};
const herbIndex = herbFiles["../../data/herbs.json"] || [];
const herbDetails = Object.fromEntries(
  Object.values(herbFiles)
    .filter((herb) => herb && herb.id && Array.isArray(herb.quickFacts))
    .map((herb) => [herb.id, herb]),
);
const herbs = herbIndex
  .map((herb) => ({ ...herb, details: herbDetails[herb.id] }))
  .filter((herb) => herb.id);

function readFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(favoritesKey) || "[]");
    return Array.isArray(saved) ? saved.filter((id) => typeof id === "string") : [];
  } catch (error) {
    console.error("Could not read saved favorites.", error);
    return [];
  }
}

function getHerbFromAddress() {
  const id = new URLSearchParams(window.location.search).get("herb");
  return herbs.find((herb) => herb.id === id) || null;
}

function HerbDetails({ herb, isFavorite, onClose, onToggleFavorite }) {
  const closeButton = useRef(null);
  const details = herb.details;
  const imageUrl = details?.image
    ? imageFiles[`../../${details.image.src}`]
    : null;

  useEffect(() => {
    closeButton.current?.focus();
    document.body.classList.add("modal-open");

    function closeOnEscape(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div
      className="herb-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="herb-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="herb-modal-title"
        data-herb-theme={herbThemes[herb.id] || "default"}
      >
        <div className="herb-modal-heading">
          <div>
            <h2 id="herb-modal-title">{herb.name}</h2>
            <p className="latin">{herb.latin}</p>
          </div>
          <button
            ref={closeButton}
            className="modal-close"
            type="button"
            aria-label="Close herb details"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {details ? (
          <>
            <div className="herb-modal-intro">
              <div>
                <p>{details.description}</p>
                <button
                  className="favorite-button"
                  type="button"
                  aria-pressed={isFavorite}
                  onClick={() => onToggleFavorite(herb.id)}
                >
                  {isFavorite ? "♥ Remove from favorites" : "♡ Add to favorites"}
                </button>
              </div>
              {imageUrl && (
                <img
                  className="herb-modal-image"
                  src={imageUrl}
                  alt={details.image.alt}
                  width="800"
                  height="533"
                />
              )}
            </div>

            <section>
              <h3>Quick facts</h3>
              <dl className="facts">
                {details.quickFacts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section>
              <h3>What is {herb.name.toLowerCase()} good for?</h3>
              <ul className="react-list">
                {details.uses.map((use) => (
                  <li key={use.title}><strong>{use.title}:</strong> {use.text}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3>Growing tips</h3>
              <ul className="tips">
                {details.growingTips.map((tip) => (
                  <li key={tip.title}>
                    <strong>{tip.title}</strong>
                    {tip.text}
                  </li>
                ))}
              </ul>
            </section>

            {details.parts?.length > 0 && (
              <section>
                <h3>Explore the plant</h3>
                <ul className="react-list">
                  {details.parts.map((part) => (
                    <li key={part.id}><strong>{part.name}:</strong> {part.text}</li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          <p className="react-message" role="alert">
            Detailed information for {herb.name} is not available yet.
          </p>
        )}
      </section>
    </div>
  );
}

function App() {
  const [favorites, setFavorites] = useState(readFavorites);
  const [selectedHerb, setSelectedHerb] = useState(getHerbFromAddress);
  const [search, setSearch] = useState("");
  // Burger menu (small screens): is the menu open?
  const [menuOpen, setMenuOpen] = useState(false);

  // Escape closes the burger menu.
  useEffect(() => {
    if (!menuOpen) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);
  const [storageError, setStorageError] = useState("");
  const favoriteHerbs = herbs.filter((herb) => favorites.includes(herb.id));
  const visibleHerbs = herbs.filter((herb) =>
    `${herb.name} ${herb.latin}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  useEffect(() => {
    function syncSelectedHerb() {
      setSelectedHerb(getHerbFromAddress());
    }

    window.addEventListener("popstate", syncSelectedHerb);
    return () => window.removeEventListener("popstate", syncSelectedHerb);
  }, []);

  function openHerb(herb) {
    window.history.pushState({}, "", `?herb=${encodeURIComponent(herb.id)}`);
    setSelectedHerb(herb);
  }

  function closeHerb() {
    window.history.replaceState({}, "", window.location.pathname);
    setSelectedHerb(null);
  }

  function toggleFavorite(id) {
    setFavorites((current) => {
      const updated = current.includes(id)
        ? current.filter((favoriteId) => favoriteId !== id)
        : [...current, id];

      try {
        localStorage.setItem(favoritesKey, JSON.stringify(updated));
        setStorageError("");
      } catch (error) {
        console.error("Could not save favorites in this browser.", error);
        setStorageError("Favorites could not be saved in this browser.");
      }

      return updated;
    });
  }

  return (
    <>
      <header className="site-header">
        <img className="logo" src={logoUrl} alt="" width="48" height="48" />
        <p className="site-name">The Little Herb Garden</p>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav
          id="site-navigation"
          className={menuOpen ? "is-open" : ""}
          aria-label="Main navigation"
          onClick={(event) => {
            if (event.target.closest("a")) setMenuOpen(false);
          }}
        >
          <ul>
            <li><a href={`${gardenHome}#herbs`}>Herbs</a></li>
            <li><a href={`${gardenHome}#visit`}>Visit</a></li>
            <li><a href="#favorites">Favorites</a></li>
            <li><a href={`${gardenHome}#about`}>About</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <section className="intro react-intro">
          <div>
            <h1>Explore the herbs</h1>
            <p>Choose a herb to learn about its uses, quick facts and growing tips.</p>
            <p><a href={`${gardenHome}#herbs`}>← Back to the garden</a></p>
          </div>
          <img
            className="hero"
            src={imageFiles["../../images/garden.svg"]}
            alt="Two raised beds full of herbs, with a bee"
          />
        </section>

        <section id="herbs">
          <h2>What grows here</h2>
          <label className="herb-search">
            <span>Search herbs</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or Latin name"
            />
          </label>
          <p className="count" aria-live="polite">
            {visibleHerbs.length} {visibleHerbs.length === 1 ? "herb" : "herbs"} found.
          </p>
          {visibleHerbs.length > 0 ? (
            <ul className="cards">
              {visibleHerbs.map((herb) => (
                <li key={herb.id}>
                  <article className="react-herb-card">
                    <button
                      className="react-herb-card-open"
                      type="button"
                      onClick={() => openHerb(herb)}
                    >
                      <h3>{herb.name}</h3>
                      <p className="latin">{herb.latin}</p>
                      <p className="use">{herb.use}</p>
                      <p className="life">{herb.life}</p>
                    </button>
                    <button
                      className="favorite-button favorite-card-button"
                      type="button"
                      aria-pressed={favorites.includes(herb.id)}
                      onClick={() => toggleFavorite(herb.id)}
                    >
                      {favorites.includes(herb.id) ? "♥ Favorited" : "♡ Add to favorites"}
                    </button>
                  </article>
                </li>
              ))}
            </ul>
          ) : (
            <p className="react-message" role="status">No herbs match your search.</p>
          )}
        </section>

        <section id="favorites">
          <h2>My favorites</h2>
          {storageError && <p className="react-message" role="alert">{storageError}</p>}
          {favoriteHerbs.length > 0 ? (
            <ul className="cards">
              {favoriteHerbs.map((herb) => (
                <li key={herb.id}>
                  <article className="react-herb-card">
                    <button
                      className="react-herb-card-open"
                      type="button"
                      onClick={() => openHerb(herb)}
                    >
                      <h3>{herb.name}</h3>
                      <p className="latin">{herb.latin}</p>
                      <p className="use">{herb.use}</p>
                    </button>
                    <button
                      className="favorite-button favorite-card-button"
                      type="button"
                      onClick={() => toggleFavorite(herb.id)}
                    >
                      Remove from favorites
                    </button>
                  </article>
                </li>
              ))}
            </ul>
          ) : (
            <p className="count">Your favorite herbs will appear here. Add any herb to get started.</p>
          )}
        </section>
      </main>

      <footer>
        <p>Made with React, HTML and CSS. <a href={`${gardenHome}`}>Back to the garden</a></p>
      </footer>

      {selectedHerb && (
        <HerbDetails
          herb={selectedHerb}
          isFavorite={favorites.includes(selectedHerb.id)}
          onClose={closeHerb}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </>
  );
}

export default App;
