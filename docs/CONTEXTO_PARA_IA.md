# CONTEXTO COMPLETO DO PROJETO BIOBEL (arquivo único para colar/anexar em uma IA)

> Gerado automaticamente por `node tools/mapa.js` — NÃO edite à mão. Versão do sistema: v11.23.
> Instrução para a IA: leia tudo abaixo antes de responder. Depois, o usuário vai enviar a(s) página(s) do painel (ex.: dashboard.html) e/ou os arquivos JS compartilhados (biobel-app.js, biobel-shell.js) e dizer o que quer mudar.
> Responda em português simples, com emojis e negrito nas palavras-chave. Diga o que testou e o que não conseguiu testar.



---
## ===== GUIA PRINCIPAL (AGENTS.md) =====

# 🤖 AGENTS.md — Guia para qualquer IA que for mexer neste projeto

> Leia este arquivo **inteiro antes de editar qualquer coisa**. Vale para Claude, ChatGPT, Gemini, Copilot, Cursor, Codex ou qualquer outra ferramenta.
> **IA de chat sem acesso ao repositório?** Peça ao usuário pra anexar [`docs/CONTEXTO_PARA_IA.md`](docs/CONTEXTO_PARA_IA.md) (este guia + estrutura + convenções + publicação em um arquivo só).
> Detalhes: [`docs/ESTRUTURA.md`](docs/ESTRUTURA.md) · [`docs/CONVENCOES.md`](docs/CONVENCOES.md) · [`docs/PUBLICACAO.md`](docs/PUBLICACAO.md) · [`docs/CHANGELOG.md`](docs/CHANGELOG.md) · [`docs/MAPA_AUTOMATICO.md`](docs/MAPA_AUTOMATICO.md)

## 1. O que é
**Biobel Cosméticos** (loja em Gravataí/RS). Este repositório publica, no GitHub Pages, **duas coisas**:
1. **Site público** da loja → `index.html` (+ `style.css`, `extras.css`, `navigation-improvements.js`, pasta `imagens/`).
2. **Painel de gestão privado** (fechamento de caixa, metas, equipe, boletos, campanhas, clima...) → `login.html` → **9 páginas HTML independentes** que compartilham o mesmo JavaScript e CSS.

⚠️ **Desde a v10.39, o painel NÃO é mais um arquivo único.** Se você já conhece uma versão anterior deste projeto (um `dashboard.html` gigante com tudo dentro), essa informação está desatualizada — leia a seção 2 com atenção.

Quem usa: a dona/gerente da loja e a equipe, principalmente **no celular**. **Não são programadoras** → tudo na tela precisa estar em **português simples**.

## 2. Arquitetura: páginas separadas com JS compartilhado

| Página (arquivo) | `data-biobel-page` | O que tem |
|---|---|---|
| `dashboard.html` | `dashboard` | Visão Geral — meta do mês, calendário comercial, central de inteligência, resumo do caixa |
| `central.html` | `central` | Central Operacional — tarefas, agenda, contas, estoque, manutenção (renderizada 100% por JS) |
| `operacao.html` | `caixa` | Fechamento de caixa do dia |
| `equipe.html` | `equipe` | Folha de ponto, faltas, rotina semanal |
| `vendas.html` | `campanhas` | Campanhas, textos de vaga, "Sem Movimento? Faça Isso!" |
| `analises.html` | `info` | Informação Geral — financeiro, vendedoras, dias, clima, comparações |
| `alertas.html` | `alertas` | Central de Alertas & Decisões |
| `config.html` | `config` | Configuração (conexão, planilhas, metas, horários, backup...) |
| `administracao.html` | `adm` | Login próprio — gastos fixos, boletos, comissões, RH |

Cada página HTML tem **só o conteúdo dela própria** (uma `<main>` ou `<section>` com um id como `dashboardTab`, `equipeTab`, `admTab`...). O JavaScript que faz tudo funcionar é **compartilhado**, carregado via `<script src="...">` em todas as páginas:

