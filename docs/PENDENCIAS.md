# Pendências conhecidas

## 🟡 Descobertas durante as melhorias gráficas da v11.77 (NÃO corrigidas)
- **Celular: Análises (530 px) e Administração (688 px) estouram na horizontal** (já estouravam antes da v11.77; a Visão Geral foi corrigida). Culpados: Análises → `#resumoCaixaDivergencia` (grade `.item/.lbl/.val` não encolhe); Administração → linha de "gastos fixos" (`#novoGastoFixoDia`, `#novoGastoFixoValor` e o botão `#btnAdicionarGastoFixo`, que vai até 688 px).
- **Cópias mortas do shell:** `biobel-shell.js`, `biobel-shell-v1161.js` e `-v1167.js` não são carregados por nenhuma página (o ativo é `biobel-shell-v1168.js`); o `service-worker.js` ainda pré-carrega o `-v1161`. Apagar e tirar do `ASSETS`.
- **Contraste que sobrou:** botões com texto branco sobre verde/vermelho/azul (`#059669`, `#10b981`, `#e11d48`, `#2f78e0`, `#8b5cf6`: 2,3–4,3:1) e **63 textos fracos no modo claro** (ex.: verde-água `#27d7a0` sobre branco = 1,85:1 no selo de conexão).
- **Versões desencontradas:** o código tinha `?v=11.73` (42×), `11.74`, `11.75`, `11.76` e `BIOBEL_VERSION v11.67`; a v11.77 unificou, mas quem trocar versão deve usar a troca ampla (`?v=11\.\d+`).

