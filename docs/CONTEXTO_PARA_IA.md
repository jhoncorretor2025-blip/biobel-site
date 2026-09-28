# CONTEXTO COMPLETO DO PROJETO BIOBEL (arquivo único para colar/anexar em uma IA)

> Gerado automaticamente por `node tools/mapa.js` — NÃO edite à mão. Versão do sistema: v10.1.
> Instrução para a IA: leia tudo abaixo antes de responder. Depois, o usuário vai enviar o `dashboard.html` (ou trechos dele) e dizer o que quer mudar.
> Responda em português simples, com emojis e negrito nas palavras-chave. Diga o que testou e o que não conseguiu testar.



---
## ===== GUIA PRINCIPAL (AGENTS.md) =====

# 🤖 AGENTS.md — Guia para qualquer IA que for mexer neste projeto

> Leia este arquivo **inteiro antes de editar qualquer coisa**. Ele vale para Claude, ChatGPT, Gemini, Copilot, Cursor, Codex ou qualquer outra ferramenta.
> **IA de chat sem acesso ao repositório?** O usuário deve anexar [`docs/CONTEXTO_PARA_IA.md`](docs/CONTEXTO_PARA_IA.md) (este guia + estrutura + convenções + publicação em um arquivo só).
> Detalhes: [`docs/ESTRUTURA.md`](docs/ESTRUTURA.md) · [`docs/CONVENCOES.md`](docs/CONVENCOES.md) · [`docs/PUBLICACAO.md`](docs/PUBLICACAO.md) · [`docs/CHANGELOG.md`](docs/CHANGELOG.md) · [`docs/MAPA_AUTOMATICO.md`](docs/MAPA_AUTOMATICO.md)

## 1. O que é
**Biobel Cosméticos** (loja em Gravataí/RS). Este repositório tem **duas coisas** publicadas no GitHub Pages:
1. **Site público** da loja → `index.html` (+ `style.css`, `extras.css`, `navigation-improvements.js`, pasta `imagens/`).
2. **Painel de gestão privado** (fechamento de caixa, metas, equipe, boletos, campanhas, clima...) → `login.html` → **`dashboard.html`**. É um **app de arquivo único** (~850 KB: HTML + CSS + JS juntos), sem build, sem framework, sem servidor. Instalável como PWA (`manifest.json` + `service-worker.js`).

Quem usa: a dona/gerente da loja e a equipe, principalmente **no celular**. **Não são programadoras** → tudo na tela precisa estar em **português simples**.

## 2. Mapa rápido dos arquivos
| Arquivo | Para que serve | Cuidado |
|---|---|---|
| `dashboard.html` | O painel inteiro (≈15 mil linhas) | **Arquivo crítico.** Sempre validar (seção 4) |
| `login.html` | Tela de entrada do painel | Autenticação só no navegador (não é segurança real) |
| `index.html` | Site público da loja | Link do WhatsApp e endereço são reais |
| `service-worker.js` | Cache offline (só `dashboard.html` e `login.html`) | Mudou o cache? suba `CACHE_NAME` |
| `manifest.json` | Configuração do PWA | — |
| `navigation-improvements.js` | Melhorias de navegação do site público | Tem GitHub Action ligada (ver `docs/PUBLICACAO.md`) |
| `tools/validar.js` | **Validador — rode antes de todo commit** | — |
| `tools/mapa.js` | Regenera `docs/MAPA_AUTOMATICO.md` | — |
| `docs/` | Documentação | `MAPA_AUTOMATICO.md` é gerado, não edite à mão |

