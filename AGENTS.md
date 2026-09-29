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
| `dashboard.html` | Visão Geral | Arquivo crítico; deve continuar funcionando |\n| `biobel-app.js` | Núcleo JavaScript compartilhado | Todas as páginas dependem dele |\n| `biobel-app.css` | CSS compartilhado | Todas as páginas dependem dele |\n| `biobel-shell.js` | Cabeçalho e navegação direta | Todas as páginas dependem dele |
| `login.html` | Tela de entrada do painel | Autenticação só no navegador (não é segurança real) |
| `index.html` | Site público da loja | Link do WhatsApp e endereço são reais |
| `service-worker.js` | Cache/offline das páginas e arquivos compartilhados | Mudou o cache? suba `CACHE_NAME` |
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

## 5. Arquitetura atual (v10.39)\n- Cada área principal tem URL própria e compartilha o mesmo núcleo JavaScript/CSS e o mesmo cabeçalho.\n- O login da sessão continua único para todas as páginas.\n- A área de Administração mantém seu controle interno separado.\n\n## 6. Armadilhas já vividas (aprenda com elas)
- **Edição que apaga função sem querer:** ao usar substituição de texto, confira que o trecho âncora não engoliu a função vizinha. `node tools/validar.js` acusa "handler chama função inexistente".
- **Ano fixo em 2026** no código (≈13 lugares: `new Date(2026, ...)`, `'2026-'+...`, função `dataDoDiaParaISO`). Cálculos de **dia da semana** vão errar a partir de 2027. Ao mexer nisso, corrija centralizando o ano.
- **Verifique se a funcionalidade já existe antes de criar.** Já aconteceu de recriarmos à mão algo que o sistema já lia da planilha (ex.: turno por venda já vem em `d.porTurno`). Faça `grep` por palavras-chave.
- **Verificação por `getElementById`:** ids que o código procura e o HTML não tem são bugs silenciosos. O validador lista os novos.
- **Cache do navegador/PWA** faz o usuário ver versão antiga. Se disser "não apareceu", confira o número da versão no topo antes de achar que é bug.
- **Um feedback do usuário costuma significar "não achei"**, não "não existe". Confirme o caminho de navegação (aba → sub-aba → card) antes de programar de novo.

## 7. Como conversar com o dono do sistema
Português informal e **simples**, sem jargão. Use **negrito** nas palavras-chave e emojis. Explique o "porquê" em uma frase. Diga com honestidade o que testou e o que **não** conseguiu testar (você não tem acesso ao navegador dele nem aos dados salvos no aparelho).

## 8. Problemas conhecidos (não é você que quebrou)
- `index.html` referencia `script.js`, que **não existe** no repositório (404 silencioso). Decidir com o dono: criar o arquivo ou remover a linha.
- Arquivos soltos na raiz sem uso aparente: `img` (arquivo de 1 byte), `test.txt`, `slide_de_fachada.png`, `imagens/roda_pe_site.png`. **Não apague sem confirmar com o dono.**
- Login e área ADM são checados **no navegador** (quem abrir o código-fonte enxerga). Não trate como segurança real.
- Cada aparelho tem seus **próprios dados** (localStorage). Não existe banco central; a única fonte compartilhada é a planilha do Google.
