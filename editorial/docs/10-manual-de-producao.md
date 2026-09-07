# ÂNCORA DIÁRIA — Manual de produção e extensão

Este documento existe para que a obra possa ser **corrigida, ampliada e reeditada** sem
depender de quem a produziu. Ele descreve a base mestre, o motor de composição e o
procedimento exato para acrescentar novas jornadas ou etapas.

---

## 1. Arquitetura: uma fonte de verdade

Nada no PDF é diagramado à mão. Tudo é gerado a partir de **três arquivos de dados**.
Alterar um título em um lugar propaga a mudança para o sumário, os índices, os marcadores
do PDF e os hiperlinks internos — automaticamente.

```
dados/
  jornadas.tsv        ← as 42 jornadas (metadados)
  manifesto.psv       ← as 437 etapas (banco mestre)
  aberturas.txt       ← textos de abertura das 6 braças e das 42 jornadas
  conteudo/*.txt      ← o conteúdo devocional propriamente dito
```

### 1.1 `dados/jornadas.tsv` — separado por TAB

| coluna | conteúdo |
|---|---|
| `JID` | identificador (`J01`…`J42`). Nunca reaproveitar um ID aposentado. |
| `BRACA` | 1 a 6 — nível de profundidade |
| `PERCURSO` | rótulo editorial: `Jornada`, `Travessia`, `Rota`, `Rota final` |
| `NOME` | título da jornada |
| `SUBTITULO` | tema em uma linha |
| `N` | número de etapas — **precisa bater** com o manifesto |
| `NECESSIDADES` | necessidades separadas por `;` — alimentam o índice *Preciso de…* |

### 1.2 `dados/manifesto.psv` — separado por `|`

Uma linha por devocional. **Este é o banco mestre exigido antes da escrita.**

| coluna | conteúdo |
|---|---|
| `ID` | `J31E05` — jornada + etapa. Único em toda a obra. |
| `JID` | jornada a que pertence |
| `ETAPA` | posição na jornada, começando em 1, sem lacunas |
| `TIPO` | tipo de entrada (ver §2) |
| `TITULO` | título da etapa |
| `REFERENCIA` | `Livro C:V` ou `Livro C:V-V` — nome do livro em português, exatamente como no cânon do auditor |
| `MIN` | duração aproximada em minutos: 3, 5, 7, 10 ou 15 |
| `TAGS` | temas separados por `;` — alimentam o índice temático |

### 1.3 `dados/conteudo/*.txt` — formato compacto

Os arquivos podem agrupar quantas jornadas se quiser; o nome do arquivo não importa.

```
@@ID J31E01
@@TEXTO
(paráfrase própria da passagem — nunca entre aspas externas)
@@IDEIA
(uma frase: a ideia central)
@@REFLEXAO
(parágrafos separados por linha em branco)
@@DENTRO
(opcional — quadro "O texto por dentro": autor, gênero, contexto, termo original)
@@PENSE
- primeira pergunta
- segunda pergunta
@@HOJE
(ação concreta, com lugar e momento)
@@ORE
(oração original)
@@LEVE
(frase curta para carregar)
@@PAUTA
(opcional — instrução para a página pautada, usada em MARCO e CARTA DE BORDO)
@@ROTAS
J31E02 :: texto do link (minúsculas, começando por "se…")
@@FIM
```

Marcação inline permitida: `<b>`, `<i>`, `<font>`. O filtro tipográfico converte aspas
retas em curvas, `...` em reticências e apóstrofos automaticamente — **não digite aspas
tipográficas à mão**.

---

## 2. Tipos de entrada

O tipo controla a cor do selo, o rótulo impresso e a presença de página pautada.

| tipo | função | duração típica | campos dispensáveis |
|---|---|---|---|
| `ETAPA` | devocional padrão | 7–10 min | — |
| `FAROL` | texto-chave, mais denso, ensina um conceito | 10–15 min | — |
| `TEMPESTADE` | para a crise aguda | 7–10 min | — |
| `CALMARIA` | pausa, sem tarefa | 3 min | `PENSE`, `HOJE` |
| `PORTO` | acolhimento, sem exigência | 3 min | `PENSE`, `HOJE` |
| `LASTRO` | uma frase para memorizar | 3 min | `PENSE` |
| `CLAMOR` | oração em tempo de aflição | 5 min | `PENSE` |
| `PASSO` | ação prática da semana | 5 min | — |
| `RETORNO` | página de reentrada após pausa | 5 min | — |
| `MEMÓRIA` | recordar o caminho percorrido | 10 min | — |
| `CARTA DE BORDO` | registro escrito longo | 10 min | — |
| `HORIZONTE` | olhar para o futuro/escatologia | 7 min | — |
| `MARCO` | fecho de jornada, com pauta e revisão | 15 min | — |