## 3. Regras de ouro (não negociáveis)
1. **Nunca use `alert()`/`confirm()` do navegador.** Use `mostrarToast(msg)`, `mostrarToastComDesfazer(msg, fnDesfazer)`, `confirmarBiobel(msg, cb)` ou `await confirmarBiobelAsync(msg)`.
2. **Datas: use `obterAgoraBrasilia()`** (fuso de Brasília) para "hoje/agora". Chave de dia: `.paraChaveISO()`. Nada de `new Date()` solto pra decidir "que dia é hoje".
3. **Dados ficam no `localStorage` do aparelho**, sempre com prefixo `biobel_`. Toda mudança de formato precisa ser **retrocompatível** (quem já tem dado salvo não pode perder nada). Use migração idempotente com flag (ex.: `biobel_..._migracao_v2`).
4. **Não apague funções/IDs sem procurar quem usa** (`grep -n "nomeDaFuncao" dashboard.html`). Um `str_replace`/edição grande já apagou função sem querer — por isso o validador existe.
5. **A cada publicação:** atualizar a versão **e a data** (span `#versaoSistema`: texto, toast e `title`) **e** adicionar uma linha na tela **Configuração → 🆕 Novidades**.
6. **Interface em português do Brasil, linguagem leiga, com emoji.** Textos curtos, botões com verbo ("Salvar", "Abrir checklist").
7. **Mobile primeiro.** Teste mentalmente em tela de ~380px. Botões grandes, nada de hover obrigatório.
8. **Segredos:** este repositório é **público**. **Nunca** escreva senhas, tokens, CPFs, chaves PIX, salários ou dados pessoais em código novo, docs, commits ou respostas. Não copie credenciais que já existam no código.
9. **Não invente números.** Se um dado não existe na planilha (ex.: custo do produto), peça o valor manual ao usuário, não estime.
10. **Não publique em rajada** (limite de builds do Pages — ver `docs/PUBLICACAO.md`). Junte as mudanças e faça **um commit** por vez.

## 4. Fluxo de trabalho obrigatório
```bash
git pull --rebase                 # um robô do GitHub também faz commits (ver docs/PUBLICACAO.md)
# ...edite...
node tools/validar.js             # TEM que dar 🟢 APROVADO (sai com erro se reprovar)
node tools/mapa.js                # atualiza docs/MAPA_AUTOMATICO.md
# atualize versão+data+Novidades e docs/CHANGELOG.md
git add -A && git commit -m "vX.Y - resumo em português" && git push
# espere o build do Pages ficar "built" (~40-90s) e confira a versão no site
```

## 5. Armadilhas já vividas (aprenda com elas)
- **Edição que apaga função sem querer:** ao usar substituição de texto, confira que o trecho âncora não engoliu a função vizinha. `node tools/validar.js` acusa "handler chama função inexistente".
- **Ano fixo em 2026** no código (≈13 lugares: `new Date(2026, ...)`, `'2026-'+...`, função `dataDoDiaParaISO`). Cálculos de **dia da semana** vão errar a partir de 2027. Ao mexer nisso, corrija centralizando o ano.
- **Verifique se a funcionalidade já existe antes de criar.** Já aconteceu de recriarmos à mão algo que o sistema já lia da planilha (ex.: turno por venda já vem em `d.porTurno`). Faça `grep` por palavras-chave.
- **Verificação por `getElementById`:** ids que o código procura e o HTML não tem são bugs silenciosos. O validador lista os novos.
- **Cache do navegador/PWA** faz o usuário ver versão antiga. Se disser "não apareceu", confira o número da versão no topo antes de achar que é bug.
- **Um feedback do usuário costuma significar "não achei"**, não "não existe". Confirme o caminho de navegação (aba → sub-aba → card) antes de programar de novo.

## 6. Como conversar com o dono do sistema
Português informal e **simples**, sem jargão. Use **negrito** nas palavras-chave e emojis. Explique o "porquê" em uma frase. Diga com honestidade o que testou e o que **não** conseguiu testar (você não tem acesso ao navegador dele nem aos dados salvos no aparelho).

