"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Anchor, ArrowLeft, ArrowRight, BookMarked, Bookmark, Check, ChevronLeft, Clipboard, Eye, EyeOff, Flag, Heart, Link2, Maximize2, Menu, MessageSquareText, Minimize2, NotebookPen, Share2 } from "lucide-react";
import { devotionalById, devotionals, devotionalsByJourney, journeyById } from "@/app/data/content";
import { createLocalId, toggleInList, useAppState } from "@/app/lib/app-state";
import { minimalApplicationFor } from "@/app/lib/discovery";
import type { AppRoute } from "@/app/lib/navigation";
import { RichText } from "@/app/components/shared";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Navigate = (page: AppRoute["page"], id?: string) => void;

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
  else {
    const input = document.createElement("textarea");
    input.value = value;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
}

export function DevotionalView({ id, navigate, readingMode, setReadingMode, openMenu }: { id?: string; navigate: Navigate; readingMode: boolean; setReadingMode: (value: boolean) => void; openMenu: () => void }) {
  const { state, setState } = useAppState();
  const devotional = id ? devotionalById.get(id) : null;
  const journey = devotional ? journeyById.get(devotional.journeyId) : null;
  const entries = journey ? devotionalsByJourney.get(journey.id) ?? [] : [];
  const localIndex = devotional ? entries.findIndex((item) => item.id === devotional.id) : -1;
  const previous = entries[localIndex - 1];
  const next = entries[localIndex + 1];
  const [minimal, setMinimal] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [milestoneOpen, setMilestoneOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteMarker, setNoteMarker] = useState("Reflexão");
  const [milestoneText, setMilestoneText] = useState("");
  const [milestoneKind, setMilestoneKind] = useState("Quero lembrar disso");
  const [readingProgress, setReadingProgress] = useState(0);
  const [toolbarRaised, setToolbarRaised] = useState(false);
  const restored = useRef<string | null>(null);

  useEffect(() => {
    if (!devotional) return;
    const frame = window.requestAnimationFrame(() => {
      const shouldOpenMinimum = window.sessionStorage.getItem("ancora:minimal") === devotional.id;
      setMinimal(shouldOpenMinimum);
      if (shouldOpenMinimum) window.sessionStorage.removeItem("ancora:minimal");
      setReadingMode(false);
      setState((current) => ({
        ...current,
        lastDevotionalId: devotional.id,
        lastJourneyId: devotional.journeyId,
        lastResumePath: `#/devotional/${devotional.id}`,
        journeyStartedAt: current.journeyStartedAt[devotional.journeyId] ? current.journeyStartedAt : { ...current.journeyStartedAt, [devotional.journeyId]: new Date().toISOString() },
      }));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [devotional, setReadingMode, setState]);

  useEffect(() => {
    if (!devotional || restored.current === devotional.id) return;
    restored.current = devotional.id;
    const position = state.readingPositions[devotional.id] ?? 0;
    const timer = window.setTimeout(() => window.scrollTo({ top: position, behavior: "auto" }), 80);
    return () => window.clearTimeout(timer);
  }, [devotional, state.readingPositions]);

  useEffect(() => {
    if (!devotional) return;
    let timeout = 0;
    let frame = 0;
    const savePosition = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const y = Math.round(window.scrollY);
        const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        setReadingProgress(Math.min(1, Math.max(0, y / scrollable)));
        setToolbarRaised(y > 24);
      });
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        const y = Math.round(window.scrollY);
        setState((current) => current.readingPositions[devotional.id] === y ? current : ({ ...current, readingPositions: { ...current.readingPositions, [devotional.id]: y } }));
      }, 250);
    };
    savePosition();
    window.addEventListener("scroll", savePosition, { passive: true });
    return () => { window.removeEventListener("scroll", savePosition); window.clearTimeout(timeout); window.cancelAnimationFrame(frame); };
  }, [devotional, setState]);

  const related = useMemo(() => devotional?.related.map((route) => ({ ...route, devotional: devotionalById.get(route.id), journey: journeyById.get(devotionalById.get(route.id)?.journeyId ?? "") })).filter((item) => item.devotional) ?? [], [devotional]);

  if (!devotional || !journey) return <div className="screen no-results"><Anchor /><h1>Devocional não encontrado</h1><Button onClick={() => navigate("home")}>Voltar ao início</Button></div>;

  const isCompleted = state.completed.includes(devotional.id);
  const isFavorite = state.favorites.includes(devotional.id);
  const isReread = state.reread.includes(devotional.id);
  const isPrayer = state.prayerCollection.includes(devotional.id);
  const isImportant = state.importantCollection.includes(devotional.id);

  const toggleFavorite = () => {
    setState((current) => ({ ...current, favorites: toggleInList(current.favorites, devotional.id) }));
    toast.success(isFavorite ? "Removido dos favoritos." : "Guardado nos favoritos.");
  };

  const toggleReread = () => {
    setState((current) => ({ ...current, reread: toggleInList(current.reread, devotional.id) }));
    toast.success(isReread ? "Removido de Quero reler." : "Guardado para reler depois.");
  };

  const toggleCompleted = () => {
    setState((current) => {
      const completed = toggleInList(current.completed, devotional.id);
      const globalIndex = devotionals.findIndex((item) => item.id === devotional.id);
      const fromTraversal = window.sessionStorage.getItem("ancora:from-traversal") !== null;
      return {
        ...current,
        completed,
        traversalIndex: !current.completed.includes(devotional.id) && fromTraversal ? Math.min(devotionals.length - 1, globalIndex + 1) : current.traversalIndex,
      };
    });
    toast.success(isCompleted ? "Marcação removida." : "Caminho registrado como percorrido.");
  };

  const saveNote = () => {
    if (!noteText.trim()) return;
    const now = new Date().toISOString();
    setState((current) => ({ ...current, notes: [{ id: createLocalId("nota"), devotionalId: devotional.id, text: noteText.trim(), marker: noteMarker, createdAt: now, updatedAt: now }, ...current.notes] }));
    setNoteText("");
    setNoteOpen(false);
    toast.success("Anotação guardada no Diário de Bordo.");
  };

  const saveMilestone = () => {
    const text = milestoneText.trim() || devotional.carry;
    const now = new Date().toISOString();
    setState((current) => ({ ...current, milestones: [{ id: createLocalId("marco"), devotionalId: devotional.id, text, kind: milestoneKind, createdAt: now }, ...current.milestones] }));
    setMilestoneText("");
    setMilestoneOpen(false);
    toast.success("Marco guardado em Minha Cartografia.");
  };

  const share = async () => {
    const text = `${devotional.title} — ${devotional.reference}\n${devotional.carry}`;
    try {
      if (navigator.share) await navigator.share({ title: devotional.title, text, url: window.location.href });
      else { await copyText(`${text}\n${window.location.href}`); toast.success("Link e referência copiados."); }
    } catch (error) {
      if ((error as Error).name !== "AbortError") toast.error("Não foi possível compartilhar neste navegador.");
    }
  };

  return (
    <article className={cn("devotional-view", readingMode && "is-reading", minimal && "is-minimal")}>
      <div className="reading-progress" aria-hidden="true"><span style={{ transform: `scaleX(${readingProgress})` }} /></div>
      <header className={cn("devotional-toolbar", toolbarRaised && "is-raised")}>
        <button onClick={() => window.history.length > 1 ? window.history.back() : navigate("journey", journey.id)} aria-label="Voltar"><ChevronLeft /></button>
        <button className="devotional-toolbar__journey" onClick={() => navigate("journey", journey.id)}><span>{journey.name}</span><small>Etapa {devotional.stage} de {journey.count}</small></button>
        <div>
          <button className={isFavorite ? "is-active" : ""} aria-pressed={isFavorite} onClick={toggleFavorite} aria-label={isFavorite ? "Remover dos favoritos" : "Favoritar"}><Heart fill={isFavorite ? "currentColor" : "none"} /></button>
          <button onClick={openMenu} aria-label="Abrir menu"><Menu /></button>
          <button onClick={() => setReadingMode(!readingMode)} aria-label={readingMode ? "Sair do modo leitura" : "Ativar modo leitura"}>{readingMode ? <Minimize2 /> : <Maximize2 />}</button>
        </div>
      </header>

      {readingMode && <button className="reading-mode-exit" onClick={() => setReadingMode(false)}><EyeOff /> Sair do modo leitura</button>}

      <div className="reader-shell">
        <header className="devotional-heading">
          <div className="devotional-heading__folio" aria-hidden="true"><Anchor /><span>ÂD</span></div>
          <div className="devotional-heading__meta"><span>{devotional.type}</span><small>≈ {devotional.duration} min</small></div>
          <p>{journey.name} · etapa {devotional.stage} de {journey.count}</p>
          <h1>{devotional.title}</h1>
          <div className="title-rule" />
        </header>

        {!readingMode && (
          <div className="mode-switcher">
            <button className={!minimal ? "is-active" : ""} onClick={() => setMinimal(false)}><BookMarked /> Devocional completo</button>
            <button className={minimal ? "is-active" : ""} onClick={() => setMinimal(true)}><Anchor /> Âncora Mínima</button>
          </div>
        )}

        <section className="movement movement--launch">
          <div className="movement__label"><span>1</span><strong>Lançar</strong><small>Leia a passagem</small></div>
          <h2>{devotional.reference}</h2>
          <div className="scripture-block"><RichText text={devotional.text} /></div>
          <p className="paraphrase-note">Paráfrase desta edição · abra a sua Bíblia em {devotional.reference}</p>
          <blockquote>{devotional.idea}</blockquote>
        </section>

        {!minimal && (
          <>
            <section className="movement movement--sound">
              <div className="movement__label"><span>2</span><strong>Sondar</strong><small>Veja o que o texto realmente diz</small></div>
              <RichText text={devotional.reflection} className="reflection-text" />
              {devotional.context && <aside className="context-card"><span><Eye /></span><div><h3>O texto por dentro</h3><RichText text={devotional.context} /></div></aside>}
              {devotional.questions.length > 0 && <div className="questions-card"><h3>Pare e pense</h3><ol>{devotional.questions.map((question, index) => <li key={index}>{question}</li>)}</ol></div>}
            </section>

            {(devotional.today || devotional.writingPrompt) && (
              <section className="movement movement--fix">
                <div className="movement__label"><span>3</span><strong>Fixar</strong><small>Escolha uma coisa para hoje</small></div>
                {devotional.today && <div className="today-action"><h3>Para hoje</h3><RichText text={devotional.today} /></div>}
                {devotional.writingPrompt && <div className="writing-prompt"><NotebookPen /><RichText text={devotional.writingPrompt} /></div>}
              </section>
            )}
          </>
        )}

        {minimal && (
          <section className="movement movement--fix">
            <div className="movement__label"><span>2</span><strong>Fixar</strong><small>Escolha uma coisa para hoje</small></div>
            <div className="today-action"><h3>Aplicação mínima</h3><RichText text={minimalApplicationFor(devotional)} /></div>
          </section>
        )}

        <section className="movement movement--tie">
          <div className="movement__label"><span>{minimal ? "3" : "4"}</span><strong>Amarrar</strong><small>Ore com o texto e leve uma frase</small></div>
          <div className="prayer-card"><h3>Oração</h3><RichText text={devotional.prayer} /></div>
          <div className="carry-card"><Anchor /><div><small>Leve com você</small><p>{devotional.carry}</p></div></div>
        </section>

        {!readingMode && (
          <section className="devotional-actions" aria-label="Ações deste devocional">
            <button className={isCompleted ? "is-active" : ""} aria-pressed={isCompleted} onClick={toggleCompleted}><Check />{isCompleted ? "Percorrido" : "Marcar percorrido"}</button>
            <button className={isFavorite ? "is-active" : ""} aria-pressed={isFavorite} onClick={toggleFavorite}><Heart fill={isFavorite ? "currentColor" : "none"} /> Favorito</button>
            <button className={isReread ? "is-active" : ""} aria-pressed={isReread} onClick={toggleReread}><Bookmark fill={isReread ? "currentColor" : "none"} /> Reler depois</button>
            <button onClick={() => setNoteOpen(true)}><MessageSquareText /> Anotar</button>
            <button onClick={() => setMilestoneOpen(true)}><Flag /> Criar marco</button>
            <button onClick={() => setCollectionsOpen(true)}><BookMarked /> Coleções</button>
            <button onClick={async () => { await copyText(devotional.reference); toast.success("Referência bíblica copiada."); }}><Clipboard /> Copiar referência</button>
            <button onClick={share}><Share2 /> Compartilhar</button>
          </section>
        )}

        {!minimal && related.length > 0 && (
          <section className="related-routes">
            <div className="movement__label"><span><Link2 /></span><strong>Rotas relacionadas</strong><small>Outros pontos ligados a esta leitura</small></div>
            <div>{related.map((route) => <button key={route.id} onClick={() => navigate("devotional", route.id)}><span><small>{route.journey?.name}</small><strong>{route.devotional!.title}</strong><p>{route.reason}</p></span><ArrowRight /></button>)}</div>
          </section>
        )}

        {!readingMode && (
          <nav className="devotional-prev-next" aria-label="Navegação da jornada">
            <button disabled={!previous} onClick={() => previous && navigate("devotional", previous.id)}><ArrowLeft /><span><small>Anterior</small><strong>{previous?.title ?? "Início da jornada"}</strong></span></button>
            <button disabled={!next} onClick={() => next ? navigate("devotional", next.id) : navigate("journey", journey.id)}><span><small>{next ? "Próximo" : "Jornada"}</small><strong>{next?.title ?? "Voltar à jornada"}</strong></span><ArrowRight /></button>
          </nav>
        )}
      </div>

      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="anchor-dialog">
          <DialogHeader><DialogTitle>Anotar no Diário de Bordo</DialogTitle><DialogDescription>{devotional.title} · {devotional.reference}</DialogDescription></DialogHeader>
          <label className="field-label" htmlFor="note-marker">Marcador pessoal</label>
          <NativeSelect id="note-marker" value={noteMarker} onChange={(event) => setNoteMarker(event.target.value)} className="w-full"><NativeSelectOption>Reflexão</NativeSelectOption><NativeSelectOption>Oração</NativeSelectOption><NativeSelectOption>Prática</NativeSelectOption><NativeSelectOption>Pergunta</NativeSelectOption></NativeSelect>
          <label className="field-label" htmlFor="note-text">Sua anotação</label>
          <Textarea id="note-text" value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="O que você quer guardar desta leitura?" className="min-h-40" />
          <DialogFooter><Button variant="outline" onClick={() => setNoteOpen(false)}>Cancelar</Button><Button onClick={saveNote} disabled={!noteText.trim()}>Guardar anotação</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={milestoneOpen} onOpenChange={setMilestoneOpen}>
        <DialogContent className="anchor-dialog">
          <DialogHeader><DialogTitle>Criar um marco</DialogTitle><DialogDescription>Registre algo desta leitura que não deve ser esquecido.</DialogDescription></DialogHeader>
          <label className="field-label" htmlFor="milestone-kind">Tipo de marco</label>
          <NativeSelect id="milestone-kind" value={milestoneKind} onChange={(event) => setMilestoneKind(event.target.value)} className="w-full"><NativeSelectOption>Quero lembrar disso</NativeSelectOption><NativeSelectOption>Uma oração respondida</NativeSelectOption><NativeSelectOption>Algo que preciso praticar</NativeSelectOption><NativeSelectOption>Uma passagem importante</NativeSelectOption></NativeSelect>
          <label className="field-label" htmlFor="milestone-text">O que aconteceu?</label>
          <Textarea id="milestone-text" value={milestoneText} onChange={(event) => setMilestoneText(event.target.value)} placeholder={devotional.carry} className="min-h-32" />
          <DialogFooter><Button variant="outline" onClick={() => setMilestoneOpen(false)}>Cancelar</Button><Button onClick={saveMilestone}>Guardar marco</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={collectionsOpen} onOpenChange={setCollectionsOpen}>
        <DialogContent className="anchor-dialog collection-dialog">
          <DialogHeader><DialogTitle>Salvar em coleções</DialogTitle><DialogDescription>Estas coleções permanecem somente neste dispositivo.</DialogDescription></DialogHeader>
          <button className={isFavorite ? "is-active" : ""} aria-pressed={isFavorite} onClick={() => setState((current) => ({ ...current, favorites: toggleInList(current.favorites, devotional.id) }))}><Heart /> Favoritos {isFavorite && <Check />}</button>
          <button className={isReread ? "is-active" : ""} aria-pressed={isReread} onClick={() => setState((current) => ({ ...current, reread: toggleInList(current.reread, devotional.id) }))}><Bookmark /> Quero reler {isReread && <Check />}</button>
          <button className={isPrayer ? "is-active" : ""} aria-pressed={isPrayer} onClick={() => setState((current) => ({ ...current, prayerCollection: toggleInList(current.prayerCollection, devotional.id) }))}><BookMarked /> Orações {isPrayer && <Check />}</button>
          <button className={isImportant ? "is-active" : ""} aria-pressed={isImportant} onClick={() => setState((current) => ({ ...current, importantCollection: toggleInList(current.importantCollection, devotional.id) }))}><Flag /> Importantes para mim {isImportant && <Check />}</button>
          <DialogFooter><Button onClick={() => setCollectionsOpen(false)}>Concluir</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}
