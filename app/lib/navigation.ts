"use client";

import { useCallback, useEffect, useState } from "react";

export type AppRoute = {
  page: "home" | "journeys" | "journey" | "devotional" | "compass" | "traversal" | "needs" | "saved" | "logbook" | "cartography" | "search" | "introduction" | "about" | "settings";
  id?: string;
};

const pages = new Set<AppRoute["page"]>([
  "home", "journeys", "journey", "devotional", "compass", "traversal", "needs", "saved", "logbook", "cartography", "search", "introduction", "about", "settings",
]);

export function parseRoute(hash: string): AppRoute {
  const [page, id] = hash.replace(/^#\/?/, "").split("/");
  return pages.has(page as AppRoute["page"]) ? { page: page as AppRoute["page"], id } : { page: "home" };
}

export function routeHref(page: AppRoute["page"], id?: string) {
  return `#/${page}${id ? `/${id}` : ""}`;
}

export function goTo(page: AppRoute["page"], id?: string) {
  const next = routeHref(page, id);
  if (window.location.hash === next) window.scrollTo({ top: 0, behavior: "smooth" });
  else window.location.hash = next;
}

export function useAppRoute() {
  const [route, setRoute] = useState<AppRoute>({ page: "home" });
  useEffect(() => {
    const sync = () => setRoute(parseRoute(window.location.hash));
    if (!window.location.hash) window.history.replaceState(null, "", routeHref("home"));
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const navigate = useCallback((page: AppRoute["page"], id?: string) => goTo(page, id), []);
  return { route, navigate };
}
