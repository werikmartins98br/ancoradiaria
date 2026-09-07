"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Anchor, BookMarked, BookOpen, Bookmark, Check, CloudOff, Compass, Download, FileJson, Flag, Heart, Map as MapIcon, MapPin, Moon, NotebookPen, Search, ShieldCheck, Sun, Trash2, Upload } from "lucide-react";
import { devotionalById, devotionals, journeyById, journeys } from "@/app/data/content";
import { journeyProgress, normalizeText } from "@/app/lib/discovery";
import { useAppState } from "@/app/lib/app-state";
import type { AppRoute } from "@/app/lib/navigation";
import type { Note, ReadingWidth, ThemeName } from "@/app/lib/types";
import { DepthMark, DevotionalListItem, EmptyState, JourneyProgressLine, ScreenHeader, StatMemory } from "@/app/components/shared";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Navigate = (page: AppRoute["page"], id?: string) => void;

export function SavedScreen({ navigate }: { navigate: Navigate }) {
  const { state } = useAppState();
  const collections = [
    { id: "favorites", label: "Favoritos", icon: <Heart />, ids: state.favorites },
    { id: "reread", label: "Quero reler", icon: <Bookmark />, ids: state.reread },
    { id: "prayers", label: "Orações", icon: <BookMarked />, ids: state.prayerCollection },
    { id: "important", label: "Importantes", icon: <Flag />, ids: state.importantCollection },
  ];

  return (
    <div className="screen saved-screen">
      <ScreenHeader eyebrow="Favoritos e coleções" title="O que você quis guardar" description="Quatro coleções simples para revisitar passagens, orações e leituras importantes." />
      <Tabs defaultValue="favorites" className="saved-tabs">
        <TabsList className="saved-tabs__list">{collections.map((collection) => <TabsTrigger key={collection.id} value={collection.id}>{collection.icon}{collection.label}<span>{collection.ids.length}</span></TabsTrigger>)}</TabsList>
        {collections.map((collection) => {
          const items = collection.ids.map((id) => devotionalById.get(id)).filter(Boolean);
          return <TabsContent key={collection.id} value={collection.id}><div className="devotional-list">{items.map((item) => <DevotionalListItem key={item!.id} devotional={item!} showJourney onOpen={() => navigate("devotional", item!.id)} />)}</div>{!items.length && <EmptyState icon={collection.icon} title={`Nada em ${collection.label.toLocaleLowerCase("pt-BR")} ainda`}>Em uma leitura, use as ações de guardar para trazer o conteúdo até aqui.</EmptyState>}</TabsContent>;
        })}
      </Tabs>
    </div>
  );
}