- **`biobel-app.js`** (~680 KB) — o cérebro do sistema: todas as funções `get*`/`salvar*`/`render*`, regras de negócio, cálculos. Roda em **todas as 9 páginas**. No fim do arquivo tem um `if(p==='dashboard'){...} else if(p==='equipe'){...}...` que lê `document.body.dataset.biobelPage` pra saber em qual página está e inicializar só o que é dela.
- **`biobel-shell.js`** — monta o cabeçalho e o menu de navegação (compartilhado, injeta em `<div id="biobel-shell">`) em todas as páginas.
- **`central-operacional.js`** — só roda em `central.html`; constrói TODO o conteúdo daquela página via JavaScript (o HTML da página em si fica praticamente vazio).
- **`inteligencia-operacional.js`** — só roda em `dashboard.html`; alimenta o card "Central de Inteligência".
- **`biobel-design-system.css`**, **`biobel-ux-refinement.css`**, **`biobel-app.css`** — CSS compartilhado entre as 9 páginas.

**Navegação entre páginas:** o menu (`biobel-shell.js`) usa `<a href="pagina.html">` normais — troca de página de verdade, não é uma SPA. A função `showTab(tab)` (em `biobel-app.js`) primeiro tenta achar a aba **na página atual**; se não achar, usa `window.BIOBEL_PAGES` pra redirecionar (`window.location.href`) pra a página certa.

## 3. Regras de ouro (não negociáveis)

1. **Qualquer código que rode IMEDIATAMENTE ao carregar `biobel-app.js` (fora de função, sem estar dentro de um `if(p===...)`) tem que valer pras 9 páginas, ou usar `?.` / `if(elemento)`.** Isso já causou um bug sério: uma linha sem proteção assumindo um elemento que só existe no Dashboard travou o script inteiro nas outras 8 páginas (ninguém conseguia navegar pra lugar nenhum). Regra prática: **nunca escreva `document.getElementById('x').algumaCoisa` no nível raiz do arquivo sem `?.`** — só é seguro dentro de uma função que só é chamada na página certa.
2. **Nunca use `alert()`/`confirm()` do navegador.** Use `mostrarToast(msg)`, `mostrarToastComDesfazer(msg, fnDesfazer)`, `confirmarBiobel(msg, cb)` ou `await confirmarBiobelAsync(msg)`.
3. **Datas: use `obterAgoraBrasilia()`** (fuso de Brasília) pra "hoje/agora". Chave de dia: `.paraChaveISO()`.
4. **Dados ficam no `localStorage` do aparelho**, sempre com prefixo `biobel_`. Toda mudança de formato precisa ser **retrocompatível**. Use migração idempotente com flag (`biobel_..._migracao_vN`).
5. **Antes de apagar ou alterar uma função/id, procure quem usa** — mas lembre que agora "quem usa" pode estar numa página **diferente** da que você está editando, já que o JS é compartilhado. Rode `grep -rn "nomeDaFuncao\|id=\"oId\"" *.html *.js`, não só no arquivo que você abriu.
6. **A cada publicação:** atualizar a versão **e a data** (span `#versaoSistema`, montado dentro do `biobel-shell.js`) e adicionar uma linha na tela **Configuração → 🆕 Novidades**. Como o cabeçalho é compartilhado, mudar a versão em UM lugar já reflete nas 9 páginas.
7. **Interface em português do Brasil, linguagem leiga, com emoji.**
8. **Mobile primeiro.**
9. **Segredos:** este repositório é **público**. **Nunca** escreva senhas, tokens, CPFs, chaves PIX, salários ou dados pessoais em código novo, docs, commits ou respostas.
10. **Não invente números.** Peça o valor manual ao usuário quando o dado não existir na planilha.
11. **Não publique em rajada** (limite de builds do Pages — ver `docs/PUBLICACAO.md`).

