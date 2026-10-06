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
| `operacao.html` | `caixa` | Fechamento de caixa do dia |
| `equipe.html` | `equipe` | Folha de ponto, faltas, rotina semanal |
| `vendas.html` | `campanhas` | Campanhas, textos de vaga, "Sem Movimento? Faça Isso!" |
| `analises.html` | `info` | Informação Geral — financeiro, vendedoras, dias, clima, comparações |
| `alertas.html` | `alertas` | Central de Alertas & Decisões |
| `config.html` | `config` | Configuração (conexão, planilhas, metas, horários, backup...) |
| `administracao.html` | `adm` | Login próprio — gastos fixos, boletos, comissões, RH |
| `administracao/fornecedor.html` | — | Boletos e fornecedores (subpágina da Administração; scripts com prefixo `../`) |
| `backup.html` | `backup` | Backup e restauração dos dados locais |

Cada página HTML tem **só o conteúdo dela própria** (uma `<main>` ou `<section>` com um id como `dashboardTab`, `equipeTab`, `admTab`...). O JavaScript que faz tudo funcionar é **compartilhado**, carregado via `<script src="...">` em todas as páginas:

- **`biobel-app.js`** (~680 KB) — o cérebro do sistema: todas as funções `get*`/`salvar*`/`render*`, regras de negócio, cálculos. Roda em **todas as páginas do painel**. No fim do arquivo tem um `if(p==='dashboard'){...} else if(p==='equipe'){...}...` que lê `document.body.dataset.biobelPage` pra saber em qual página está e inicializar só o que é dela.
- **`biobel-shell.js`** — monta o cabeçalho e o menu de navegação (compartilhado, injeta em `<div id="biobel-shell">`) em todas as páginas.
- **`central-operacional.js`** — era da `central.html` (página removida); nenhuma página atual o carrega. Não mexa.
- **`inteligencia-operacional.js`** — só roda em `dashboard.html`; alimenta o card "Central de Inteligência".

### 🔒 Módulos (peças separadas do `biobel-app.js`) — onde mexer e onde NÃO mexer
Para você (IA) não precisar abrir arquivo que já funciona: **leia só a linha da tabela que bate com o problema**.

| Se o problema é… | Arquivo | Regra |
|---|---|---|
| a planilha **não carrega** / "Conectando..." / ponte Apps Script / leitura XLSX e fallbacks | `biobel-planilha-leitura.js` | 🔒 estável — só mexa se o defeito for DE LEITURA |
| um **número do dia errado** (venda, pagamentos, vendedoras, turnos, fechamento, horários) | `biobel-planilha-processamento.js` | 🔒 estável — mexer aqui muda TODOS os números do sistema |
| comparação entre meses | `biobel-planilha-comparacao.js` | 🔒 estável |
| **avisos de venda alta** (> R$ 200 "Parabéns", > R$ 400 "MEGA PARABÉNS") | `biobel-recognition.js` | 🔒 auto-contido: só usa `daysData` e `money` |
| cabeçalho, menu, versão, faixa "sistema não carregou" | `biobel-shell.js` | cuidado: vale pra todas as páginas |
| todo o resto (telas, regras, cálculos) | `biobel-app.js` | enorme (~14 mil linhas): **use `grep -n`, não leia inteiro** |

**Ordem dos scripts em TODA página do painel** (o validador reprova se estiver diferente):
`biobel-shell.js` → os 4 módulos → `biobel-app.js`. **Nunca carregue módulo por JavaScript depois** (injeção dinâmica): o `biobel-app.js` chama funções dos módulos já no carregamento; se o módulo chegar depois dá `is not defined`, o resto do arquivo para de rodar e a planilha não é lida (foi exatamente o que aconteceu em 05/10). **Módulo novo:** `<script src>` nas páginas + lista `MODULOS_OBRIGATORIOS` em `tools/checar-sintaxe.js` e `tools/validar.js`.

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
node tools/checar-sintaxe.js            # 1 SEGUNDO. OBRIGATÓRIO antes de todo commit: pega erro que derruba o sistema inteiro
node tools/validar.js arquivo.html    # rode PRA CADA página que você tocou (ou que usa a função/id que você mudou)
node tools/mapa.js                    # atualiza docs/MAPA_AUTOMATICO.md e docs/CONTEXTO_PARA_IA.md
# atualize versão+data+Novidades (dentro de biobel-shell.js) e docs/CHANGELOG.md
git add -A && git commit -m "vX.Y - resumo em português" && git push
# espere o build do Pages ficar "built" (~40-100s) e confira a versão no site
```

⚠️ **Se você mexeu em `biobel-app.js`, `biobel-shell.js` ou em qualquer módulo `biobel-*.js`, rode o validador em TODAS as páginas do painel**, não só numa. Um erro nesses arquivos compartilhados afeta todas ao mesmo tempo. **Vigia automático:** `tools/github-validar.yml` é um workflow pronto que roda `checar-sintaxe` + `validar` sozinho a cada envio. Ele só passa a valer depois de copiado para `.github/workflows/validar.yml` **pelo site do GitHub** (o token das IAs não tem permissão de "workflow"). Com ele ativo: **commit com ❌ vermelho = sistema possivelmente quebrado no ar — corrija antes de qualquer outra coisa.** Sem ele, a única proteção é VOCÊ rodar `node tools/checar-sintaxe.js` antes de enviar.

## 5. Armadilhas já vividas (aprenda com elas)
- **Nunca escreva "hoje" num número sem conferir a data.** `diaHoje()` (dashboard) procura a aba de hoje e, se não existe, **cai no último dia lançado**. Rótulos como "Venda hoje" mostravam as vendas de ontem sem avisar (06/10 às 8h exibindo 05/10). Use `infoDia(dia)`/`rotuloDia()` (em `dashboard.html`): mostram "de ontem · seg 05/10" e o aviso "Hoje ainda sem vendas lançadas". Todo cartão/tabela que mostre um dia deve exibir a **data** desse dia.
- **Troca de versão em massa (`11.43` → `11.44`): nunca troque o texto "11.xx" às cegas em `config.html`** — a tela de Novidades tem títulos de versões antigas ("v11.43 — 05/10") que seriam alterados junto. Troque só os `?v=` dos `<script>`, `BIOBEL_VERSION`, o cache do service worker e os selos.
- **Sistema parado em "🟡 Conectando..." com tudo zerado = ERRO DE SINTAXE no `biobel-app.js` (ou em módulo), NÃO problema de planilha.** O navegador descarta o arquivo inteiro; nada roda; o selo "Conectando..." é só o texto inicial do HTML. Em 05/10 isso durou horas: ~17 commits "consertaram a leitura da planilha" (v11.25–v11.42) sem nunca rodar uma checagem de sintaxe. **Primeiro passo SEMPRE: `node tools/checar-sintaxe.js`. Só depois mexa em lógica de leitura.** Hoje, se o sistema principal não carregar, aparece uma faixa vermelha "O sistema não terminou de carregar".
- **Aspa dupla-escapada** (`\\'` no lugar de `\'`) dentro de string JavaScript que gera HTML com `onclick="f(\'x\')"`: fecha a string cedo e o script inteiro da página morre sem aviso. Aconteceu no `administracao.html` de 01/10 até 05/10 (funcionários).
- **Teste de verdade, não só leitura de código:** abra a página num Chromium headless (Playwright) com a planilha simulada e olhe o selo, os números e o console. Foi assim que os erros escondidos foram achados. Atenção: o selo "Conectando..." aparecendo NÃO prova que o código rodou.
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
