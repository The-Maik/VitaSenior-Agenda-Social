import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function openFirst(page) {
  await page
    .getByRole("button", { name: "Ler: Movimento no cotidiano", exact: true })
    .click();
}

test("biblioteca, pesquisa sem acentos e estado vazio", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".content-card")).toHaveCount(6);
  await page.getByRole("button", { name: "Equilíbrio", exact: true }).click();
  await expect(page.locator(".content-card")).toHaveCount(2);
  await page.getByRole("searchbox").fill("AUTONOMIA");
  await expect(page.locator(".content-card")).toHaveCount(1);
  await page.getByRole("searchbox").fill("<img src=x onerror=alert(1)>");
  await expect(page.locator(".content-card")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Nenhum conteúdo por aqui." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Mostrar todos os conteúdos" })
    .click();
  await expect(page.locator(".content-card")).toHaveCount(6);
  await expect(
    page.getByRole("button", { name: "Todos", exact: true }),
  ).toBeFocused();
  await page.getByRole("searchbox").fill("respiracao");
  await expect(page.locator(".content-card")).toHaveCount(1);
});

test("favoritar, marcar leitura e restaurar foco após fechar o modal", async ({
  page,
}) => {
  await page.goto("/");
  await openFirst(page);
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#article-title")).toBeFocused();
  await page
    .getByRole("button", { name: "Marcar como lido", exact: true })
    .click();
  await page.getByRole("button", { name: "Favoritar", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", {
      name: "Ler: Movimento no cotidiano",
      exact: true,
    }),
  ).toBeFocused();
  await expect(page.locator("#reading-count")).toHaveText(
    "1 de 6 conteúdos lidos nesta visita",
  );
  await page.getByRole("button", { name: /Ver meus favoritos/ }).click();
  await expect(page.locator(".content-card")).toHaveCount(1);
  await page
    .getByRole("button", {
      name: "Favoritar: Movimento no cotidiano",
      exact: true,
    })
    .click();
  await expect(page.locator(".content-card")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /Ver meus favoritos/ }),
  ).toBeFocused();
});

test("favorito removido dentro do modal não perde foco ao fechar", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "Favoritar: Movimento no cotidiano",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: /Ver meus favoritos/ }).click();
  await openFirst(page);
  await page
    .getByRole("button", { name: "Remover dos favoritos", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: /Ver meus favoritos/ }),
  ).toBeFocused();
  await expect(page.locator(".content-card")).toHaveCount(0);
});

test("limpar, recarregar e sair descartam marcações; sem armazenamento persistente", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "Favoritar: Movimento no cotidiano",
      exact: true,
    })
    .click();
  await openFirst(page);
  await page
    .getByRole("button", { name: "Marcar como lido", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Acessibilidade", exact: true })
    .click();
  await page.getByRole("button", { name: "Limpar minhas marcações" }).click();
  await expect(page.locator("#clear-status")).toContainText("apagados");
  await page.keyboard.press("Escape");
  await expect(page.locator("#reading-count")).toContainText("0 de 6");
  await expect(page.locator("#saved-count")).toHaveText("(0)");
  await page
    .getByRole("button", {
      name: "Favoritar: Movimento no cotidiano",
      exact: true,
    })
    .click();
  await page.reload();
  await expect(page.locator("#saved-count")).toHaveText("(0)");
  await page
    .getByRole("button", {
      name: "Favoritar: Movimento no cotidiano",
      exact: true,
    })
    .click();
  await page.getByRole("link", { name: "Privacidade", exact: true }).click();
  await page.goBack();
  await expect(page.locator("#saved-count")).toHaveText("(0)");
  expect(
    await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
    })),
  ).toEqual({ local: 0, session: 0 });
  expect(await context.cookies()).toHaveLength(0);
});