## 4. Fluxo de trabalho obrigatório
```bash
git pull --rebase                 # um robô do GitHub também faz commits (ver docs/PUBLICACAO.md)
# ...edite...
node tools/validar.js arquivo.html    # rode PRA CADA página que você tocou (ou que usa a função/id que você mudou)
node tools/mapa.js                    # atualiza docs/MAPA_AUTOMATICO.md e docs/CONTEXTO_PARA_IA.md
# atualize versão+data+Novidades (dentro de biobel-shell.js) e docs/CHANGELOG.md
git add -A && git commit -m "vX.Y - resumo em português" && git push
# espere o build do Pages ficar "built" (~40-100s) e confira a versão no site
```

⚠️ **Se você mexeu em `biobel-app.js`, `biobel-shell.js`, `central-operacional.js` ou `inteligencia-operacional.js`, rode o validador nas 9 páginas do painel, não só numa.** Um erro nesses arquivos compartilhados afeta todas ao mesmo tempo — foi exatamente assim que os dois bugs mais sérios já encontrados aconteceram.

## 5. Armadilhas já vividas (aprenda com elas)
- **Impressão do recibo em branco:** o CSS de impressão esconde todo filho direto do `<body>` menos `#printReceipt`. Se o recibo estiver dentro de um painel, o painel é escondido e leva o recibo junto (um `display:none` no pai nunca é vencido pelo filho). Regra: **`#printReceipt` é sempre filho direto do `<body>`** — use `garantirAreaRecibo()`, nunca `document.getElementById('printReceipt')` solto (em várias páginas o elemento nem existe). O efeito do modo de impressão (`body.receipt-printing`) vale **só em `@media print`**. **Como testar sem impressora:** Chromium headless + `page.pdf()` em A4, 80 mm e 58 mm e leia o PDF (`pdftotext`/`pdftoppm`). Cuidado: o `afterprint` dispara depois de CADA `page.pdf()` e desfaz o modo de impressão — use uma página nova por tamanho de papel, senão você testa a tela normal sem perceber.
- **Aba aberta há dias roda código velho:** o painel só procura versão nova ao carregar a página. Num computador que fica com o sistema aberto o dia todo (ex.: o da loja), uma correção publicada não chega até alguém recarregar (Ctrl+Shift+R). Antes de investigar "só no computador X", confira o número da versão no topo da tela dele.
- **`<style>` aberto duas vezes no `<head>`** (faltou o `</style>` ao inserir um bloco de CSS): o navegador descarta em silêncio a primeira regra do bloco seguinte e o layout quebra sem nenhum erro no console. Ao inserir CSS no `<head>`, confira que cada `<style>` tem o seu `</style>` — o `tools/validar.js` agora reprova esse caso. **Dica:** o defeito só aparece olhando a tela; se puder, renderize a página num navegador headless (Playwright) antes de publicar.
- **Bug do "só a página inicial abre"**: uma linha sem `?.` no nível raiz de `biobel-app.js`, assumindo um elemento (`daySelect`) que só existe no Dashboard, travava o script inteiro nas outras 8 páginas — o conteúdo delas nunca ficava visível (`classList.remove('hidden')` nunca rodava, porque o erro interrompia a execução antes de chegar lá). Corrigido adicionando `?.`. **Lição:** qualquer código de nível raiz em arquivo JS compartilhado precisa ser à prova de "esse elemento pode não existir nesta página".
- **Bug do código aparecendo como texto na tela**: na migração pra páginas separadas, sobrou uma cópia inteira (~70 KB) do `biobel-app.js` colada por engano dentro do `<body>` de cada uma das 9 páginas, fora de qualquer `<script>` — o navegador mostrava aquilo como texto solto em vez de executar. Corrigido removendo o trecho duplicado de cada página.
- **Ano fixo em 2026** no `biobel-app.js` (dezenas de `new Date(2026, ...)`). Cálculos de **dia da semana** vão errar a partir de 2027.
- **Verifique se a funcionalidade já existe antes de criar.** Já aconteceu de recriar à mão algo que o sistema já lia da planilha (ex.: turno por venda já vem em `d.porTurno`).
- **`tools/validar.js` valida UMA página por vez** (e os arquivos `.js` locais que ela referencia) — rodar só numa página não garante que as outras 8 continuam funcionando, se você mexeu num arquivo compartilhado.
- **Cache do navegador/PWA** faz o usuário ver versão antiga — o `service-worker.js` usa estratégia "rede primeiro", mas ainda assim confira a versão no topo antes de achar que é bug.
- **Um feedback do usuário costuma significar "não achei"**, não "não existe". Confirme o caminho de navegação antes de programar de novo.

