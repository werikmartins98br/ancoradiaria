import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataRoot = path.join(root, "editorial", "dados");
const output = path.join(root, "app", "data", "content.generated.json");

const splitTable = (source, separator) => {
  const lines = source.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const headers = lines.shift().split(separator);
  return lines.filter(Boolean).map((line) => {
    const values = line.split(separator);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
};

const parseBlocks = (source) => {
  const records = new Map();
  let record = null;
  let field = null;
  let buffer = [];

  const closeField = () => {
    if (record && field) record[field] = buffer.join("\n").trim();
    field = null;
    buffer = [];
  };

  const closeRecord = () => {
    closeField();
    if (record?.ID) records.set(record.ID, record);
    record = null;
  };

  for (const rawLine of source.split(/\r?\n/)) {
    const tag = rawLine.match(/^@@([A-ZÇÃ]+)\s*(.*)$/u);
    if (!tag) {
      if (field) buffer.push(rawLine);
      continue;
    }
    const [, name, rest] = tag;
    if (name === "ID") {
      closeRecord();
      record = { ID: rest.trim() };
    } else if (name === "FIM") {
      closeRecord();
    } else {
      closeField();
      field = name;
      if (rest.trim()) buffer.push(rest.trim());
    }
  }
  closeRecord();
  return records;
};

const cleanInline = (value = "") => value
  .replace(/<\/?font(?:\s[^>]*)?>/gi, "")
  .replace(/<(?!\/?(?:i|b)\b)[^>]*>/gi, "")
  .trim();

const list = (value = "") => value
  .split(/\r?\n/)
  .map((item) => cleanInline(item.replace(/^[-•]\s*/, "")))
  .filter(Boolean);

const routes = (value = "") => list(value).map((line) => {
  const [id, ...reason] = line.split("::");
  return { id: id.trim(), reason: reason.join("::").trim() };
});

const journeyRows = splitTable(await readFile(path.join(dataRoot, "jornadas.tsv"), "utf8"), "\t");
const manifestRows = splitTable(await readFile(path.join(dataRoot, "manifesto.psv"), "utf8"), "|");
const openings = parseBlocks(await readFile(path.join(dataRoot, "aberturas.txt"), "utf8"));
const contentFiles = (await readdir(path.join(dataRoot, "conteudo"))).filter((name) => name.endsWith(".txt")).sort();
const content = new Map();
for (const filename of contentFiles) {
  for (const [id, record] of parseBlocks(await readFile(path.join(dataRoot, "conteudo", filename), "utf8"))) {
    if (content.has(id)) throw new Error(`Conteúdo duplicado: ${id}`);
    content.set(id, record);
  }
}

const depthMeta = [
  { id: 1, roman: "I", name: "Fundamento", subtitle: "Onde a âncora encontra o fundo" },
  { id: 2, roman: "II", name: "Firmeza", subtitle: "O que sustenta quando o vento vira" },
  { id: 3, roman: "III", name: "Profundidade", subtitle: "Fé para os lugares de pressão" },
  { id: 4, roman: "IV", name: "Transformação", subtitle: "Quando a Escritura toca a vida real" },
  { id: 5, roman: "V", name: "Maturidade", subtitle: "Carregar mais, não apenas saber mais" },
  { id: 6, roman: "VI", name: "Continuidade", subtitle: "Uma prática que permanece sem o livro" },
].map((depth) => ({ ...depth, description: cleanInline(openings.get(`BRACA${depth.id}`)?.TEXTO ?? "") }));

const journeyIds = new Set(journeyRows.map((row) => row.JID));
const devotionalIds = new Set(manifestRows.map((row) => row.ID));
if (journeyIds.size !== journeyRows.length) throw new Error("Há IDs de jornada duplicados.");
if (devotionalIds.size !== manifestRows.length) throw new Error("Há IDs de devocional duplicados.");

const journeys = journeyRows.map((row) => ({
  id: row.JID,
  depth: Number(row.BRACA),
  course: row.PERCURSO,
  name: cleanInline(row.NOME),
  subtitle: cleanInline(row.SUBTITULO),
  count: Number(row.N),
  needs: row.NECESSIDADES.split(";").map((value) => value.trim()).filter(Boolean),
  description: cleanInline(openings.get(row.JID)?.TEXTO ?? ""),
}));

const devotionals = manifestRows.map((row) => {
  if (!journeyIds.has(row.JID)) throw new Error(`Jornada inexistente em ${row.ID}: ${row.JID}`);
  const body = content.get(row.ID);
  if (!body) throw new Error(`Conteúdo ausente: ${row.ID}`);
  const related = routes(body.ROTAS);
  for (const relation of related) {
    if (!devotionalIds.has(relation.id)) throw new Error(`Rota quebrada em ${row.ID}: ${relation.id}`);
    if (relation.id === row.ID) throw new Error(`Rota autorreferente em ${row.ID}`);
  }
  const tags = row.TAGS.split(";").map((value) => value.trim()).filter(Boolean);
  const reference = cleanInline(row.REFERENCIA);
  const bibleBook = reference.replace(/\s+\d.*$/, "");
  return {
    id: row.ID,
    journeyId: row.JID,
    stage: Number(row.ETAPA),
    type: row.TIPO,
    title: cleanInline(row.TITULO),
    reference,
    bibleBook,
    duration: Number(row.MIN),
    tags,
    text: cleanInline(body.TEXTO),
    idea: cleanInline(body.IDEIA),
    reflection: cleanInline(body.REFLEXAO),
    context: cleanInline(body.DENTRO),
    questions: list(body.PENSE),
    today: cleanInline(body.HOJE),
    prayer: cleanInline(body.ORE),
    carry: cleanInline(body.LEVE),
    writingPrompt: cleanInline(body.PAUTA),
    related,
  };
});

for (const journey of journeys) {
  const stages = devotionals.filter((item) => item.journeyId === journey.id).sort((a, b) => a.stage - b.stage);
  if (stages.length !== journey.count) throw new Error(`${journey.id}: esperado ${journey.count}, encontrado ${stages.length}`);
  stages.forEach((item, index) => {
    if (item.stage !== index + 1) throw new Error(`${journey.id}: lacuna na etapa ${index + 1}`);
  });
}

if (devotionals.length !== 437 || journeys.length !== 42) {
  throw new Error(`Totais inesperados: ${devotionals.length} devocionais e ${journeys.length} jornadas.`);
}

const payload = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: "editorial/dados",
  stats: {
    devotionals: devotionals.length,
    journeys: journeys.length,
    relations: devotionals.reduce((total, item) => total + item.related.length, 0),
    bibleBooks: new Set(devotionals.map((item) => item.bibleBook)).size,
  },
  depths: depthMeta,
  journeys,
  devotionals,
};

await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(payload)}\n`, "utf8");
console.log(`Conteúdo importado: ${payload.stats.devotionals} devocionais, ${payload.stats.journeys} jornadas, ${payload.stats.relations} rotas.`);
