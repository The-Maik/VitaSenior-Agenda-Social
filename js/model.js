/** Estado apenas em memória: sem cookies, localStorage ou envio de dados. */
export function normalize(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

export function filterArticles(
  articles,
  { category = "todos", query = "", savedOnly = false, saved = new Set() } = {},
) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return articles.filter(
    (article) =>
      (category === "todos" || article.category === category) &&
      (!savedOnly || saved.has(article.id)) &&
      words.every((word) =>
        normalize(
          `${article.title} ${article.summary} ${article.intro} ${article.points.join(" ")}`,
        ).includes(word),
      ),
  );
}

export function createSession(articles) {
  const ids = new Set(articles.map((article) => article.id));
  const saved = new Set();
  const read = new Set();
  return {
    saved,
    read,
    toggleSaved(id) {
      if (!ids.has(id)) return false;
      if (saved.has(id)) {
        saved.delete(id);
        return false;
      }
      saved.add(id);
      return true;
    },
    markRead(id) {
      if (ids.has(id)) read.add(id);
    },
    clear() {
      saved.clear();
      read.clear();
    },
  };
}
