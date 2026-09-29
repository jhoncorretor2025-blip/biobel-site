## v10.46 — Comparativo individual de atendimentos e tempo
- **Novo:** cada turno mantém a contagem separada de atendimentos da Alessandra e da Day.
- **Novo:** além da quantidade, o card mostra a média de tempo entre os atendimentos de cada uma e o maior intervalo individual, quando há horários exatos registrados.
- **Mantido:** o comparativo da equipe continua mostrando ritmo geral, maior intervalo e divisão da carga do período.
- **Importante:** os tempos são calculados pelos horários das vendas registradas e não representam, por si só, a duração real de cada atendimento.


## v10.45 — Escala de atendimento e ritmo por atendente
- **Novo:** card "Hoje — escala e ritmo de atendimento" na Análises.
- **Novo:** seg–sex considera Alessandra sozinha pela manhã e Alessandra + Day à tarde.
- **Novo:** sábado considera Alessandra + Day juntas no mesmo turno.
- **Novo:** calcula atendimentos do período, ritmo da equipe, carga de trabalho disponível por atendimento e divisão por atendente.
- **Novo:** mostra maior e segundo maior intervalo real entre registros com horário em cada turno.
- **Importante:** o sistema não chama isso de duração real do atendimento; é uma análise de ritmo/carga baseada nos horários registrados na planilha.
- **Interno:** registros de venda passam a guardar o horário exato para permitir essa separação por turno e funcionária.
## v10.42 | 🐛🔧 Dois bugs críticos corrigidos + documentação atualizada
- **Corrigido:** código JavaScript duplicado (~70 KB, cópia do próprio biobel-app.js) que tinha
  sobrado colado por engano dentro do `<body>` das 9 páginas do painel, fora de qualquer
  `<script>` — o navegador mostrava aquele código como texto visível na tela. Removido de
  todas as 9 páginas.
- **Corrigido:** o menu de navegação só abria a página inicial. Causa: uma linha em
  `biobel-app.js`, no nível raiz do arquivo (roda ao carregar, em todas as páginas),
  assumia um elemento (`daySelect`) que só existe no Dashboard, sem proteção — o erro
  travava o carregamento do script inteiro nas outras 8 páginas, então o conteúdo delas
  nunca ficava visível. Corrigido com `?.`; verificado que não havia outros pontos com o
  mesmo risco (checado com simulação real da execução do script, página por página).
- `tools/validar.js` atualizado para entender scripts compartilhados entre páginas
  (`<script src="arquivo.js">` local) e não dar mais falso positivo de "handler não existe"
  nessa arquitetura nova.
- Documentação (`AGENTS.md`, `docs/ESTRUTURA.md`, `docs/CONVENCOES.md`, `docs/PUBLICACAO.md`)
  reescrita para refletir a divisão em 9 páginas com JS/CSS compartilhados — a versão anterior
  ainda descrevia o painel como um arquivo único.

## v10.41 | 🛠️ Correções da nova arquitetura
- Corrigidos caminhos da logo nas páginas do painel para funcionar corretamente no GitHub Pages.
- Atualizado o cache do PWA para incluir os JS/CSS compartilhados usados pelas páginas separadas.
- Mantida a estrutura de dados e a planilha existentes.

| v10.40 | 🧩 Painel dividido em páginas independentes com núcleo compartilhado: HTMLs separados por área, JavaScript/CSS compartilhados, links diretos, login de sessão mantido e PWA atualizado. |
| v10.39 | 🧩 Preparação da migração para páginas independentes e núcleo compartilhado. |
| v10.26 | 🎨 Refinamento visual do painel: identidade da Biobel mais consistente, cards com melhor hierarquia, navegação mais clara, controles padronizados, gráficos/tabelas com menos ruído e ajustes de leitura no celular. |
| v10.25 | 🛡️ Reforço de atualização do PWA/cache: o dashboard registra o service worker com versão de script e `updateViaCache: 'none'`, e o cache offline sobe para v6 para reduzir o risco de o painel ficar preso em uma versão antiga. |
| v10.24 | 📊 Novo gráfico diário separando vendas por manhã, meio-dia e tarde; ⏱️ análise dos intervalos entre vendas registradas, incluindo a janela 15h–15h45; 📅 correção do agrupamento semanal para segunda–domingo e remoção de vários cálculos presos ao ano 2026. |
## v10.23 | 🧠 Central de Inteligência da planilha
- Criada uma central que trabalha **somente com os dados que já existem na planilha**, sem cadastro novo de produtos ou clientes.
- **Possíveis inconsistências:** cruza vendas, meios de pagamento, vendas individuais e diferença de caixa para apontar o que merece conferência.
- **Comparação automática:** mostra o último dia lançado x dia anterior x média dos dias anteriores, além de quantidade de vendas e ticket médio.
- **Explicação dos números:** transforma os dados do último dia em frases simples sobre faturamento, quantidade de vendas, ticket, pagamentos e dinheiro físico.
- **O que chamou atenção:** seleciona automaticamente fatos relevantes do período, sem precisar procurar manualmente na tabela.
- Versão publicada em **28/09/2026**.

