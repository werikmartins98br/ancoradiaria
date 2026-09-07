"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Compass, RotateCcw, ShieldCheck } from "lucide-react";
import { COMPASS_QUESTIONS, recommendJourneys, type CompassAnswer, type CompassQuestion } from "@/app/lib/discovery";
import { useAppState } from "@/app/lib/app-state";
import type { AppRoute } from "@/app/lib/navigation";
import { DepthMark, JourneyCard, ScreenHeader } from "@/app/components/shared";
import { cn } from "@/lib/utils";

type Navigate = (page: AppRoute["page"], id?: string) => void;

export function CompassScreen({ navigate }: { navigate: Navigate }) {
  const { state } = useAppState();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<CompassQuestion["id"], CompassAnswer>>>({});
  const [showResult, setShowResult] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const advanceTimer = useRef<number | null>(null);
  const question = COMPASS_QUESTIONS[step];
  const result = useMemo(() => recommendJourneys(answers), [answers]);
  const selectedLabels = Object.values(answers).filter(Boolean).map((answer) => (answer as CompassAnswer).label.toLocaleLowerCase("pt-BR"));

  const choose = (answer: CompassAnswer) => {
    if (isAdvancing) return;
    const next = { ...answers, [question.id]: answer };
    setAnswers(next);
    setPendingId(answer.id);
    setIsAdvancing(true);
    const advance = () => {
      if (step === COMPASS_QUESTIONS.length - 1) setShowResult(true);
      else setStep((value) => value + 1);
      setPendingId(null);
      setIsAdvancing(false);
    };
    if (state.settings.reducedMotion) advance();
    else advanceTimer.current = window.setTimeout(advance, 190);
  };

  useEffect(() => () => { if (advanceTimer.current) window.clearTimeout(advanceTimer.current); }, []);

  const restart = () => {
    setAnswers({});
    setStep(0);
    setShowResult(false);
    setPendingId(null);
    setIsAdvancing(false);
  };

  if (showResult && result.length) {
    const [primary, ...alternatives] = result;
    return (
      <div className="screen compass-screen compass-results">
        <ScreenHeader eyebrow="Bússola" title="Uma rota possível para hoje" description="A recomendação cruza suas respostas com os temas, necessidades e conexões da própria obra." action={<button className="text-button" onClick={restart}><RotateCcw /> Refazer</button>} />

        <section className="compass-primary">
          <div className="compass-route-seal"><Compass /><span>Rota encontrada</span></div>
          <div className="compass-primary__copy">
            <span className="compass-kicker"><Compass /> Rota principal</span>
            <div className="compass-depth"><DepthMark depth={primary.journey.depth} inverse /> Braça {primary.journey.depth}</div>
            <h2>{primary.journey.name}</h2>
            <p className="compass-primary__subtitle">{primary.journey.subtitle}</p>
            <p>Esta jornada se aproxima do que você descreveu: <strong>{selectedLabels.join(", ")}</strong>{primary.matches.length ? ` — com pontos de contato em ${primary.matches.join(", ")}.` : "."}</p>
            <button className="light-button" onClick={() => navigate("journey", primary.journey.id)}>Conhecer esta rota <ArrowRight /></button>
          </div>
          <img className="compass-primary__rose" src="/assets/rosa-dos-ventos.png" alt="" aria-hidden="true" />
          <img className="compass-primary__botanical" src="/assets/aquarelas/el_15.png" alt="" aria-hidden="true" />
        </section>

        <section className="compass-alternatives">
          <div className="home-section__heading"><p className="eyebrow">Outras rotas</p><h2>Também podem acompanhar este momento</h2></div>
          <div className="journey-grid">
            {alternatives.slice(0, 3).map(({ journey }) => <JourneyCard key={journey.id} journey={journey} onOpen={() => navigate("journey", journey.id)} />)}
          </div>
        </section>

        <aside className="compass-disclaimer"><ShieldCheck /><p><strong>Uma ferramenta de descoberta.</strong> A Bússola não oferece profecia, diagnóstico ou revelação. Ela apenas aproxima o seu momento da arquitetura temática do livro.</p></aside>
      </div>
    );
  }

  return (
    <div className="screen compass-screen">
      <ScreenHeader eyebrow="Bússola" title="Por onde eu começo hoje?" description="Três perguntas. Nenhuma resposta certa. Escolha o que mais se aproxima de como você está agora." />

      <section className="compass-question">
        <div className="compass-progress" aria-label={`Pergunta ${step + 1} de ${COMPASS_QUESTIONS.length}`}>
          <div>{COMPASS_QUESTIONS.map((item, index) => <span key={item.id} className={cn(index <= step && "is-active")} />)}</div>
          <small>{step + 1} de {COMPASS_QUESTIONS.length}</small>
        </div>
        <div className="compass-question__instrument" aria-hidden="true">
          <img src="/assets/rosa-dos-ventos.png" alt="" style={{ transform: `rotate(${step * 24 - 12}deg)` }} />
          <span>0{step + 1}</span>
        </div>
        <img className="compass-question__star" src="/assets/aquarelas/el_16.png" alt="" aria-hidden="true" />
        <div key={question.id} className={cn("compass-question__content", isAdvancing && "is-leaving")}>
          <p className="eyebrow">Sondagem breve</p>
          <h2>{question.prompt}</h2>
          <div className="answer-grid">
            {question.answers.map((answer) => (
              <button key={answer.id} disabled={isAdvancing} aria-pressed={answers[question.id]?.id === answer.id} className={cn(answers[question.id]?.id === answer.id && "is-selected", pendingId === answer.id && "is-confirming")} onClick={() => choose(answer)}>
                <span>{answer.label}</span>{pendingId === answer.id ? <Check /> : <ArrowRight />}
              </button>
            ))}
          </div>
          {step > 0 && <button className="back-button" onClick={() => { setPendingId(null); setStep((value) => value - 1); }}><ArrowLeft /> Voltar à pergunta anterior</button>}
        </div>
      </section>

      <p className="compass-footnote">Suas respostas são processadas somente neste dispositivo e não são armazenadas.</p>
    </div>
  );
}
