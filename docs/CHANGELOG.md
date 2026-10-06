## v11.44 — 06/10/2026
- **Visão Geral mostra de que dia são os números.** Antes o cartão dizia "Venda hoje" mesmo quando a aba de hoje ainda não existia: `diaHoje()` cai no último dia lançado e a tela apresentava os números de ontem como se fossem de hoje (ex.: 06/10 às 8h mostrando as vendas de 05/10).
- Cartões: "Venda de ontem · seg 05/10", "Líder de ontem · 05/10" (ou "Venda hoje · ter 06/10" quando é hoje; "Último dia lançado · sáb 03/10" quando há 3+ dias sem lançar). Quando os números não são de hoje aparece "⚠️ Hoje (06/10) ainda sem vendas lançadas". Meta do mês ganhou "· até 05/10".
- Comparativo diário: a coluna e o resumo deixam de dizer "Hoje" quando não é hoje ("Ontem · 05/10", "Ontem (05/10) acima da média").
- O bloco "Movimento da loja" já era correto (só conta a aba de hoje de verdade) e não foi alterado.
- Testado com o relógio simulado em 06/10 08:17 (abas só até 05.10), com a aba de hoje já criada, e com 3 dias sem lançar.

## v11.43 — 05/10/2026
- **Corrigido: sistema parado em "Conectando..." com tudo zerado (a planilha NÃO era o problema).** Causa: erro de sintaxe no `biobel-app.js` desde as 09:35 de hoje (commit "lembrete 09h30": `}` sobrando na linha 201; depois do v11.37, a função `iniciarAssistenteOperacional` ficou sem o `)();` final). O navegador descarta o arquivo inteiro, então nada rodava e a leitura da planilha nem era tentada. Os ~17 commits v11.25–v11.42 ("recuperação da leitura", modularização) tentaram corrigir o sintoma sem checar a sintaxe e não podiam funcionar.
- **Corrigida uma corrida de carregamento escondida atrás do erro:** o núcleo chamava `restaurarUltimaLeituraPlanilha` (que mora num módulo) já no carregamento, mas o `biobel-shell.js` injetava os módulos por JavaScript *depois*. Resultado: `is not defined`, o resto do `biobel-app.js` parava e o `render` bom nunca era instalado. Agora os 4 módulos (`biobel-recognition`, `biobel-planilha-leitura`, `-processamento`, `-comparacao`) são `<script>` no HTML, **antes** do `biobel-app.js` (10 páginas). O carregador dinâmico foi removido do shell.
- **Rede de proteção:** se o `biobel-app.js` não chegar ao fim, o shell mostra a faixa vermelha "O sistema não terminou de carregar" e o selo vira "🔴 Sistema com erro" (antes ficava "Conectando..." pra sempre).
- **`administracao.html` voltou a funcionar:** desde 01/10 16:20 (commit "refina visual da administracao") as 6 aspas `\\'` (barra dupla) nos botões de Funcionários fechavam a string cedo e todo o script da página morria. Corrigido para `\'`.
- `backup.html`: faltava carregar a biblioteca XLSX (falhava ao tentar ler a planilha); `config.html`: `</div>` sobrando removido; `dashboard.html`: linha morta (`kpiCaixaSub`, cartão que não existe mais) interrompia o `renderCompact` e deixava os atalhos do calendário comercial sem preencher.
- **Ferramentas:** novo `tools/checar-sintaxe.js` (1 segundo: sintaxe de todo `.js` e de todo `<script>` inline, ordem dos módulos, scripts inexistentes, `<style>` aninhado); novo workflow pronto em `tools/github-validar.yml` (roda sozinho a cada envio; precisa ser copiado para `.github/workflows/validar.yml` pelo site do GitHub — o token das IAs não tem permissão de workflow; ainda NÃO está ativo); `tools/validar.js` agora aceita o `?v=` no endereço dos scripts, **checa a sintaxe dos `.js` externos** (antes não checava), confere a ordem dos módulos e reconhece funções definidas por atribuição (`window.nome = ...`). `tools/mapa.js` enxerga os módulos.
- Avisos de venda (`biobel-recognition.js`) testados: > R$ 200 "PARABÉNS", > R$ 400 "MEGA PARABÉNS"; não existe aviso por "acima da média". Na primeira abertura em um aparelho, celebra a maior venda do mês inteiro.