## v10.22 | 🧾 Ponte de gravação do fechamento reforçada
- O registro do horário em **O26** agora usa **JSONP primeiro**, reduzindo falhas de CORS no navegador.
- O painel informa quando a ponte está ausente ou quando a gravação não é confirmada.
- Adicionada a ponte oficial em apps-script/biobel-bridge.gs, limitada a gravações em **O26** nas abas DD.MM.
- Versão publicada em **28/09/2026**.

## v10.21 | 🧾 Registro automático do horário do fechamento
- Ao imprimir o **fechamento diário**, registra automaticamente o horário em **O26** da aba correspondente ao dia.
- A impressão não fica travada esperando a internet.
- Em caso de falha temporária, o registro fica pendente no aparelho e é reenviado quando a ponte do Apps Script voltar a responder.
- Versão publicada em **28/09/2026**.

## v10.16 | 🔧 Navegação protegida de Configuração e Administração
- Corrigida a abertura das áreas **Configuração** e **Administração** pelo novo menu, com tratamento de erro e fallback.
- Reforçada a navegação no computador e no celular sem criar banco novo e sem alterar a origem dos dados da planilha.
- Versão exibida no painel atualizada para **v10.16**.

v10.15 | 🔧 Correção de botões e recuperação da planilha principal: corrigida a busca global, sincronizado o indicador de versão e reforçada a recuperação local da referência da planilha principal sem apagar planilhas cadastradas.
v10.14 | 🛠️ Correção crítica da tela inicial: removido fechamento acidental do script que fazia código aparecer na página. Restaurados os recursos inteligentes já existentes de clima/chuva, checklist de ações e aviso para preparar/cadastrar a planilha do próximo mês.
v10.13 | 🧠 Inteligência operacional: semáforo, comparador de períodos, meta progressiva, previsão de fechamento, evolução de vendedoras, calendário comercial, clima × vendas, detector de anomalias, ações recomendadas, relatório gerencial e busca global 2.0, todos aproveitando os dados já carregados da planilha e sem banco novo.\nv10.12 | 🧭 Central Operacional sem banco novo: tarefas, agenda, notificações, painel executivo, tendência de vendas, simuladores de meta/comissão, reconhecimento, contas/conciliação auxiliar, estoque com alerta de mínimo e sugestão de compra, ocorrências, manutenção, exportações e assistente interno baseado nos dados já carregados da planilha.\nv10.11 | ✨ UX de alto impacto: cabeçalhos contextuais por área, feedback visual para ações, áreas de toque mais confortáveis, proteção contra sobreposição da navegação mobile e refinamento do menu Mais.
v10.10 | 🧭 Navegação reorganizada por objetivo: novo menu desktop com Visão Geral, Operação, Equipe, Vendas e Administração; navegação mobile inferior com Início, Operação, Equipe, Vendas e Mais. Abas e funções antigas permanecem preservadas para reduzir risco.
v10.9 | 🛡️ Manutenção mais segura: validador reforçado para referências de arquivos, chaves `localStorage` e indicadores de dívida técnica, sem alterar dados existentes.
v10.8.1 | 🧩 Reorganização interna segura: criação de zonas de manutenção no `dashboard.html`, documentação do mapa de responsabilidades e proteção explícita da área de clima durante futuras refatorações.
v10.8 | 🧭 Organização inteligente: remove a duplicação do menu “Mais”, cria navegação móvel completa, agrupa a Administração por assunto e melhora a busca global com múltiplas palavras e relevância.
v10.7 | 📱 Refinamento mobile: cabeçalho mais enxuto, navegação adaptada para uso com uma mão, busca maior, atalhos compactos, cards mais densos, filtros roláveis, tabelas com primeira coluna fixa e ações com área de toque ampliada.
v10.6 | 🧭 Navegação reorganizada por objetivo: Visão Geral concentra análises e alertas, Caixa e Equipe ficam como áreas operacionais, Ferramentas agrupa Marketing & Vendas e Configuração, e ADM passa a se chamar Administração.
v10.5 | ✨ Refinamento UX/UI completo: hierarquia, microinterações, site público, cards de produto, CTA, mobile, acessibilidade e consistência visual.
v10.4 | 🧩 Componentes padronizados: cabeçalhos de cards, filtros, badges/tags, ações, estados vazio/carregando/desabilitado e comportamento mobile.
v10.3 | 🎨 Design System Biobel: padronização de cards, controles, espaçamentos, estados, navegação interna e comportamento mobile/desktop.
# 📜 Histórico de versões (resumo)

