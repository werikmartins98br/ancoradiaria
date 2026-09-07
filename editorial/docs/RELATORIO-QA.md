# ÂNCORA DIÁRIA — Relatório de qualidade

Arquivo final: `saida/ancora-diaria.pdf`

---

## 1. Números da obra

| | |
|---|---|
| Devocionais completos | **437** |
| Jornadas | **42**, em 6 braças (níveis de profundidade) |
| Páginas do PDF | **1.599** |
| Formato | A5 · 148 × 210 mm (419,5 × 595,3 pt), uniforme em todas as páginas |
| Tamanho do arquivo | 8,9 MB |
| Passagens bíblicas únicas | **437** (zero repetições, zero sobreposições de versículos) |
| Livros bíblicos representados | **65 de 66** |
| Rotas relacionadas (links semânticos) | **1.193** |
| Hiperlinks internos no PDF | **6.252** — todos resolvem para uma página real |
| Marcadores (bookmarks) | **507**, em 3 níveis |
| Tipos de página especial | 12 |
| Corpo / entrelinha | 10,6 pt / 16,2 pt |

### Distribuição canônica

| Bloco | Devocionais | % | Livros cobertos |
|---|---:|---:|---|
| Pentateuco | 35 | 8,0% | 5/5 |
| Históricos | 26 | 5,9% | 12/12 |
| Poéticos e sapienciais | 83 | 19,0% | 5/5 |
| Profetas maiores | 26 | 5,9% | 5/5 |
| Profetas menores | 17 | 3,9% | 11/12 |
| Evangelhos | 90 | 20,6% | 4/4 |
| Atos | 15 | 3,4% | 1/1 |
| Cartas paulinas | 88 | 20,1% | 13/13 |
| Hebreus e cartas gerais | 52 | 11,9% | 8/8 |
| Apocalipse | 5 | 1,1% | 1/1 |

**Livro ausente: Obadias** — decisão editorial, não esquecimento. É um oráculo de 21 versículos
de juízo contra Edom, sem unidade de aplicação devocional que não exigisse forçar o texto.
Incluí-lo apenas para fechar 66/66 violaria a exegese responsável exigida pelo projeto.

### Tipos de entrada

ETAPA 270 · FAROL 39 · MARCO 28 · PASSO 21 · TEMPESTADE 20 · CALMARIA 13 ·
LASTRO 10 · CARTA DE BORDO 10 · HORIZONTE 9 · CLAMOR 7 · PORTO 7 · RETORNO 3

### Duração declarada

3 min: 30 · 5 min: 31 · 7 min: 212 · 10 min: 131 · 15 min: 33

---

## 2. Testes executados

Quatro suítes automatizadas, todas reexecutáveis (`make audit`, `make verify`):

**`qa/audita_manifesto.py`** — contagem por jornada × `jornadas.tsv`; unicidade de IDs;
sequência de etapas sem lacunas; referências bíblicas repetidas; **sobreposição de intervalos
de versículos dentro do mesmo capítulo**; similaridade de títulos (Jaccard ≥ 0,60); cobertura
canônica; distribuição de tipos e durações.

**`qa/audita_conteudo.py`** — cobertura manifesto × conteúdo; campos obrigatórios por tipo de
entrada; destinos de rota inexistentes ou autorreferentes; duplicação literal de paráfrase;
**similaridade entre títulos, ideias centrais, frases de encerramento, aberturas de reflexão,
fechos de oração e ações do bloco *Para hoje***; aberturas repetidas; lista de frases proibidas
(pseudociência e teologia da prosperidade); saturação de metáforas náuticas; comprimento da
reflexão × duração declarada; paráfrase entre aspas.

**`qa/audita_glifos.py`** — todo caractere usado na obra é conferido contra as 11 fontes
embutidas. Um glifo ausente não gera erro de compilação: vira um retângulo vazio na página.

**`qa/verifica_pdf.py`** — metadados; uniformidade de dimensões; contagem e hierarquia de
marcadores; marcadores apontando para página inexistente; marcadores exibindo a chave em vez
do título; ordem de páginas; resolução de **cada** hiperlink interno para uma página real;
varredura das 1.597 páginas em busca de marcadores de conteúdo pendente; páginas sem texto.

