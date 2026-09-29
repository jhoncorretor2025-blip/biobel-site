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
├── dashboard.html             ← VISÃO GERAL
├── central.html · operacao.html · equipe.html · vendas.html\n├── analises.html · alertas.html · config.html · administracao.html\n├── biobel-app.js · biobel-app.css · biobel-shell.js ← núcleo compartilhado\n├── manifest.json, service-worker.js   ← PWA (instalar no celular / offline)
├── .nojekyll                  ← diz ao GitHub Pages pra NÃO processar com Jekyll (não apague)
├── .github/workflows/         ← automação que mexe no index.html
├── tools/  validar.js · mapa.js
└── docs/   ESTRUTURA · CONVENCOES · PUBLICACAO · CHANGELOG · MAPA_AUTOMATICO
```
**Arquitetura v10.39:** cada área principal tem uma página própria. O JavaScript, CSS e cabeçalho compartilhados ficam em arquivos comuns. O `dashboard.html` continua como Visão Geral.

## 2. Anatomia das páginas do painel
1. `dashboard.html` concentra a Visão Geral.
2. `central.html`, `operacao.html`, `equipe.html`, `vendas.html`, `analises.html`, `alertas.html`, `config.html` e `administracao.html` são páginas independentes, cada uma com sua própria seção de conteúdo.
3. `biobel-shell.js` injeta o cabeçalho e os links diretos.
4. `biobel-app.js` contém o núcleo JavaScript compartilhado e escolhe o renderizador pela propriedade `body[data-biobel-page]`.
5. `biobel-app.css` reúne o CSS que antes ficava dentro do dashboard, evitando duplicação.

### Zonas internas do JavaScript compartilhado
As zonas agora ficam em `biobel-app.js`. Elas são apenas marcadores de manutenção: **não alteram a execução** e devem continuar sendo alteradas por partes.
- **CORE / INICIALIZAÇÃO** → utilitários compartilhados e inicialização.
- **EQUIPE** → rotinas, folha de ponto, faltas e exportações relacionadas.
- **ADMINISTRAÇÃO** → acesso, financeiro, fornecedores, pessoas, comissões, custos e fluxo de caixa.
- **DADOS** → backup, metas e integração com Google Sheets/planilhas.
- **ANÁLISES** → comparativos e indicadores.
- **CAMPANHAS** → marketing e “Sem Movimento”.
- **CLIMA** → correlação, clima atual e previsões. Esta zona deve ser tratada como **sensível**: não refatorar junto com outras mudanças.
- **EXPORTAÇÕES / RENDERIZAÇÃO** → relatórios, fechamento e desenho do dashboard.

**Regra de segurança:** em uma melhoria futura, alterar uma zona por vez, validar o painel e só então avançar para a próxima.

### Como cada área navega agora
| Área | Como funciona | Onde mexer |
|---|---|---|
| Páginas principais | links diretos entre os arquivos HTML | `biobel-shell.js` + `showTab()` de compatibilidade |
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


## 8. Organização UX v10.8
- **Navegação:** o antigo menu “Mais” deixou de duplicar Configuração e ADM. No celular, ele funciona como **Menu** e reúne todas as áreas principais.
- **Administração:** os atalhos existentes continuam os mesmos, mas agora são apresentados por assunto: Visão, Financeiro, Pessoas e Planejamento.
- **Busca global:** aceita consultas com várias palavras, normaliza acentos e ordena resultados por relevância, sem criar uma segunda busca.
- **Clima e avisos:** nenhuma lógica, aviso ou mensagem de clima/tempo foi alterada nesta versão.
