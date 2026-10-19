import { ARTICLES, CATEGORIES, SOURCES } from "./content.js";
import { createSession, filterArticles } from "./model.js";
import { ReadingTimer, formatTime } from "./timer.js";

const $ = (selector) => document.querySelector(selector);
const session = createSession(ARTICLES);
const filters = {
  category: "todos",
  query: "",
  savedOnly: false,
  saved: session.saved,
};
const timer = new ReadingTimer();
let interval = null;
let activeArticle = null;
let dialogOpener = null;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// Desenhos vetoriais originais, sem biblioteca ou recurso externo.
const iconPaths = {
  sun: [
    "M32 19v-7m0 40v-7M19 32h-7m40 0h-7M18 18l5 5m18 18 5 5M18 46l5-5m18-18 5-5",
    "M42 32a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  ],
  leaf: ["M16 47C9 24 29 13 50 14c1 23-14 36-31 30", "M13 53c6-17 16-28 31-34"],
  home: ["m11 29 21-18 21 18M18 25v27h28V25M27 52V36h10v16"],
  balance: [
    "M32 13v38M20 51h24M13 23h38M19 23 10 39h18L19 23m26 0-9 16h18L45 23",
  ],
  wind: [
    "M10 23h30c14 0 14-16 4-16-5 0-7 3-7 6M10 32h40c12 0 12 16 3 16-4 0-6-2-6-5M10 41h17c12 0 12 15 3 15",
  ],
  chat: [
    "M50 32c0 11-8 19-20 19h-6L13 56l3-12c-5-4-8-10-8-16 0-11 9-19 21-19s21 9 21 23Z",
    "M20 25h19M20 34h14",
  ],
  bookmark: ["M17 10h30v45L32 45 17 55Z"],
};
function icon(name) {
  const namespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(namespace, "svg");
  svg.setAttribute("viewBox", "0 0 64 64");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2.5");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  for (const d of iconPaths[name]) {
    const path = document.createElementNS(namespace, "path");
    path.setAttribute("d", d);
    svg.append(path);
  }
  return svg;
}

function renderCards(focusKey) {
  const articles = filterArticles(ARTICLES, filters);
  const fragment = document.createDocumentFragment();
  for (const article of articles) {
    const card = element("article", "content-card");
    const art = element("div", `card-art ${article.category}`);
    art.append(
      element(
        "span",
        "card-number",
        String(ARTICLES.indexOf(article) + 1).padStart(2, "0"),
      ),
      icon(article.icon),
    );
    const bookmark = element("button", "bookmark");
    bookmark.type = "button";
    bookmark.dataset.focusKey = `save-${article.id}`;
    bookmark.setAttribute("aria-label", `Favoritar: ${article.title}`);
    bookmark.setAttribute(
      "aria-pressed",
      String(session.saved.has(article.id)),
    );
    bookmark.append(icon("bookmark"));
    bookmark.addEventListener("click", () => {
      session.toggleSaved(article.id);
      renderCards(bookmark.dataset.focusKey);
    });
    art.append(bookmark);
    const content = element("div", "card-content");
    const title = element("h3", "", article.title);
    title.id = `title-${article.id}`;
    card.setAttribute("aria-labelledby", title.id);
    content.append(
      element("p", "card-category", CATEGORIES[article.category]),
      title,
      element("p", "card-description", article.summary),
    );
    const bottom = element("div", "card-bottom");
    bottom.append(element("span", "", "Leitura breve"));
    const open = element("button", "card-open", "Ler conteúdo ↗");
    open.type = "button";
    open.dataset.focusKey = `open-${article.id}`;
    open.setAttribute("aria-label", `Ler: ${article.title}`);
    open.addEventListener("click", () => openArticle(article, open));
    bottom.append(open);
    content.append(bottom);
    if (session.read.has(article.id))
      content.append(element("p", "read-badge", "✓ Você marcou como lido"));
    card.append(art, content);
    fragment.append(card);
  }
  $("#cards-grid").replaceChildren(fragment);
  $("#result-count").textContent =
    `${articles.length} ${articles.length === 1 ? "conteúdo disponível" : "conteúdos disponíveis"}`;
  $("#saved-count").textContent = `(${session.saved.size})`;
  $("#empty-state").hidden = articles.length > 0;
  $("#empty-description").textContent = filters.savedOnly
    ? "Use o botão de favorito em um conteúdo. Se já tem favoritos, tente limpar os filtros de assunto e busca."
    : "Tente outro assunto ou uma palavra diferente.";
  $("#reading-progress").value = session.read.size;
  $("#reading-count").textContent =
    `${session.read.size} de ${ARTICLES.length} conteúdos lidos nesta visita`;
  if (focusKey) {
    const replacement = [...document.querySelectorAll("[data-focus-key]")].find(
      (node) => node.dataset.focusKey === focusKey,
    );
    (replacement || $("#saved-filter")).focus({ preventScroll: true });
  }
}