test("timer pausa, retoma, termina e muda duração sem intervalo duplicado", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await page
    .getByRole("button", { name: "Iniciar pausa", exact: true })
    .click();
  await page.clock.fastForward(15_000);
  await expect(page.locator("#timer-display")).toHaveText("00:45");
  await page.getByRole("button", { name: "Pausar contagem" }).click();
  await page.clock.fastForward(50_000);
  await expect(page.locator("#timer-display")).toHaveText("00:45");
  await page.getByRole("button", { name: "Continuar pausa" }).click();
  await page.clock.fastForward(46_000);
  await expect(page.locator("#timer-display")).toHaveText("00:00");
  await expect(page.locator("#timer-status")).toContainText("terminou");
  await page.getByRole("button", { name: "Iniciar nova pausa" }).click();
  await expect(page.locator("#timer-display")).toHaveText("01:00");
  await page.getByLabel("Duração").selectOption("120");
  await expect(page.locator("#timer-display")).toHaveText("02:00");
  await page.clock.fastForward(5_000);
  await expect(page.locator("#timer-display")).toHaveText("02:00");
  await page
    .getByRole("button", { name: "Iniciar pausa", exact: true })
    .click();
  await page.clock.fastForward(10_000);
  await expect(page.locator("#timer-display")).toHaveText("01:50");
  await page.getByRole("button", { name: "Reiniciar", exact: true }).click();
  await expect(page.locator("#timer-display")).toHaveText("02:00");
});

test("não carrega recursos externos e não apresenta erros de execução ou CSP", async ({
  page,
}) => {
  const external = [],
    errors = [];
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== "http://127.0.0.1:4173")
      external.push(request.url());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await openFirst(page);
  await page.keyboard.press("Escape");
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});

test("acessibilidade automatizada da página, artigo e configurações", async ({
  page,
}) => {
  await page.goto("/");
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await openFirst(page);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Acessibilidade", exact: true })
    .click();
  await page.getByLabel("Ampliado").check();
  await page.getByLabel("Usar alto contraste").check();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("teclado abre configurações e mantém foco dentro do modal", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Pular para o conteúdo" }),
  ).toBeFocused();
  const trigger = page.getByRole("button", {
    name: "Acessibilidade",
    exact: true,
  });
  await trigger.focus();
  await page.keyboard.press("Enter");
  for (let index = 0; index < 12; index++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() =>
        Boolean(document.activeElement.closest("dialog[open]")),
      ),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

for (const width of [320, 390, 768, 1440]) {
  test(`layout sem rolagem horizontal em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Acessibilidade", exact: true })
      .click();
    await page.getByLabel("Ampliado").check();
    await page.keyboard.press("Escape");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await openFirst(page);
    expect(
      await page
        .locator("#article-dialog")
        .evaluate((dialog) => dialog.scrollWidth <= dialog.clientWidth),
    ).toBe(true);
  });
}

for (const path of ["privacidade.html", "termos.html", "fontes.html"]) {
  test(`${path} funciona sem JavaScript e passa na análise de acessibilidade`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    const response = await page.goto(`http://127.0.0.1:4173/${path}`);
    expect(response.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page
      .getByRole("link", { name: "← Voltar ao início", exact: true })
      .click();
    await expect(
      page.getByText("Ative o JavaScript para usar a biblioteca interativa.", {
        exact: false,
      }),
    ).toBeVisible();
    await context.close();
    const enabledContext = await browser.newContext();
    const enabled = await enabledContext.newPage();
    await enabled.goto(`http://127.0.0.1:4173/${path}`);
    expect(
      (await new AxeBuilder({ page: enabled }).analyze()).violations,
    ).toEqual([]);
    await enabledContext.close();
  });
}

test("servidor local não expõe .git, dependências ou arquivos fora da raiz", async ({
  request,
}) => {
  for (const path of [
    "/.git/config",
    "/package-lock.json",
    "/node_modules/axe-core/axe.js",
    "/assets/%2e%2e/%2e%2e/.bash_history",
  ]) {
    expect((await request.get(path)).status()).toBe(404);
  }
  expect((await request.post("/")).status()).toBe(405);
  expect((await request.head("/")).status()).toBe(200);
});

test("caminhos relativos funcionam no subdiretório do GitHub Pages", async ({
  page,
}) => {
  const prefix = "/Projeto-VitaSenior";
  await page.route("**/Projeto-VitaSenior/**", async (route) => {
    const url = new URL(route.request().url());
    const response = await page.request.get(
      url.pathname.slice(prefix.length) || "/",
    );
    await route.fulfill({ response });
  });
  await page.goto(`${prefix}/`);
  await expect(page.locator(".content-card")).toHaveCount(6);
  await expect(page.locator("#library-fallback")).toBeHidden();
  expect(
    await page
      .locator(".hero-art img")
      .evaluate((img) => img.complete && img.naturalWidth > 0),
  ).toBe(true);
  await openFirst(page);
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Privacidade", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${prefix}/privacidade.html$`));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Privacidade, com clareza",
  );
});
