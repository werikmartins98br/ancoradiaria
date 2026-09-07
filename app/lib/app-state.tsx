"use client";

import { createContext, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { AppState } from "@/app/lib/types";

const STORAGE_KEY = "ancora-diaria:web-app:v1";

export const DEFAULT_STATE: AppState = {
  version: 1,
  onboarded: false,
  lastDevotionalId: null,
  lastJourneyId: null,
  lastResumePath: "#/home",
  traversalIndex: 0,
  completed: [],
  favorites: [],
  reread: [],
  prayerCollection: [],
  importantCollection: [],
  notes: [],
  milestones: [],
  readingPositions: {},
  journeyStartedAt: {},
  settings: {
    theme: "light",
    fontScale: 1,
    readingWidth: "comfortable",
    reducedMotion: false,
  },
};

const uniqueStrings = (value: unknown) => Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === "string"))] : [];

export function normalizeImportedState(value: unknown): AppState {
  if (!value || typeof value !== "object") throw new Error("Backup inválido.");
  const candidate = (value as { state?: unknown }).state ?? value;
  if (!candidate || typeof candidate !== "object") throw new Error("Backup sem dados reconhecíveis.");
  const source = candidate as Partial<AppState>;
  const settings = source.settings ?? DEFAULT_STATE.settings;
  return {
    ...DEFAULT_STATE,
    ...source,
    version: 1,
    completed: uniqueStrings(source.completed),
    favorites: uniqueStrings(source.favorites),
    reread: uniqueStrings(source.reread),
    prayerCollection: uniqueStrings(source.prayerCollection),
    importantCollection: uniqueStrings(source.importantCollection),
    notes: Array.isArray(source.notes) ? source.notes.filter((note) => note && typeof note === "object" && typeof note.id === "string" && typeof note.devotionalId === "string" && typeof note.text === "string") : [],
    milestones: Array.isArray(source.milestones) ? source.milestones.filter((item) => item && typeof item === "object" && typeof item.id === "string" && typeof item.devotionalId === "string" && typeof item.text === "string") : [],
    readingPositions: source.readingPositions && typeof source.readingPositions === "object" ? source.readingPositions : {},
    journeyStartedAt: source.journeyStartedAt && typeof source.journeyStartedAt === "object" ? source.journeyStartedAt : {},
    settings: {
      theme: settings.theme === "dark" || settings.theme === "sepia" ? settings.theme : "light",
      fontScale: typeof settings.fontScale === "number" ? Math.min(1.3, Math.max(0.9, settings.fontScale)) : 1,
      readingWidth: settings.readingWidth === "focused" || settings.readingWidth === "wide" ? settings.readingWidth : "comfortable",
      reducedMotion: Boolean(settings.reducedMotion),
    },
  };
}

type AppStateContextValue = {
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
  hydrated: boolean;
  resetState: () => void;
  importState: (value: unknown) => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) setState(normalizeImportedState(JSON.parse(stored)));
      } catch {
        setState(DEFAULT_STATE);
      } finally {
        setHydrated(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { /* Navegação privada ou contexto isolado: mantém a sessão em memória. */ }
  }, [hydrated, state]);

  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme;
    document.documentElement.dataset.motion = state.settings.reducedMotion ? "reduced" : "full";
    document.documentElement.style.setProperty("--reader-scale", String(state.settings.fontScale));
    document.documentElement.style.setProperty("--reader-width", state.settings.readingWidth === "focused" ? "38rem" : state.settings.readingWidth === "wide" ? "52rem" : "44rem");
  }, [state.settings]);

  const value = useMemo<AppStateContextValue>(() => ({
    state,
    setState,
    hydrated,
    resetState: () => setState(DEFAULT_STATE),
    importState: (input) => setState(normalizeImportedState(input)),
  }), [state, hydrated]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useAppState precisa estar dentro de AppStateProvider.");
  return context;
}

export function toggleInList(list: string[], id: string) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export function createLocalId(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
}