function openDialog(dialog, opener) {
  dialogOpener = opener;
  dialog.showModal();
  dialog.scrollTop = 0;
}

function updateArticleActions() {
  const read = session.read.has(activeArticle.id);
  const saved = session.saved.has(activeArticle.id);
  $("#mark-read").textContent = read ? "Marcado como lido" : "Marcar como lido";
  $("#mark-read").disabled = read;
  $("#bookmark-article").textContent = saved
    ? "Remover dos favoritos"
    : "Favoritar";
  $("#bookmark-article").setAttribute("aria-pressed", String(saved));
}

function openArticle(article, opener) {
  activeArticle = article;
  const body = $("#article-body");
  const title = element("h2", "", article.title);
  title.id = "article-title";
  title.tabIndex = -1;
  const list = element("ul");
  for (const point of article.points) list.append(element("li", "", point));
  const source = SOURCES[article.source];
  const sourceNote = element("p", "source-note");
  sourceNote.append("Referência para esta leitura: ");
  const link = element("a", "", source.label);
  link.href = source.url;
  link.rel = "noreferrer";
  sourceNote.append(
    link,
    ` (${source.language}). Síntese educativa da equipe do projeto; não implica endosso da instituição.`,
  );
  body.replaceChildren(
    title,
    element("p", "", article.intro),
    element("h3", "", article.heading),
    list,
    element("h3", "", "Para refletir"),
    element("p", "", article.reflection),
    element(
      "p",
      "article-boundary",
      "Este texto não avalia sua saúde e não é uma prescrição. Procure orientação profissional para escolher ou adaptar práticas à sua realidade.",
    ),
    sourceNote,
  );
  $("#article-category").textContent = CATEGORIES[article.category];
  $("#article-status").textContent = "";
  updateArticleActions();
  openDialog($("#article-dialog"), opener);
  title.focus({ preventScroll: true });
}

for (const dialog of document.querySelectorAll("dialog")) {
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const controls = [
      ...dialog.querySelectorAll(
        'button, a[href], input:not([type="radio"]), input[type="radio"]:checked, select, [tabindex="0"]',
      ),
    ].filter((node) => !node.disabled && node.getClientRects().length > 0);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });
  dialog
    .querySelector("[data-close]")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    if (dialog.id === "article-dialog") {
      renderCards(dialogOpener?.dataset.focusKey);
      activeArticle = null;
    } else dialogOpener?.focus({ preventScroll: true });
  });
}

