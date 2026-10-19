// Servidor local de desenvolvimento. Não utilizar como servidor de produção.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { extname, resolve, sep } from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const port = Number(process.env.PORT || 4173);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
};
const publicFiles = new Set([
  "index.html",
  "privacidade.html",
  "termos.html",
  "fontes.html",
]);
const publicDirectories = ["assets/", "css/", "js/"];
createServer(async (request, response) => {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    const relative = pathname.replace(/^\/+/, "") || "index.html";
    const file = resolve(root, relative);
    if (
      !file.startsWith(root.endsWith(sep) ? root : root + sep) ||
      (!publicFiles.has(relative) &&
        !publicDirectories.some((dir) => relative.startsWith(dir))) ||
      relative.split("/").some((part) => part.startsWith("."))
    ) {
      response.writeHead(404);
      response.end("Não encontrado");
      return;
    }
    const metadata = await stat(file);
    if (!metadata.isFile()) throw new Error("Not a file");
    const body = await readFile(file);
    response.writeHead(200, {
      "Content-Type": mime[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Não encontrado");
  }
}).listen(port, "127.0.0.1", () =>
  process.stdout.write(`VitaSênior: http://127.0.0.1:${port}\n`),
);
