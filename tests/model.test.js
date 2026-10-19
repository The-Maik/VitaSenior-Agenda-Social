import test from "node:test";
import assert from "node:assert/strict";
import { ARTICLES, CATEGORIES, SOURCES } from "../js/content.js";
import { createSession, filterArticles } from "../js/model.js";
import { ReadingTimer, formatTime } from "../js/timer.js";

test("busca ignora acentos e combina palavras, assunto e favoritos", () => {
  assert.ok(filterArticles(ARTICLES, { query: "EQUILIBRIO" }).length > 0);
  const session = createSession(ARTICLES);
  session.toggleSaved("equilibrio-autonomia");
  assert.deepEqual(
    filterArticles(ARTICLES, {
      query: "autonomia equilibrio",
      category: "equilibrio",
      savedOnly: true,
      saved: session.saved,
    }).map((a) => a.id),
    ["equilibrio-autonomia"],
  );
  assert.equal(
    filterArticles(ARTICLES, { query: "  assunto inexistente  " }).length,
    0,
  );
  assert.equal(
    filterArticles(ARTICLES, { query: "<script>alert(1)</script>" }).length,
    0,
  );
});

test("sessões são isoladas, ignoram IDs desconhecidos e apagam as marcações", () => {
  const first = createSession(ARTICLES);
  const second = createSession(ARTICLES);
  first.toggleSaved("movimento-cotidiano");
  first.markRead("movimento-cotidiano");
  first.markRead("movimento-cotidiano");
  first.markRead("unknown");
  first.toggleSaved("unknown");
  assert.equal(first.read.size, 1);
  assert.equal(first.saved.size, 1);
  assert.equal(second.saved.size, 0);
  assert.equal(second.read.size, 0);
  first.clear();
  assert.equal(first.read.size, 0);
  assert.equal(first.saved.size, 0);
});

test("catálogo tem identificadores únicos, categorias e fontes HTTPS válidas", () => {
  assert.equal(new Set(ARTICLES.map((a) => a.id)).size, ARTICLES.length);
  for (const article of ARTICLES) {
    assert.ok(CATEGORIES[article.category]);
    assert.ok(article.points.length > 0);
    assert.equal(new URL(SOURCES[article.source].url).protocol, "https:");
  }
});

test("temporizador usa tempo decorrido mesmo após atualização atrasada", () => {
  let now = 0;
  const timer = new ReadingTimer({ now: () => now });
  timer.start();
  now = 59_500;
  assert.equal(timer.seconds, 1);
  assert.equal(timer.tick(), false);
  now = 90_000;
  assert.equal(timer.tick(), true);
  assert.equal(timer.seconds, 0);
  assert.equal(timer.running, false);
  assert.equal(timer.tick(), false);
});

test("pausar preserva fração de segundo e retomada não conta tempo pausado", () => {
  let now = 0;
  const timer = new ReadingTimer({ now: () => now });
  timer.start();
  now = 12_500;
  timer.pause();
  assert.equal(timer.seconds, 48);
  now = 200_000;
  timer.start();
  now = 247_499;
  assert.equal(timer.seconds, 1);
  now = 247_500;
  assert.equal(timer.tick(), true);
});

test("iniciar é idempotente e reiniciar permite outra duração", () => {
  let now = 0;
  const timer = new ReadingTimer({ now: () => now });
  timer.start();
  now = 10_000;
  timer.start();
  assert.equal(timer.seconds, 50);
  timer.reset(120);
  assert.equal(timer.running, false);
  assert.equal(timer.seconds, 120);
  assert.throws(() => timer.reset(-1), RangeError);
  assert.throws(() => timer.reset(NaN), RangeError);
  assert.equal(formatTime(120), "02:00");
  assert.equal(formatTime(5), "00:05");
});

test("temporizador concluído reinicia sem ficar negativo", () => {
  let now = 0;
  const timer = new ReadingTimer({ now: () => now, duration: 1 });
  timer.start();
  now = 2000;
  timer.tick();
  timer.start();
  assert.equal(timer.seconds, 1);
  assert.equal(timer.running, true);
});