## v11.42 — 05/10/2026
- Corrigido o selo de versão da Visão Geral, que estava fixo em v11.31 apesar do sistema já estar em v11.41.
- O selo da página agora é sincronizado automaticamente com a versão central do shell.
- Corrigido o fluxo de carregamento da planilha para que falhas no carregamento dos módulos não deixem o painel preso indefinidamente em “Conectando...”.
- Adicionado limite de 12 segundos para carregamento de módulos compartilhados e tratamento seguro do erro.
- Mantidos os dados, regras de negócio e fallbacks existentes da leitura da planilha.

## v11.41 — 05/10/2026
- Auditoria estrutural final da modularização: não restam declarações duplicadas de funções no `biobel-app.js`.
- O núcleo mantém somente a coordenação da aplicação; leitura, comparação, processamento e extratores da planilha ficam em módulos dedicados.
- Cache-busting final alinhado para v11.41 em todas as páginas e módulos compartilhados.
- Registro do Service Worker e cache PWA alinhados para v11.41.
- Mantidos os comportamentos de impressão, armazenamento, menus, formulários e regras de negócio existentes.

## v11.40 — 05/10/2026
- Unificada a conversão dos valores de pagamento das linhas de venda com `valorPagamentoDaLinha()`.
- Extratores de vendedores, quantidade de vendas, vendas individuais e tipos de venda agora aceitam tanto números quanto valores em texto, inclusive formatos monetários como `R$ 450,00`.
- O reconhecimento de vendas passa a receber a venda individual quando ela não vier como número nativo na leitura da planilha.
- Quantidade de itens por venda também passou a usar a mesma conversão segura.
- Nenhuma regra de limite do reconhecimento foi alterada: acima de R$ 200 e destaque acima de R$ 400 continuam iguais.
- Cache PWA e versão do shell atualizados para v11.40.

## v11.39 — 05/10/2026
- Carregamento dos módulos compartilhados passou a ser controlado por uma promessa de prontidão.
- `loadGoogleSheet()` agora aguarda o carregamento de leitura, processamento e comparação antes de iniciar a atualização.
- Isso elimina uma condição de corrida em conexões lentas, sem mudar o fallback Apps Script → XLSX.
- Cache PWA e registro do Service Worker atualizados para v11.39.

## v11.38 — 05/10/2026
- Versões dos scripts compartilhados alinhadas nas páginas do painel para v11.38.
- Registro do Service Worker deixou de apontar para a versão antiga v10.66 e passou a acompanhar o sistema atual.
- Mantido o cache PWA em v11.38.
- Nenhuma regra de negócio ou cálculo foi alterada nesta etapa.

## v11.37 — 05/10/2026
- Removido o bloco legado do lembrete 09:30, incluindo seus helpers e seu segundo timer.
- Mantida a implementação atual do assistente operacional 09:30, que usa as atividades escolhidas e concluídas do dia.
- Eliminada a execução periódica duplicada da verificação do popup.
- Cache PWA e versão do shell atualizados para v11.37.

## v11.36 — 05/10/2026
- Removidas declarações duplicadas antigas do núcleo `biobel-app.js`.
- Mantida a versão efetivamente ativa das rotinas de lembrete 09:30, formatação de horários, atualização automática da planilha e próxima ação.
- O comportamento executado pelo navegador permanece o da última declaração existente antes da limpeza.
- Cache PWA e versão do shell atualizados para v11.36.

## v11.35 — 05/10/2026
- Extratores de vendas, pagamentos, horários, turnos, produtos, gênero, vendedores e fechamento de caixa foram concentrados em `biobel-planilha-processamento.js`.
- Utilitários específicos da transformação das linhas da planilha também saíram do núcleo, reduzindo o acoplamento do `biobel-app.js`.
- Funções de horário usadas por outras áreas e `normalizarNomeAba()` permaneceram no núcleo para preservar dependências existentes.
- Nenhuma regra de cálculo dos extratores foi reescrita.
- Versão e cache PWA atualizados para v11.35.

