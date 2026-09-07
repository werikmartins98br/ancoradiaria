import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(await readFile(path.join(root, "app", "data", "content.generated.json"), "utf8"));
const errors = [];
const required = ["id", "journeyId", "stage", "type", "title", "reference", "bibleBook", "duration", "text", "idea", "reflection", "prayer", "carry"];
const ids = new Set();
const journeyIds = new Set(data.journeys.map((item) => item.id));

for (const item of data.devotionals) {
  if (ids.has(item.id)) errors.push(`ID duplicado: ${item.id}`);
  ids.add(item.id);
  if (!journeyIds.has(item.journeyId)) errors.push(`Jornada inexistente: ${item.id} -> ${item.journeyId}`);
  for (const field of required) if (item[field] === undefined || item[field] === null || item[field] === "") errors.push(`Campo ${field} ausente em ${item.id}`);
  for (const route of item.related) {
    if (route.id === item.id) errors.push(`Rota autorreferente: ${item.id}`);
    if (!data.devotionals.some((target) => target.id === route.id)) errors.push(`Rota quebrada: ${item.id} -> ${route.id}`);
  }
}

for (const journey of data.journeys) {
  const entries = data.devotionals.filter((item) => item.journeyId === journey.id).sort((a, b) => a.stage - b.stage);
  if (entries.length !== journey.count) errors.push(`${journey.id}: ${entries.length}/${journey.count} etapas`);
  entries.forEach((item, index) => { if (item.stage !== index + 1) errors.push(`${journey.id}: lacuna antes de ${item.id}`); });
  if (!journey.needs.length) errors.push(`${journey.id}: sem necessidades para Bússola/Preciso de`);
}

const signatures = new Set();
for (const item of data.devotionals) {
  const signature = `${item.reference}|${item.title}|${item.text}|${item.reflection}`;
  if (signatures.has(signature)) errors.push(`Conteúdo integral duplicado: ${item.id}`);
  signatures.add(signature);
}

if (data.devotionals.length !== 437) errors.push(`Grande Travessia incompleta: ${data.devotionals.length}/437`);
if (data.journeys.length !== 42) errors.push(`Mapa incompleto: ${data.journeys.length}/42`);
if (data.stats.relations !== 1193) errors.push(`Relações inesperadas: ${data.stats.relations}/1193`);
if (new Set(data.devotionals.map((item) => item.bibleBook)).size !== 65) errors.push("Cobertura bíblica inesperada.");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("QA de dados aprovado: IDs, jornadas, relações, busca, travessia, campos e duplicação.");
