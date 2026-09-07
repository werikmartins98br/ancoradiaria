# QA — Âncora Diária Web App

Data da rodada final: 6 de setembro de 2026.

## Resultado

- Build de produção: aprovado.
- ESLint: aprovado, sem erros ou avisos.
- TypeScript: aprovado.
- Testes automatizados: 10/10 aprovados.
- Revisão visual premium: design tokens, tipografia editorial, profundidade, estados interativos e vocabulário de movimento unificados.
- Identidade autoral: aquarelas originais integradas à Home, jornadas, Bússola, Cartografia, Diário, Introdução e Sobre.
- Servidor local: Home, manifest e service worker aprovados.
- Conteúdo: 437 devocionais, 42 jornadas, 1.193 conexões e 65 livros bíblicos validados.
- Dados: IDs únicos, etapas completas, jornadas existentes, relações válidas, ausência de duplicação integral e Grande Travessia completa.

## Fluxos exercitados no navegador

Home e primeiro acesso; Continuar; mar em movimento; menu lateral e foco; Introdução; Sobre e conteúdo sobre TDAH; Bússola com transições, recomendação principal e alternativas; mapa e página de jornada; Grande Travessia; busca, filtros e estado sem resultados; Preciso de...; leitura completa; barra de progresso; rotas relacionadas e retorno; Âncora Mínima; modo leitura; favoritos; reler depois; anotações; edição e confirmação de exclusão; linha do tempo do Diário de Bordo; marcos; Minha Cartografia; Bíblia explorada; temas; preferências; exportação e importação de backup; recarregamento e persistência.

## Responsividade e offline

- Inspeção visual em 320 px, 390 px, 768 px e desktop.
- Chrome em proporção Android vertical: navegação inferior, menu lateral, Bússola e leitura aprovados.
- Sem overflow horizontal a 320 px.
- Temas claro, escuro e sépia aprovados; o escuro usa navy profundo e superfícies quentes, sem inversão automática.
- Transições de rota, seleção da Bússola, feedbacks e controles fixos aprovados; `prefers-reduced-motion` e a preferência local removem movimento não essencial.
- Modal de anotação aprovado em 320 px e com viewport vertical reduzido, simulando teclado aberto; conteúdo passa a rolar sem perder ações.
- Manifest instalável, ícones locais e service worker com 48 arquivos essenciais pré-carregados.
- Nenhuma requisição de conteúdo, analytics ou dados pessoais para serviços externos.

Não foram encontrados erros evitáveis conhecidos na rodada final. Teste em aparelho físico continua recomendado antes de uma publicação em lojas, especialmente para diferenças de teclado e compartilhamento nativo entre fabricantes.
