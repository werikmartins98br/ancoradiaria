"use client";

import { Anchor, ArrowLeft, ArrowRight, Check, Flag, MapPin, Route as RouteIcon } from "lucide-react";
import { depths, devotionals, journeyById } from "@/app/data/content";
import { useAppState } from "@/app/lib/app-state";
import type { AppRoute } from "@/app/lib/navigation";
import { DepthMark, DevotionalListItem, ScreenHeader } from "@/app/components/shared";

type Navigate = (page: AppRoute["page"], id?: string) => void;

export function TraversalScreen({ navigate }: { navigate: Navigate }) {
  const { state, setState } = useAppState();
  const index = Math.min(devotionals.length - 1, Math.max(0, state.traversalIndex));
  const current = devotionals[index];
  const previous = devotionals[index - 1];
  const next = devotionals[index + 1];
  const journey = journeyById.get(current.journeyId)!;
  const nearby = devotionals.slice(Math.max(0, index - 2), Math.min(devotionals.length, index + 4));
  const journeyStart = devotionals.findIndex((item) => item.journeyId === current.journeyId);
  const journeyEnd = journeyStart + journey.count - 1;

  const move = (nextIndex: number) => setState((value) => ({ ...value, traversalIndex: Math.min(devotionals.length - 1, Math.max(0, nextIndex)), lastResumePath: "#/traversal" }));
  const openCurrent = () => {
    window.sessionStorage.setItem("ancora:from-traversal", String(index));
    setState((value) => ({ ...value, traversalIndex: index, lastResumePath: "#/traversal" }));
    navigate("devotional", current.id);
  };

  return (
    <div className="screen traversal-screen">
      <ScreenHeader eyebrow="Grande Travessia" title="A obra inteira, em uma sequência possível" description="Quatrocentas e trinta e sete etapas em ordem de profundidade crescente. Sem datas e sem prazo." />

      <section className="traversal-map">
        <div className="traversal-map__head">
          <span><RouteIcon /> Posição atual</span>
          <strong>{index + 1} <small>de {devotionals.length}</small></strong>
        </div>
        <div className="traversal-route" aria-hidden="true"><span style={{ width: `${((index + 1) / devotionals.length) * 100}%` }} /><i style={{ left: `${((index + 1) / devotionals.length) * 100}%` }}><Anchor /></i></div>
        <div className="traversal-depths">
          {depths.map((depth) => {
            const totalBefore = devotionals.filter((item) => (journeyById.get(item.journeyId)?.depth ?? 0) < depth.id).length;
            const isPast = index >= totalBefore;
            return <span key={depth.id} className={isPast ? "is-reached" : ""}><DepthMark depth={depth.id} /><small>{depth.roman}</small></span>;
          })}
        </div>
      </section>

      <section className={`traversal-current depth-${journey.depth}`}>
        <div className="traversal-current__meta"><DepthMark depth={journey.depth} inverse={journey.depth > 3} /> Braça {journey.depth} · {journey.name}</div>
        <p className="eyebrow">Etapa {current.stage} de {journey.count} · {current.type}</p>
        <h2>{current.title}</h2>
        <p className="traversal-current__idea">{current.idea}</p>
        <span>{current.reference} · {current.duration} min</span>
        <button className="light-button" onClick={openCurrent}>{state.completed.includes(current.id) ? "Reler esta etapa" : "Abrir esta etapa"} <ArrowRight /></button>
      </section>

      <div className="traversal-nav">
        <button disabled={!previous} onClick={() => move(index - 1)}><ArrowLeft /><span><small>Etapa anterior</small><strong>{previous?.title ?? "Início da travessia"}</strong></span></button>
        <button disabled={!next} onClick={() => move(index + 1)}><span><small>Próxima etapa</small><strong>{next?.title ?? "Fim da travessia"}</strong></span><ArrowRight /></button>
      </div>

      <section className="traversal-journey-progress">
        <div className="home-section__heading"><p className="eyebrow">Jornada atual</p><h2>{journey.name}</h2></div>
        <div className="stage-dots" aria-label={`Etapa ${current.stage} de ${journey.count}`}>
          {Array.from({ length: journey.count }, (_, stage) => {
            const entry = devotionals[journeyStart + stage];
            return <button key={entry.id} className={`${state.completed.includes(entry.id) ? "is-complete" : ""} ${journeyStart + stage === index ? "is-current" : ""}`} onClick={() => move(journeyStart + stage)} aria-label={`Ir para etapa ${stage + 1}: ${entry.title}`}>{state.completed.includes(entry.id) ? <Check /> : stage + 1}</button>;
          })}
        </div>
        <p>Esta jornada ocupa as posições {journeyStart + 1} a {journeyEnd + 1} da Grande Travessia.</p>
      </section>

      <section className="traversal-nearby">
        <div className="home-section__heading"><p className="eyebrow">Ao redor da posição atual</p><h2>Trecho da travessia</h2></div>
        <div className="devotional-list">{nearby.map((entry) => <DevotionalListItem key={entry.id} devotional={entry} showJourney onOpen={() => { move(devotionals.indexOf(entry)); navigate("devotional", entry.id); }} />)}</div>
      </section>

      <section className="traversal-milestones">
        <Flag />
        <div><p className="eyebrow">Marcos guardados</p><h2>{state.milestones.length ? `${state.milestones.length} momentos que não devem ser esquecidos` : "Os momentos importantes podem ficar aqui"}</h2><p>{state.milestones.length ? "Eles também aparecem em Minha Cartografia." : "Em qualquer devocional, escolha Criar marco para registrar uma passagem, oração ou decisão."}</p></div>
        {state.milestones.length > 0 && <button className="outline-button" onClick={() => navigate("cartography")}>Ver cartografia <MapPin /></button>}
      </section>
    </div>
  );
}