## 6. Como conversar com o dono do sistema
Português informal e **simples**, sem jargão. **Negrito** nas palavras-chave e emojis. Explique o "porquê" em uma frase. Diga com honestidade o que testou e o que **não** conseguiu testar (você não tem acesso ao navegador dele nem aos dados salvos no aparelho — mas pode simular a execução do JS em Node, como já foi feito pra achar os dois bugs acima).

## 7. Problemas conhecidos (não é você que quebrou)
- `index.html` referencia `script.js`, que **não existe** no repositório (404 silencioso).
- Arquivos soltos na raiz sem uso aparente: `img` (1 byte), `test.txt`, `slide_de_fachada.png`, `imagens/roda_pe_site.png`, e alguns `imagens/*/teste.html`. **Não apague sem confirmar com o dono.**
- Login e área ADM são checados **no navegador**. Não trate como segurança real.
- Cada aparelho tem seus **próprios dados** (localStorage). Não existe banco central; a única fonte compartilhada é a planilha do Google.


---
## ===== ESTRUTURA (docs/ESTRUTURA.md) =====

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


---
## ===== CONVENÇÕES (docs/CONVENCOES.md) =====

# 📐 Convenções de código e design

## Nomes
| Tipo | Padrão | Exemplos |
|---|---|---|
| Ler dado salvo | `getX()` (com `try/catch` + valor padrão) | `getBoletos()`, `getClimaDias()` |
| Salvar dado | `salvarX(valor)` | `salvarBoletos(lista)` |
| Desenhar na tela | `renderX()` | `renderBoletos()`, `renderTirinhaPrevisaoClima()` |
| Ações do usuário | verbo + objeto | `adicionarBoleto()`, `alternarAtividadeSemMovimento(i)`, `removerX()` |
| Chave de dados | `biobel_` + área + assunto (minúsculo, `_`) | `biobel_adm_boletos`, `biobel_clima_dias` |
| Migração | chave com sufixo `_migracao_vN` ou `_seed_vN` | `biobel_campanhas_migracao_v2` |
| IDs no HTML | camelCase com prefixo da área | `novoBoletoValor`, `configSecaoBackup`, `admAncoraGastos` |
| Comentário de seção de código | `/* ===== Nome — o que faz ===== */` (alimenta o mapa automático) | ver `MAPA_AUTOMATICO.md` |

## Utilitários que já existem (use, não recrie)
- `mostrarToast(msg)` · `mostrarToastComDesfazer(msg, fn)` (5 s) · `confirmarBiobel(msg, cb)` · `await confirmarBiobelAsync(msg)`
- `obterAgoraBrasilia()` (+ `.paraChaveISO()`) · `money(n)` (R$ pt-BR) · `parseValorSimples(texto)` (aceita "1.234,56")
- `getClimaDias()` / `salvarClimaDias()` · `getDiasAtipicos()` (dias fora da média não entram em estatísticas)
- `registrarAlteracao(texto)` → log de alterações · `carregarJsPDFSobDemanda()` + `desenharCabecalhoPDF()` → PDFs
- Proteção global contra clique duplo (500 ms) e feedback visual `button:active` já são automáticos.