**Inspeção visual** — 27 páginas renderizadas e examinadas: capa, folha de rosto, expediente,
carta ao leitor, manifesto, como usar, método, Âncora Mínima, Porto de Retorno, sondagem,
*Preciso de…*, mapa das jornadas, Grande Travessia, estações, sumário, divisórias de braça,
abertura de jornada, sumário de jornada, e páginas de devocional amostradas no início, no
primeiro quarto, no meio, no terceiro quarto e no fim, mais MARCO, FAROL, TEMPESTADE, os
quatro índices, apêndice e colofão.

---

## 3. Erros encontrados e corrigidos

| # | Problema | Como foi detectado | Correção |
|---|---|---|---|
| 1 | **27 paráfrases envolvidas por aspas externas** — apresentaria paráfrase como se fosse tradução oficial, violando a política de uso bíblico | `audita_conteudo.py` | Aspas externas removidas; aspas internas de diálogo preservadas |
| 2 | **6 caracteres de transliteração hebraica ausentes das fontes** (ḥ, ṣ, ṭ, Ḥ, ʾ, ʿ) — apareceriam como retângulos vazios nos quadros *O texto por dentro* | `audita_glifos.py` | Transliteração simplificada para grafia latina; macrons mantidos (existem nas fontes) |
| 3 | **Glifo ◯ ausente** — o marcador de conclusão da Grande Travessia era um retângulo vazio em 42 linhas | `audita_glifos.py` + inspeção visual | Novo flowable `ItemMarcavel`, que desenha o círculo vetorialmente |
| 4 | **18 páginas MARCO abrindo com a mesma frase** ("Você chegou ao fim de…") | `audita_conteudo.py` | 18 aberturas reescritas, uma a uma |
| 5 | **9 reflexões abrindo com "Este é um dos…"** | `audita_conteudo.py` | 8 reescritas |
| 6 | **2 frases de *Leve com você* idênticas** em devocionais diferentes | `audita_conteudo.py` | Uma reescrita em cada par |
| 7 | **2 ações de *Para hoje* praticamente idênticas** | `audita_conteudo.py` | Reescritas |
| 8 | **2 devocionais sem o campo *Leve com você*** | `audita_conteudo.py` | Campos escritos |
| 9 | **Título repetido** entre duas jornadas | `audita_conteudo.py` | J37E02 renomeado |
| 10 | **12 sobreposições de intervalos de versículos** e **5 títulos quase idênticos** | `audita_manifesto.py`, antes da escrita | Passagens e títulos reatribuídos no banco mestre |
| 11 | **Marcadores do PDF exibindo a chave interna** em vez do título | inspeção do outline | Chave passava como `bytes` a `addOutlineEntry`; corrigido para `str` |
| 12 | **Espaçamento entre caracteres vazando** para linhas seguintes na capa | inspeção visual | `saveState`/`restoreState` e reset explícito de `charSpace` |
| 13 | **Números de página colados no texto** nos índices | inspeção visual | Separador e espaço fixo no helper `_pg()` |
| 14 | **Baixo contraste** na faixa III do mapa de braças | inspeção visual | Cor de texto trocada para a faixa clara |
| 15 | **Texto sangrando na divisória de braça** (moldura sem recuo) | inspeção visual | Frame com margens próprias |
| 16 | **Palavra em inglês** infiltrada em duas paráfrases | busca por padrões | Corrigidas |
| 17 | **Contagem desatualizada na capa** ("mais de 430") | conferência final | Trocada por "437 devocionais" |
| 18 | **Sumário de jornada e índice *Preciso de…* sem números de página** | inspeção visual | Números de página adicionados a ambos |
| 19 | **Braço da âncora vetorial** renderizando como lasca fina em vez de pata | inspeção visual | Geometria refeita com vetores unitários |

**Estado final de todas as suítes: 0 erros, 0 avisos.**

### Segunda rodada — identidade visual

