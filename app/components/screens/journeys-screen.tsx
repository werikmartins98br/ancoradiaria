"use client";

import { useState } from "react";
import { Anchor, ArrowLeft, ArrowRight, Check, Map, Route as RouteIcon } from "lucide-react";
import { depths, devotionalsByJourney, journeyById, journeys } from "@/app/data/content";
import { journeyProgress } from "@/app/lib/discovery";
import { useAppState } from "@/app/lib/app-state";
import type { AppRoute } from "@/app/lib/navigation";
import { DepthMark, DevotionalListItem, EmptyState, JourneyCard, JourneyProgressLine, RichText, ScreenHeader } from "@/app/components/shared";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Navigate = (page: AppRoute["page"], id?: string) => void;

export function JourneysScreen({ navigate }: { navigate: Navigate }) {
  const [depth, setDepth] = useState("all");
  const filteredDepths = depth === "all" ? depths : depths.filter((item) => String(item.id) === depth);

  return (
    <div className="screen journeys-screen">
      <ScreenHeader eyebrow="Mapa das jornadas" title="Quarenta e duas formas de entrar" description="As braças indicam profundidade, não uma ordem obrigatória. Você pode começar por qualquer percurso." />

      <div className="journeys-atlas">
        <div className="journeys-atlas__legend" aria-hidden="true"><span>Superfície</span><i /><span>Profundidade</span></div>
        <div className="depth-overview" aria-label="Seis braças da obra">
          {depths.map((item) => { const active = depth === String(item.id); return <button key={item.id} aria-pressed={active} className={`depth-overview__item depth-${item.id} ${active ? "is-selected" : ""}`} onClick={() => setDepth(String(item.id))}><span>{item.roman}</span><strong>{item.name}</strong><small>{journeys.filter((journey) => journey.depth === item.id).reduce((total, journey) => total + journey.count, 0)} devocionais</small><DepthMark depth={item.id} inverse={item.id > 3} /></button>; })}
        </div>
        <img className="journeys-atlas__map" src="/assets/mapa-canto.png" alt="" aria-hidden="true" />
        <img className="journeys-atlas__mountains" src="/assets/aquarelas/el_05.png" alt="" aria-hidden="true" />
        <img className="journeys-atlas__route" src="/assets/aquarelas/fio_04.png" alt="" aria-hidden="true" />
      </div>

      <Tabs value={depth} onValueChange={setDepth} className="journey-tabs">
        <TabsList variant="line" className="journey-tabs__list">
          <TabsTrigger value="all">Todas</TabsTrigger>
          {depths.map((item) => <TabsTrigger key={item.id} value={String(item.id)}>{item.roman}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <div className="depth-groups">
        {filteredDepths.map((item) => (
          <section key={item.id} className="depth-group">
            <header>
              <div className="depth-group__number"><DepthMark depth={item.id} /> <span>Braça {item.roman}</span></div>
              <h2>{item.name}</h2>
              <p>{item.subtitle}</p>
            </header>
            <div className="journey-grid">
              {journeys.filter((journey) => journey.depth === item.id).map((journey) => <JourneyCard key={journey.id} journey={journey} onOpen={() => navigate("journey", journey.id)} />)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export function JourneyScreen({ id, navigate }: { id?: string; navigate: Navigate }) {
  const { state, setState } = useAppState();
  const journey = id ? journeyById.get(id) : null;
  const entries = journey ? devotionalsByJourney.get(journey.id) ?? [] : [];
  const progress = journey ? journeyProgress(journey, state) : null;
  const nextEntry = entries.find((item) => !state.completed.includes(item.id)) ?? entries[0];
  const nearby = journey ? journeys.filter((item) => item.depth === journey.depth && item.id !== journey.id).slice(0, 3) : [];

  if (!journey) return <div className="screen"><EmptyState title="Jornada não encontrada" icon={<Map />}>Esta rota não existe na base atual.</EmptyState></div>;

  const start = () => {
    setState((current) => ({
      ...current,
      lastJourneyId: journey.id,
      journeyStartedAt: current.journeyStartedAt[journey.id] ? current.journeyStartedAt : { ...current.journeyStartedAt, [journey.id]: new Date().toISOString() },
    }));
    navigate("devotional", nextEntry.id);
  };

  return (
    <div className="screen journey-detail">
      <button className="back-button" onClick={() => navigate("journeys")}><ArrowLeft /> Voltar ao mapa</button>
      <section className={`journey-hero depth-${journey.depth}`}>
        <div className="journey-hero__copy">
          <div className="journey-hero__meta"><DepthMark depth={journey.depth} inverse={journey.depth > 3} /> Braça {journey.depth} · {journey.course}</div>
          <p className="eyebrow">Jornada {Number(journey.id.slice(1)).toString().padStart(2, "0")}</p>
          <h1>{journey.name}</h1>
          <p className="journey-hero__subtitle">{journey.subtitle}</p>
          <RichText text={journey.description} className="journey-hero__description" />
          <JourneyProgressLine journey={journey} />
          <button className="light-button" onClick={start}>{progress?.completed ? "Continuar jornada" : "Iniciar jornada"} <ArrowRight /></button>
        </div>
        <div className="journey-hero__art" aria-hidden="true"><img src={journey.depth >= 4 ? "/assets/farol.png" : "/assets/veleiro.png"} alt="" /></div>
      </section>

      <section className="journey-needs">
        <span>Esta jornada pode acompanhar quem diz:</span>
        <div>{journey.needs.map((need) => <button key={need} onClick={() => { window.sessionStorage.setItem("ancora:need", need); navigate("needs"); }}>{need}</button>)}</div>
      </section>

      <section className="journey-stages">
        <div className="home-section__heading"><p className="eyebrow">O percurso</p><h2>{journey.count} etapas, no seu ritmo</h2></div>
        <div className="journey-stages__list">
          {entries.map((entry, index) => (
            <div key={entry.id} className="journey-stage-wrap">
              {index < entries.length - 1 && <span className={`journey-stage-line ${state.completed.includes(entry.id) ? "is-complete" : ""}`} />}
              <DevotionalListItem devotional={entry} onOpen={() => navigate("devotional", entry.id)} />
            </div>
          ))}
        </div>
      </section>

      {progress?.done && (
        <section className="journey-complete"><span><Check /></span><div><p className="eyebrow">Marco de percurso</p><h2>Esta jornada foi percorrida.</h2><p>Ela continua disponível para releitura. Concluir não fecha uma rota; apenas registra que você já passou por ela.</p></div></section>
      )}

      <section className="nearby-routes">
        <div className="home-section__heading"><p className="eyebrow">Na mesma braça</p><h2>Outros percursos próximos</h2></div>
        <div className="journey-grid">{nearby.map((item) => <JourneyCard key={item.id} journey={item} onOpen={() => navigate("journey", item.id)} />)}</div>
      </section>

      <footer className="journey-footer"><Anchor /><span>Não há relógio aqui — só direção.</span><button onClick={() => navigate("traversal")}><RouteIcon /> Ver Grande Travessia</button></footer>
    </div>
  );
}
