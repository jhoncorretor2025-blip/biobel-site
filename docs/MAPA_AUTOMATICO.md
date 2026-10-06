# 🗺️ Mapa automático do sistema (gerado por `node tools/mapa.js`)

> **Não edite à mão** — este arquivo é regenerado. Explicações humanas: [ESTRUTURA.md](ESTRUTURA.md).
> Gerado a partir do estado real do repositório — painel na versão **v?** (?), compartilhada por `biobel-shell.js` entre as 8 páginas.

## Páginas do painel (8)
| Arquivo | data-biobel-page | id do conteúdo | Tamanho | IDs no HTML | Scripts locais próprios |
|---|---|---|---|---|---|
| `dashboard.html` | `dashboard` | `dashboardTab` | 48 KB | 94 | — |
| `operacao.html` | `caixa` | `caixaTab` | 8 KB | 27 | — |
| `equipe.html` | `equipe` | `equipeTab` | 23 KB | 70 | — |
| `vendas.html` | `campanhas` | `campanhasTab` | 5 KB | 18 | — |
| `analises.html` | `info` | `infoTab` | 33 KB | 145 | — |
| `alertas.html` | `alertas` | `alertasTab` | 3 KB | 11 | — |
| `config.html` | `config` | `configTab` | 73 KB | 130 | — |
| `administracao.html` | `adm` | `admTab` | 85 KB | 168 | — |

## Mapa de navegação (de `biobel-shell.js`)
```js
const PAGES={dashboard:"dashboard.html",caixa:"operacao.html",equipe:"equipe.html",campanhas:"vendas.html",info:"analises.html",alertas:"alertas.html",config:"config.html",adm:"administracao.html",backup:"backup.html"}
```
⚠️ Os nomes internos (`caixa`, `info`, `campanhas`) não batem sempre com os nomes de arquivo — confira sempre os dois lados.

## Arquivos JavaScript compartilhados
| Arquivo | Tamanho | Funções (aprox.) | Usado em |
|---|---|---|---|
| `biobel-app.js` | 733 KB | 748 | todas as 8 páginas |
| `biobel-shell.js` | 15 KB | 4 | todas as 8 páginas |
| `biobel-recognition.js` | 4 KB | 2 | todas as 8 páginas |
| `biobel-planilha-leitura.js` | 9 KB | 10 | todas as 8 páginas |
| `biobel-planilha-processamento.js` | 18 KB | 23 | todas as 8 páginas |
| `biobel-planilha-comparacao.js` | 2 KB | 1 | todas as 8 páginas |
| `central-operacional.js` | 43 KB | 16 |  |
| `inteligencia-operacional.js` | 12 KB | 13 | dashboard.html |

## Outros arquivos
| Arquivo | Tamanho |
|---|---|
| index.html | 29 KB |
| login.html | 5 KB |
| biobel-design-system.css | 7 KB |
| biobel-ux-refinement.css | 41 KB |
| biobel-app.css | 86 KB |
| service-worker.js | 3 KB |

## Seções do código JavaScript em `biobel-app.js` (comentários `/* ===== Nome ===== */`)
Para achar uma: `grep -n "===== Nome" biobel-app.js`
- BIOBEL — ZONA: CORE / INICIALIZAÇÃO
   Utilitários compartilhados e estado inicial do painel.
- Máscara de moeda (Real) para campos de texto
- Toast com "Desfazer" — pra remoções, dá uma segunda chance rápida sem precisar recriar tudo
- BIOBEL — ZONA: EQUIPE / ROTINAS E ATIVIDADES
- Atividades da Gerência (Alessandra) — lista própria, separada da rotina Gabi/Day
- Item 4: Aviso de armazenamento quase cheio — evita a pessoa perder dados sem entender
   por quê, se um dia o limite do navegador (geralmente uns 5-10MB) chegar perto do fim.
- Item 11: Indicador de "última vez salvo" — intercepta TODO salvamento do sistema de uma
   vez só, sem precisar mexer em cada função individual de salvar.