| # | Ponto | O que mudou |
|---|---|---|
| 20 | **A marca era só uma âncora solta**, sem construção nem significado | Criada a **insígnia**: a âncora inscrita num anel de sondagem com **42 marcas — uma por jornada** — e **6 marcas longas** nas fronteiras das braças, com estrela no alto e horizonte com ondas na base. O emblema não é ornamento: é o índice da obra virado marca. Usada na capa, nas duas folhas de rosto e no colofão |
| 21 | **Nenhum sistema de símbolos** — os tipos de página eram só texto | **13 ícones vetoriais**, um por tipo (farol, tempestade, calmaria, porto, lastro, clamor, passo, retorno, memória, carta de bordo, horizonte, marco, etapa), no selo do alto de cada etapa e no índice de páginas especiais |
| 22 | **As braças não tinham símbolo** | **Marca de profundidade**: seis faixas empilhadas, as *n* primeiras preenchidas. Um cabo com traços seria mais literal, mas com um traço só lembraria uma cruz — ambiguidade indesejada num livro cristão. Aparece na abertura de cada jornada, no topo de cada divisória e nas faixas do mapa |
| 23 | **A abertura de jornada não dizia em que braça o leitor estava** | Agora traz a marca de profundidade com a legenda `BRAÇA IV · TRANSFORMAÇÃO` |
| 24 | **A chave dos ícones só existia no fim do livro** — o leitor os encontrava na p. 42 | Legenda completa dos 12 símbolos acrescentada à página *Como usar*, com link para o índice |
| 25 | **Marca-d'água da divisória de braça atrapalhava o título** | Removida; o lugar passou a ser ocupado pela marca de profundidade, em ouro, no alto |
| 26 | **Âncora vetorial** com proporções que só funcionavam em tamanho grande | Redesenhada para permanecer legível de 6 mm a 60 mm |

### Terceira rodada — aquarelas

| # | Ponto | O que mudou |
|---|---|---|
| 27 | **Halo vermelho nas aquarelas** — os PNGs vinham com uma matte vermelha/amarela sob os pixels transparentes; ao compor sobre papel claro, as bordas semitransparentes mostravam franja vermelha | `build/prepara_imagens.py` propaga a cor dos pixels opacos para dentro da região transparente (*alpha bleed*, 14 iterações) antes de qualquer composição. Verificado por contagem de pixels vermelhos no resultado composto: de alguns milhares para zero |
| 28 | **Página de boas-vindas** | O texto original foi apagado da arte por detecção de pixels mais escuros que o entorno local, com preenchimento por mediana larga — preservando navio, moldura, botânica, rosa dos ventos e a textura do papel. Sobre essa base entra a escrita da Âncora Diária |
| 29 | **Duas pranchas de elementos** vinham como folha única | Separadas automaticamente em 33 peças por componentes conexos de alfa, recortadas ao retângulo mínimo e reamostradas para ~300 dpi no tamanho impresso |
| 30 | **Ilustração poderia atrapalhar a leitura** | Regra aplicada em todo o livro: nada de imagem sobre coluna de texto; o que fica atrás de texto entra entre 0,10 e 0,22 de opacidade; o repertório roda por índice, para que jornadas vizinhas nunca repitam o mesmo motivo |
| 31 | **Colofão passou a afirmar coisa falsa** — dizia que nenhum elemento gráfico era imagem licenciada, o que deixou de valer com as aquarelas | Texto corrigido: distingue o que é geometria vetorial do que é aquarela do acervo do autor |
| 32 | **Página final ficou órfã**, com o navio espremido no alto | Transformada em página de fecho deliberada: navio, âncora, a assinatura da obra e "FIM", centralizados |

---

## 4. Limitações que permanecem — declaradas, não escondidas

**1. Texto bíblico em paráfrase própria, não em tradução reconhecida.**
Esta é a limitação mais relevante da obra e é consequência de uma restrição real do ambiente
de produção: não havia acesso a um texto bíblico em português de domínio público legível por
máquina (os repositórios e registros de pacote estavam bloqueados por política de rede), e
reproduzir extensamente uma tradução protegida seria violação de direitos autorais.

A solução adotada: referência completa e conferida em todas as entradas; paráfrase própria,
preparada a partir do sentido do texto original com atenção a gênero, contexto histórico e
contexto imediato; **identificação explícita como paráfrase em todas as 437 ocorrências**,
nunca entre aspas; e convite impresso, em cada etapa, para abrir a Bíblia do leitor na
referência indicada. A política está declarada no expediente e no colofão.