## v11.34 — 05/10/2026
- Processamento diário da planilha modularizado em `biobel-planilha-processamento.js`.
- A função `processarLinhasDoDia()` foi retirada do núcleo sem alterar sua lógica, campos retornados ou chamadas existentes.
- Os extratores e utilitários usados pelo processamento permaneceram no `biobel-app.js` nesta etapa, evitando uma cadeia maior de dependências.
- Leitura, comparação, armazenamento, impressão e interface de negócio não foram reescritos.
- Cache PWA e versão do shell atualizados para v11.34.

## v11.33 — 05/10/2026
- Leitura principal da planilha modularizada em `biobel-planilha-leitura.js`, retirando do núcleo as rotinas de Apps Script, XLSX e Google Visualization.
- `loadGoogleSheet()` passa a atuar como orquestrador, preservando a ordem de fallback **Apps Script → XLSX**, o bloqueio de leituras simultâneas e os efeitos após atualização bem-sucedida.
- Ajustado o timeout explícito da ponte principal para manter os 9 segundos usados antes da modularização.
- Removida a declaração duplicada de `fetchBiobelComTimeout()`; chamadas de rede continuam com seus timeouts explícitos.
- Nenhuma lógica de `processarLinhasDoDia()`, impressão, armazenamento de vendas ou interface de negócio foi alterada nesta etapa.
- Cache PWA atualizado para v11.33.

## v11.32 — 05/10/2026
- Modularização incremental da planilha: a rotina `lerDadosPlanilhaSemAtivar()`, usada para carregar meses históricos para comparação sem trocar a planilha ativa, foi movida para `biobel-planilha-comparacao.js`.
- Mantidas as dependências e o processamento existente por `processarLinhasDoDia()`, incluindo os caminhos Apps Script e XLSX.
- O carregamento principal da planilha, `loadGoogleSheet()`, não foi alterado nesta etapa.
- Cache PWA atualizado para v11.32.

## v11.31 — 05/10/2026
- Modularização segura: reconhecimento motivacional de vendas separado do núcleo `biobel-app.js` para `biobel-recognition.js`.
- Mantidas as funções públicas `mostrarReconhecimentoVenda()` e `verificarVendasMotivacionais()` e a chave `biobel_vendas_motivacionais_v2`.
- Preservados o evento `biobel:data-updated`, limite de R$ 200, destaque acima de R$ 400 e comportamento visual existente.
- Nenhuma lógica de planilha, armazenamento, impressão, menus ou formulários foi alterada.
- Cache PWA atualizado para v11.31.

## v11.30 — 05/10/2026
- Correção do leitor da planilha: a ponte do Apps Script não bloqueia mais a leitura direta quando estiver indisponível ou travada.
- Adicionado tempo limite na ponte; ao falhar, o sistema retorna automaticamente ao leitor XLSX tradicional.
- A rotina de dados foi restaurada para o comportamento anterior às últimas tentativas de correção, preservando os demais recursos.
- Versão/cache atualizados para v11.30.

## v11.28 — 05/10/2026
- Correção da leitura dos dados do Google Sheets usando o endpoint Google Visualization como caminho principal para as abas diárias DD.MM.
- Mantidos os caminhos alternativos por XLSX e Apps Script, com proteção contra travamentos.
- O dashboard continua preservando a última leitura válida quando uma sincronização falha.
- A estrutura de cada aba diária continua sendo processada pela mesma função central processarLinhasDoDia usada nas demais leituras.
- Versão/cache atualizados para v11.28.

## v11.27 — 05/10/2026
- Correção de atualização do dashboard: os scripts compartilhados da tela inicial passaram a usar identificadores de versão na URL (?v=11.27), reduzindo o risco de o navegador/PWA executar JavaScript antigo.
- Versão e cache do PWA atualizados para v11.27.
- Mantida a leitura direta do Google Sheets como primeiro caminho, com ponte Apps Script e recuperação como alternativas.
- Mantida a proteção para nunca substituir dados válidos por zeros quando uma sincronização falhar.

