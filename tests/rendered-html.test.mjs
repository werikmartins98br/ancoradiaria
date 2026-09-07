import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist", "client");

test("o build estático contém a aplicação e os metadados PWA", async () => {
  const html = await readFile(path.join(output, "index.html"), "utf8");
  const manifest = JSON.parse(await readFile(path.join(output, "manifest.webmanifest"), "utf8"));

  assert.match(html, /<html[^>]+lang=["']pt-BR["']/i);
  assert.match(html, /Âncora Diária — Um lugar para voltar/);
  assert.match(html, /manifest\.webmanifest/);
  assert.equal(manifest.name, "Âncora Diária");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/#/home");
  assert.equal(manifest.icons.length, 2);

  await Promise.all([
    access(path.join(output, "icons", "icon-192.png")),
    access(path.join(output, "icons", "icon-512.png")),
    access(path.join(output, "assets", "navio.png")),
    access(path.join(output, "assets", "aquarelas", "el_11.png")),
    access(path.join(output, "assets", "aquarelas", "el_09.png")),
    access(path.join(output, "fonts", "lora-regular.ttf")),
  ]);
});

test("o service worker pré-carrega o build e só atende a origem local", async () => {
  const worker = await readFile(path.join(output, "sw.js"), "utf8");
  assert.match(worker, /const CACHE = "ancora-diaria-[a-f0-9]{12}"/);
  assert.match(worker, /\/index\.html/);
  assert.match(worker, /\/manifest\.webmanifest/);
  assert.match(worker, /url\.origin !== self\.location\.origin/);
  assert.match(worker, /event\.request\.mode === "navigate"/);
});