## ⚠️ Regra extra pra código compartilhado entre páginas (`biobel-app.js`, `biobel-shell.js`)
- **Qualquer linha de nível raiz** (fora de qualquer `function`, sem estar dentro de um bloco `if(p==='pagina'){...}`) roda em **todas as 9 páginas do painel ao mesmo tempo**. Se ela referenciar um elemento (`getElementById`) que só existe nalgumas páginas, **precisa** de `?.` ou de um `if(elemento)` — senão o erro trava o script inteiro nas páginas que não têm esse elemento. Já aconteceu (ver `AGENTS.md`).
- Antes de adicionar uma linha nova no nível raiz de `biobel-app.js`, pergunte: "essa linha roda em TODAS as 9 páginas quando carregar?" Se a resposta for sim e ela referencia algo específico de uma página, ela precisa de proteção.
- Prefira colocar código específico de uma página **dentro** do bloco `if(p==='essa-pagina'){...}` correspondente, em vez de nível raiz com proteção — é mais claro sobre a intenção.
- Testar isso não dá pra fazer só olhando: rode uma simulação (ver exemplo em `docs/PUBLICACAO.md` ou peça pro Claude simular a execução em Node, mockando `document`/`window`, como já foi feito pra achar os bugs conhecidos).

## Design (tema escuro; existe modo claro)
- **Cards:** `class="card rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-7"` ou o par `adv-card` + `adv-card-title` (`<h3>` + `<span>` de descrição).
- **Paleta:** fundo interno `#0b1728` / `#0f172a` · borda `#1e2c42` · texto `#dce5f2` · texto secundário `#93a3ba` · verde `#27d7a0` (`#0ea97a` botões) · azul `#4f9cff` · amarelo `#fbbf24` · rosa/vermelho `#fb7185` · roxo `#a78bfa`.
- **Semântica de cor:** verde = feito/ok · amarelo = atenção/sol · azul = informação/chuva · vermelho = problema/pior.
- Botões: sempre `type="button"` fora de formulário; rótulo com verbo + emoji ("💾 Salvar").
- Listas comparativas: barra horizontal (`height:10px`, `border-radius:999px`) com valor à direita.
- Estados vazios explicam o que fazer ("Sem dados de turno nessa planilha ainda").

## Comportamento esperado
- **Retrocompatível sempre:** nunca renomeie/mude formato de chave existente sem migração.
- **Remover = com "Desfazer"** (`mostrarToastComDesfazer`).
- **Erros de rede não travam a tela:** `try/catch`, fallback silencioso (ex.: clima), nada de `alert`.
- **Listas que reiniciam por dia** (ex.: checklist "Sem Movimento") guardam a data junto e regeneram quando a data muda.
- **Preferir o dado que já vem da planilha** a pedir digitação.
- **Sugestão ≠ imposição:** valores automáticos (datas de boleto, clima) sempre editáveis pelo usuário; escolha manual vence a automática.
- Textos para o usuário final: português simples, sem termos técnicos ("salvo no aparelho", não "localStorage").

## Testes (não há framework — e tudo bem)
1. `node tools/validar.js <arquivo.html>` — rode pra **cada página** que pode ter sido afetada. Se mexeu em `biobel-app.js`, `biobel-shell.js` ou outro arquivo compartilhado, rode nas 9.
2. Lógica pura (cálculos, ranking, datas): copie a função para `node -e "..."` e rode com **dados simulados**, incluindo casos-limite (vazio, 1 item, empate).
3. **Código de nível raiz em arquivo compartilhado:** simule a execução em Node mockando `document`/`window`/`localStorage`, rodando como cada uma das 9 páginas — é a única forma confiável de achar um `getElementById` desprotegido antes de travar o sistema de verdade.
4. Diga ao usuário o que **não** foi testado (visual no celular real, dados reais do aparelho dele).

## Não faça
- ❌ `alert/confirm` nativos · ❌ `new Date()` pra "hoje" · ❌ segredos/dados pessoais em arquivos · ❌ apagar função sem `grep` (lembrando: o uso pode estar numa página diferente) · ❌ criar tela sem checar se já existe · ❌ publicar sem validar as páginas afetadas · ❌ ler/gravar dado do usuário fora do prefixo `biobel_` · ❌ `getElementById(...)` sem `?.` no nível raiz de arquivo compartilhado.


