// Loads the herbs from data/herbs.json and shows each one as a card.

const list = document.querySelector("#herbs-list") // should match by id in index.html

async function loadHerbs() {
  const response = await fetch("data/herb.json")
  if (!response.ok) {
    throw new Error(`Could not load ${response.url}: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

function element(tag, className, text) {
  const node = document.createElement(tag)
  node.className = className
  node.textContent = text
  return node
}

function card(herb) {
  const item = element("li", "card", "")
  item.append(
    element("h3", "name", herb.name),
    element("p", "latin", herb.latin),
    element("p", "use", herb.use),
    element("p", "life", herb.life))
  return item
}

async function show() {
  try {
    const herbs = await loadHerbs()
    list.replaceChildren(...herbs.map(card))
    count.textContent = `${herbs.length} herbs grow here.`
  } catch (error) {
    console.error(error)
    count.textContent = "Failed to load herbs. Please try again later."
  }
}

