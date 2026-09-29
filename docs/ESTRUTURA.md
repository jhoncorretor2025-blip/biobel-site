# 🏗️ Estrutura do sistema (explicação humana)

> Complementa o [`MAPA_AUTOMATICO.md`](MAPA_AUTOMATICO.md) (gerado por script) com o **"porquê"** e o **"como se mexe"**.

## 1. Visão geral do repositório
```
/
├── AGENTS.md                  ← guia de entrada pra qualquer IA (leia primeiro)
├── CLAUDE.md / .github/copilot-instructions.md  ← apontam pro AGENTS.md
├── README.md
├── index.html                 ← SITE PÚBLICO da loja
│   ├── style.css, extras.css
│   ├── navigation-improvements.js   (injetado por GitHub Action, ver PUBLICACAO.md)
│   └── imagens/  (banner/, depoimentos/, produtos)
├── login.html                 ← tela de entrada do painel (autentica e manda pro dashboard.html)
│
│   ===== PAINEL: 9 páginas independentes, mesmo JS/CSS compartilhado =====
├── dashboard.html              → data-biobel-page="dashboard"
├── central.html                → data-biobel-page="central"    (conteúdo 100% via JS)
├── operacao.html                → data-biobel-page="caixa"
├── equipe.html                 → data-biobel-page="equipe"
├── vendas.html                 → data-biobel-page="campanhas"
├── analises.html                → data-biobel-page="info"
├── alertas.html                 → data-biobel-page="alertas"
├── config.html                  → data-biobel-page="config"
├── administracao.html           → data-biobel-page="adm"       (login próprio)
│
├── biobel-app.js               ← TODA a lógica de negócio (~680 KB), compartilhada pelas 9
├── biobel-shell.js             ← cabeçalho + menu de navegação, compartilhado
├── central-operacional.js      ← só roda em central.html
├── inteligencia-operacional.js ← só roda em dashboard.html
├── biobel-design-system.css / biobel-ux-refinement.css / biobel-app.css  ← CSS compartilhado
│
├── manifest.json, service-worker.js   ← PWA (instalar no celular / offline)
├── .nojekyll                  ← diz ao GitHub Pages pra NÃO processar com Jekyll (não apague)
├── .github/workflows/         ← automação que mexe no index.html
├── tools/  validar.js · mapa.js
└── docs/   ESTRUTURA · CONVENCOES · PUBLICACAO · CHANGELOG · MAPA_AUTOMATICO · CONTEXTO_PARA_IA
```

## 2. Como uma página do painel é montada
1. `<head>`: Tailwind (CDN), `xlsx` e `chart.js` (CDN), os 3 CSS compartilhados.
2. `<body data-biobel-page="X">` — esse atributo é a **identidade da página**; todo o roteamento do JS depende dele.
3. Divs de overlay compartilhados (tour guiado, dica do dia, assistente de desligamento, etc.) — existem em todas as páginas, mesmo que só façam sentido nalgumas.
4. O conteúdo real da página: um `<main>` ou `<section>` com um id só dela (`dashboardTab`, `equipeTab`...) — ou, no caso de `central.html`, uma `<main id="centralPage">` **vazia**, porque `central-operacional.js` constrói tudo por JavaScript.
5. No fim: `<script src="biobel-shell.js">`, `<script src="biobel-app.js">`, e os scripts extras que aquela página específica precisa (`inteligencia-operacional.js` só no dashboard, `central-operacional.js` só na central).

## 3. Como o JavaScript compartilhado sabe o que fazer em cada página
`biobel-app.js` tem, perto do fim do arquivo, duas cadeias `if(p==='dashboard'){...} else if(p==='central'){...} else if(p==='caixa'){...}...`, onde `p = document.body.dataset.biobelPage`. Uma cadeia prepara os dados/gráficos da página; a outra remove a classe `hidden` do conteúdo dela e chama a função de inicialização específica (`initEquipeTab()`, `initAdmTab()`, `renderInfoTab()`...).

**Isso significa:** qualquer coisa que você escrever em `biobel-app.js` **fora** desses blocos `if(p===...)` roda em **todas as 9 páginas ao carregar**, mesmo que o elemento que você está referenciando só exista em uma delas. Se essa referência não tiver proteção (`?.` ou `if(elemento)`), ela **quebra o script inteiro** nas outras páginas — foi exatamente isso que já aconteceu (ver `AGENTS.md`, seção 5).