## v11.26 — 05/10/2026
- **Correção de regressão na atualização da planilha.** A leitura direta do Google Sheets voltou a ser o caminho principal, preservando o comportamento que já funcionava antes das melhorias recentes.
- A ponte do Google Apps Script agora é usada como segunda alternativa, e todas as chamadas externas possuem **tempo limite**, evitando que o cabeçalho permaneça indefinidamente em “Conectando...”.
- O modo de recuperação por Google Visualization permanece como terceiro recurso.
- O sistema guarda a **última leitura bem-sucedida** no navegador e a mantém visível quando uma atualização temporária falhar; uma falha de sincronização não transforma os indicadores em zero.
- Atualização automática continua a cada 60 segundos e pode ser acionada manualmente pelo botão/atalho existente.
- Cache do PWA renovado para **v11.26**.

## v11.25 — 05/10/2026
- **Corrigida a leitura da planilha do Google no painel.** Quando o download direto do XLSX ou a ponte do Google Apps Script falhar, o sistema tenta automaticamente um modo de recuperação pelas abas diárias do Google Visualization.
- A recuperação lê as abas do mês atual, reconstrói os dados usando o mesmo processador do sistema e só substitui os dados depois que a leitura encontra informações válidas.
- O Service Worker recebeu novo identificador de cache para forçar a atualização dos arquivos da v11.25.
- A versão **v11.25** passou a ser exibida de forma consistente no cabeçalho e na tela inicial.

## v11.23 — 05/10/2026
- **Impressão do recibo refeita de forma estrutural.** Causa da folha em branco (reproduzida em teste nas versões anteriores a 05/10, em A4, Carta, térmica 80 mm e 58 mm): `body.receipt-printing > *:not(#printReceipt){display:none}` esconde todo filho direto do `<body>`, mas o `#printReceipt` ficava DENTRO de um painel — o painel era escondido e o recibo ia junto (um `display:none` no pai vence qualquer `display:block!important` no filho).
- `garantirAreaRecibo()` (biobel-app.js): o recibo é sempre filho direto do `<body>`, criado na hora em páginas que não o têm. Isso também corrige **imprimir a semana da Equipe** e **Alt+P no Dashboard (mensal)**, que davam `Cannot set properties of null` desde a divisão em páginas (o `#printReceipt` só existia em `operacao.html`).
- `startReceiptPrint()`: não move mais o recibo na hora de imprimir (nada a restaurar); `afterprint` via `addEventListener` (cliques repetidos não empilham ouvintes); se `window.print()` falhar, a classe sai sozinha.
- CSS (biobel-app.css): efeito do modo de impressão **somente em `@media print`** (a tela normal nunca é afetada, nem se a classe ficar presa); uma única regra `@page` (antes havia duas conflitantes: 4mm e 8mm); `:root{color-scheme:light}` na impressão (o `color-scheme:dark` do `<head>` pintava a moldura da página de preto com "Gráficos de fundo" ligado); `min-height`/`height` do body zerados na impressão (o `min-h-screen` gerava página extra em papel de altura curta).
- Observação: `printDaily()` (fechamento "completo") é código morto — nenhuma tela o chama e o `#daySelect` não existe mais; segue assim.

## v11.11 — 03/10/2026
- **Corrigido bug na tela inicial:** o `<head>` do `dashboard.html` tinha um `<style>` aberto duas vezes (faltava um `</style>`). O navegador ignorava em silêncio a regra principal dos cartões de "Acesso rápido", que ficavam sem fundo, sem borda e com ícone/texto desalinhados. Agora um único bloco `<style>`.
- Tela inicial: botões de clima com destaque do escolhido; previsão dos próximos dias em 5 cartões (data, máxima/mínima, chuva em azul); barra de progresso da meta visível no tema escuro; divisor vazio da meta escondido quando não há resumo de hoje; títulos da Central de Inteligência sem a numeração solta (2, 3, 5, 10); atalhos em 2×2 no celular; título e barra de clima legíveis no modo claro.
- `tools/validar.js` ganhou a checagem nº 10: `<style>` aberto dentro de outro ou desbalanceado agora **reprova** (antes passava sem aviso).

