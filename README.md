# Âncora Diária — Web App

Experiência devocional local e instalável construída a partir da base editorial oficial do livro. O aplicativo reúne 437 devocionais, 42 jornadas e 1.193 rotas relacionadas. Não exige login, backend ou serviços externos; progresso, anotações, favoritos, marcos e preferências ficam no navegador.

## Abrir localmente

O build pronto está incluído. Com Node.js 22 ou mais recente:

```bash
npm run local
```

Abra `http://localhost:4173`. No Windows, também é possível dar duplo clique em `INICIAR-WINDOWS.bat`; no macOS/Linux, execute `./iniciar-local.sh`.

Para desenvolver:

```bash
npm install
npm run dev
```

Para importar novamente o conteúdo, validar e gerar o build de produção:

```bash
npm run build
npm test
```

## Conteúdo e assets

- Fonte editorial única: `editorial/dados/`
- Base gerada automaticamente: `app/data/content.generated.json`
- Importador: `scripts/import-content.mjs`
- Validador: `scripts/validate-content.mjs`
- Assets do livro: `public/assets/`
- Aquarelas autorais em uso na interface: `public/assets/aquarelas/`
- Fontes locais: `public/fonts/`
- Build offline: `dist/client/`

Não edite `content.generated.json` à mão. Para adicionar um devocional, inclua-o em `editorial/dados/manifesto.psv` e no arquivo correspondente de `editorial/dados/conteudo/`; para adicionar uma jornada, atualize `editorial/dados/jornadas.tsv` e sua abertura em `editorial/dados/aberturas.txt`. Depois execute `npm run content:build` e `npm run content:validate`.

## Backup

Em **Preferências → Backup local**, use **Exportar meus dados** para gerar um JSON. **Importar backup** restaura anotações, progresso, favoritos, coleções, marcos e preferências. O arquivo não contém o texto do livro.

O menu lateral, disponível pelo ícone de menu no topo, reúne a Grande Travessia, necessidades, Diário, coleções, Introdução, Sobre, preferências e backup. O Diário de Bordo apresenta as anotações em uma linha do tempo ligada às leituras de origem.

## Evolução futura

A camada de conteúdo é independente da interface e os dados pessoais passam pelo contexto em `app/lib/app-state.tsx`. Uma evolução para contas e sincronização pode substituir a persistência local por um repositório remoto mantendo IDs, telas e regras de descoberta. O manifest e o service worker já deixam a versão atual preparada como PWA.

Consulte `QA.md` para o resumo das verificações executadas.
