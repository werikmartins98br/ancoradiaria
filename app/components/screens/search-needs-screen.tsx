"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Filter, Search, SlidersHorizontal } from "lucide-react";
import { bibleBooks, devotionalTypes, journeys } from "@/app/data/content";
import { recommendationsForNeed, searchDevotionals, type SearchFilters } from "@/app/lib/discovery";
import { useAppState } from "@/app/lib/app-state";
import type { AppRoute } from "@/app/lib/navigation";
import { DevotionalListItem, JourneyCard, ScreenHeader } from "@/app/components/shared";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

type Navigate = (page: AppRoute["page"], id?: string) => void;

const needs = ["Ansiedade", "Medo", "Culpa", "Perdão", "Recomeço", "Direção", "Disciplina", "Oração", "Esperança", "Descanso", "Propósito", "Sabedoria", "Decisões", "Relacionamentos", "Sofrimento", "Solidão", "Fé", "Espera"];

export function SearchScreen({ navigate }: { navigate: Navigate }) {
  const { state } = useAppState();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({ status: "all" });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const results = useMemo(() => searchDevotionals(query, filters, state), [query, filters, state]);
  const visible = results.slice(0, query || Object.values(filters).some((value) => value && value !== "all") ? 80 : 24);

  const setFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => setFilters((current) => ({ ...current, [key]: value || undefined }));

  useEffect(() => {
    const initialQuery = window.sessionStorage.getItem("ancora:search");
    const initialBook = window.sessionStorage.getItem("ancora:book");
    window.sessionStorage.removeItem("ancora:search");
    window.sessionStorage.removeItem("ancora:book");
    const frame = window.requestAnimationFrame(() => {
      if (initialQuery) setQuery(initialQuery);
      if (initialBook) {
        setFilters((current) => ({ ...current, bibleBook: initialBook }));
        setFiltersOpen(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="screen search-screen">
      <ScreenHeader eyebrow="Busca local" title="Encontre uma palavra no caminho" description="Pesquise título, frase, referência, livro bíblico, tema, jornada ou necessidade. Tudo acontece neste dispositivo." />
      <section className="search-panel">
        <label className="search-field"><Search /><span className="sr-only">Buscar na obra</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: medo, Romanos 8, direção..." autoFocus /></label>
        <button className={cn("filter-toggle", filtersOpen && "is-active")} onClick={() => setFiltersOpen((value) => !value)}><SlidersHorizontal /> Filtros</button>
      </section>

      <div className="status-chips" aria-label="Filtrar por estado">
        {[
          ["all", "Todos"], ["unread", "Não iniciados"], ["completed", "Percorridos"], ["favorite", "Favoritos"],
        ].map(([value, label]) => <button key={value} className={filters.status === value ? "is-active" : ""} onClick={() => setFilter("status", value as SearchFilters["status"])}>{label}</button>)}
      </div>

      {filtersOpen && (
        <section className="filter-panel">
          <div><label htmlFor="filter-journey">Jornada</label><NativeSelect id="filter-journey" value={filters.journeyId ?? ""} onChange={(event) => setFilter("journeyId", event.target.value)}><NativeSelectOption value="">Todas</NativeSelectOption>{journeys.map((journey) => <NativeSelectOption key={journey.id} value={journey.id}>{journey.name}</NativeSelectOption>)}</NativeSelect></div>
          <div><label htmlFor="filter-book">Livro bíblico</label><NativeSelect id="filter-book" value={filters.bibleBook ?? ""} onChange={(event) => setFilter("bibleBook", event.target.value)}><NativeSelectOption value="">Todos</NativeSelectOption>{bibleBooks.map((book) => <NativeSelectOption key={book} value={book}>{book}</NativeSelectOption>)}</NativeSelect></div>
          <div><label htmlFor="filter-type">Tipo de entrada</label><NativeSelect id="filter-type" value={filters.type ?? ""} onChange={(event) => setFilter("type", event.target.value)}><NativeSelectOption value="">Todos</NativeSelectOption>{devotionalTypes.map((type) => <NativeSelectOption key={type} value={type}>{type}</NativeSelectOption>)}</NativeSelect></div>
          <div><label htmlFor="filter-duration">Duração</label><NativeSelect id="filter-duration" value={filters.duration ?? ""} onChange={(event) => setFilter("duration", Number(event.target.value) || undefined)}><NativeSelectOption value="">Qualquer duração</NativeSelectOption>{[3, 5, 7, 10, 15].map((duration) => <NativeSelectOption key={duration} value={duration}>{duration} minutos</NativeSelectOption>)}</NativeSelect></div>
          <button className="text-button" onClick={() => setFilters({ status: "all" })}><Filter /> Limpar filtros</button>
        </section>
      )}

      <section className="search-results">
        <div className="result-count"><strong>{results.length}</strong> {results.length === 1 ? "resultado encontrado" : "resultados encontrados"}{results.length > visible.length && <span> · mostrando os {visible.length} mais relevantes</span>}</div>
        <div className="devotional-list">
          {visible.map((item) => <DevotionalListItem key={item.id} devotional={item} showJourney onOpen={() => navigate("devotional", item.id)} />)}
        </div>
        {!results.length && <div className="no-results"><Search /><h2>Nada apareceu por aqui</h2><p>Tente uma palavra mais curta, uma referência ou remova algum filtro.</p></div>}
      </section>
    </div>
  );
}

export function NeedsScreen({ navigate }: { navigate: Navigate }) {
  const { state } = useAppState();
  const [selected, setSelected] = useState("Direção");

  useEffect(() => {
    const stored = window.sessionStorage.getItem("ancora:need");
    if (!stored) return;
    window.sessionStorage.removeItem("ancora:need");
    const frame = window.requestAnimationFrame(() => setSelected(stored));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const results = useMemo(() => recommendationsForNeed(selected, state), [selected, state]);

  return (
    <div className="screen needs-screen">
      <ScreenHeader eyebrow="Preciso de..." title="Comece pelo que você está vivendo" description="Escolha uma necessidade para encontrar jornadas e devocionais relacionados. Isto é um índice temático, não diagnóstico ou revelação." />
      <div className="needs-cloud">
        {needs.map((need) => <button key={need} className={selected === need ? "is-active" : ""} onClick={() => setSelected(need)}>{need}</button>)}
      </div>

      <section className="need-results-header"><span>Rotas para</span><h2>{selected}</h2><p>Conteúdos aproximados por necessidades, títulos, temas e palavras-chave da base editorial.</p></section>

      {results.journeys.length > 0 && (
        <section className="need-journeys">
          <div className="home-section__heading"><p className="eyebrow">Jornadas</p><h2>Percursos inteiros para este momento</h2></div>
          <div className="journey-grid">{results.journeys.slice(0, 3).map((journey) => <JourneyCard key={journey.id} journey={journey} onOpen={() => navigate("journey", journey.id)} />)}</div>
        </section>
      )}

      <section className="need-devotionals">
        <div className="home-section__heading"><p className="eyebrow">Entradas relacionadas</p><h2>Leituras para começar agora</h2></div>
        <div className="devotional-list">{results.devotionals.slice(0, 18).map((item) => <DevotionalListItem key={item.id} devotional={item} showJourney onOpen={() => navigate("devotional", item.id)} />)}</div>
        <button className="outline-button" onClick={() => { window.sessionStorage.setItem("ancora:search", selected); navigate("search"); }}>Buscar mais sobre {selected.toLocaleLowerCase("pt-BR")} <ArrowRight /></button>
      </section>
    </div>
  );
}
