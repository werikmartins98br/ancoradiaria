"use client";

import { useEffect, useRef, useState } from "react";
import { Anchor, BookOpen, Compass, FileText, Heart, Home, Info, Map, MapPin, Menu, NotebookPen, Search, Settings2, WifiOff, X } from "lucide-react";
import { content } from "@/app/data/content";
import { AppStateProvider, useAppState } from "@/app/lib/app-state";
import { useAppRoute, type AppRoute } from "@/app/lib/navigation";
import { BrandMark } from "@/app/components/shared";
import { HomeScreen } from "@/app/components/screens/home-screen";
import { CompassScreen } from "@/app/components/screens/compass-screen";
import { JourneyScreen, JourneysScreen } from "@/app/components/screens/journeys-screen";
import { NeedsScreen, SearchScreen } from "@/app/components/screens/search-needs-screen";
import { TraversalScreen } from "@/app/components/screens/traversal-screen";
import { CartographyScreen, LogbookScreen, SavedScreen, SettingsScreen } from "@/app/components/screens/personal-screens";
import { AboutScreen, IntroductionScreen } from "@/app/components/screens/about-screen";
import { DevotionalView } from "@/app/components/devotional-view";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const primaryNav = [
  { page: "home" as const, label: "Início", icon: Home },
  { page: "journeys" as const, label: "Jornadas", icon: Map },
  { page: "compass" as const, label: "Bússola", icon: Compass },
  { page: "search" as const, label: "Buscar", icon: Search },
  { page: "cartography" as const, label: "Cartografia", icon: MapPin },
];

function Onboarding({ navigate }: { navigate: (page: AppRoute["page"], id?: string) => void }) {
  const { state, setState, hydrated } = useAppState();
  const finish = (page?: AppRoute["page"]) => {
    setState((current) => ({ ...current, onboarded: true }));
    if (page) navigate(page);
  };
  return (
    <Dialog open={hydrated && !state.onboarded} onOpenChange={(open) => !open && finish()}>
      <DialogContent className="onboarding-dialog" showCloseButton={false}>
        <DialogHeader>
          <div className="onboarding-mark"><Anchor /></div>
          <p className="eyebrow">Bem-vindo ao Âncora Diária</p>
          <DialogTitle>Há três maneiras de começar.</DialogTitle>
          <DialogDescription>Nenhuma é a certa. Escolha a que combina com o dia que você tem.</DialogDescription>
        </DialogHeader>
        <div className="onboarding-paths">
          <button onClick={() => finish("traversal")}><span><MapPin /></span><div><strong>Grande Travessia</strong><small>Siga toda a obra em uma sequência possível.</small></div><em>01</em></button>
          <button onClick={() => finish("journeys")}><span><Map /></span><div><strong>Explorar livremente</strong><small>Escolha uma das 42 jornadas e comece por ela.</small></div><em>02</em></button>
          <button onClick={() => finish("compass")}><span><Compass /></span><div><strong>Usar a Bússola</strong><small>Responda três perguntas e encontre uma rota.</small></div><em>03</em></button>
        </div>
        <button className="onboarding-skip" onClick={() => finish()}>Agora não, quero olhar primeiro</button>
      </DialogContent>
    </Dialog>
  );
}