**Regra editorial:** `MARCO` só ao fim de jornadas de 8 etapas ou mais. Jornadas curtas
fecham com `LASTRO` ou `HORIZONTE`.

---

## 3. Motor de composição

```
build/
  motor.py       paleta, fontes, estilos, flowables, LivroAncora (BaseDocTemplate)
  conteudo.py    parser do formato @@TAG, carga do banco mestre, filtro tipográfico
  paginas.py     páginas de devocional, abertura de jornada, abertura de braça
  frente.py      capa e todo o pré-textual
  navegacao.py   sondagem, "Preciso de…", mapa, Grande Travessia, estações, sumário, índices
  simbolos.py    insígnia da marca, 13 ícones de tipo, marcas de braça (tudo vetorial)
  ilustra.py     camada de aquarela: repertórios, cache de imagem e posicionamento
  prepara_imagens.py  trata os originais uma vez e gera assets/img/ (rodar só quando
                 entrarem imagens novas)
  tras.py        apêndice metodológico, bibliografia, colofão
  gerar.py       orquestração multi-passada
```

### 3.1 Por que multi-passada

Os números de página só existem depois que o documento é composto, mas os índices
precisam deles. `gerar.py` compõe o livro inteiro, coleta o mapa `chave → página`,
recompõe com esse mapa e repete até o mapa estabilizar (normalmente 2 passadas).
O mesmo mecanismo alimenta os cabeçalhos correntes.

### 3.2 Como um link interno funciona

1. `Marcador(chave, titulo, nivel)` chama `canvas.bookmarkPage(chave)` e
   `canvas.addOutlineEntry(titulo, chave, nivel)`.
   **A chave precisa ser `str`, nunca `bytes`** — em `bytes`, o ReportLab exibe a chave
   no lugar do título no painel de marcadores.
2. Qualquer parágrafo pode apontar para lá com `<link href="#chave">`.
3. `paginas.DESTINOS` é o conjunto de chaves válidas. `_lk()` consulta esse conjunto e,
   se o destino não existir, emite **texto simples em vez de link** — assim uma rota
   apontando para uma etapa ainda não escrita não quebra a compilação.

### 3.3 Comandos

```bash
python3 qa/audita_manifesto.py     # estrutura, passagens, cobertura canônica
python3 qa/audita_conteudo.py      # campos, rotas, duplicação, repetição, clichês
python3 build/gerar.py saida/ancora-diaria.pdf
python3 qa/verifica_pdf.py saida/ancora-diaria.pdf   # marcadores, links, amostragem visual
```

---

## 4. Procedimento para acrescentar uma jornada

1. **Escolha o lugar.** Decida a braça (1–6) e o `JID` seguinte livre.
2. **Acrescente a linha em `jornadas.tsv`** com `N` = número de etapas pretendido e
   necessidades que ainda não estejam saturadas no índice *Preciso de…*.
3. **Preencha o manifesto antes de escrever uma linha de conteúdo.** Uma linha por etapa,
   com passagem definida. Atribua os tipos de modo que a jornada tenha ritmo variado —
   evite dez `ETAPA` seguidas.
4. **Rode `qa/audita_manifesto.py`.** Ele acusa: contagem divergente, IDs duplicados,
   sequência com buraco, referência repetida, **sobreposição de versículos no mesmo
   capítulo**, títulos semelhantes e livros bíblicos desconhecidos. Corrija tudo antes de
   escrever. É muito mais barato trocar uma passagem agora do que reescrever um
   devocional depois.
5. **Escreva o conteúdo** em `dados/conteudo/<nome>.txt`, seguindo o formato de §1.3.
6. **Acrescente a abertura da jornada** em `dados/aberturas.txt`:
   ```
   @@ID J43
   @@TEXTO
   (dois a quatro parágrafos apresentando a jornada)
   ```
7. **Rode `qa/audita_conteudo.py`.** Ele acusa campos vazios, rotas para destinos
   inexistentes, paráfrases entre aspas, frases proibidas, títulos/frases/aberturas
   repetidas e reflexões curtas demais para a duração declarada.
8. **Gere e verifique o PDF.**

### 4.1 Rotas relacionadas

Cada etapa deve ter 2 ou 3 rotas. Critérios, nesta ordem:
- Uma rota para **outra jornada** (evita que o livro vire uma sequência de silos).
- Uma rota para um **estado emocional adjacente**, não para o mesmo tema.
- O texto do link começa com **“se…”** e descreve a situação do leitor, nunca o conteúdo
  da etapa de destino.

---