- Modo Apresentação / TV
- Busca Global — pula direto pra onde a pessoa precisa, sem caçar pelo sistema
- Botão "Voltar ao Topo" (aparece só depois de rolar a tela)
- Modo Compacto (reduz espaçamento entre cards, pra caber mais informação na tela)
- Minimizar/Maximizar cards — aplica um botão em todo card automaticamente
- Tour Guiado — aparece sozinho na primeira vez, explica as abas principais
- Grupos colapsáveis genéricos na ADM (Funcionários, Fornecedores, etc.)
- Modo Simples/Completo do Dashboard — esconde graficos e tabelas tecnicas
- BIOBEL — ZONA: EQUIPE / FOLHA DE PONTO E FALTAS
- Folha de Ponto — entrada, intervalo, saída, com cálculo automático de horas
- Registro de Faltas — justificadas ou não
- Exportar Boletos — PDF e CSV, respeitando o filtro/busca que estiver ativo na tela
- Log de alterações (simples, guarda as últimas 30)
- Logo personalizada da Biobel (usada no relatório mensal em PDF)
- Link "Trabalhe Conosco" (Google Forms) — aparece automaticamente no site público
- BIOBEL — ZONA: ADMINISTRAÇÃO / ACESSO E DADOS DE GESTÃO
- Área ADM/Gerência (login próprio, separado do login principal do painel)
- Sessão administrativa — expiração automática em 2 horas
- Chave PIX de cada funcionária (pra Alessandra saber como pagar)
- Aviso antes de sair com algo digitado e não salvo
- Textos de Vaga — prontos pra copiar e colar nas redes sociais
- Campanhas — datas especiais e promocionais, prontas pra copiar e colar
- Sem Movimento? Faça Isso! — checklist de ações de divulgação, reseta todo dia
- Dica do Dia — mensagem aleatória, uma vez por dia, lista editável
- Calendário Comercial (datas especiais calculadas automaticamente)
- Agenda de Reuniões com Fornecedores
- Mensagens Programadas (aniversários, avisos, datas especiais)
- Exibição da faixa (na área ADM) — até 3x de manhã e 3x à tarde por mensagem/dia
- Índice de navegação (chips) da área ADM
- Resumo de "o que precisa de atenção", logo no topo
- Filtro rápido de status nos boletos
- Assistente Guiado de Desligamento — passo a passo, bem simples, uma pergunta por vez
- BIOBEL — ZONA: ADMINISTRAÇÃO / FINANCEIRO E FORNECEDORES
- Gastos Fixos (aluguel, água, luz, internet...)
- Boletos de Fornecedores (gastos variáveis)
- Padrão de parcelamento por fornecedor — lembra o jeito que cada um costuma parcelar
- Ranking de Fornecedores e Gastos por Marca — quem/o que mais pesa no bolso
- Dados dos Fornecedores — telefone e CNPJ, guardado por nome
- Histórico de Preços por Fornecedor (item 7)
- Cadastros de Marcas e Fornecedores — usados automaticamente no módulo de boletos
- BIOBEL — ZONA: ADMINISTRAÇÃO / PESSOAS E COMISSÕES
- Comissão por Níveis de Meta (Gabriela e Day, cada uma recebe o valor do nível atingido)
- Hora extra fixa (Gabriela, 2h/semana)
- Data de Admissão — Gabriela (CLT), pra calcular férias e FGTS
- Desligamento — Gabriela e Day, com resumo em PDF pra contadora
- Arquivo de Ex-Funcionários — registro histórico de quem já trabalhou aqui
- Férias — Gabriela (histórico, período aquisitivo/concessivo, alerta de vencimento)
- Recesso Remunerado — Day (estágio, 30 dias/ano, proporcional se < 1 ano)
- Aniversários (Gabriela e Day) — pra gerente lembrar
- Contrato de Estágio — Day (início e prazo de renovação)
- Promoção de Day: Estágio -> CLT
- BIOBEL — ZONA: ADMINISTRAÇÃO / CUSTOS, ESTOQUE E CAPITAL
- Impostos (DAS/MEI/Simples Nacional) — valor manual, sem inventar número
- Taxa da Máquina de Cartão (débito/crédito)
- Valor do Estoque Parado (manual, sem coluna de custo na planilha)
- Reserva de Emergência / Capital de Giro (manual)
- Participação no Lucro (opcional, separada da comissão por metas)
- BIOBEL — ZONA: ADMINISTRAÇÃO / FLUXO DE CAIXA E DRE
- Alerta de Fluxo de Caixa (avisa se as contas a vencer não vão caber no saldo disponível)
- Projeção de Fluxo de Caixa — 3 meses (item 14)
- DRE Simplificado (resumo formal do período)
- Comissões e participação no lucro por vendedora
- Histórico de comissões já registradas (fica salvo mesmo depois que o mês virar)
- BIOBEL — ZONA: DADOS / BACKUP E METAS
- Backup automático (roda sozinho 1x por semana, guardado dentro do próprio navegador)
- Item 7: Validação de CPF e CNPJ — confere os dígitos verificadores de verdade, não só
   se tem a quantidade certa de números. Não bloqueia salvar, só avisa visualmente.