## v10.87 — 01/10/2026
- Navegação principal reforça visualmente a página atual e usa aria-current.
- Página de Fornecedores passa a carregar o shell principal, com navegação completa e caminhos corretos para a pasta interna.
- Criada trilha de navegação nas páginas internas, incluindo Administração > Fornecedores.
- Adicionado indicador visual de carregamento da planilha e aviso de erro com botão para tentar novamente.
- Menu mobile passa a ter Mais áreas com Central, Análises, Alertas, Configuração, Administração, Fornecedores e Backup.
- Ações principais de salvar/adicionar recebem feedback visual temporário.
- Campos obrigatórios passam a ter contraste visual e indicação com * nos principais formulários.

## v10.86 — 01/10/2026
- Histórico de **Compras e boletos por fornecedor** ganhou coluna **Ações**.
- Fornecedores cadastrados agora podem ser **editados** ou **excluídos** diretamente do histórico.
- A exclusão é somente do cadastro do fornecedor; os boletos históricos continuam preservados.
- Fornecedores usados em boletos mas ainda não cadastrados recebem botão **Cadastrar** no próprio histórico.

## v10.85 — 01/10/2026
- Planejamento de Gastos por Semana passa a exibir **4 blocos semanais diretamente no resumo**.
- Adicionada **Média de referência** (total mensal ÷ 4) para servir como parâmetro de planejamento.
- A divisão real continua baseada nos **dias de vencimento**; as semanas não são artificialmente igualadas.

## v10.84 — 01/10/2026
- Menu da Administração reorganizado para facilitar a navegação.
- Criado atalho direto **📅 Gastos por semana**.
- Criado atalho direto **📊 Mês a mês**.
- Os dois atalhos usam âncoras próprias para abrir somente a seção correspondente, evitando que o usuário precise procurar no meio dos outros cards.

## v10.83 — 01/10/2026
- Ativação automática do **Planejamento de Gastos por Semana** ao abrir a Administração.
- Mantidas as faixas **1–7, 8–15, 16–23 e 24–fim do mês**, com fixos e boletos/parcelas separados.

## v10.82 — 01/10/2026
- Adicionada a seção **Planejamento de Gastos por Semana** na Administração.
- Divide o mês em quatro faixas: **1–7, 8–15, 16–23 e 24–fim do mês**.
- Cada semana mostra **gastos fixos**, **boletos/parcelas**, o **total previsto** e os itens que vencem naquela faixa.
- Incluído seletor para consultar o mês atual e meses próximos.
- Gastos sem dia de vencimento ficam em uma área separada e não são atribuídos a uma semana por suposição.

## v10.81 — 01/10/2026
- Planejamento Financeiro — Mês a Mês reorganizado em **cartões por mês**, substituindo a tabela muito larga que causava sobreposição visual.
- Cada mês agora separa claramente **Custos** e **Faturamento**, com gasto previsto, faturamento mínimo, meta com lucro, faturado, falta e status.
- Adicionada barra de progresso do faturamento da meta.
- Layout adaptado para computador e celular.

## v10.80 — 01/10/2026
- Corrigido o resumo financeiro da Administração para considerar **boletos/parcelas pelo mês de vencimento**.
- Uma compra parcelada não é mais somada inteira no mês atual; cada parcela entra no respectivo mês.
- DRE simplificado passou a deixar claro que os gastos variáveis são as parcelas/boletos do mês atual.
- Resumo superior reorganizado em dois blocos: **Custos previstos do mês** e **Resultado do mês**.
- Corrigida uma duplicidade do indicador de “último salvamento” no resumo.

## v10.79 — 01/10/2026
- Área de **Funcionários** reorganizada em subtabs: **Ativos, Cadastro, Consulta, Desligamentos e Ex-funcionários**.
- A aba **Ativos** mostra rapidamente quem está na equipe e o vínculo atual.
- **Cadastro** concentra os dados das funcionárias.
- **Consulta** concentra férias, recesso e hora extra.
- **Desligamentos** reúne os registros de saída e a exportação dos PDFs.
- **Ex-funcionários** mantém o arquivo histórico separado.

## v10.78 — 01/10/2026
- Corrigida a barra de atalhos da Administração que estava posicionada como sticky e podia sobrepor visualmente os cards durante a rolagem.
- A barra agora permanece no fluxo normal da página, com fundo e borda próprios para separar os atalhos do conteúdo.

