// "I'm interested" button in the herb dialog. It opens a pop-up with a short
// quiz about that herb. The questions are made from the herb's own JSON file
// (data/<id>.json), so when the data changes, the quiz changes with it.
// At the end the visitor sees a score and a message (congratulations, or try again).
//
// This file only ADDS the quiz. If the data cannot be loaded, the visitor gets
// a friendly message and the rest of the site works as before.

const quizKey = "little-herb-garden-quiz";
const questionsPerQuiz = 5;

// Best score per herb in this browser: { basil: 4, ... }
function readScores() {
  try {
    const saved = JSON.parse(localStorage.getItem(quizKey) || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch (error) {
    return {};
  }
}

function saveScore(herbId, score) {
  try {
    const scores = readScores();
    if (!(scores[herbId] >= score)) {
      scores[herbId] = score;
      localStorage.setItem(quizKey, JSON.stringify(scores));
    }
  } catch (error) {
    // Storage blocked: the quiz still works, we just can't remember the score.
  }
}

// Small helper to create an element with a class and text.
function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ----- Data: load every herb once, then build questions from it -----

let allHerbsPromise = null;

function loadAllHerbs() {
  if (!allHerbsPromise) {
    allHerbsPromise = fetch("data/herbs.json")
      .then((response) => {
        if (!response.ok) throw new Error(`herbs.json: ${response.status}`);
        return response.json();
      })
      .then((list) =>
        Promise.all(
          list.map((item) =>
            fetch(`data/${item.id}.json`).then((response) => {
              if (!response.ok) throw new Error(`${item.id}.json: ${response.status}`);
              return response.json();
            })
          )
        )
      )
      .catch((error) => {
        allHerbsPromise = null; // try again next time
        throw error;
      });
  }
  return allHerbsPromise;
}

function fact(herb, label) {
  return herb.quickFacts?.find((item) => item.label === label)?.value;
}

// One question: the right answer plus three wrong answers taken from other herbs.
function makeQuestion(herb, others, label, text) {
  const answer = fact(herb, label);
  if (!answer) return null;

  let wrong;
  if (label === "Life cycle") {
    wrong = ["Annual", "Perennial"].filter((value) => value !== answer);
  } else {
    const values = others.map((other) => fact(other, label)).filter(Boolean);
    wrong = shuffle([...new Set(values)].filter((value) => value !== answer)).slice(0, 3);
  }
  if (wrong.length === 0) return null;

  return {
    text: text.replace("{herb}", herb.name),
    answer,
    options: shuffle([answer, ...wrong]),
    explain: `${herb.name} – ${label}: ${answer}.`,
  };
}

function buildQuestions(herb, allHerbs) {
  const others = allHerbs.filter((other) => other.id !== herb.id);
  return shuffle([
    makeQuestion(herb, others, "Life cycle", "How long does {herb} live?"),
    makeQuestion(herb, others, "Origin", "Where does {herb} come from?"),
    makeQuestion(herb, others, "Blooms", "When does {herb} bloom?"),
    makeQuestion(herb, others, "Height", "How tall does {herb} grow?"),
    makeQuestion(herb, others, "Likes", "What does {herb} like?"),
  ].filter(Boolean)).slice(0, questionsPerQuiz);
}

// ----- The button inside the herb dialog -----

function buildInterestSection(herbId, herbName) {
  const section = make("section", "herb-dialog-section interest");
  section.append(make("h3", "", `Interested in ${herbName}?`));
  section.append(make("p", "interest-intro", `Test what you learned about ${herbName} in a 5-question quiz.`));

  const best = readScores()[herbId];
  const bestLine = make("p", "interest-best", best >= 0 ? `Your best score: ${best} / ${questionsPerQuiz}` : "");
  bestLine.setAttribute("role", "status");

  const openButton = make("button", "favorite-button", "🌿 I'm interested");
  openButton.type = "button";
  openButton.addEventListener("click", () => {
    openQuizPopup(herbId, herbName, () => {
      const score = readScores()[herbId];
      bestLine.textContent = score >= 0 ? `Your best score: ${score} / ${questionsPerQuiz}` : "";
    });
  });

  section.append(openButton, bestLine);
  return section;
}

// ----- The quiz pop-up -----
// It uses the HTML <dialog> element: showModal() keeps keyboard focus inside
// it and Escape closes it.

function openQuizPopup(herbId, herbName, onFinished) {
  const popupWindow = document.createElement("dialog");
  popupWindow.className = "interest-popup quiz-popup";
  popupWindow.setAttribute("aria-labelledby", "quiz-title");

  // Take the colours of the herb dialog behind it.
  const herbDialog = document.querySelector("#herb-dialog");
  if (herbDialog) {
    const colours = getComputedStyle(herbDialog);
    ["--herb-accent", "--herb-dark", "--herb-light"].forEach((property) => {
      const value = colours.getPropertyValue(property).trim();
      if (value) popupWindow.style.setProperty(property, value);
    });
  }

  const closeButton = make("button", "modal-close", "×");
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close the quiz");
  closeButton.addEventListener("click", () => popupWindow.close());

  const title = make("h2", "", `${herbName} quiz`);
  title.id = "quiz-title";

  const body = make("div", "quiz-body");
  popupWindow.append(closeButton, title, body);

  // Escape closes only this pop-up, not the herb dialog behind it.
  popupWindow.addEventListener("keydown", (event) => {
    if (event.key === "Escape") event.stopPropagation();
  });
  // Clicking the dark area around the pop-up closes it.
  popupWindow.addEventListener("click", (event) => {
    if (event.target === popupWindow) popupWindow.close();
  });
  popupWindow.addEventListener("close", () => {
    popupWindow.remove();
    document.querySelector("#herb-dialog-close")?.focus();
  });

  document.body.append(popupWindow);
  popupWindow.showModal();

  body.append(make("p", "", "Loading your quiz…"));

  loadAllHerbs()
    .then((allHerbs) => {
      const herb = allHerbs.find((item) => item.id === herbId);
      const questions = herb ? buildQuestions(herb, allHerbs) : [];
      if (questions.length === 0) {
        body.replaceChildren(make("p", "", "There is no quiz for this herb yet."));
        return;
      }
      showQuestion(body, popupWindow, herbName, questions, 0, 0, herbId, onFinished);
    })
    .catch((error) => {
      console.error("Could not load the quiz data.", error);
      body.replaceChildren(make("p", "interest-error", "Sorry, the quiz could not be loaded. Please try again later."));
    });
}

function showQuestion(body, popupWindow, herbName, questions, index, score, herbId, onFinished) {
  const question = questions[index];

  const progress = make("p", "quiz-progress", `Question ${index + 1} of ${questions.length}`);
  const bar = make("div", "quiz-bar");
  const barFill = make("span", "");
  barFill.style.width = `${(index / questions.length) * 100}%`;
  bar.append(barFill);
  bar.setAttribute("aria-hidden", "true");

  const heading = make("h3", "quiz-question", question.text);

  const optionList = make("div", "quiz-options");
  const feedback = make("p", "quiz-feedback");
  feedback.setAttribute("role", "status");
  const nextButton = make("button", "favorite-button quiz-next", index + 1 === questions.length ? "See my score" : "Next question");
  nextButton.type = "button";
  nextButton.hidden = true;

  let gotItRight = false;

  question.options.forEach((option) => {
    const button = make("button", "quiz-option", option);
    button.type = "button";
    button.addEventListener("click", () => {
      gotItRight = option === question.answer;

      // Lock the answers and show which one was right.
      optionList.querySelectorAll("button").forEach((other) => {
        other.disabled = true;
        if (other.textContent === question.answer) other.classList.add("is-correct");
      });
      if (!gotItRight) button.classList.add("is-wrong");

      feedback.textContent = gotItRight ? `✓ Correct! ${question.explain}` : `✗ Not quite. ${question.explain}`;
      feedback.className = `quiz-feedback ${gotItRight ? "is-correct" : "is-wrong"}`;
      barFill.style.width = `${((index + 1) / questions.length) * 100}%`;
      nextButton.hidden = false;
      nextButton.focus();
    });
    optionList.append(button);
  });

  nextButton.addEventListener("click", () => {
    const newScore = score + (gotItRight ? 1 : 0);
    if (index + 1 < questions.length) {
      showQuestion(body, popupWindow, herbName, questions, index + 1, newScore, herbId, onFinished);
    } else {
      saveScore(herbId, newScore);
      onFinished();
      showResult(body, popupWindow, herbName, questions.length, newScore, herbId, onFinished);
    }
  });

  body.replaceChildren(progress, bar, heading, optionList, feedback, nextButton);
  optionList.firstElementChild?.focus();
}

function showResult(body, popupWindow, herbName, total, score, herbId, onFinished) {
  const percent = Math.round((score / total) * 100);

  let icon = "🌱";
  let heading = "Try again!";
  let message = `Read the ${herbName} card once more, then give it another go. You can do it!`;
  if (score === total) {
    icon = "🏆";
    heading = "Congratulations!";
    message = `Perfect score! You are a ${herbName} expert.`;
  } else if (percent >= 60) {
    icon = "🌿";
    heading = "Well done!";
    message = `You know ${herbName} quite well. One more try for a perfect score?`;
  }

  const badge = make("div", "quiz-badge", icon);
  badge.setAttribute("aria-hidden", "true");
  const resultHeading = make("h3", "quiz-result-heading", heading);
  const scoreLine = make("p", "quiz-score", `${score} / ${total}`);
  const rate = make("p", "quiz-rate", `${percent}% correct`);
  const text = make("p", "", message);

  const actions = make("div", "quiz-actions");
  const againButton = make("button", "favorite-button", "Try again");
  againButton.type = "button";
  againButton.addEventListener("click", () => {
    body.replaceChildren(make("p", "", "Loading your quiz…"));
    loadAllHerbs().then((allHerbs) => {
      const herb = allHerbs.find((item) => item.id === herbId);
      const questions = herb ? buildQuestions(herb, allHerbs) : [];
      if (questions.length > 0) {
        showQuestion(body, popupWindow, herbName, questions, 0, 0, herbId, onFinished);
      }
    });
  });
  const backButton = make("button", "favorite-button", `Back to ${herbName}`);
  backButton.type = "button";
  backButton.addEventListener("click", () => popupWindow.close());
  const exploreButton = make("button", "favorite-button", "Explore more herbs");
  exploreButton.type = "button";
  exploreButton.addEventListener("click", () => {
    popupWindow.close();
    document.querySelector("#herb-dialog-close")?.click();
  });
  actions.append(againButton, backButton, exploreButton);

  body.replaceChildren(badge, resultHeading, scoreLine, rate, text, actions);
  againButton.focus();
}

// app.js builds the herb dialog. Watch it, and add the quiz button once for
// each new herb (each new dialog has a new favorite button).
const interestDialogArea = document.querySelector("#herb-dialog-content");

if (interestDialogArea) {
  new MutationObserver(() => {
    const button = interestDialogArea.querySelector("[data-favorite-id]");
    if (!button || button.dataset.interestShown) return;
    button.dataset.interestShown = "yes";

    const herbId = button.dataset.favoriteId;
    const herbName = interestDialogArea.querySelector("h2")?.textContent || herbId;
    interestDialogArea.append(buildInterestSection(herbId, herbName));
  }).observe(interestDialogArea, { childList: true });
}
