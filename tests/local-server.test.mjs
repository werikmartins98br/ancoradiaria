import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("o servidor local entrega a Home, o manifest e o service worker", async () => {
  const port = 4198;
  const child = spawn(process.execPath, ["scripts/serve-local.mjs"], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });

  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("O servidor local não iniciou a tempo.")), 5000);
      child.once("error", reject);
      child.stdout.on("data", (chunk) => {
        if (String(chunk).includes("Âncora Diária disponível")) {
          clearTimeout(timeout);
          resolve();
        }
      });
    });

    const [home, manifest, worker] = await Promise.all([
      fetch(`http://127.0.0.1:${port}/`),
      fetch(`http://127.0.0.1:${port}/manifest.webmanifest`),
      fetch(`http://127.0.0.1:${port}/sw.js`),
    ]);

    assert.equal(home.status, 200);
    assert.match(home.headers.get("content-type") ?? "", /^text\/html/);
    assert.match(await home.text(), /Âncora Diária/);
    assert.equal(manifest.status, 200);
    assert.match(manifest.headers.get("content-type") ?? "", /application\/manifest\+json/);
    assert.equal((await manifest.json()).name, "Âncora Diária");
    assert.equal(worker.status, 200);
    assert.match(await worker.text(), /ancora-diaria-/);
  } finally {
    child.kill("SIGTERM");
  }
});
