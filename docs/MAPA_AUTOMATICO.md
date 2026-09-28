# 🗺️ Mapa automático do sistema (gerado por `node tools/mapa.js`)

> **Não edite à mão** — este arquivo é regenerado. Explicações humanas: [ESTRUTURA.md](ESTRUTURA.md).
> Gerado a partir do `dashboard.html` versão **v10.1** (28/09/2026).

## Arquivos e tamanhos
| Arquivo | Tamanho |
|---|---|
| dashboard.html | 846 KB |
| index.html | 17 KB |
| login.html | 5 KB |
| style.css / extras.css | 11 KB / 12 KB |
| service-worker.js | 2 KB |

## Abas do dashboard (`<section id="...Tab">`)
- `infoTab`
- `alertasTab`
- `equipeTab`
- `campanhasTab`
- `configTab`
- `caixaTab`
- `admTab`

Botões de aba: `tabDashboard → showTab('dashboard')`, `tabInfo → showTab('info')`, `tabAlertas → showTab('alertas')`, `tabCaixa → showTab('caixa')`, `tabEquipe → showTab('equipe')`, `tabCampanhas → showTab('campanhas')`, `tabConfig → showTab('config')`, `tabAdm → showTab('adm')`

## Seções do código JavaScript (comentários `/* ===== Nome ===== */`)
Para achar uma: `grep -n "===== Nome" dashboard.html`
- MODO CLARO
- Máscara de moeda (Real) para campos de texto
- Toast com "Desfazer" — pra remoções, dá uma segunda chance rápida sem precisar recriar tudo
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
- Folha de Ponto — entrada, intervalo, saída, com cálculo automático de horas
- Registro de Faltas — justificadas ou não
- Exportar Boletos — PDF e CSV, respeitando o filtro/busca que estiver ativo na tela
- Log de alterações (simples, guarda as últimas 30)
- Logo personalizada da Biobel (usada no relatório mensal em PDF)
- Link "Trabalhe Conosco" (Google Forms) — aparece automaticamente no site público
- Área ADM/Gerência (login próprio, separado do login principal do painel)
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
- Gastos Fixos (aluguel, água, luz, internet...)
- Boletos de Fornecedores (gastos variáveis)
- Padrão de parcelamento por fornecedor — lembra o jeito que cada um costuma parcelar
- Ranking de Fornecedores e Gastos por Marca — quem/o que mais pesa no bolso
- Dados dos Fornecedores — telefone e CNPJ, guardado por nome
- Histórico de Preços por Fornecedor (item 7)
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
- Impostos (DAS/MEI/Simples Nacional) — valor manual, sem inventar número
- Taxa da Máquina de Cartão (débito/crédito)
- Valor do Estoque Parado (manual, sem coluna de custo na planilha)
- Reserva de Emergência / Capital de Giro (manual)
- Participação no Lucro (opcional, separada da comissão por metas)
- Alerta de Fluxo de Caixa (avisa se as contas a vencer não vão caber no saldo disponível)
- Projeção de Fluxo de Caixa — 3 meses (item 14)
- DRE Simplificado (resumo formal do período)
- Comissões e participação no lucro por vendedora
- Histórico de comissões já registradas (fica salvo mesmo depois que o mês virar)
- Backup automático (roda sozinho 1x por semana, guardado dentro do próprio navegador)
- Item 7: Validação de CPF e CNPJ — confere os dígitos verificadores de verdade, não só
   se tem a quantidade certa de números. Não bloqueia salvar, só avisa visualmente.
- Meta individual por vendedora (opcional)
- Dados da Empresa (CNPJ, razão social)
- E-mail quando bater a meta do mês (item 10)
- Resumo semanal automático por e-mail (item 11) — só segunda-feira, uma vez por semana
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
- Campanhas de Marketing (item 2) — compara o período da campanha com o resto do mês
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
- Fechamento Mensal Formal (retrato travado dos números, guardado no histórico)
- Exportar Excel (planilha de verdade, pronta pra levar pro contador)
- Múltiplas planilhas salvas (troca rápida entre meses)
- Aviso de mês divergente (itens 1, 2, 3, 4, 9)

## Funções globais: 594
Para achar uma: `grep -n "^function nome\|^async function nome" dashboard.html`

## Bibliotecas externas (CDN)
- https://cdn.tailwindcss.com
- https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js
- https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js

## Chaves de dados no navegador: 122
Prefixo comum `biobel_`. Agrupadas pelo 1º termo depois do prefixo (chaves terminadas em `_` são prefixos + sufixo dinâmico):