## 7. Problemas conhecidos (não é você que quebrou)
- `index.html` referencia `script.js`, que **não existe** no repositório (404 silencioso). Decidir com o dono: criar o arquivo ou remover a linha.
- Arquivos soltos na raiz sem uso aparente: `img` (arquivo de 1 byte), `test.txt`, `slide_de_fachada.png`, `imagens/roda_pe_site.png`. **Não apague sem confirmar com o dono.**
- Login e área ADM são checados **no navegador** (quem abrir o código-fonte enxerga). Não trate como segurança real.
- Cada aparelho tem seus **próprios dados** (localStorage). Não existe banco central; a única fonte compartilhada é a planilha do Google.


---
## ===== ESTRUTURA (docs/ESTRUTURA.md) =====

# 🏗️ Estrutura do sistema (explicação humana)

> Complementa o [`MAPA_AUTOMATICO.md`](MAPA_AUTOMATICO.md) (lista gerada por script) com o **"porquê"** e o **"como se mexe"**.

## 1. Visão geral do repositório
```
/
├── AGENTS.md                  ← guia de entrada para qualquer IA (leia primeiro)
├── CLAUDE.md / .github/copilot-instructions.md  ← apenas apontam pro AGENTS.md
├── README.md
├── index.html                 ← SITE PÚBLICO da loja
│   ├── style.css, extras.css
│   ├── navigation-improvements.js   (injetado por GitHub Action, ver PUBLICACAO.md)
│   └── imagens/  (banner/, depoimentos/, produtos)
├── login.html                 ← tela de entrada do painel
├── dashboard.html             ← PAINEL DE GESTÃO (arquivo único, o coração do projeto)
├── manifest.json, service-worker.js   ← PWA (instalar no celular / offline)
├── .nojekyll                  ← diz ao GitHub Pages pra NÃO processar com Jekyll (não apague)
├── .github/workflows/         ← automação que mexe no index.html
├── tools/  validar.js · mapa.js
└── docs/   ESTRUTURA · CONVENCOES · PUBLICACAO · CHANGELOG · MAPA_AUTOMATICO
```
**Decisão de projeto:** o `dashboard.html` é **um arquivo só** de propósito (sem build, sem npm, publicação = copiar o arquivo). Não "modularize" sem combinar com o dono: o service worker, o PWA e o modo de publicação dependem disso.

## 2. Anatomia do `dashboard.html`
Ordem dentro do arquivo:
1. `<head>`: Tailwind (CDN), `xlsx` e `chart.js` (CDN), `<style>` com o CSS próprio (tema escuro; existe **modo claro**, ver seção `MODO CLARO`).
2. Cabeçalho fixo: logo, **número da versão** (`#versaoSistema`), indicador "✅ Salvo às HH:MM", nome da planilha ativa.
3. Botões de aba → `showTab('nome')`. Abas: `dashboard`, `info`, `alertas`, `caixa`, `equipe`, `campanhas`, `config`, `adm`.
4. Uma `<section id="...Tab">` por aba (a aba Dashboard é o bloco principal com `#dashboardModoAvancado` etc.).
5. Dois blocos `<script>` grandes no fim (todo o JavaScript). O código é organizado por **seções comentadas** `/* ===== Nome ===== */`.

### Como cada área navega por dentro
| Área | Como funciona | Onde mexer |
|---|---|---|
| Abas principais | `showTab('info'│'caixa'│...)` | função `showTab` |
| **Configuração** | chips `#chipX` + cards `#configSecaoX`; `mostrarSecaoConfig('X')` lê o array `secoes` | adicionar nome ao array `secoes` |
| **Informação Geral** | chips `#chipInfoX` + `#infoSecaoX`; `mostrarSecaoInfo('X')` (Financeiro, Vendedoras, Dias, Avancado, Comparar, PorDiaSemana) | idem |
| **Equipe** | sub-abas `mostrarEquipeSubAba('ponto'│'rotina')` | — |
| **Campanhas** | `mostrarAbaCampanha('data'│'promo')` + card "Sem Movimento" no topo | — |
| **ADM** (área com login próprio) | Chips do topo chamam `isolarSecaoAdm('admAncoraX')`, que **mostra só a seção clicada** e esconde o resto. Cada seção começa com uma `<div id="admAncoraX">` seguida do conteúdo (todos irmãos diretos de `#admConteudoWrap`). Grupos colapsáveis: `.grupo-adm-header[data-grupo]` + `#conteudoGrupo-<g>` + `#setaGrupo-<g>` (funções `alternarGrupoAdm`, `fecharTodosGruposAdmExceto`). | ver receitas abaixo |
| **Busca global** | array `BIOBEL_INDICE_BUSCA` com `{termos, label, acao}` | adicionar entrada ao criar tela nova |