export function LogbookScreen({ navigate }: { navigate: Navigate }) {
  const { state, setState } = useAppState();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Note | null>(null);
  const [draft, setDraft] = useState("");
  const [deleting, setDeleting] = useState<Note | null>(null);
  const notes = useMemo(() => state.notes.filter((note) => {
    if (!query.trim()) return true;
    const devotional = devotionalById.get(note.devotionalId);
    return normalizeText(`${note.text} ${note.marker} ${devotional?.title ?? ""} ${devotional?.reference ?? ""}`).includes(normalizeText(query));
  }).sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()), [state.notes, query]);

  const edit = (note: Note) => { setEditing(note); setDraft(note.text); };
  const save = () => {
    if (!editing || !draft.trim()) return;
    setState((current) => ({ ...current, notes: current.notes.map((note) => note.id === editing.id ? { ...note, text: draft.trim(), updatedAt: new Date().toISOString() } : note) }));
    setEditing(null);
    toast.success("Anotação atualizada.");
  };
  const remove = () => {
    if (!deleting) return;
    setState((current) => ({ ...current, notes: current.notes.filter((note) => note.id !== deleting.id) }));
    setDeleting(null);
    toast.success("Anotação excluída.");
  };

  return (
    <div className="screen logbook-screen">
      <ScreenHeader eyebrow="Diário de Bordo" title="Palavras encontradas pelo caminho" description="Suas anotações ficam neste dispositivo e continuam ligadas ao devocional em que nasceram." />
      <label className="search-field logbook-search"><Search /><span className="sr-only">Pesquisar anotações</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar no Diário de Bordo..." /></label>
      {notes.length > 0 && <section className="logbook-timeline" aria-label="Linha do tempo do Diário de Bordo">
        <header className="logbook-timeline__heading"><div><p className="eyebrow">Linha do tempo</p><h2>{query ? "Registros encontrados" : "A história escrita da sua caminhada"}</h2><p>{notes.length} {notes.length === 1 ? "registro ligado" : "registros ligados"} às leituras que acompanharam você.</p></div><img src="/assets/aquarelas/el_22.png" alt="" aria-hidden="true" /></header>
        <ol className="notes-list">
        {notes.map((note, index) => {
          const devotional = devotionalById.get(note.devotionalId);
          const journey = devotional ? journeyById.get(devotional.journeyId) : null;
          const date = new Date(note.updatedAt || note.createdAt);
          return <li key={note.id} className="timeline-entry" style={{ "--timeline-index": index } as CSSProperties}>
            <time className="timeline-date" dateTime={date.toISOString()}><strong>{date.toLocaleDateString("pt-BR", { day: "2-digit" })}</strong><span>{date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</span><small>{date.toLocaleDateString("pt-BR", { year: "numeric" })}</small></time>
            <span className="timeline-node" aria-hidden="true"><Anchor /></span>
            <article className="note-card"><header><span>{note.marker}</span><small>{note.updatedAt !== note.createdAt ? "editada" : "registro"}</small></header><p>{note.text}</p><footer><button onClick={() => navigate("devotional", note.devotionalId)}><BookOpen /> {devotional?.title ?? "Devocional"}<small>{journey?.name} · {devotional?.reference}</small></button><div><button onClick={() => edit(note)} aria-label="Editar anotação"><NotebookPen /></button><button onClick={() => setDeleting(note)} aria-label="Excluir anotação"><Trash2 /></button></div></footer></article>
          </li>;
        })}
        </ol>
        <img className="logbook-timeline__flower" src="/assets/aquarelas/el_06.png" alt="" aria-hidden="true" />
      </section>}
      {!notes.length && <EmptyState icon={<NotebookPen />} title={query ? "Nenhuma anotação encontrada" : "O diário ainda está em branco"}>{query ? "Tente outra palavra ou limpe a busca." : "Abra um devocional e escolha Anotar para guardar o que encontrou."}</EmptyState>}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}><DialogContent className="anchor-dialog"><DialogHeader><DialogTitle>Editar anotação</DialogTitle><DialogDescription>As alterações serão guardadas somente neste dispositivo.</DialogDescription></DialogHeader><Textarea value={draft} onChange={(event) => setDraft(event.target.value)} className="min-h-48" /><DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button><Button onClick={save} disabled={!draft.trim()}>Salvar alterações</Button></DialogFooter></DialogContent></Dialog>
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Excluir esta anotação?</AlertDialogTitle><AlertDialogDescription>Ela será removida do Diário de Bordo neste dispositivo. Esta ação não pode ser desfeita sem um backup.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={remove}>Excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}