function AppRuntime() {
  const { route, navigate } = useAppRoute();
  const { state, hydrated } = useAppState();
  const [readingMode, setReadingMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [online, setOnline] = useState(true);
  const menuCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setOnline(navigator.onLine));
    const sync = () => setOnline(navigator.onLine);
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener("online", sync); window.removeEventListener("offline", sync); };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMenuOpen(false);
      if (route.page !== "devotional") {
        setReadingMode(false);
        window.scrollTo({ top: 0, behavior: state.settings.reducedMotion ? "auto" : "smooth" });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [route.page, route.id, state.settings.reducedMotion]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuCloseRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      previousFocus?.focus();
    };
  }, [menuOpen]);

  if (!hydrated) return <div className="app-loading"><BrandMark /><span /><p>Preparando sua cartografia…</p></div>;

  const activeNavPage = route.page === "journey" || route.page === "traversal" ? "journeys" : route.page === "needs" ? "compass" : route.page;
  const isDevotional = route.page === "devotional";
  const navigateFromMenu = (page: AppRoute["page"], id?: string) => { setMenuOpen(false); navigate(page, id); };

  const renderRoute = () => {
    switch (route.page) {
      case "home": return <HomeScreen navigate={navigate} />;
      case "journeys": return <JourneysScreen navigate={navigate} />;
      case "journey": return <JourneyScreen id={route.id} navigate={navigate} />;
      case "devotional": return <DevotionalView id={route.id} navigate={navigate} readingMode={readingMode} setReadingMode={setReadingMode} openMenu={() => setMenuOpen(true)} />;
      case "compass": return <CompassScreen navigate={navigate} />;
      case "traversal": return <TraversalScreen navigate={navigate} />;
      case "needs": return <NeedsScreen navigate={navigate} />;
      case "saved": return <SavedScreen navigate={navigate} />;
      case "logbook": return <LogbookScreen navigate={navigate} />;
      case "cartography": return <CartographyScreen navigate={navigate} />;
      case "search": return <SearchScreen navigate={navigate} />;
      case "introduction": return <IntroductionScreen navigate={navigate} />;
      case "about": return <AboutScreen navigate={navigate} />;
      case "settings": return <SettingsScreen />;
      default: return <HomeScreen navigate={navigate} />;
    }
  };

  return (
    <div className={cn("app-shell", isDevotional && "app-shell--reader", readingMode && "app-shell--focus")}>
      <a href="#main-content" className="skip-link">Pular para o conteúdo</a>
      {!readingMode && (
        <aside className="desktop-sidebar">
          <div className="sidebar-header">
            <button onClick={() => navigate("home")} className="sidebar-brand"><BrandMark /></button>
            <button className="sidebar-menu-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menu completo"><Menu /></button>
          </div>
          <nav aria-label="Navegação principal">
            {primaryNav.map((item) => { const Icon = item.icon; const active = activeNavPage === item.page; return <button key={item.page} className={active ? "is-active" : ""} aria-current={active ? "page" : undefined} onClick={() => navigate(item.page)}><Icon /><span>{item.label}</span></button>; })}
          </nav>
          <div className="sidebar-secondary">
            <button className={route.page === "logbook" ? "is-active" : ""} aria-current={route.page === "logbook" ? "page" : undefined} onClick={() => navigate("logbook")}><NotebookPen /><span>Diário de Bordo</span></button>
            <button className={route.page === "saved" ? "is-active" : ""} aria-current={route.page === "saved" ? "page" : undefined} onClick={() => navigate("saved")}><Heart /><span>Favoritos</span></button>
            <button className={route.page === "settings" ? "is-active" : ""} aria-current={route.page === "settings" ? "page" : undefined} onClick={() => navigate("settings")}><Settings2 /><span>Preferências</span></button>
          </div>
          <div className="sidebar-footer"><Anchor /><span>{content.stats.devotionals} devocionais<br />{content.stats.journeys} jornadas</span></div>
        </aside>
      )}

      {!readingMode && !isDevotional && (
        <header className="mobile-topbar">
          <button onClick={() => navigate("home")}><BrandMark /></button>
          <div>{!online && <span className="offline-pill"><WifiOff /> offline</span>}<button className="icon-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu /></button></div>
        </header>
      )}

      <main id="main-content" className="app-main">
        <div key={`${route.page}:${route.id ?? ""}`} className="route-stage" data-page={route.page}>{renderRoute()}</div>
      </main>

      {!readingMode && !isDevotional && (
        <nav className="bottom-nav" aria-label="Navegação principal">
          {primaryNav.map((item) => { const Icon = item.icon; const active = activeNavPage === item.page; return <button key={item.page} className={cn(active && "is-active", item.page === "compass" && "bottom-nav__compass")} aria-current={active ? "page" : undefined} onClick={() => navigate(item.page)}><span><Icon /></span><small>{item.label}</small></button>; })}
        </nav>
      )}

      <div className={cn("mobile-menu", menuOpen && "is-open")} aria-hidden={!menuOpen}>
        <button className="mobile-menu__backdrop" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" />
        <aside role="dialog" aria-modal="true" aria-label="Menu do Âncora Diária">
          <header><BrandMark /><button ref={menuCloseRef} onClick={() => setMenuOpen(false)} aria-label="Fechar menu"><X /></button></header>
          <div className="drawer-intro"><p>Seu ponto de partida para navegar pela obra e cuidar da sua caminhada.</p><img src="/assets/aquarelas/el_09.png" alt="" aria-hidden="true" /></div>
          <nav aria-label="Menu completo">
            <p className="drawer-section-label">Navegar</p>
            <button className={route.page === "traversal" ? "is-active" : ""} onClick={() => navigateFromMenu("traversal")}><MapPin /><span><strong>Grande Travessia</strong><small>Etapa {state.traversalIndex + 1} de 437</small></span></button>
            <button className={route.page === "needs" ? "is-active" : ""} onClick={() => navigateFromMenu("needs")}><Compass /><span><strong>Preciso de...</strong><small>Entrar por uma necessidade</small></span></button>
            <button className={route.page === "logbook" ? "is-active" : ""} onClick={() => navigateFromMenu("logbook")}><NotebookPen /><span><strong>Diário de Bordo</strong><small>{state.notes.length} {state.notes.length === 1 ? "anotação" : "anotações"}</small></span></button>
            <button className={route.page === "saved" ? "is-active" : ""} onClick={() => navigateFromMenu("saved")}><Heart /><span><strong>Favoritos e coleções</strong><small>{state.favorites.length + state.reread.length} {state.favorites.length + state.reread.length === 1 ? "item guardado" : "itens guardados"}</small></span></button>
            <p className="drawer-section-label">Conhecer</p>
            <button className={route.page === "introduction" ? "is-active" : ""} onClick={() => navigateFromMenu("introduction")}><FileText /><span><strong>Introdução</strong><small>Por que esta obra existe e como começar</small></span></button>
            <button className={route.page === "about" ? "is-active" : ""} onClick={() => navigateFromMenu("about")}><Info /><span><strong>Sobre o Âncora Diária</strong><small>Método, TDAH, princípios e autoria</small></span></button>
            <p className="drawer-section-label">Aplicativo</p>
            <button className={route.page === "settings" ? "is-active" : ""} onClick={() => navigateFromMenu("settings")}><Settings2 /><span><strong>Preferências e backup</strong><small>Leitura, privacidade e dados</small></span></button>
          </nav>
          <footer><BookOpen /> <span>A âncora nunca foi o livro.</span><img src="/assets/aquarelas/fio_03.png" alt="" aria-hidden="true" /></footer>
        </aside>
      </div>

      <Onboarding navigate={navigate} />
      <Toaster position="top-center" />
    </div>
  );
}

export function AnchorApp() {
  return <AppStateProvider><AppRuntime /></AppStateProvider>;
}