**adm** (33): `biobel_adm_autenticado`, `biobel_adm_boletos`, `biobel_adm_comissoes`, `biobel_adm_data_admissao_gabriela`, `biobel_adm_fechamentos_mensais`, `biobel_adm_gastos_fixos`, `biobel_adm_historico_comissoes`, `biobel_adm_historico_ferias_gabriela`, `biobel_adm_historico_recesso_day`, `biobel_adm_inicio_estagio_day`, `biobel_adm_inicio_informal_gabriela`, `biobel_adm_migracao_salarios_v2`, `biobel_adm_migracao_vencimentos_v1`, `biobel_adm_nascimento_`, `biobel_adm_nascimento_day`, `biobel_adm_nascimento_gabriela`, `biobel_adm_niveis_comissao`, `biobel_adm_pct_participacao_lucro`, `biobel_adm_renovacao_estagio_meses`, `biobel_adm_reunioes`, `biobel_adm_secao_isolada`, `biobel_adm_seed_dados_pessoais_v1`, `biobel_adm_taxa_credito`, `biobel_adm_taxa_debito`, `biobel_adm_tipo_imposto`, `biobel_adm_usuario_logado`, `biobel_adm_valor_estoque`, `biobel_adm_valor_estoque_data`, `biobel_adm_valor_hora_extra`, `biobel_adm_valor_hora_extra_definido_manualmente`, `biobel_adm_valor_imposto_mensal`, `biobel_adm_valor_reserva`, `biobel_adm_valor_reserva_data`

**equipe** (7): `biobel_equipe_assinatura_atual`, `biobel_equipe_assinaturas`, `biobel_equipe_dia_atual`, `biobel_equipe_diaria_`, `biobel_equipe_historico`, `biobel_equipe_rotina_custom`, `biobel_equipe_sub_aba`

**horario** (4): `biobel_horario_abertura`, `biobel_horario_fechamento_sabado`, `biobel_horario_fechamento_semana`, `biobel_horario_padrao_ponto`

**campanhas** (3): `biobel_campanhas`, `biobel_campanhas_`, `biobel_campanhas_migracao_v2`

**chave** (3): `biobel_chave_pix_`, `biobel_chave_pix_day`, `biobel_chave_pix_gabriela`

**dados** (3): `biobel_dados_empresa`, `biobel_dados_fornecedores`, `biobel_dados_pessoais_`

**email** (3): `biobel_email_contadora`, `biobel_email_meta_enviado_mes`, `biobel_email_semanal_enviado`

**logo** (3): `biobel_logo_custom`, `biobel_logo_custom_url`, `biobel_logo_padrao_escolhido`

**meta** (3): `biobel_meta_anual`, `biobel_meta_qtd_vendas`, `biobel_meta_trimestral`

**notif** (3): `biobel_notif_mes_divergente_dia`, `biobel_notif_meta_dia`, `biobel_notif_vencimentos_dia`

**seed** (3): `biobel_seed_msg_alessandra_v1`, `biobel_seed_pix_v1`, `biobel_seed_planilha_setembro_v1`

**arquivo** (2): `biobel_arquivo_ex_funcionarios`, `biobel_arquivo_meses`

**atividades** (2): `biobel_atividades_gerencia`, `biobel_atividades_sem_movimento`

**daily** (2): `biobel_daily_goal_manual`, `biobel_daily_sales_goal`

**historico** (2): `biobel_historico_meses`, `biobel_historico_planilhas_ativas`

**link** (2): `biobel_link_trabalhe_conosco`, `biobel_link_trabalhe_conosco_definido`

**modo** (2): `biobel_modo_compacto`, `biobel_modo_travado_gastos`

**ultimo** (2): `biobel_ultimo_backup_automatico`, `biobel_ultimo_erro_conexao`

**abrir** (1): `biobel_abrir_assistente_desligamento_apos_login`

**apps** (1): `biobel_apps_script_url`

**card** (1): `biobel_card_colapsado_`

**clima** (1): `biobel_clima_dias`

**config** (1): `biobel_config_secao_ativa`

**dashboard** (1): `biobel_dashboard_modo`

**desligamento** (1): `biobel_desligamento_`

**dias** (1): `biobel_dias_atipicos`

**dica** (1): `biobel_dica_do_dia_ultima_data`

**dicas** (1): `biobel_dicas_do_dia`

**faltas** (1): `biobel_faltas`

**folha** (1): `biobel_folha_ponto`

**font** (1): `biobel_font_pct`

**google** (1): `biobel_google_sheet_url`

**grupo** (1): `biobel_grupo_adm_`

**hide** (1): `biobel_hide_legends`

**info** (1): `biobel_info_secao_ativa`

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

**planilhas** (1): `biobel_planilhas_salvas`

**previsao** (1): `biobel_previsao_clima_cache`

**promocao** (1): `biobel_promocao_clt_day`

**provedor** (1): `biobel_provedor_email`

**recordes** (1): `biobel_recordes_comparacao`

**sales** (1): `biobel_sales_goal`

**snapshot** (1): `biobel_snapshot_automatico`

**texto** (1): `biobel_texto_vaga_`

**theme** (1): `biobel_theme`

**tour** (1): `biobel_tour_concluido`

**ultima** (1): `biobel_ultima_sincronizacao_ok`

**zoom** (1): `biobel_zoom_auto_sugerido`