## 5. Restrições que não podem ser afrouxadas

1. **Texto bíblico.** As paráfrases são próprias e sempre rotuladas como paráfrase.
   Nunca colocar uma paráfrase entre aspas como se fosse tradução. Nunca reproduzir
   extensamente uma tradução protegida. A referência completa é obrigatória.
2. **Ciência.** Nenhum achado científico entra no miolo devocional. Ele orienta o
   *design* e é declarado no apêndice. Proibidas as expressões listadas em
   `qa/audita_conteudo.py` → `FRASES_PROIBIDAS`.
3. **Sem calendário.** Nenhuma data, nenhum dia numerado, nenhum contador de sequência.
4. **Sem culpa por interrupção.** Nenhuma frase do tipo “você quebrou a sequência”,
   “volte ao início”, “recupere os dias perdidos”.
5. **Legibilidade.** Corpo 10,6 pt / entrelinha 16,2 e as margens de `motor.py` são piso,
   não teto. Se faltar espaço, aumenta-se o número de páginas — nunca se reduz a
   tipografia.
6. **Gamificação.** Marcos, mapas e selos, sim. Pontos de espiritualidade, ranking,
   sequência punitiva ou competição, não.

---

## 6a. Aquarelas

`assets/originais/` guarda os arquivos como vieram; `assets/img/` guarda as peças tratadas.
Para acrescentar imagens novas: coloque em `assets/originais/` e rode
`python3 build/prepara_imagens.py`. Ele faz três coisas — *alpha bleed* (indispensável: os
PNGs vêm com matte colorida sob a transparência e, sem esse passo, aparece franja vermelha
sobre papel claro), recorte automático por componentes conexos e redução a ~300 dpi.

Para posicionar, use os flowables de `paginas.py`:

| flowable | uso |
|---|---|
| `Cena(nome, x, y, ...)` | desenha em coordenada absoluta da página **sem ocupar altura no fluxo** — para margens, pés e marcas-d'água |
| `Motivo(nome, alt=...)` | elemento centralizado dentro do fluxo |
| `FioOrnamental(i)` | rota de mapa como separador |

**As três regras que não se quebram:** nada de imagem sobre coluna de texto; o que fica atrás
de texto entra entre 0,10 e 0,22 de opacidade; o repertório roda por índice
(`IL.motivo(i)`, `IL.fio(i)`), para que páginas vizinhas nunca repitam.

## 6. Ativos gráficos

**Onde cada símbolo aparece.** A insígnia: capa, falsa folha de rosto, folha de rosto e colofão.
Os ícones de tipo: no selo do alto de cada etapa, na legenda da página *Como usar* e no *Índice de
páginas especiais*. As marcas de braça: na abertura de cada jornada (com a legenda do nível), no
topo de cada divisória de braça e nas faixas do mapa de profundidade.

**Para acrescentar um tipo de página novo**, escreva a função `i_<nome>` em `simbolos.py`,
registre-a em `ICONES`, e acrescente o tipo a `CORES_TIPO`/`NOMES_TIPO` em `paginas.py`,
à `LegendaSimbolos.ITENS` e à lista do índice de tipos em `navegacao.py`.


Todos vetoriais, desenhados em código (`motor.py`), sem dependência de imagem externa:

| elemento | função |
|---|---|
| `marca_completa()` | **a insígnia**: âncora inscrita num anel de 42 marcas (uma por jornada), com 6 marcas longas nas fronteiras das braças. Capa, folhas de rosto, ornamentos |
| `desenha_icone()` | um glifo por tipo de entrada — 13 no total |
| `desenha_braca()` | marca de profundidade: seis faixas, as *n* primeiras preenchidas |
| `desenha_ancora_v2()` | âncora almirantado isolada |
| `linhas_batimetricas()` | textura de isóbatas de fundo |
| `Ornamento` | separadores (âncora, losango, filete duplo) |
| `Selo` | selo circular por tipo de entrada |
| `MapaBraca` | mapa de profundidade das seis braças |
| `BarraProgresso` | posição da etapa dentro da jornada |
| `Pauta` / `Quadricula` | áreas de escrita |

Paleta: `NAVY #16324F` · `DEEP #0E2436` · `PAPER #F4EFE6` · `GOLD #B08234` ·
`TERRA #A6543C` · `OLIVE #5C6B4B` · `INK #2E2A26` · `MIST #8B8377` · `LINE #D9D0C2` ·
`CREAM #FBF8F2` · `SAND #EFE7D8` · `SEA #3E6485`.

Tipografia: **Lora** (texto) e **Poppins** (navegação), ambas SIL Open Font License,
instanciadas estaticamente a partir das fontes variáveis em `fontes/`.
