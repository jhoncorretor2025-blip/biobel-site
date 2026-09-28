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
