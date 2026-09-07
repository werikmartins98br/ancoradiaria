"use client";

import { Anchor, ArrowRight, BookOpen, Compass, Heart, Map, MapPin, NotebookPen, Search, Sparkles } from "lucide-react";
import { devotionalById, journeyById } from "@/app/data/content";
import { devotionalNow } from "@/app/lib/discovery";
import { useAppState } from "@/app/lib/app-state";
import type { AppRoute } from "@/app/lib/navigation";
import { JourneyProgressLine, MiniMeta } from "@/app/components/shared";

type Navigate = (page: AppRoute["page"], id?: string) => void;

const needs = ["Ansiedade", "Medo", "Culpa", "Perdão", "Recomeço", "Direção", "Disciplina", "Oração", "Esperança", "Descanso", "Propósito", "Sabedoria"];

export function HomeScreen({ navigate }: { navigate: Navigate }) {
  const { state } = useAppState();
  const last = state.lastDevotionalId ? devotionalById.get(state.lastDevotionalId) : null;
  const currentJourney = last ? journeyById.get(last.journeyId) : state.lastJourneyId ? journeyById.get(state.lastJourneyId) : null;
  const suggested = devotionalNow(state);
  const suggestedJourney = journeyById.get(suggested.journeyId)!;

  const openMinimum = () => {
    window.sessionStorage.setItem("ancora:minimal", suggested.id);
    navigate("devotional", suggested.id);
  };

  return (
    <div className="screen home-screen">
      <header className="home-greeting">
        <div>
          <p className="eyebrow">{last ? "Bem-vindo de volta" : "Um lugar para voltar"}</p>
          <h1>{last ? "A sua rota continua aqui." : "Por onde você quer começar?"}</h1>
          <p>{last ? "Sem atraso, sem cobrança. Apenas o próximo passo." : "Siga a travessia inteira, escolha uma jornada ou deixe a Bússola orientar sua leitura."}</p>
        </div>
        <div className="home-greeting__watercolor" aria-hidden="true"><span /><img src="/assets/aquarelas/el_00.png" alt="" /><img src="/assets/aquarelas/fio_05.png" alt="" /></div>
      </header>

      <div className="home-primary">
        <section className="continue-card">
          <div className="continue-card__bearing" aria-hidden="true"><Compass /><span>Uma direção possível</span></div>
          <div className="continue-card__content">
            <p className="eyebrow">Continuar</p>
            {last ? (
              <>
                <span className="continue-card__journey">{currentJourney?.name} · etapa {last.stage}</span>
                <h2>{last.title}</h2>
                <MiniMeta devotional={last} />
                {currentJourney && <JourneyProgressLine journey={currentJourney} />}
                <button className="primary-button" onClick={() => navigate("devotional", last.id)}>Retomar leitura <ArrowRight /></button>
              </>
            ) : (
              <>
                <span className="continue-card__journey">Sua primeira leitura</span>
                <h2>Encontre uma rota para o dia que você tem.</h2>
                <p className="continue-card__copy">Três perguntas rápidas conectam o seu momento às jornadas da obra.</p>
                <button className="primary-button" onClick={() => navigate("compass")}>Usar a Bússola <Compass /></button>
              </>
            )}
          </div>
          <div className="continue-card__art" aria-hidden="true"><img src="/assets/navio.png" alt="" /></div>
          <img className="continue-card__star" src="/assets/aquarelas/el_16.png" alt="" aria-hidden="true" />
          <div className="home-sea" aria-hidden="true">
            <div className="home-sea__line home-sea__line--front">{Array.from({ length: 5 }, (_, index) => <img key={`front-${index}`} src="/assets/aquarelas/el_11.png" alt="" />)}</div>
            <div className="home-sea__line home-sea__line--back">{Array.from({ length: 5 }, (_, index) => <img key={`back-${index}`} src="/assets/aquarelas/el_11.png" alt="" />)}</div>
          </div>
        </section>

        <section className="today-card">
          <div className="today-card__label"><Sparkles /> Devocional de agora</div>
          <div>
            <p>{suggestedJourney.name}</p>
            <h2>{suggested.title}</h2>
            <span>{suggested.idea}</span>
            <MiniMeta devotional={suggested} />
          </div>
          <button onClick={() => navigate("devotional", suggested.id)} aria-label={`Abrir ${suggested.title}`}><ArrowRight /></button>
          <img className="today-card__watercolor" src="/assets/aquarelas/el_09.png" alt="" aria-hidden="true" />
        </section>
      </div>

      <section className="home-section">
        <div className="home-section__heading"><p className="eyebrow">Escolha a forma de entrar</p><h2>Encontre o que cabe em hoje</h2></div>
        <div className="action-grid">
          <button className="action-card action-card--compass" onClick={() => navigate("compass")}><span><Compass /></span><strong>Bússola</strong><small>Uma orientação breve para começar</small><ArrowRight /></button>
          <button className="action-card action-card--journeys" onClick={() => navigate("journeys")}><span><Map /></span><strong>Explorar jornadas</strong><small>42 percursos em seis braças</small><ArrowRight /></button>
          <button className="action-card action-card--traversal" onClick={() => navigate("traversal")}><span><MapPin /></span><strong>Grande Travessia</strong><small>{state.traversalIndex + 1} de 437 · sem calendário</small><ArrowRight /></button>
          <button className="action-card action-card--minimum" onClick={openMinimum}><span><Anchor /></span><strong>Âncora Mínima</strong><small>Passagem, ideia, aplicação e oração</small><ArrowRight /></button>
        </div>
      </section>

      <section className="needs-strip">
        <div className="home-section__heading"><p className="eyebrow">Preciso de...</p><h2>Comece pelo que está vivendo</h2></div>
        <div className="chip-scroll">
          {needs.map((need) => <button key={need} onClick={() => { window.sessionStorage.setItem("ancora:need", need); navigate("needs"); }}>{need}</button>)}
          <button className="chip-more" onClick={() => navigate("needs")}>Ver todas <ArrowRight /></button>
        </div>
        <img className="needs-strip__botanical" src="/assets/aquarelas/el_20.png" alt="" aria-hidden="true" />
      </section>

      <section className="personal-grid">
        <button className="personal-card--logbook" onClick={() => navigate("logbook")}><span><NotebookPen /></span><div><strong>Diário de Bordo</strong><small>{state.notes.length ? `${state.notes.length} ${state.notes.length === 1 ? "anotação guardada" : "anotações guardadas"}` : "O que você encontrou pelo caminho"}</small></div><ArrowRight /></button>
        <button className="personal-card--map" onClick={() => navigate("cartography")}><span><Map /></span><div><strong>Minha Cartografia</strong><small>{state.completed.length ? `${state.completed.length} ${state.completed.length === 1 ? "caminho percorrido" : "caminhos percorridos"}` : "A memória da sua caminhada"}</small></div><ArrowRight /></button>
        <button className="personal-card--saved" onClick={() => navigate("saved")}><span><Heart /></span><div><strong>Favoritos e coleções</strong><small>{state.favorites.length ? `${state.favorites.length} ${state.favorites.length === 1 ? "conteúdo favorito" : "conteúdos favoritos"}` : "Guarde o que quer revisitar"}</small></div><ArrowRight /></button>
        <button className="personal-card--search" onClick={() => navigate("search")}><span><Search /></span><div><strong>Buscar na obra</strong><small>Título, tema, passagem ou palavra</small></div><ArrowRight /></button>
      </section>

      <footer className="home-signature"><img src="/assets/aquarelas/fio_03.png" alt="" aria-hidden="true" /><BookOpen /><span>A âncora nunca foi o livro.</span><img src="/assets/aquarelas/fio_03.png" alt="" aria-hidden="true" /></footer>
    </div>
  );
}