---
## ===== PUBLICAÇÃO (docs/PUBLICACAO.md) =====

# 🚀 Como publicar com segurança

## Onde o site roda
- **GitHub Pages**, branch `main`, pasta raiz `/`. Sem build próprio: **o que está na `main` é o que vai ao ar**. O painel agora usa páginas HTML independentes + arquivos compartilhados.
- `.nojekyll` na raiz impede o GitHub de processar com Jekyll (**não apague**).
- URL pública: `https://jhoncorretor2025-blip.github.io/biobel-site/` (painel: `login.html` → `dashboard.html`).

## Passo a passo
1. `git pull --rebase` (veja "Robô" abaixo).
2. Edite. Rode `node tools/validar.js <arquivo.html>` **em cada página que pode ter sido afetada** até dar **🟢 APROVADO** — se você mexeu em `biobel-app.js`, `biobel-shell.js`, `biobel-app.css` ou outro arquivo compartilhado, rode nas 9 páginas do painel (dashboard, central, operacao, equipe, vendas, analises, alertas, config, administracao).
3. Suba a versão **e a data** no span `#versaoSistema` — ele é montado dentro de **`biobel-shell.js`** (não em cada página individual), então mudar em um lugar já reflete nas 9. Tem 2 pontos pra atualizar ali: o texto visível (`>vX.Y</span>`) e a mensagem do toast/title (`'… versão vX.Y'` / `title="Atualizado em DD/MM/AAAA...`). Adicione também a entrada em **Configuração → 🆕 Novidades** (essa seção mora dentro de `config.html`) e em `docs/CHANGELOG.md`.
4. `node tools/mapa.js` (atualiza `docs/MAPA_AUTOMATICO.md`).
5. **Um commit** com mensagem `vX.Y - resumo do que mudou e por quê`. `git push`.
6. Espere o build: `GET https://api.github.com/repos/jhoncorretor2025-blip/biobel-site/pages` → `"status": "built"` (leva 40–100 s; o arquivo é grande). `"building"` = aguarde; `"errored"` = veja a seção abaixo.
7. Abra o site e **confira o número da versão** no topo (cache pode mostrar a antiga: recarregue forte / feche e abra o app).

## ⚠️ Limite de publicações (já aconteceu)
Fazer **muitos pushes em sequência** estourou o limite de builds do Pages: todos passaram a falhar em <1 s com `"errored"` ("Page build failed") por mais de uma hora, mesmo com o código certo. A cura foi **parar de publicar ~1 h**. Regra: **agrupe mudanças e publique em lotes**; evite passar de poucas publicações por hora. Se der `errored` logo depois de um push que estava válido, **não** fique reenviando — espere.

## 🤖 Robô do GitHub (Action)
`.github/workflows/apply-navigation-improvements.yml` dispara quando `navigation-improvements.js` **ou o próprio workflow** é alterado: ele garante que o `<script src="navigation-improvements.js">` esteja no `index.html` e **faz commit na `main`**. Por isso sempre rode `git pull --rebase` antes do push, senão o push é rejeitado.

## Credenciais
- Use um **token com acesso só a este repositório** (permissão de conteúdo: leitura/escrita), validade curta.
- **Nunca** grave token/senha em arquivo, commit, doc ou resposta. Passe por variável de ambiente.
- Se um token aparecer em conversa/log, **revogue e gere outro**.
- O repositório é **público**: qualquer coisa commitada é visível.

## Voltar atrás (rollback)
Cada versão é um commit: `git revert <sha>` e push (ou restaurar o arquivo de um commit anterior). Os **dados dos usuários** ficam no aparelho e não são afetados por rollback do código; o backup de dados está em **Configuração → Backup**.

## PWA / cache
`service-worker.js` guarda as páginas principais e os arquivos compartilhados e busca a rede com `cache: 'reload'`. Para invalidar tudo, suba o `CACHE_NAME`.
