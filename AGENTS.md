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