$("#mark-read").addEventListener("click", () => {
  session.markRead(activeArticle.id);
  updateArticleActions();
  // Atualiza o fundo sem tirar o foco do modal.
  renderCards();
  $("#bookmark-article").focus({ preventScroll: true });
  $("#article-status").textContent =
    "Leitura marcada nesta visita. Você pode fechar este conteúdo e explorar outro.";
});
$("#bookmark-article").addEventListener("click", () => {
  const saved = session.toggleSaved(activeArticle.id);
  updateArticleActions();
  renderCards();
  $("#article-status").textContent = saved
    ? "Conteúdo adicionado aos favoritos desta visita."
    : "Conteúdo removido dos favoritos.";
});
for (const button of document.querySelectorAll("[data-category]")) {
  button.addEventListener("click", () => {
    filters.category = button.dataset.category;
    for (const other of document.querySelectorAll("[data-category]"))
      other.setAttribute("aria-pressed", String(other === button));
    renderCards();
  });
}
$("#search").addEventListener("input", (event) => {
  filters.query = event.target.value;
  renderCards();
});
$("#saved-filter").addEventListener("click", (event) => {
  filters.savedOnly = !filters.savedOnly;
  event.currentTarget.setAttribute("aria-pressed", String(filters.savedOnly));
  renderCards();
});
$("#clear-filters").addEventListener("click", () => {
  filters.category = "todos";
  filters.query = "";
  filters.savedOnly = false;
  $("#search").value = "";
  $("#saved-filter").setAttribute("aria-pressed", "false");
  for (const button of document.querySelectorAll("[data-category]"))
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.category === "todos"),
    );
  renderCards();
  $('[data-category="todos"]').focus();
});
$("#accessibility-open").addEventListener("click", (event) =>
  openDialog($("#accessibility-dialog"), event.currentTarget),
);
for (const input of document.querySelectorAll('[name="font-size"]')) {
  input.addEventListener("change", () =>
    document.documentElement.classList.toggle(
      "large-text",
      input.value === "large",
    ),
  );
}
$("#high-contrast").addEventListener("change", (event) =>
  document.documentElement.classList.toggle(
    "high-contrast",
    event.target.checked,
  ),
);
$("#clear-session").addEventListener("click", () => {
  session.clear();
  renderCards();
  $("#clear-status").textContent =
    "Favoritos e marcações de leitura apagados desta página.";
});

function stopInterval() {
  clearInterval(interval);
  interval = null;
}
function renderTimer() {
  $("#timer-display").textContent = formatTime(timer.seconds);
  $("#timer-toggle").textContent = timer.running
    ? "Pausar contagem"
    : timer.seconds === 0
      ? "Iniciar nova pausa"
      : timer.seconds < timer.duration
        ? "Continuar pausa"
        : "Iniciar pausa";
}
function tick() {
  if (timer.tick()) {
    stopInterval();
    $("#timer-status").textContent =
      "Seu tempo de pausa terminou. Continue a leitura quando quiser.";
  }
  renderTimer();
}
$("#timer-toggle").addEventListener("click", () => {
  if (timer.running) {
    timer.pause();
    stopInterval();
    $("#timer-status").textContent =
      "Contagem pausada. Continue quando quiser.";
  } else {
    timer.start();
    interval = setInterval(tick, 250);
    $("#timer-status").textContent =
      "Pausa em andamento. Você pode interromper a qualquer momento.";
  }
  renderTimer();
});
function resetTimer() {
  stopInterval();
  timer.reset(Number($("#pause-duration").value));
  renderTimer();
  $("#timer-status").textContent =
    "O tempo é livre; não orienta exercícios ou respiração.";
}
$("#timer-reset").addEventListener("click", resetTimer);
$("#pause-duration").addEventListener("change", resetTimer);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) tick();
});
// Não mantém favoritos por meio do cache de navegação do navegador.
window.addEventListener("pagehide", () => {
  session.clear();
  for (const dialog of document.querySelectorAll("dialog[open]"))
    dialog.close();
  resetTimer();
});
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    $("#clear-filters").click();
    document.documentElement.classList.remove("large-text", "high-contrast");
    $('[name="font-size"][value="normal"]').checked = true;
    $("#high-contrast").checked = false;
    renderCards();
  }
});

renderCards();
renderTimer();
for (const id of [
  "library-controls",
  "library-meta",
  "accessibility-open",
  "pause-card",
])
  $(`#${id}`).hidden = false;

$("#library-fallback").hidden = true;
