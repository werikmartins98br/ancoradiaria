import rawContent from "./content.generated.json";
import type { ContentDatabase } from "@/app/lib/types";

export const content = rawContent as ContentDatabase;
export const devotionals = content.devotionals;
export const journeys = content.journeys;
export const depths = content.depths;

export const devotionalById = new Map(devotionals.map((item) => [item.id, item]));
export const journeyById = new Map(journeys.map((item) => [item.id, item]));

export const devotionalsByJourney = new Map(
  journeys.map((journey) => [
    journey.id,
    devotionals.filter((item) => item.journeyId === journey.id).sort((a, b) => a.stage - b.stage),
  ]),
);

export const bibleBooks = [...new Set(devotionals.map((item) => item.bibleBook))].sort((a, b) => a.localeCompare(b, "pt-BR"));
export const devotionalTypes = [...new Set(devotionals.map((item) => item.type))].sort((a, b) => a.localeCompare(b, "pt-BR"));
