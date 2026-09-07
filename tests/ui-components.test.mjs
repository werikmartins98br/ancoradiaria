import assert from "node:assert/strict";
import test, { after } from "node:test";
import { createServer } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vite = await createServer({
  appType: "custom",
  configFile: false,
  root,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true },
});

after(async () => vite.close());

const contentModule = await vite.ssrLoadModule("/app/data/content.ts");
const discovery = await vite.ssrLoadModule("/app/lib/discovery.ts");
const stateModule = await vite.ssrLoadModule("/app/lib/app-state.tsx");

test("a mesma base alimenta jornadas, busca e travessia", () => {
  const { content, devotionals, journeys, devotionalById, journeyById } = contentModule;
  assert.equal(devotionals.length, 437);
  assert.equal(journeys.length, 42);
  assert.equal(content.stats.relations, 1193);
  assert.equal(content.stats.bibleBooks, 65);
  assert.equal(devotionalById.size, 437);
  assert.equal(journeyById.size, 42);
  assert.equal(new Set(devotionals.map((item) => item.id)).size, 437);
  assert.ok(devotionals.every((item) => journeyById.has(item.journeyId)));
  assert.ok(devotionals.every((item) => item.related.every((route) => devotionalById.has(route.id))));
});

test("a busca local prioriza correspondências temáticas reais", () => {
  const result = discovery.searchDevotionals("medo", { status: "all" }, stateModule.DEFAULT_STATE);
  assert.ok(result.length >= 10);
  assert.match(result[0].title.toLocaleLowerCase("pt-BR"), /medo/);
  assert.ok(result.slice(0, 8).every((item) => discovery.normalizeText(`${item.title} ${item.idea} ${item.reflection} ${item.tags.join(" ")}`).includes("medo")));

  const reference = discovery.searchDevotionals("Romanos 5:1-5", { status: "all" }, stateModule.DEFAULT_STATE);
  assert.equal(reference[0].id, "J39E01");
});

test("a Bússola sempre recomenda jornadas existentes e sem duplicação", () => {
  const [arrival, weight, need] = discovery.COMPASS_QUESTIONS;
  const answers = {
    arrival: arrival.answers.find((item) => item.id === "anxious"),
    weight: weight.answers.find((item) => item.id === "future"),
    need: need.answers.find((item) => item.id === "hope"),
  };
  const results = discovery.recommendJourneys(answers);
  assert.equal(results.length, 4);
  assert.equal(new Set(results.map((item) => item.journey.id)).size, 4);
  assert.ok(results.every((item) => contentModule.journeyById.has(item.journey.id)));
  assert.ok(results[0].score > 0);
});

test("a Âncora Mínima deriva uma aplicação existente para toda leitura", () => {
  const applications = contentModule.devotionals.map(discovery.minimalApplicationFor);
  assert.equal(applications.length, 437);
  assert.ok(applications.every((value) => typeof value === "string" && value.trim().length > 0));
});

test("importação de backup normaliza listas e preferências", () => {
  const restored = stateModule.normalizeImportedState({
    state: {
      onboarded: true,
      completed: ["J01E01", "J01E01", 42],
      favorites: ["J39E01"],
      notes: [{ id: "nota-qa", devotionalId: "J01E01", text: "registro", marker: "Reflexão", createdAt: "2026-01-01", updatedAt: "2026-01-01" }],
      settings: { theme: "sepia", fontScale: 9, readingWidth: "wide", reducedMotion: true },
    },
  });
  assert.deepEqual(restored.completed, ["J01E01"]);
  assert.deepEqual(restored.favorites, ["J39E01"]);
  assert.equal(restored.notes.length, 1);
  assert.equal(restored.settings.theme, "sepia");
  assert.equal(restored.settings.fontScale, 1.3);
  assert.equal(restored.settings.readingWidth, "wide");
  assert.equal(restored.settings.reducedMotion, true);
});