## v10.77 — 01/10/2026
- Nova aba **Análise por tipo** na área de Fornecedores.
- Mostra gasto por tipo de produto, quantidade de boletos, quantidade de fornecedores e participação em relação ao maior gasto classificado.
- Mostra quais tipos ainda não têm nenhuma compra registrada.
- Adicionado **Geral — produtos misturados** para compras com vários tipos no mesmo boleto.
- Boletos antigos sem tipo informado continuam separados como **Não informado**, sem classificação automática inventada.

## v10.76 — 01/10/2026
- Adicionado o campo **Tipo de Produto** ao cadastro de Boletos de Fornecedores, posicionado ao lado do valor.
- Incluídas as categorias usadas na planilha: cabelo / Creme e shapoo e etc, Cabelo/acessorios, shampoo, Creme, Coloração/Tinta, Perfume, Unha, maquiagem e shampoo e cond.
- O tipo de produto passa a ser salvo no boleto, carregado na edição, pesquisável e incluído na exportação CSV.

## v10.75 — 01/10/2026
- Backup completo e automático passam a verificar explicitamente Gastos Fixos (biobel_adm_gastos_fixos).
- A tela de Backup agora informa claramente que os gastos fixos fazem parte do backup.
- Conferência de dados críticos foi ampliada de 3 para 4 itens.

## v10.74 — 01/10/2026
- Criado **Planejamento Financeiro — Mês a Mês** na Administração.
- Mostra gastos fixos mensais, boletos/variáveis por mês, outros custos mensais cadastrados e gasto previsto.
- Calcula **faturamento mínimo** para cobrir os gastos cadastrados.
- Permite definir uma **meta de lucro mensal** e calcula o faturamento necessário para atingir essa meta.
- Mostra o faturamento já registrado no mês atual e quanto ainda falta faturar.
- Os boletos são distribuídos no mês pelo vencimento; quando não há vencimento, usa-se a data de criação como referência.
- Mantida a observação de que comissões sobre vendas e taxas de cartão podem aumentar o faturamento real necessário.

## v10.73 — 01/10/2026
- Boletos cadastrados na área exclusiva de Fornecedores continuam sendo a fonte do **Gasto Variável** da Biobel.
- O resumo financeiro da página de Fornecedores passa a mostrar total dos boletos, pendentes, pagos e quantidade de registros.
- Adicionar, editar, marcar como pago e excluir boleto atualizam a integração do total de gastos variáveis.
- Administração continua usando a mesma base `biobel_adm_boletos`, sem duplicação.

## v10.71 — 01/10/2026
- Cadastro de Fornecedores reorganizado na ordem solicitada: **Cadastrar Boleto → Cadastrar Fornecedor → Cadastrar Marca**.
- O formulário completo de boleto foi restaurado na página exclusiva de fornecedores, com parcelamento, vencimento, recorrência, observações e comprovante.
- Fornecedores possuem **Editar** e **Excluir** em cada registro.
- Marcas possuem **Editar** e **Excluir** em cada registro.
- Mantido o compartilhamento com as bases de dados já existentes, sem criar cadastro paralelo.

## v10.69 — 01/10/2026
- Usuário **Alesandra** passa a ser perfil **Master** da Biobel.
- Um único login da gerência agora autentica simultaneamente o painel normal e a área administrativa.
- O perfil Master mantém acesso às áreas internas, incluindo Fornecedores, sem novo login.
- Ao sair da gerência, a sessão integrada também é encerrada.

## v10.67 — 01/10/2026
- Área de **Fornecedores** separada em página própria: `administracao/fornecedor.html`.
- Cadastro, contatos, compras/boletos e conferência ficaram organizados em áreas independentes.
- Administração ganhou acesso direto para abrir a nova página de fornecedores.
- A nova página usa as mesmas bases locais existentes (`biobel_cadastros_adm` e `biobel_dados_fornecedores`), evitando duplicação de dados.
- Service Worker atualizado para incluir a nova página.