## 3. Fluxo de dados
```
Planilha Google (1 ABA POR DIA, nome "DD.MM", ex.: 22.09)
      │  ponte Apps Script (chave biobel_apps_script_url)  OU  export XLSX direto (biobel_google_sheet_url)
      ▼
loadGoogleSheet()  ← roda ao abrir e a cada 60 s
      │  normalizarNomeAba() aceita "25.8" e vira "25.08"; abas que não são dia são ignoradas
      ▼
processarLinhasDoDia(aba, linhas)  →  daysData[]  (um objeto por dia)
      ▼
funções render*()  desenham cards, gráficos e alertas
```
**Objeto de um dia (`daysData[i]`):** `dia` ("DD.MM"), `initial`, `sales` (total vendido), `withdrawals`, `closing`, `dinheiro`, `debito`, `credito`, `pix`, `vendedoras`, `qtdVendas`, `vendedorasDetalhe`, `tipoVenda`, `produtos`, `horarios`, **`porTurno`** (`{ 'manhã'|'meio-dia'|'tarde': {qtd, valor} }`), `porTurnoVend`, `totalComTurno`, `genero`, `vendasIndividuais`, `primeiraVenda`, `ultimaVenda`, `horariosVendas`, `registrosVendas`.
> A planilha tem, **linha a linha**, turno e horário de cada venda — o sistema **já** agrega isso. Não peça digitação manual do que já vem da planilha.

**Vários meses:** `biobel_planilhas_salvas` guarda as planilhas (uma por mês). `verificarMesDivergente()` troca sozinho pra planilha do mês atual **uma vez por sessão** (`sessionStorage`), depois só avisa.

## 4. Armazenamento
- Tudo em **`localStorage` do aparelho**, prefixo `biobel_` (lista completa e agrupada no [MAPA_AUTOMATICO](MAPA_AUTOMATICO.md)).
- Um interceptador global de `localStorage.setItem` mostra "✅ Salvo às HH:MM" para qualquer chave `biobel_*`.
- **Backup:** Configuração → Backup (baixar `.json` / restaurar / backup automático semanal no navegador).
- **Não existe banco de dados central.** Celular da gerente e computador têm dados diferentes, exceto o que vem da planilha.

## 5. Módulos de negócio (onde ficam no código)
Procure pelo comentário de seção com `grep -n "===== Nome" dashboard.html`.
- **Caixa/Dashboard:** metas, ritmo, calendário comercial, alertas de fechamento.
- **Equipe:** folha de ponto (sábado tem carga própria), rotina semanal, atividades da gerência.
- **ADM:** gastos fixos, boletos de fornecedores (1x/2x/3x com datas sugeridas 30/45/60), comissão por níveis, férias/recesso/FGTS, desligamento (assistente guiado + PDF), arquivo de ex-funcionários, fluxo de caixa, DRE.
- **Clima:** API gratuita **Open-Meteo** com coordenadas fixas de Gravataí; categorias `Sol | Nublado | Chuva | Frio` em `biobel_clima_dias` (chave `"DD.MM"`). Marcação manual sempre prevalece sobre a automática.
- **Campanhas / Sem Movimento:** textos prontos pra copiar; checklist diária (reseta sozinha, ordem muda na chuva).
- **Alertas:** Central de Alertas & Decisões reúne pontos de atenção.

