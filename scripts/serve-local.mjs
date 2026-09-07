import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(projectRoot, "dist", "client");
const port = Number(process.env.PORT || 4173);
const types = {
  ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf",
};

try { await access(path.join(publicRoot, "index.html")); }
catch { console.error("Build local não encontrado. Execute npm run build primeiro."); process.exit(1); }

const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
  let target = path.resolve(publicRoot, `.${pathname}`);
  if (!target.startsWith(publicRoot)) { response.writeHead(403); response.end("Acesso negado"); return; }
  try {
    const info = await stat(target);
    if (info.isDirectory()) target = path.join(target, "index.html");
    await access(target);
  } catch { target = path.join(publicRoot, "index.html"); }
  const extension = path.extname(target).toLowerCase();
  response.writeHead(200, {
    "Content-Type": types[extension] || "application/octet-stream",
    "Cache-Control": target.endsWith("index.html") || target.endsWith("sw.js") ? "no-cache" : "public, max-age=31536000, immutable",
    "Service-Worker-Allowed": "/",
    "X-Content-Type-Options": "nosniff",
  });
  createReadStream(target).pipe(response);
});

server.listen(port, "0.0.0.0", () => console.log(`Âncora Diária disponível em http://localhost:${port}`));
