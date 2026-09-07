"use client";

import type { ReactNode } from "react";
import { Anchor, BookOpen, Check, ChevronRight, Clock3, Compass, Heart, MapPin, Route as RouteIcon } from "lucide-react";
import { devotionalsByJourney, journeyById } from "@/app/data/content";
import { journeyProgress } from "@/app/lib/discovery";
import { useAppState } from "@/app/lib/app-state";
import type { Devotional, Journey } from "@/app/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const depthNames = ["Fundamento", "Firmeza", "Profundidade", "Transformação", "Maturidade", "Continuidade"];

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("brand-lockup", compact && "brand-lockup--compact")} aria-label="Âncora Diária">
      <span className="brand-mark" aria-hidden="true"><Anchor /></span>
      {!compact && <span><strong>Âncora</strong><small>Diária</small></span>}
    </div>
  );
}

export function DepthMark({ depth, inverse = false }: { depth: number; inverse?: boolean }) {
  return (
    <span className={cn("depth-mark", inverse && "depth-mark--inverse")} aria-label={`Braça ${depth} de 6`}>
      {[1, 2, 3, 4, 5, 6].map((level) => <i key={level} className={level <= depth ? "is-filled" : ""} />)}
    </span>
  );
}

export function ScreenHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <header className="screen-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
      <div className="screen-header__bearing" aria-hidden="true"><span /><Compass /><span /></div>
    </header>
  );
}

export function JourneyProgressLine({ journey, compact = false }: { journey: Journey; compact?: boolean }) {
  const { state } = useAppState();
  const progress = journeyProgress(journey, state);
  const ratio = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0;
  return (
    <div className={cn("route-progress", compact && "route-progress--compact")}>
      <div className="route-progress__track"><span style={{ width: `${ratio}%` }} /></div>
      <span>{progress.done ? "Jornada percorrida" : `${progress.completed} de ${progress.total} etapas`}</span>
    </div>
  );
}

export function JourneyCard({ journey, onOpen, featured = false }: { journey: Journey; onOpen: () => void; featured?: boolean }) {
  const { state } = useAppState();
  const progress = journeyProgress(journey, state);
  return (
    <button className={cn("journey-card", featured && "journey-card--featured")} data-depth={journey.depth} onClick={onOpen}>
      <div className="journey-card__top">
        <span className="journey-card__depth"><DepthMark depth={journey.depth} /> Braça {journey.depth}</span>
        {progress.done ? <span className="journey-card__done"><Check /> percorrida</span> : <span className="journey-card__index">J{journey.id.slice(1)}</span>}
      </div>
      <h3>{journey.name}</h3>
      <p>{journey.subtitle}</p>
      <JourneyProgressLine journey={journey} compact />
      <span className="journey-card__open">Abrir {journey.course.toLowerCase()} <ChevronRight /></span>
    </button>
  );
}

export function DevotionalListItem({ devotional, onOpen, showJourney = false }: { devotional: Devotional; onOpen: () => void; showJourney?: boolean }) {
  const { state } = useAppState();
  const completed = state.completed.includes(devotional.id);
  const favorite = state.favorites.includes(devotional.id);
  const journey = journeyById.get(devotional.journeyId);
  return (
    <button className="devotional-row" onClick={onOpen}>
      <span className={cn("devotional-row__status", completed && "is-complete")} aria-label={completed ? "Percorrido" : "Não iniciado"}>
        {completed ? <Check /> : <span />}
      </span>
      <span className="devotional-row__body">
        {showJourney && <small>{journey?.name}</small>}
        <strong>{devotional.title}</strong>
        <span>{devotional.reference} <i>·</i> {devotional.type.toLocaleLowerCase("pt-BR")} <i>·</i> {devotional.duration} min</span>
      </span>
      {favorite && <Heart className="devotional-row__heart" fill="currentColor" aria-label="Favorito" />}
      <ChevronRight className="devotional-row__chevron" />
    </button>
  );
}

export function RichText({ text, className }: { text: string; className?: string }) {
  if (!text) return null;
  return (
    <div className={className}>
      {text.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => (
        <p key={index} dangerouslySetInnerHTML={{ __html: paragraph.replace(/\n/g, " ") }} />
      ))}
    </div>
  );
}

export function SectionTitle({ icon, eyebrow, children }: { icon?: ReactNode; eyebrow?: string; children: ReactNode }) {
  return (
    <div className="section-title">
      {icon && <span>{icon}</span>}
      <div>{eyebrow && <small>{eyebrow}</small>}<h2>{children}</h2></div>
    </div>
  );
}

export function EmptyState({ icon = <Anchor />, title, children, action }: { icon?: ReactNode; title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-state__route" aria-hidden="true"><i /><i /><i /></div>
      <span>{icon}</span>
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </div>
  );
}

export function StatMemory({ icon, value, label }: { icon: ReactNode; value: string | number; label: string }) {
  return <div className="memory-stat"><span>{icon}</span><strong>{value}</strong><small>{label}</small></div>;
}

export const primaryActions = [
  { label: "Bússola", description: "Encontrar uma rota para hoje", page: "compass" as const, icon: <Compass /> },
  { label: "Jornadas", description: "Explorar os 42 percursos", page: "journeys" as const, icon: <RouteIcon /> },
  { label: "Grande Travessia", description: "Percorrer a obra em sequência", page: "traversal" as const, icon: <MapPin /> },
  { label: "Âncora Mínima", description: "Uma leitura para o dia curto", page: "home" as const, icon: <Anchor /> },
  { label: "Diário de Bordo", description: "Revisitar suas anotações", page: "logbook" as const, icon: <BookOpen /> },
  { label: "Favoritos", description: "O que você quis guardar", page: "saved" as const, icon: <Heart /> },
];

export function MiniMeta({ devotional }: { devotional: Devotional }) {
  return <span className="mini-meta"><Clock3 /> {devotional.duration} min <i>·</i> {devotional.reference}</span>;
}

export function JourneyNext({ journey }: { journey: Journey }) {
  const { state } = useAppState();
  return (devotionalsByJourney.get(journey.id) ?? []).find((item) => !state.completed.includes(item.id)) ?? (devotionalsByJourney.get(journey.id) ?? [])[0];
}

export { Button };