> Mais recente primeiro. A versão vigente está sempre no topo do painel e em **Configuração → 🆕 Novidades**.

| Versão | O que mudou |
|---|---|
| **v10.1** | 🌧️ Clima + "Sem Movimento": aviso de chuva com botão direto pra checklist e promoções; ações digitais primeiro na chuva; checklist espelhada no Dashboard. 📚 Repositório com `AGENTS.md`, `docs/`, `tools/validar.js`, `tools/mapa.js`. |
| **v10.2** | 🧭 Navegação reorganizada: novo menu **Ferramentas** com atalhos para áreas existentes; Campanhas saiu da fileira principal para reduzir poluição visual; nenhuma funcionalidade existente foi removida. |
| v10.0 | Checklist "Sem Movimento" ganha +5 ações (11 no total). |
| v9.9 | Comparativo de turnos inclui **meio-dia**; nasce a checklist "Sem Movimento? Faça Isso!" (reseta todo dia). |
| v9.8 | **Correção de rumo:** cards de turno passam a usar `d.porTurno` (já extraído da planilha) e o card manual de atendimentos foi removido. |
| v9.5–9.7 | (Etapa intermediária) cards de turno com entrada manual — substituída na 9.8. Lição: verificar se o dado já existe antes de criar. |
| v9.4 | Troca **automática** pra planilha do mês atual, uma vez por sessão. |
| v9.3 | Segurança/confiabilidade: aviso de armazenamento cheio, restaurar backup, validação de CPF/CNPJ, tela Novidades, indicador "Salvo às HH:MM". |
| v9.0–9.2 | Clima: cores, "amanhã (previsão)", tirinha de 7 dias, barras de correlação, correlação só de sábados, relatório PDF. |
| v8.7–8.9 | Fornecedores: busca, dados (telefone/CNPJ), ranking, gastos por marca, aviso de duplicado, exportar PDF/CSV. Clima automático (Open-Meteo). |
| v8.4–8.6 | Boleto 1x/2x/3x integrado ao formulário com datas sugeridas (30/45/60), memória de parcelamento por fornecedor, navegação da ADM por **isolamento de seção**. |
| v8.2–8.3 | Agenda de reuniões como grupo, lembrete de reunião, marcas de fornecedor, clima rápido no Dashboard, faturamento por dia da semana, atividades com links. |
| v8.0–8.1 | Compra parcelada; melhorias gráficas da Equipe. |
| v7.0–v7.9 | Textos de vaga, Dica do Dia, assistente guiado de desligamento, Modo Simples, Central de Ações Rápidas, "Desfazer", Campanhas, Atividades da Gerência. |
| v6.x | Grupos colapsáveis na ADM, arquivo de ex-funcionários, promoção estágio→CLT, folha de ponto com regra própria de sábado. |
| ≤ v5.9 | Base: fechamento diário, metas, comissões, gastos fixos, folha de ponto, calendário comercial, desligamento com PDF. |
