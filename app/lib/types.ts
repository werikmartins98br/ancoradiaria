export type ThemeName = "light" | "dark" | "sepia";
export type ReadingWidth = "focused" | "comfortable" | "wide";

export type RelatedRoute = { id: string; reason: string };

export type Devotional = {
  id: string;
  journeyId: string;
  stage: number;
  type: string;
  title: string;
  reference: string;
  bibleBook: string;
  duration: number;
  tags: string[];
  text: string;
  idea: string;
  reflection: string;
  context: string;
  questions: string[];
  today: string;
  prayer: string;
  carry: string;
  writingPrompt: string;
  related: RelatedRoute[];
};

export type Journey = {
  id: string;
  depth: number;
  course: string;
  name: string;
  subtitle: string;
  count: number;
  needs: string[];
  description: string;
};

export type Depth = {
  id: number;
  roman: string;
  name: string;
  subtitle: string;
  description: string;
};

export type ContentDatabase = {
  schemaVersion: number;
  generatedAt: string;
  source: string;
  stats: { devotionals: number; journeys: number; relations: number; bibleBooks: number };
  depths: Depth[];
  journeys: Journey[];
  devotionals: Devotional[];
};

export type Note = {
  id: string;
  devotionalId: string;
  text: string;
  marker: string;
  createdAt: string;
  updatedAt: string;
};

export type Milestone = {
  id: string;
  devotionalId: string;
  text: string;
  kind: string;
  createdAt: string;
};

export type AppState = {
  version: 1;
  onboarded: boolean;
  lastDevotionalId: string | null;
  lastJourneyId: string | null;
  lastResumePath: string;
  traversalIndex: number;
  completed: string[];
  favorites: string[];
  reread: string[];
  prayerCollection: string[];
  importantCollection: string[];
  notes: Note[];
  milestones: Milestone[];
  readingPositions: Record<string, number>;
  journeyStartedAt: Record<string, string>;
  settings: {
    theme: ThemeName;
    fontScale: number;
    readingWidth: ReadingWidth;
    reducedMotion: boolean;
  };
};
