import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const read = (file) => readFile(path.join(root, file), "utf8");

test("a navegação editorial reúne menu, introdução, sobre e preferências", async () => {
  const [shell, navigation, about] = await Promise.all([
    read("app/components/app-shell.tsx"),
    read("app/lib/navigation.ts"),
    read("app/components/screens/about-screen.tsx"),
  ]);

  assert.match(shell, /Menu do Âncora Diária/);
  assert.match(shell, /Preferências e backup/);
  assert.match(navigation, /"introduction"/);
  assert.match(navigation, /"about"/);
  assert.match(about, /TDAH e dificuldades de constância/);
  assert.match(about, /Não diagnostica, não trata/);
});

test("a identidade viva usa aquarelas, mar animado e linha do tempo acessível", async () => {
  const [home, logbook, styles] = await Promise.all([
    read("app/components/screens/home-screen.tsx"),
    read("app/components/screens/personal-screens.tsx"),
    read("app/globals.css"),
  ]);

  assert.match(home, /home-sea__line/);
  assert.match(logbook, /Linha do tempo do Diário de Bordo/);
  assert.match(styles, /@keyframes sea-drift/);
  assert.match(styles, /html\[data-motion="reduced"\] \.home-sea__line/);
  assert.doesNotMatch(`${home}\n${logbook}`, /fundear|fundeadouro/i);

  await Promise.all([
    access(path.join(root, "public", "assets", "aquarelas", "el_04.png")),
    access(path.join(root, "public", "assets", "aquarelas", "el_09.png")),
    access(path.join(root, "public", "assets", "aquarelas", "el_11.png")),
    access(path.join(root, "public", "assets", "aquarelas", "el_22.png")),
  ]);
});