- Meta individual por vendedora (opcional)
- Dados da Empresa (CNPJ, razão social)
- E-mail quando bater a meta do mês (item 10)
- Resumo semanal automático por e-mail (item 11) — só segunda-feira, uma vez por semana
- BIOBEL — ZONA: ANÁLISES / COMPARATIVOS E INDICADORES
- Tela "Por Dia da Semana" — compara todas as ocorrências do mesmo dia da semana
- Meta de quantidade de vendas (opcional)
- Metas trimestral e anual (opcional)
- Alerta de venda fora do padrão (possível erro de digitação)
- Alerta: dias abaixo da meta diária
- Recorde do mês (comparado ao histórico de meses arquivados)
- Alerta de diferença grande entre o caixa esperado (só dinheiro físico) e o fechamento contado
- Central de Alertas & Decisões — reúne todos os pontos de atenção do sistema num só lugar
- Emoji de "clima do dia" nas vendas (comparado à média do período)
- Contador de dias sem erro de conexão
- Comparar meses arquivados lado a lado
- Comparar Mesmo Período — este mês (em andamento) x mês passado (arquivado)
- Acima/Abaixo da Média, e Melhor/Pior Semana do Mês (aba Dias)
- BIOBEL — ZONA: CAMPANHAS / MARKETING E SEM MOVIMENTO
- Campanhas de Marketing (item 2) — compara o período da campanha com o resto do mês
- BIOBEL — ZONA: CLIMA / CORRELAÇÃO E PREVISÕES
   ATENÇÃO: manter esta zona isolada ao fazer refatorações.
- Correlação com Clima (item 12) — marcação manual, sem depender de API externa
- Busca automática do clima de hoje — API gratuita Open-Meteo, sem precisar de chave
- Previsão futura do clima — busca uma vez por dia e guarda em cache, reaproveitada por
   várias telas (previsão dos próximos dias, alerta de fim de semana, calendário comercial)
- Recordes batidos (item 10) — guarda uma linha do tempo de conquistas
- Exportar a comparação em PDF (item 6)
- Top 30 Melhores Dias — junta o mês atual com TODOS os meses arquivados, sem separar
- Dias Atípicos — excluídos das médias por dia da semana, sem sumir do faturamento total
- Contagem de dias úteis restantes — pula domingo (loja fechada) e feriados marcados
- Recordes de Vendas Individuais (Top 5 melhores/piores)
- BIOBEL — ZONA: EXPORTAÇÕES / RELATÓRIOS E FECHAMENTO
- Fechamento Mensal Formal (retrato travado dos números, guardado no histórico)
- Exportar Excel (planilha de verdade, pronta pra levar pro contador)
- BIOBEL — ZONA: DADOS / GOOGLE SHEETS E PLANILHAS
- Múltiplas planilhas salvas (troca rápida entre meses)
- Aviso de mês divergente (itens 1, 2, 3, 4, 9)
- Conversão robusta de valores vindos da planilha
- PROCESSAMENTO DE DADOS DA PLANILHA =====
   REGRA CRÍTICA DO CAIXA:
   O fechamento da gaveta é o valor informado pela própria planilha.
   Nunca substituir esse valor por uma conta parcial. Se não for localizado,
   marcar como ausente e bloquear o fechamento/impressão.