## v10.66 — 01/10/2026
- Área de Fornecedores separada em abas: **Boletos, Cadastros, Conferência e Histórico**.
- Criada conferência automática de boletos para apontar vencidos, sem marca, sem fornecedor, sem valor e possíveis duplicidades.
- Cadastros de marcas e fornecedores agora ficam estruturalmente separados do formulário de boletos.
- Registros de funcionários deixam de ser usados como fonte automática de fornecedores.

## v10.65 — 01/10/2026
- Nova aba **🏷️ Cadastros — Marcas e Fornecedores** na Administração.
- Marcas já conhecidas, marcas usadas em boletos e fornecedores já existentes são aproveitados automaticamente no cadastro.
- Novos fornecedores e marcas passam a aparecer automaticamente nas opções de boletos.
- Dados de contato do fornecedor são sincronizados com o cadastro existente.
- Interface responsiva para desktop e celular.

## v10.64 — 01/10/2026
- Criada página exclusiva **💾 Backup** em `backup.html`, acessível diretamente sem entrar em Configuração.
- Nova página reúne download de backup, restauração, backup automático e conferência dos dados protegidos.
- Adicionado acesso direto ao Backup no cabeçalho do sistema.
- UI, registro do Service Worker e cache PWA alinhados em v10.64.

## v10.63 — 01/10/2026
- Cadastro de boletos passa a explicar claramente o significado de **Quantidade do produto** e **Validade do produto**.
- Orientação fixa adicionada ao formulário para evitar dúvidas no preenchimento.
- Campos de quantidade e validade receberam exemplos e descrições acessíveis.

## v10.62 — 01/10/2026
- Backup completo e automático passam a registrar explicitamente a presença de dados de fornecedores, boletos e padrões de parcelamento.
- Tela de Backup atualizada para informar que dados de fornecedores também são preservados.
- Novo boleto em 1x recebe automaticamente vencimento sugerido para 30 dias após a data do cadastro quando o campo estiver vazio.

## v10.61 — 01/10/2026
- Novo design da área de Boletos de Fornecedores, com resumo de total, pendentes, pagos e valor pendente.
- Formulário de boletos reorganizado para facilitar o cadastro.
- Parcelamento ampliado de 1x/2x/3x para 1x/2x/3x/4x.
- Parcelas 4x usam sugestões de vencimento editáveis e divisão automática do valor total.
- Anexos de boleto/comprovante agora aceitam PDF além de JPG/PNG; PDFs anexados podem ser visualizados dentro do sistema.

## v10.60 — 01/10/2026
- Central Operacional passa a informar explicitamente a fonte dos dados e o período exibido.
- Novo bloco “Como entender” explica de onde vêm faturamento, atingimento, atendimentos e média por venda.
- Novo bloco “O que a Central está dizendo” traduz os indicadores em linguagem simples.
- Reforçada a separação visual entre dados atuais e histórico/comparações.

## v10.59 — 01/10/2026
- Central Operacional reorganizada em três níveis: Agora, Gestão e Administração.
- Novo bloco "Precisa da sua atenção" para pendências operacionais.
- Layout desktop com grid de 12 colunas e adaptação preservada para mobile.
- Formulários da Central com labels visíveis, foco acessível e campos mais claros.
- Botões de ações e estados visuais mais consistentes.
- Dados locais da Central migrados sem perder registros anteriores.
- UI, registro do Service Worker e cache PWA alinhados na mesma versão.

## v10.58 — 01/10/2026
- **Corrigido bug grave:** a Central Operacional (e o card "Central de Inteligência" do Dashboard) mostrava faturamentos astronômicos (ex.: R$ 77 quatrilhões) — as funções de conversão de número (`n()` em `central-operacional.js`, `num()` em `inteligencia-operacional.js`) foram feitas pra ler texto brasileiro ("1.923,08"), mas os valores da planilha já chegam como número puro; ao "converter" um número que já estava certo, o ponto decimal era removido, inflando cada valor em ~100x. Corrigido checando o tipo antes de converter.
- Design da Central Operacional reformulado pra usar a mesma paleta de cores, cards e botões do resto do sistema.
- Removidas duas versões antigas (v10.39, v10.48) que tinham ficado fixas no texto da própria página da Central, desatualizadas em relação à versão real do sistema.

