# 🚀 Como publicar com segurança

## Onde o site roda
- **GitHub Pages**, branch `main`, pasta raiz `/`. Sem build próprio: **o que está na `main` é o que vai ao ar**. O painel agora usa páginas HTML independentes + arquivos compartilhados.
- `.nojekyll` na raiz impede o GitHub de processar com Jekyll (**não apague**).
- URL pública: `https://jhoncorretor2025-blip.github.io/biobel-site/` (painel: `login.html` → `dashboard.html`).

## Passo a passo
1. `git pull --rebase` (veja "Robô" abaixo).
2. Edite. Rode `node tools/validar.js` até dar **🟢 APROVADO** e confira pelo menos as páginas `dashboard.html`, `central.html`, `operacao.html`, `equipe.html`, `analises.html`, `config.html` e `administracao.html`.
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
`service-worker.js` guarda as páginas principais e os arquivos compartilhados e busca a rede com `cache: 'reload'`. Para invalidar tudo, suba o `CACHE_NAME`.