- ALERTA DE HORÁRIO AUSENTE — COLUNA L
- Assistente operacional: próxima ação, passagem de turno e resumo diário
- BIOBEL — ZONA: RENDERIZAÇÃO / DASHBOARD AVANÇADO
- BIOBEL — ZONA: INTELIGÊNCIA DA PLANILHA (v10.24)
   Quatro leituras automáticas sem cadastro de produtos/clientes:
   2) possíveis inconsistências, 3) comparação, 5) explicação e 10) destaques.
- v11.24 — rotina operacional + escolha obrigatória às 09:30

## Bibliotecas externas (CDN)
- https://cdn.tailwindcss.com
- https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js
- https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js

## Chaves de dados no navegador (localStorage): 141
Prefixo comum `biobel_`. Agrupadas pelo 1º termo depois do prefixo:

**adm** (35): `biobel_adm_autenticado`, `biobel_adm_boletos`, `biobel_adm_comissoes`, `biobel_adm_data_admissao_gabriela`, `biobel_adm_fechamentos_mensais`, `biobel_adm_gastos_fixos`, `biobel_adm_historico_comissoes`, `biobel_adm_historico_ferias_gabriela`, `biobel_adm_historico_recesso_day`, `biobel_adm_inicio_estagio_day`, `biobel_adm_inicio_informal_gabriela`, `biobel_adm_login_ts`, `biobel_adm_meta_lucro_mensal`, `biobel_adm_migracao_salarios_v2`, `biobel_adm_migracao_vencimentos_v1`, `biobel_adm_nascimento_`, `biobel_adm_nascimento_day`, `biobel_adm_nascimento_gabriela`, `biobel_adm_niveis_comissao`, `biobel_adm_pct_participacao_lucro`, `biobel_adm_renovacao_estagio_meses`, `biobel_adm_reunioes`, `biobel_adm_secao_isolada`, `biobel_adm_seed_dados_pessoais_v1`, `biobel_adm_taxa_credito`, `biobel_adm_taxa_debito`, `biobel_adm_tipo_imposto`, `biobel_adm_usuario_logado`, `biobel_adm_valor_estoque`, `biobel_adm_valor_estoque_data`, `biobel_adm_valor_hora_extra`, `biobel_adm_valor_hora_extra_definido_manualmente`, `biobel_adm_valor_imposto_mensal`, `biobel_adm_valor_reserva`, `biobel_adm_valor_reserva_data`

**equipe** (7): `biobel_equipe_assinatura_atual`, `biobel_equipe_assinaturas`, `biobel_equipe_dia_atual`, `biobel_equipe_diaria_`, `biobel_equipe_historico`, `biobel_equipe_rotina_custom`, `biobel_equipe_sub_aba`

**horario** (4): `biobel_horario_abertura`, `biobel_horario_fechamento_sabado`, `biobel_horario_fechamento_semana`, `biobel_horario_padrao_ponto`

**campanhas** (3): `biobel_campanhas`, `biobel_campanhas_`, `biobel_campanhas_migracao_v2`

**chave** (3): `biobel_chave_pix_`, `biobel_chave_pix_day`, `biobel_chave_pix_gabriela`

**dados** (3): `biobel_dados_empresa`, `biobel_dados_fornecedores`, `biobel_dados_pessoais_`

**email** (3): `biobel_email_contadora`, `biobel_email_meta_enviado_mes`, `biobel_email_semanal_enviado`

**logo** (3): `biobel_logo_custom`, `biobel_logo_custom_url`, `biobel_logo_padrao_escolhido`

**meta** (3): `biobel_meta_anual`, `biobel_meta_qtd_vendas`, `biobel_meta_trimestral`

**notif** (3): `biobel_notif_mes_divergente_dia`, `biobel_notif_meta_dia`, `biobel_notif_vencimentos_dia`

