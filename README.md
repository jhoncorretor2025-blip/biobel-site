# Biobel Cosméticos — site e painel de gestão

- 🌐 **Site público:** `index.html`
- 📊 **Painel de gestão:** `login.html` → `dashboard.html` (app de arquivo único, sem build)

## 🤖 Como usar outra IA para mexer no sistema

| Tipo de IA | O que fazer |
|---|---|
| **Com acesso ao repositório** (Claude Code, Copilot, Cursor, Codex...) | Nada de especial: elas leem o [`AGENTS.md`](AGENTS.md) sozinhas. Se não lerem, mande: *"Leia o AGENTS.md antes de tudo."* |
| **IA de chat sem acesso ao repositório** (ChatGPT, Gemini, etc.) | 1) Anexe o arquivo [`docs/CONTEXTO_PARA_IA.md`](docs/CONTEXTO_PARA_IA.md) (é tudo em um só). 2) Anexe o `dashboard.html`. 3) Diga o que quer mudar. |
| **IA que abre links** | Mande: `https://raw.githubusercontent.com/jhoncorretor2025-blip/biobel-site/main/docs/CONTEXTO_PARA_IA.md` |

Depois que a IA mexer: ela deve rodar `node tools/validar.js` (tem que dar 🟢 APROVADO) e `node tools/mapa.js` antes de publicar.

📚 Documentação completa: pasta [`docs/`](docs/)