*Se você quiser publicar com uma tradução reconhecida*, o caminho é obter licença da sociedade
bíblica detentora dos direitos (ARA/ARC/NAA pela SBB, NVI pela Biblica) e substituir o campo
`@@TEXTO` de cada entrada. A estrutura de dados permite fazer isso sem tocar em nenhuma outra
parte da obra.

**2. Autoria única, sem revisão humana independente.**
Toda a obra — exegese, redação, teologia, design — foi produzida em uma única passada, sem
revisor teológico, revisor de texto ou leitor-beta. As auditorias automatizadas detectam
repetição, inconsistência estrutural e violação de regras declaradas; **elas não substituem
revisão teológica humana**. Recomendo fortemente uma leitura por alguém com formação
teológica antes da publicação comercial, especialmente das entradas marcadas como FAROL
(as 39 mais doutrinárias) e das passagens em que há divergência legítima entre tradições —
sinalizadas no texto, mas que merecem conferência.

**3. Obadias ausente.** Documentado acima. É decisão consciente, e pode ser revertida se você
preferir cobertura de 66/66.

**4. Direitos das aquarelas.**
As aquarelas usadas na obra — navio, farol, veleiro, rosa dos ventos, carta náutica e os
motivos de rodapé — foram fornecidas por você e estão sendo tratadas como acervo próprio.
**Não verifiquei a licença de nenhuma delas**, e não tenho como fazê-lo daqui. Antes de
vender, confirme que o pacote de origem permite uso comercial e, se exigir, crédito. É o
único ponto da obra em que há material que não foi criado aqui do zero.

O restante do repertório gráfico — insígnia, símbolos de tipo, marcas de braça, isóbatas,
ornamentos, mapa de profundidade, barra de progresso — é geometria desenhada em código, sem
dependência externa.

**5. Páginas finais de devocional com espaço em branco.**
Cada devocional começa em página nova — decisão deliberada, pela previsibilidade que reduz o
esforço de retomada. O efeito colateral é que a última página de cada entrada frequentemente
fica pela metade. Preferi isso a comprimir tipografia ou quebrar a previsibilidade estrutural.

**6. Índice temático baseado em palavras-chave declaradas**, não em análise semântica do texto
corrido. As tags foram atribuídas manualmente no banco mestre; um tema tratado de passagem
dentro de uma reflexão pode não aparecer no índice.

**7. Marcadores em 3 níveis, não 4.** O adendo previa avaliar a inclusão da hierarquia
Braça → Jornada → Etapa. Os três níveis atuais (páginas estruturais / jornadas / etapas) já
somam 506 entradas; acrescentar as braças como quarto nível empurraria o painel de marcadores
para além do que é confortável navegar em leitores de tablet. As braças aparecem como entradas
de nível 0, na sequência correta.

**8. Não testado em impressão física.** As margens (15 mm topo, 16,5 mm base, 15,5 mm laterais)
são adequadas para leitura em tela e para impressão sob demanda em A5, mas não há margem de
lombada diferenciada. Para impressão em capa dura com mais de 1.500 páginas, será necessário
aumentar a margem interna — ajuste de uma linha em `motor.py`.

---

## 5. Arquivos auxiliares entregues

```
dados/jornadas.tsv          42 jornadas — metadados e necessidades
dados/manifesto.psv         437 etapas — banco mestre (fonte única de verdade)
dados/aberturas.txt         textos de abertura das braças e jornadas
dados/conteudo/*.txt        o conteúdo devocional, em formato editável
build/                      motor editorial reutilizável (6 módulos)
qa/audita_manifesto.py      auditoria estrutural
qa/audita_conteudo.py       auditoria de conteúdo e repetição
qa/audita_glifos.py         auditoria de cobertura de glifos
qa/verifica_pdf.py          verificação técnica do PDF
qa/relatorio-*.txt          saída das quatro suítes
qa/mapa_paginas.json        mapa destino → página da última compilação
docs/00-decisoes.md         decisões editoriais fundacionais
docs/01-base-cientifica.md  base de evidências, com gradação de força
docs/10-manual-de-producao.md  como ampliar a obra sem quebrar nada
Makefile                    make audit · make build · make verify · make png
```
