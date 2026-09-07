"use client";

import { Anchor, ArrowRight, BookOpen, Check, Compass, Map, MapPin, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import type { AppRoute } from "@/app/lib/navigation";
import { ScreenHeader } from "@/app/components/shared";

type Navigate = (page: AppRoute["page"], id?: string) => void;

const principles = [
  ["Ritmo, não calendário", "Você não está atrasado em relação a uma data. O que importa aqui é a direção."],
  ["Voltar é suficiente", "Não existe sequência quebrada. Existe o momento em que você decidiu voltar."],
  ["A Escritura vem primeiro", "A reflexão serve ao texto bíblico e sempre convida você a abrir a própria Bíblia."],
  ["Fidelidade não é produtividade", "Três minutos atentos e quarenta minutos atentos pertencem à mesma caminhada."],
  ["Clareza acima de enfeite", "A beleza cria acolhimento, mas nunca deve competir com o que precisa ser compreendido."],
  ["Sem promessas inventadas", "A obra não oferece atalhos espirituais nem afirma o que a Bíblia não afirma."],
  ["O objetivo é a sua independência", "O método foi feito para acompanhar você até que começar sozinho fique mais possível."],
];

const methods = [
  ["01", "Lançar", "Leia a passagem e, sempre que puder, abra a sua Bíblia na referência indicada."],
  ["02", "Sondar", "Observe o que o texto realmente diz antes de perguntar o que ele significa para você."],
  ["03", "Fixar", "Escolha uma prática pequena, concreta e possível para o dia que você tem."],
  ["04", "Amarrar", "Ore com o texto e leve uma frase para recordar ao longo do dia."],
];

function WatercolorDivider({ asset = "fio_03.png" }: { asset?: string }) {
  return <div className="watercolor-divider" aria-hidden="true"><span /><img src={`/assets/aquarelas/${asset}`} alt="" /><span /></div>;
}

export function IntroductionScreen({ navigate }: { navigate: Navigate }) {
  return (
    <div className="screen guide-screen introduction-screen">
      <ScreenHeader eyebrow="Introdução" title="Um lugar para voltar" description="Âncora Diária foi criado para acompanhar a fé real: com pausas, recomeços, dias longos e dias em que quase nada cabe." />

      <section className="guide-hero">
        <div className="guide-hero__copy">
          <p className="eyebrow">Boas-vindas</p>
          <h2>Não é só um devocional. É um jeito de permanecer quando a constância falha e a vontade some.</h2>
          <p>Leia com verdade. Volte sem culpa. A âncora não impede a tempestade; impede que você seja levado por ela.</p>
          <strong>Você voltou. Isso já é o bastante.</strong>
        </div>
        <img className="guide-hero__ship" src="/assets/aquarelas/el_04.png" alt="" aria-hidden="true" />
        <img className="guide-hero__wave" src="/assets/aquarelas/el_11.png" alt="" aria-hidden="true" />
        <span className="guide-hero__glow" aria-hidden="true" />
      </section>

      <section className="guide-letter">
        <div className="guide-letter__title"><img src="/assets/aquarelas/el_22.png" alt="" aria-hidden="true" /><div><p className="eyebrow">Carta ao leitor</p><h2>Este livro nasceu de uma cena conhecida.</h2></div></div>
        <div className="guide-letter__body">
          <div>
            <p>Talvez você já tenha começado um devocional, seguido por alguns dias e depois parado quando a vida ficou cheia. Ao voltar, a data impressa parecia dizer que você estava atrasado.</p>
            <p>Âncora Diária troca essa cobrança por jornadas. Aqui não há calendário, lacuna para preencher ou sequência para perder. Você pode fazer uma etapa hoje, outra na próxima semana e continuar exatamente de onde parou.</p>
            <p>O aplicativo tenta ser um lugar de retorno e um caminho de mão única: de você para as Escrituras. Se um dia você abrir a Bíblia sozinho, com as suas próprias perguntas, ele terá cumprido o seu papel.</p>
          </div>
          <blockquote>“A âncora nunca foi o livro.”</blockquote>
        </div>
      </section>

      <WatercolorDivider asset="fio_04.png" />

      <section className="guide-principles">
        <div className="home-section__heading"><p className="eyebrow">A base da experiência</p><h2>Sete princípios desta obra</h2></div>
        <ol>{principles.map(([title, description], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol>
        <img className="guide-principles__botanical" src="/assets/aquarelas/el_15.png" alt="" aria-hidden="true" />
      </section>

      <section className="guide-ways">
        <div className="home-section__heading"><p className="eyebrow">Como usar</p><h2>Três maneiras de começar</h2></div>
        <div>
          <button onClick={() => navigate("compass")}><span><Compass /></span><em>01</em><h3>Pelo que você está vivendo</h3><p>A Bússola faz três perguntas e aproxima seu momento das jornadas da obra.</p><strong>Usar a Bússola <ArrowRight /></strong></button>
          <button onClick={() => navigate("journeys")}><span><Map /></span><em>02</em><h3>Escolhendo uma jornada</h3><p>Explore os percursos e entre por um tema que faça sentido agora.</p><strong>Ver jornadas <ArrowRight /></strong></button>
          <button onClick={() => navigate("traversal")}><span><MapPin /></span><em>03</em><h3>Fazendo a Grande Travessia</h3><p>Percorra toda a obra em profundidade crescente, sem datas e sem prazo.</p><strong>Começar a travessia <ArrowRight /></strong></button>
        </div>
      </section>

      <section className="guide-return">
        <img src="/assets/aquarelas/el_09.png" alt="" aria-hidden="true" />
        <div><p className="eyebrow">Para os dias curtos</p><h2>O pouco também pode ser inteiro.</h2><p>A Âncora Mínima reúne passagem, ideia central, aplicação breve e oração. Ela reduz o esforço de começar sem transformar a leitura em algo menor.</p></div>
        <button className="light-button" onClick={() => navigate("home")}>Voltar ao início <ArrowRight /></button>
      </section>
    </div>
  );
}

export function AboutScreen({ navigate }: { navigate: Navigate }) {
  return (
    <div className="screen guide-screen about-screen">
      <ScreenHeader eyebrow="Sobre o Âncora Diária" title="Fé sem produtividade espiritual" description="Uma obra devocional cristã, editorial e interativa, feita para diminuir a distância entre querer buscar a Deus e encontrar um primeiro passo possível." />

      <section className="about-manifesto">
        <div className="about-manifesto__copy"><p className="eyebrow">A obra em uma frase</p><h2>Quarenta e duas jornadas para atravessar as estações da fé — sem calendário, sem culpa e sem sequência para perder.</h2><p>O conteúdo continua sendo o centro. A tecnologia apenas ajuda a encontrar uma leitura, guardar o que foi descoberto e reconhecer o caminho já percorrido.</p></div>
        <div className="about-manifesto__numbers"><span><strong>437</strong><small>devocionais</small></span><span><strong>42</strong><small>jornadas</small></span><span><strong>6</strong><small>níveis de profundidade</small></span></div>
        <img src="/assets/aquarelas/el_00.png" alt="" aria-hidden="true" />
      </section>

      <section className="attention-section">
        <div className="attention-section__art" aria-hidden="true"><img src="/assets/aquarelas/el_05.png" alt="" /><span /></div>
        <div className="attention-section__copy">
          <p className="eyebrow">TDAH e dificuldades de constância</p>
          <h2>Menos atrito para começar. Nenhuma punição para voltar.</h2>
          <p>O projeto foi desenhado para ser especialmente acolhedor a pessoas com TDAH, dificuldade de atenção, rotina instável ou histórico de abandonar planos — sem tratar nenhuma dessas experiências como falta de fé.</p>
          <div className="attention-features">
            <article><Sparkles /><div><h3>Estrutura previsível</h3><p>As leituras repetem quatro movimentos, diminuindo decisões desnecessárias.</p></div></article>
            <article><Anchor /><div><h3>Começo pequeno</h3><p>A Âncora Mínima oferece uma entrada legítima nos dias de pouca energia.</p></div></article>
            <article><RotateCcw /><div><h3>Retomada sem culpa</h3><p>O aplicativo guarda o ponto de leitura e nunca usa sequência diária como cobrança.</p></div></article>
            <article><Map /><div><h3>Orientação visível</h3><p>Bússola, jornadas e rotas relacionadas deixam o próximo passo fora da cabeça.</p></div></article>
          </div>
          <aside><ShieldCheck /><p>Âncora Diária é uma obra devocional e educativa. Não diagnostica, não trata e não substitui acompanhamento médico, psicológico ou psiquiátrico.</p></aside>
        </div>
      </section>

      <WatercolorDivider asset="fio_07.png" />

      <section className="method-section">
        <div className="home-section__heading"><p className="eyebrow">Os quatro movimentos da âncora</p><h2>Um método simples para abrir a Bíblia</h2></div>
        <div className="method-route">{methods.map(([number, title, description]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></article>)}</div>
        <img src="/assets/aquarelas/el_03.png" alt="" aria-hidden="true" />
      </section>

      <section className="about-boundaries">
        <div><BookOpen /><p className="eyebrow">O que ele tenta ser</p><h2>Um lugar de retorno.</h2><ul><li><Check /> Uma ponte para as Escrituras</li><li><Check /> Uma estrutura possível para dias reais</li><li><Check /> Uma memória da sua caminhada</li></ul></div>
        <div><ShieldCheck /><p className="eyebrow">O que ele não é</p><h2>Um atalho espiritual.</h2><ul><li>Não é oráculo ou profecia</li><li>Não promete resultados por desempenho</li><li>Não substitui a Bíblia nem cuidado profissional</li></ul></div>
      </section>

      <footer className="about-author">
        <img src="/assets/aquarelas/el_17.png" alt="" aria-hidden="true" />
        <div><p className="eyebrow">Criação e autoria</p><h2>Werik Vinícius</h2><p>Texto, arquitetura editorial, projeto gráfico e ilustrações originais de Âncora Diária. Primeira edição digital.</p></div>
        <button className="primary-button" onClick={() => navigate("introduction")}>Ler a introdução <ArrowRight /></button>
      </footer>
    </div>
  );
}