**ultimo** (3): `biobel_ultimo_backup_automatico`, `biobel_ultimo_erro_conexao`, `biobel_ultimo_horario_fechamento_registrado`

**arquivo** (2): `biobel_arquivo_ex_funcionarios`, `biobel_arquivo_meses`

**atividades** (2): `biobel_atividades_gerencia`, `biobel_atividades_sem_movimento`

**central** (2): `biobel_central_v10_39`, `biobel_central_v10_59`

**daily** (2): `biobel_daily_goal_manual`, `biobel_daily_sales_goal`

**dashboard** (2): `biobel_dashboard_modo`, `biobel_dashboard_modo_migracao`

**historico** (2): `biobel_historico_meses`, `biobel_historico_planilhas_ativas`

**link** (2): `biobel_link_trabalhe_conosco`, `biobel_link_trabalhe_conosco_definido`

**modo** (2): `biobel_modo_compacto`, `biobel_modo_travado_gastos`

**rotina** (2): `biobel_rotina_concluida_hoje_v1`, `biobel_rotina_escolhida_hoje_v1`

**seed** (2): `biobel_seed_msg_alessandra_v1`, `biobel_seed_pix_v1`

**ultima** (2): `biobel_ultima_leitura_planilha_v1`, `biobel_ultima_sincronizacao_ok`

**abrir** (1): `biobel_abrir_assistente_desligamento_apos_login`

**acesso** (1): `biobel_acesso_total`

**alerta** (1): `biobel_alerta_horario_ausente_v1`

**apps** (1): `biobel_apps_script_url`

**cadastros** (1): `biobel_cadastros_adm`

**card** (1): `biobel_card_colapsado_`

**clima** (1): `biobel_clima_dias`

**config** (1): `biobel_config_secao_ativa`

**desligamento** (1): `biobel_desligamento_`

**dias** (1): `biobel_dias_atipicos`

**dica** (1): `biobel_dica_do_dia_ultima_data`

**dicas** (1): `biobel_dicas_do_dia`

**faltas** (1): `biobel_faltas`

**fechamento** (1): `biobel_fechamento_caixa_confirmado_`

**folha** (1): `biobel_folha_ponto`

**font** (1): `biobel_font_pct`

**fornecedor** (1): `biobel_fornecedor_aba`

**google** (1): `biobel_google_sheet_url`

**grupo** (1): `biobel_grupo_adm_`

**hide** (1): `biobel_hide_legends`

**info** (1): `biobel_info_secao_ativa`

**inteligencia** (1): `biobel_inteligencia_v10_13`

**ja** (1): `biobel_ja_trocou_mes_automatico`

**lembrete** (1): `biobel_lembrete_reunioes_ultima_data`

**log** (1): `biobel_log_alteracoes`

**logged** (1): `biobel_logged_in`

**mensagens** (1): `biobel_mensagens_programadas`

**meses** (1): `biobel_meses_email_enviados`

**metas** (1): `biobel_metas_vendedoras`

**migracao** (1): `biobel_migracao_niveis_50_55_v1`

**msg** (1): `biobel_msg_contador_`

**notificacoes** (1): `biobel_notificacoes_ativas`

**padroes** (1): `biobel_padroes_parcelado_fornecedor`

**passagens** (1): `biobel_passagens_turno_v1`

**pendente** (1): `biobel_pendente_horario_fechamento`

**perfil** (1): `biobel_perfil`

**planilhas** (1): `biobel_planilhas_salvas`

**previsao** (1): `biobel_previsao_clima_cache`

**promocao** (1): `biobel_promocao_clt_day`

**provedor** (1): `biobel_provedor_email`

**recordes** (1): `biobel_recordes_comparacao`

**resumo** (1): `biobel_resumo_1715_v1`

**sales** (1): `biobel_sales_goal`

**snapshot** (1): `biobel_snapshot_automatico`

**texto** (1): `biobel_texto_vaga_`

**theme** (1): `biobel_theme`

**tour** (1): `biobel_tour_concluido`

**vendas** (1): `biobel_vendas_motivacionais_v2`

**zoom** (1): `biobel_zoom_auto_sugerido`