## 4. Navegação entre páginas
- **Menu principal:** `biobel-shell.js` monta `<a href="pagina.html">` de verdade — clicar troca de página no navegador (não é uma SPA / não usa `pushState`).
- **Atalhos internos** (botões dentro de uma página, tipo "⚡ Fechar Caixa" no Dashboard): chamam `showTab('caixa')`. Essa função primeiro procura `#caixaTab` **na página atual**; se não achar (porque você está em outra página), usa o mapa `window.BIOBEL_PAGES` e faz `window.location.href = 'operacao.html'`.
- **Mapa de páginas** (`PAGES` dentro de `biobel-shell.js`, espelhado em `biobel-app.js` como `map`):
  ```js
  {dashboard:"dashboard.html", central:"central.html", caixa:"operacao.html",
   equipe:"equipe.html", campanhas:"vendas.html", info:"analises.html",
   alertas:"alertas.html", config:"config.html", adm:"administracao.html"}
  ```
  Repare que os **nomes internos** (`caixa`, `campanhas`, `info`) não batem sempre com os **nomes de arquivo** (`operacao.html`, `vendas.html`, `analises.html`) — são os nomes herdados de quando o sistema era um arquivo único com abas. Ao mexer em algo, confira sempre os dois lados desse mapa.

## 5. Fluxo de dados (igual em todas as páginas)
```
Planilha Google (1 ABA POR DIA, nome "DD.MM", ex.: 22.09)
      │  ponte Apps Script OU export XLSX direto
      ▼
loadGoogleSheet()  ← roda ao abrir cada página e a cada 60s (dentro de biobel-app.js)
      │  normalizarNomeAba() aceita "25.8" e vira "25.08"
      ▼
processarLinhasDoDia(aba, linhas)  →  daysData[]  (compartilhado em memória enquanto a aba estiver aberta)
      ▼
funções render*() (dentro do bloco if(p===...) certo) desenham cards, gráficos e alertas
```
**Objeto de um dia (`daysData[i]`):** `dia`, `initial`, `sales`, `withdrawals`, `closing`, `dinheiro`, `debito`, `credito`, `pix`, `vendedoras`, `qtdVendas`, `porTurno` (`{'manhã'|'meio-dia'|'tarde': {qtd, valor}}`), entre outros — a planilha já traz turno e horário linha a linha, não peça isso de novo pro usuário.

**Importante:** como cada página é carregada do zero pelo navegador, `daysData` é recalculado **a cada troca de página** (não é "estado global" que sobrevive à navegação) — é por isso que `loadGoogleSheet()` roda de novo em cada uma.

## 6. Armazenamento
- Tudo em `localStorage` do aparelho, prefixo `biobel_` — compartilhado entre as 9 páginas (mesmo domínio = mesmo `localStorage`).
- Indicador "✅ Salvo às HH:MM" intercepta `localStorage.setItem` globalmente (dentro de `biobel-app.js`, roda em todas).
- **Backup:** Configuração → Backup (baixar `.json` / restaurar / backup automático semanal).
- **Não existe banco de dados central.** Aparelhos diferentes têm dados diferentes, exceto o que vem da planilha.

## 7. Receitas (passo a passo pra tarefas comuns)
**A) Mudar algo visual/comportamental de UMA página específica** → edite só o HTML daquela página (`equipe.html`, etc.), ou a parte de `biobel-app.js` dentro do `if(p==='equipe'){...}` correspondente. Rode `node tools/validar.js equipe.html`.

**B) Mudar algo que afeta TODAS as páginas** (ex.: o menu, um utilitário tipo `mostrarToast`, o cabeçalho) → edite `biobel-shell.js` ou a parte de nível raiz de `biobel-app.js` **com muito cuidado** (regra de ouro #1 do AGENTS.md — proteja qualquer `getElementById` com `?.`). Rode `node tools/validar.js` nas 9 páginas depois.

**C) Novo card numa página existente** → copie um card vizinho DAQUELA página, dê ids únicos, crie `renderMeuCard()` dentro do bloco `if(p==='...')` certo em `biobel-app.js`, chame-a junto dos outros `render*` daquela página.

**D) Novo dado salvo** → funções `getX()`/`salvarX()` em `biobel-app.js` (com `try/catch` e valor padrão); chave `biobel_x`; migração com flag se mudar formato de algo existente.

**E) Nova página inteira** → copie a estrutura de uma página parecida (cabeçalho, overlays, `<main>`/`<section>` com id próprio, os `<script src>` do fim), registre o nome nela no mapa `PAGES` (`biobel-shell.js`) e no `map`/roteamento (`biobel-app.js`), e no `ARQUIVOS_ESSENCIAIS` do `service-worker.js`.

**F) Depois de qualquer receita:** `node tools/validar.js <cada página que pode ter sido afetada>` → `node tools/mapa.js` → versão/data/Novidades → publicar (ver [PUBLICACAO.md](PUBLICACAO.md)).

## 8. Dívidas técnicas conhecidas
1. **Ano 2026 fixo** em dezenas de pontos de `biobel-app.js`. Vai errar cálculos de dia da semana a partir de 2027.
2. **Autenticação só no navegador** (login do painel e da ADM).
3. `biobel-app.js` é um arquivo enorme (~680 KB) compartilhado — qualquer erro nele afeta as 9 páginas de uma vez. É a peça mais frágil e mais crítica do sistema.
4. Os nomes internos de página (`caixa`, `info`, `campanhas`) não batem com os nomes de arquivo (`operacao.html`, `analises.html`, `vendas.html`) — fonte comum de confusão ao editar.
5. `index.html` aponta pra `script.js` inexistente.