export function CartographyScreen({ navigate }: { navigate: Navigate }) {
  const { state } = useAppState();
  const started = journeys.filter((journey) => state.journeyStartedAt[journey.id] || journeyProgress(journey, state).completed > 0);
  const concluded = started.filter((journey) => journeyProgress(journey, state).done);
  const completedSet = new Set(state.completed);
  const visited = devotionals.filter((item) => completedSet.has(item.id));

  const themeCounts = new Map<string, number>();
  visited.forEach((item) => item.tags.forEach((tag) => themeCounts.set(tag, (themeCounts.get(tag) ?? 0) + 1)));
  const topThemes = [...themeCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR")).slice(0, 12);

  const bookCounts = new Map<string, number>();
  visited.forEach((item) => bookCounts.set(item.bibleBook, (bookCounts.get(item.bibleBook) ?? 0) + 1));
  const books = [...bookCounts.entries()].sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));
  const routes = [...started].sort((a, b) => journeyProgress(b, state).completed - journeyProgress(a, state).completed).slice(0, 5);

  return (
    <div className="screen cartography-screen">
      <ScreenHeader eyebrow="Minha Cartografia" title="A memória da sua caminhada" description="Não é uma medida de espiritualidade. É um lugar para reconhecer as passagens, temas e encontros que já fizeram parte do caminho." />
      <section className="memory-stats"><StatMemory icon={<Anchor />} value={state.completed.length} label="devocionais percorridos" /><StatMemory icon={<MapPin />} value={started.length} label="jornadas iniciadas" /><StatMemory icon={<Check />} value={concluded.length} label="jornadas concluídas" /><StatMemory icon={<Flag />} value={state.milestones.length} label="marcos guardados" /></section>

      <section className="symbolic-map">
        <div className="symbolic-map__heading"><div><p className="eyebrow">Mapa da caminhada</p><h2>Territórios por onde você já passou</h2></div><MapIcon /></div>
        {started.length ? <div className="symbolic-map__depths">{[1, 2, 3, 4, 5, 6].map((depth) => {
          const items = started.filter((journey) => journey.depth === depth);
          if (!items.length) return null;
          return <div key={depth} className={`symbolic-depth depth-${depth}`}><header><DepthMark depth={depth} inverse={depth > 3} /><span>Braça {depth}</span></header><div>{items.map((journey) => { const progress = journeyProgress(journey, state); return <button key={journey.id} className={progress.done ? "is-complete" : ""} onClick={() => navigate("journey", journey.id)}><i>{progress.done ? <Check /> : <MapPin />}</i><span><strong>{journey.name}</strong><small>{progress.completed} de {progress.total} etapas</small></span></button>; })}</div></div>;
        })}</div> : <EmptyState icon={<Compass />} title="O mapa começa na primeira leitura">Use a Bússola, escolha uma jornada ou siga a Grande Travessia. O caminho aparecerá aqui sem pressa.</EmptyState>}
        <img className="symbolic-map__chart" src="/assets/mapa-canto.png" alt="" aria-hidden="true" />
        <img className="symbolic-map__mountains" src="/assets/aquarelas/el_12.png" alt="" aria-hidden="true" />
      </section>

      <div className="cartography-columns">
        <section className="cartography-card themes-memory"><p className="eyebrow">Temas que voltaram</p><h2>Palavras presentes na caminhada</h2>{topThemes.length ? <div className="theme-cloud">{topThemes.map(([theme, count], index) => <button key={theme} style={{ fontSize: `${1 + Math.max(0, 3 - index) * 0.08}rem` }} onClick={() => { window.sessionStorage.setItem("ancora:search", theme); navigate("search"); }}>{theme}<small>{count}</small></button>)}</div> : <p className="muted-copy">Os temas aparecem à medida que devocionais são marcados como percorridos.</p>}</section>
        <section className="cartography-card routes-memory"><p className="eyebrow">Rotas mais percorridas</p><h2>Jornadas que fazem parte da sua história</h2>{routes.length ? routes.map((journey) => <button key={journey.id} onClick={() => navigate("journey", journey.id)}><div><strong>{journey.name}</strong><small>{journey.subtitle}</small></div><JourneyProgressLine journey={journey} compact /></button>) : <p className="muted-copy">As jornadas iniciadas serão reunidas aqui.</p>}</section>
      </div>

      <section className="bible-memory"><div className="home-section__heading"><p className="eyebrow">Bíblia explorada</p><h2>Livros e passagens encontrados</h2></div>{books.length ? <><div className="book-cloud">{books.map(([book, count]) => <button key={book} onClick={() => { window.sessionStorage.setItem("ancora:book", book); navigate("search"); }}><BookOpen /><span>{book}<small>{count} {count === 1 ? "leitura" : "leituras"}</small></span></button>)}</div><p className="bible-memory__note">{books.length} {books.length === 1 ? "dos 65 livros presentes na obra já apareceu" : "dos 65 livros presentes na obra já apareceram"} na sua caminhada.</p></> : <EmptyState icon={<BookOpen />} title="As páginas ainda estão fechadas">Ao marcar uma leitura como percorrida, o livro bíblico correspondente será registrado aqui.</EmptyState>}</section>

      <section className="milestone-memory"><div className="home-section__heading"><p className="eyebrow">Marcos</p><h2>O que não deve ser esquecido</h2></div>{state.milestones.length ? <div className="milestone-list">{state.milestones.slice(0, 8).map((milestone) => { const devotional = devotionalById.get(milestone.devotionalId); return <button key={milestone.id} onClick={() => navigate("devotional", milestone.devotionalId)}><Flag /><div><small>{milestone.kind} · {new Date(milestone.createdAt).toLocaleDateString("pt-BR")}</small><p>{milestone.text}</p><span>{devotional?.title} · {devotional?.reference}</span></div></button>; })}</div> : <EmptyState icon={<Flag />} title="Nenhum marco guardado ainda">Em um devocional, escolha Criar marco para registrar uma oração respondida, uma prática ou uma passagem importante.</EmptyState>}</section>

      <section className="logbook-memory"><Heart /><div><p className="eyebrow">Leituras guardadas</p><h2>{state.favorites.length || state.reread.length ? `${state.favorites.length} ${state.favorites.length === 1 ? "favorito" : "favoritos"} · ${state.reread.length} para reler` : "Algumas rotas merecem uma nova visita"}</h2><p>Favoritos, leituras para reler, orações e passagens importantes ficam reunidos em coleções simples.</p></div><button className="outline-button" onClick={() => navigate("saved")}>Abrir coleções</button></section>

      <section className="logbook-memory"><NotebookPen /><div><p className="eyebrow">Diário de Bordo</p><h2>{state.notes.length ? `${state.notes.length} ${state.notes.length === 1 ? "anotação acompanha" : "anotações acompanham"} esta caminhada` : "Suas palavras também fazem parte do mapa"}</h2><p>Releia, pesquise e volte ao devocional que deu origem a cada anotação.</p></div><button className="outline-button" onClick={() => navigate("logbook")}>Abrir diário</button></section>
    </div>
  );
}

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export function SettingsScreen() {
  const { state, setState, importState, resetState } = useAppState();
  const inputRef = useRef<HTMLInputElement>(null);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    const capture = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPromptEvent); };
    window.addEventListener("beforeinstallprompt", capture);
    return () => window.removeEventListener("beforeinstallprompt", capture);
  }, []);

  const updateSettings = (settings: Partial<typeof state.settings>) => setState((current) => ({ ...current, settings: { ...current.settings, ...settings } }));
  const exportBackup = () => {
    const payload = JSON.stringify({ app: "Âncora Diária", schemaVersion: 1, exportedAt: new Date().toISOString(), state }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ancora-diaria-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Backup exportado.");
  };
  const importBackup = async (file?: File) => {
    if (!file) return;
    try { importState(JSON.parse(await file.text())); toast.success("Backup importado com sucesso."); }
    catch { toast.error("Este arquivo não é um backup válido do Âncora Diária."); }
    if (inputRef.current) inputRef.current.value = "";
  };
  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") toast.success("Instalação iniciada.");
    setInstallPrompt(null);
  };

  const themes: { id: ThemeName; label: string; icon: React.ReactNode; description: string }[] = [
    { id: "light", label: "Claro", icon: <Sun />, description: "Papel claro e azul-marinho" },
    { id: "sepia", label: "Sépia", icon: <BookOpen />, description: "Leitura quente e contemplativa" },
    { id: "dark", label: "Escuro", icon: <Moon />, description: "Menos brilho em ambientes escuros" },
  ];
  const widths: { id: ReadingWidth; label: string }[] = [{ id: "focused", label: "Focada" }, { id: "comfortable", label: "Confortável" }, { id: "wide", label: "Ampla" }];

  return (
    <div className="screen settings-screen">
      <ScreenHeader eyebrow="Preferências" title="Uma leitura do seu jeito" description="Configurações e dados permanecem neste dispositivo." />
      <section className="settings-card"><header><h2>Aparência</h2><p>Escolha o ambiente visual da leitura.</p></header><RadioGroup value={state.settings.theme} onValueChange={(value) => updateSettings({ theme: value as ThemeName })} className="theme-options">{themes.map((theme) => <label key={theme.id} className={state.settings.theme === theme.id ? "is-active" : ""}><RadioGroupItem value={theme.id} /><span className={`theme-swatch theme-swatch--${theme.id}`}>{theme.icon}</span><span><strong>{theme.label}</strong><small>{theme.description}</small></span></label>)}</RadioGroup></section>
      <section className="settings-card"><header><h2>Conforto de leitura</h2><p>Ajustes aplicados aos devocionais.</p></header><div className="setting-row setting-row--slider"><div><strong>Tamanho do texto</strong><small>{Math.round(state.settings.fontScale * 100)}%</small></div><Slider value={[state.settings.fontScale]} min={0.9} max={1.3} step={0.05} onValueChange={(value) => updateSettings({ fontScale: value[0] })} aria-label="Tamanho do texto" /></div><div className="setting-row"><div><strong>Largura de leitura</strong><small>Mais estreita ajuda a manter o foco</small></div><RadioGroup value={state.settings.readingWidth} onValueChange={(value) => updateSettings({ readingWidth: value as ReadingWidth })} className="width-options">{widths.map((width) => <label key={width.id}><RadioGroupItem value={width.id} />{width.label}</label>)}</RadioGroup></div><div className="setting-row"><div><strong>Reduzir movimento</strong><small>Desativa transições não essenciais</small></div><Switch checked={state.settings.reducedMotion} onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })} aria-label="Reduzir movimento" /></div></section>
      <section className="settings-card"><header><h2>Offline e instalação</h2><p>Depois do primeiro carregamento, o conteúdo principal permanece disponível sem internet.</p></header><div className="privacy-note"><CloudOff /><div><strong>Preparado para funcionar offline</strong><small>O conteúdo, os assets e seus dados pessoais ficam no próprio dispositivo.</small></div></div><Button onClick={install} disabled={!installPrompt}><Download /> {installPrompt ? "Instalar neste dispositivo" : "Aplicativo já instalado ou instalação indisponível"}</Button></section>
      <section className="settings-card"><header><h2>Backup local</h2><p>Guarde suas anotações, favoritos, progresso, marcos e preferências em um arquivo JSON.</p></header><div className="backup-actions"><Button onClick={exportBackup}><FileJson /> Exportar meus dados</Button><Button variant="outline" onClick={() => inputRef.current?.click()}><Upload /> Importar backup</Button><input ref={inputRef} type="file" accept="application/json,.json" hidden onChange={(event) => importBackup(event.target.files?.[0])} /></div><p className="settings-hint"><ShieldCheck /> O arquivo não contém o conteúdo do livro; apenas a sua caminhada pessoal.</p></section>
      <section className="settings-card privacy-card"><ShieldCheck /><div><h2>Privacidade por padrão</h2><p>Não há conta, rastreamento, servidor de dados ou envio de anotações. Apagar os dados do navegador também apaga sua caminhada — por isso o backup é importante.</p></div></section>
      <section className="settings-card danger-card"><header><h2>Recomeçar o aplicativo</h2><p>Remove progresso, notas, favoritos, marcos e preferências deste dispositivo.</p></header><Button variant="destructive" onClick={() => setResetOpen(true)}><Trash2 /> Apagar meus dados locais</Button></section>
      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Apagar toda a caminhada local?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita sem um backup exportado. O conteúdo do livro continuará no aplicativo.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => { resetState(); setResetOpen(false); toast.success("Dados locais apagados."); }}>Apagar dados</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}
