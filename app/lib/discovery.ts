import { devotionals, devotionalsByJourney, journeyById, journeys } from "@/app/data/content";
import type { AppState, Devotional, Journey } from "@/app/lib/types";

export const normalizeText = (value = "") => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const devotionalCorpus = new Map(devotionals.map((item) => {
  const journey = journeyById.get(item.journeyId);
  return [item.id, normalizeText([
    item.title,
    item.reference,
    item.bibleBook,
    item.type,
    ...item.tags,
    journey?.name,
    journey?.subtitle,
    ...(journey?.needs ?? []),
    item.text,
    item.idea,
    item.reflection,
    item.context,
    ...item.questions,
    item.today,
    item.prayer,
    item.carry,
    item.writingPrompt,
  ].filter(Boolean).join(" "))];
}));

export type SearchFilters = {
  journeyId?: string;
  bibleBook?: string;
  type?: string;
  duration?: number;
  status?: "all" | "completed" | "unread" | "favorite";
};

export function minimalApplicationFor(devotional: Devotional) {
  return devotional.today || devotional.carry;
}

export function searchDevotionals(query: string, filters: SearchFilters, state: AppState) {
  const normalized = normalizeText(query);
  const terms = normalized.split(" ").filter(Boolean);
  const completed = new Set(state.completed);
  const favorites = new Set(state.favorites);

  return devotionals
    .filter((item) => !filters.journeyId || item.journeyId === filters.journeyId)
    .filter((item) => !filters.bibleBook || item.bibleBook === filters.bibleBook)
    .filter((item) => !filters.type || item.type === filters.type)
    .filter((item) => !filters.duration || item.duration === filters.duration)
    .filter((item) => filters.status !== "completed" || completed.has(item.id))
    .filter((item) => filters.status !== "unread" || !completed.has(item.id))
    .filter((item) => filters.status !== "favorite" || favorites.has(item.id))
    .map((item) => {
      if (!terms.length) return { item, score: 1 };
      const journey = journeyById.get(item.journeyId);
      const title = normalizeText(item.title);
      const reference = normalizeText(item.reference);
      const tags = normalizeText(item.tags.join(" "));
      const journeyText = normalizeText(`${journey?.name ?? ""} ${journey?.subtitle ?? ""} ${(journey?.needs ?? []).join(" ")}`);
      let score = 0;
      if (title.includes(normalized)) score += 14;
      if (reference.includes(normalized)) score += 12;
      if (tags.includes(normalized)) score += 10;
      if (journeyText.includes(normalized)) score += 8;
      for (const term of terms) {
        if (title.includes(term)) score += 6;
        if (reference.includes(term)) score += 5;
        if (tags.includes(term)) score += 4;
        if (journeyText.includes(term)) score += 3;
        if ((devotionalCorpus.get(item.id) ?? "").includes(term)) score += 1;
      }
      return { item, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id))
    .map((result) => result.item);
}

export type CompassAnswer = { id: string; label: string; terms: string[] };
export type CompassQuestion = { id: "arrival" | "weight" | "need"; prompt: string; answers: CompassAnswer[] };

export const COMPASS_QUESTIONS: CompassQuestion[] = [
  {
    id: "arrival",
    prompt: "Como você está chegando hoje?",
    answers: [
      { id: "calm", label: "Tranquilo", terms: ["calmaria", "gratidao", "presenca"] },
      { id: "tired", label: "Cansado", terms: ["cansado", "exausto", "descanso", "perseveranca"] },
      { id: "anxious", label: "Ansioso", terms: ["ansiedade", "preocupado", "futuro", "confianca"] },
      { id: "frustrated", label: "Frustrado", terms: ["espera", "conflito", "trabalho", "desanimado"] },
      { id: "confused", label: "Confuso", terms: ["discernimento", "decisao", "sabedoria", "direcao"] },
      { id: "discouraged", label: "Desanimado", terms: ["desanimado", "perseveranca", "esperanca", "recomeco"] },
      { id: "grateful", label: "Grato", terms: ["gratidao", "contentamento", "louvor"] },
      { id: "directionless", label: "Sem direção", terms: ["direcao", "proposito", "vocacao", "decisao"] },
    ],
  },
  {
    id: "weight",
    prompt: "O que mais pesa neste momento?",
    answers: [
      { id: "decision", label: "Decisão", terms: ["decisao", "sabedoria", "discernimento"] },
      { id: "fear", label: "Medo", terms: ["medo", "coragem", "futuro"] },
      { id: "guilt", label: "Culpa", terms: ["culpa", "vergonha", "perdao", "graca"] },
      { id: "relationship", label: "Relacionamento", terms: ["relacionamento", "casamento", "familia", "conflito", "perdao"] },
      { id: "future", label: "Futuro", terms: ["futuro", "esperanca", "ansiedade", "transicao"] },
      { id: "waiting", label: "Espera", terms: ["espera", "silencio", "paciencia"] },
      { id: "work", label: "Trabalho", terms: ["trabalho", "sobrecarga", "proposito"] },
      { id: "spirituality", label: "Vida espiritual", terms: ["oracao", "fe", "constancia", "biblia"] },
      { id: "loss", label: "Perda", terms: ["luto", "perda", "sofrimento", "consolo"] },
      { id: "discipline", label: "Disciplina", terms: ["disciplina", "constancia", "dominio proprio", "obediencia"] },
    ],
  },
  {
    id: "need",
    prompt: "O que você mais precisa agora?",
    answers: [
      { id: "comfort", label: "Consolo", terms: ["consolo", "luto", "sofrimento", "presenca"] },
      { id: "direction", label: "Direção", terms: ["direcao", "decisao", "proposito", "discernimento"] },
      { id: "correction", label: "Correção", terms: ["correcao", "santidade", "obediencia", "arrependimento"] },
      { id: "hope", label: "Esperança", terms: ["esperanca", "futuro", "perseveranca"] },
      { id: "rest", label: "Descanso", terms: ["descanso", "exausto", "calmaria", "paz"] },
      { id: "courage", label: "Coragem", terms: ["coragem", "medo", "obediencia", "perseveranca"] },
      { id: "wisdom", label: "Sabedoria", terms: ["sabedoria", "discernimento", "decisao"] },
      { id: "prayer", label: "Oração", terms: ["oracao", "clamor", "silencio"] },
      { id: "restart", label: "Recomeço", terms: ["recomeco", "retorno", "graca", "arrependimento"] },
    ],
  },
];

const journeyCorpus = new Map(journeys.map((journey) => {
  const entries = devotionalsByJourney.get(journey.id) ?? [];
  return [journey.id, normalizeText([
    journey.name,
    journey.subtitle,
    journey.description,
    ...journey.needs,
    ...entries.flatMap((item) => [item.title, ...item.tags, item.idea]),
  ].join(" "))];
}));

export function recommendJourneys(answers: Partial<Record<CompassQuestion["id"], CompassAnswer>>) {
  const selected = Object.values(answers).filter(Boolean) as CompassAnswer[];
  const weightedTerms = selected.flatMap((answer, answerIndex) => answer.terms.map((term) => ({ term, weight: answerIndex === 2 ? 4 : answerIndex === 1 ? 3 : 2 })));
  return journeys
    .map((journey) => {
      const corpus = journeyCorpus.get(journey.id) ?? "";
      const needCorpus = normalizeText(journey.needs.join(" "));
      let score = 0;
      const matches: string[] = [];
      for (const { term, weight } of weightedTerms) {
        const normalizedTerm = normalizeText(term);
        if (needCorpus.includes(normalizedTerm)) score += weight * 3;
        if (corpus.includes(normalizedTerm)) {
          score += weight;
          matches.push(term);
        }
      }
      return { journey, score, matches: [...new Set(matches)].slice(0, 3) };
    })
    .sort((a, b) => b.score - a.score || a.journey.id.localeCompare(b.journey.id))
    .slice(0, 4);
}

export function recommendationsForNeed(need: string, state: AppState) {
  const normalized = normalizeText(need);
  const relatedJourneys = journeys
    .map((journey) => {
      const corpus = journeyCorpus.get(journey.id) ?? "";
      const score = (normalizeText(journey.needs.join(" ")).includes(normalized) ? 10 : 0) + (corpus.includes(normalized) ? 3 : 0);
      return { journey, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((item) => item.journey);

  return {
    journeys: relatedJourneys,
    devotionals: searchDevotionals(need, { status: "all" }, state).slice(0, 24),
  };
}

export function devotionalNow(state: AppState): Devotional {
  const completed = new Set(state.completed);
  if (state.lastJourneyId) {
    const next = (devotionalsByJourney.get(state.lastJourneyId) ?? []).find((item) => !completed.has(item.id));
    if (next) return next;
  }
  const startedJourney = journeys.find((journey) => state.journeyStartedAt[journey.id] && (devotionalsByJourney.get(journey.id) ?? []).some((item) => !completed.has(item.id)));
  if (startedJourney) return (devotionalsByJourney.get(startedJourney.id) ?? []).find((item) => !completed.has(item.id))!;
  const firstUnread = devotionals.find((item) => !completed.has(item.id));
  return firstUnread ?? devotionals[0];
}

export function journeyProgress(journey: Journey, state: AppState) {
  const ids = new Set((devotionalsByJourney.get(journey.id) ?? []).map((item) => item.id));
  const completed = state.completed.filter((id) => ids.has(id)).length;
  return { completed, total: journey.count, done: completed === journey.count };
}
