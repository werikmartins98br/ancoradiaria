import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(root, "dist", "client");

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else files.push(absolute);
  }
  return files;
}

const files = (await walk(outputRoot)).filter((file) => path.basename(file) !== "sw.js");
const publicUrls = files.map((file) => `/${path.relative(outputRoot, file).split(path.sep).join("/")}`).sort();
const signature = createHash("sha256");
for (const file of files) {
  const info = await stat(file);
  signature.update(`${path.relative(outputRoot, file)}:${info.size};`);
}
const version = signature.digest("hex").slice(0, 12);
const source = `const CACHE = "ancora-diaria-${version}";
const PRECACHE = ${JSON.stringify(publicUrls)};

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("ancora-diaria-") && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put("/index.html", copy));
      return response;
    }).catch(() => caches.match("/index.html").then((response) => response || caches.match("/"))));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    }
    return response;
  })));
});
`;
await writeFile(path.join(outputRoot, "sw.js"), source, "utf8");
console.log(`Service worker gerado: ${publicUrls.length} arquivos essenciais, cache ${version}.`);