## v10.57 — 01/10/2026
- A área de comparação passa a ser carregada automaticamente ao abrir a subaba Comparar.
- Meses históricos, como Setembro, podem ser preparados para comparação sem alterar a planilha ativa.

## v10.56 — 01/10/2026
- Meses históricos podem ser carregados em segundo plano para comparação sem trocar a planilha ativa.
- Setembro 2026 ganha ação direta “↔ Comparar”.
- Interface diferencia claramente mês em uso de mês histórico.

## v10.55 — 01/10/2026
- Redesign da área de planilhas mensais com cartões mais claros e indicação da planilha em uso.
- Remoção automática de duplicatas da mesma planilha na lista.
- Gráfico principal do dashboard com melhor hierarquia visual, legendas e tooltips.

## v10.54 — 01/10/2026
- Outubro 2026 passa a ser a planilha padrão do sistema.
- Outubro 2026 é cadastrado automaticamente na lista de planilhas salvas.
- Versão exibida no shell e cache PWA atualizados para v10.54.

## v10.53 — Restauração da Visão Geral completa
- **Correção:** a Visão Geral completa volta a aparecer por padrão no Dashboard.
- **Correção:** remove uma preferência antiga que podia deixar todo o conteúdo avançado escondido sem o usuário ter escolhido isso.
- **Mantido:** o botão permite alternar para o modo simples quando desejado.
- **Preservado:** nenhum dado de vendas, metas ou configurações é removido nessa migração; apenas a preferência de visualização antiga é limpa uma única vez.

## v10.52 — Resumo secundário no fechamento de caixa
- **Novo:** no Fechamento Rápido, acima dos valores do caixa, aparece um resumo do dia selecionado.
- **Mostra:** posição do dia no mês, quantidade de atendimentos, quem trabalhou e total vendido.
- **Dinâmico:** acompanha o dia escolhido no seletor do caixa.
- **Importante:** a equipe exibida segue a escala configurada (Alessandra manhã + Alessandra/Day à tarde; sábado juntas).

## v10.51 — Correção da posição de hoje no mês
- **Correção:** “Posição de hoje no mês” agora compara o faturamento do dia atual com os demais dias já lançados no mês.
- **Exemplo:** se 29/09 tem R$ 1.200,00 e está abaixo de outros 20 dias, mostra **21º de 25**.
- **Novo:** mostra quanto falta para ultrapassar o dia imediatamente acima no ranking.

## v10.50 — Posição acumulada do mês
- **Novo:** indicador de posição do mês conforme o faturamento acumulado atual é comparado com os meses anteriores registrados no histórico.
- **Dinâmico:** a posição é recalculada automaticamente conforme novas vendas entram.
- **Transparente:** mostra a posição no formato “Xº de Y meses” e informa quando há empate.

## v10.49 — Resumo rápido de hoje no Dashboard
- **Novo:** linha de indicadores no card de meta com vendido hoje, maior venda, menor venda, atendimentos, média entre atendimentos e ticket médio.
- **Novo:** a linha é calculada automaticamente com os registros do dia atual da planilha.
- **Importante:** “média entre atendimentos” usa os horários das vendas registradas e não representa a duração real do atendimento.

## v10.48 — Resumo executivo do dia na Central
- **Novo:** a Central passou a mostrar uma leitura gerencial simples do dia ou do último dia lançado.
- **Novo:** faturamento do dia, quantidade de atendimentos, média por venda e horário da primeira/última venda.
- **Novo:** atendimentos e valores separados por manhã, meio-dia e tarde.
- **Novo:** valores registrados por cada atendente no dia para facilitar a leitura rápida.
- **Mantido:** metas, tarefas, agenda, ocorrências, manutenção, contas, estoque e demais ferramentas da Central.
- **Importante:** os dados locais já existentes da Central continuam preservados.

## v10.47 — Filtro por dia e total da escala
- **Novo:** filtro no card de escala para alternar entre **Hoje**, qualquer dia lançado e **Total do período**.
- **Novo:** o total soma os atendimentos dos dias carregados e mantém a separação entre Alessandra e Day.
- **Mantido:** análise de ritmo, média entre registros e maiores intervalos continua disponível no comparativo.

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