## 6. Receitas (passo a passo pra tarefas comuns)
**A) Novo card numa aba existente** → copie um card vizinho (`class="card rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-7"` ou `adv-card`), dê `id`s únicos, crie `renderMeuCard()` e chame-a onde os outros `render*` da aba são chamados (procure a chamada de um card irmão).
**B) Nova seção de Configuração** → botão `<button id="chipX" onclick="mostrarSecaoConfig('X')" class="config-chip">`, container `<div id="configSecaoX" ... style="display:none">`, e inclua `'X'` no array `secoes`.
**C) Novo dado salvo** → funções `getX()` (com `try/catch` e valor padrão) e `salvarX()`; chave `biobel_x`; se mudar formato de algo existente, crie migração com flag `biobel_x_migracao_vN`.
**D) Nova seção na ADM** → `<div id="admAncoraX"></div>` + conteúdo como irmãos diretos de `#admConteudoWrap`, botão no `<nav>` chamando `isolarSecaoAdm('admAncoraX')`, e inclua o id em `ANCORAS_SECOES_ADM`.
**E) Tela nova aparecer na busca** → nova linha em `BIOBEL_INDICE_BUSCA`.
**F) Depois de qualquer receita:** `node tools/validar.js` → `node tools/mapa.js` → versão/data/Novidades → publicar (ver [PUBLICACAO.md](PUBLICACAO.md)).

## 7. Dívidas técnicas conhecidas
1. **Ano 2026 fixo** em ~13 pontos (dia da semana, comparativos, `dataDoDiaParaISO`). Precisa virar "ano da planilha ativa" antes de 2027.
2. **Autenticação só no navegador** (login do painel e da ADM).
3. `dashboard.html` gigante → difícil de revisar. Se um dia for dividido, faça por etapas com o dono, mantendo a versão de arquivo único funcionando.
4. `index.html` aponta pra `script.js` inexistente.


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
1. `node tools/validar.js` (sintaxe, divs, ids, handlers, funções duplicadas, versão).
2. Lógica pura (cálculos, ranking, datas): copie a função para `node -e "..."` e rode com **dados simulados**, incluindo casos-limite (vazio, 1 item, empate).
3. Diga ao usuário o que **não** foi testado (visual no celular real, dados reais do aparelho dele).

## Não faça
- ❌ `alert/confirm` nativos · ❌ `new Date()` pra "hoje" · ❌ segredos/dados pessoais em arquivos · ❌ apagar função sem `grep` · ❌ criar tela sem checar se já existe · ❌ publicar sem validar · ❌ ler/gravar dado do usuário fora do prefixo `biobel_`.


---
## ===== PUBLICAÇÃO (docs/PUBLICACAO.md) =====

# 🚀 Como publicar com segurança

## Onde o site roda
- **GitHub Pages**, branch `main`, pasta raiz `/`. Sem build próprio: **o que está na `main` é o que vai ao ar**.
- `.nojekyll` na raiz impede o GitHub de processar com Jekyll (**não apague**).
- URL pública: `https://jhoncorretor2025-blip.github.io/biobel-site/` (painel: `login.html` → `dashboard.html`).

## Passo a passo
1. `git pull --rebase` (veja "Robô" abaixo).
2. Edite. Rode `node tools/validar.js` até dar **🟢 APROVADO**.
3. Suba a versão **e a data** no span `#versaoSistema` (texto visível + `mostrarToast('… versão vX.Y')` + `title`) e adicione a entrada em **Configuração → 🆕 Novidades** (dentro do `dashboard.html`) e em `docs/CHANGELOG.md`.
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
`service-worker.js` (cache `biobel-cache-v2`) guarda `dashboard.html` e `login.html` e busca a rede com `cache: 'reload'`. Se precisar forçar todo mundo a baixar de novo, suba o número do `CACHE_NAME`.
