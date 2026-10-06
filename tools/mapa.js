#!/usr/bin/env node
/**
 * Gera docs/MAPA_AUTOMATICO.md e docs/CONTEXTO_PARA_IA.md a partir do estado real do repositório
 * (9 páginas do painel + arquivos JS/CSS compartilhados). Rode depois de mudanças grandes:
 *     node tools/mapa.js
 * (Não edite esses dois arquivos à mão — são sobrescritos. Explicações humanas ficam em docs/ESTRUTURA.md)
 */
const fs = require('fs');
const path = require('path');
const raiz = path.join(__dirname, '..');
const ler = f => fs.readFileSync(path.join(raiz, f), 'utf8');
const kb = f => { try { return (fs.statSync(path.join(raiz, f)).size / 1024).toFixed(0) + ' KB'; } catch (e) { return '—'; } };
const existe = f => fs.existsSync(path.join(raiz, f));

const PAGINAS_PAINEL = [
  'dashboard.html', 'central.html', 'operacao.html', 'equipe.html', 'vendas.html',
  'analises.html', 'alertas.html', 'config.html', 'administracao.html'
];
const JS_COMPARTILHADOS = ['biobel-app.js', 'biobel-shell.js', 'biobel-recognition.js', 'biobel-planilha-leitura.js',
  'biobel-planilha-processamento.js', 'biobel-planilha-comparacao.js', 'central-operacional.js', 'inteligencia-operacional.js'];

// ---- Levanta dados de cada página do painel ----
const infoPaginas = PAGINAS_PAINEL.filter(existe).map(f => {
  const html = ler(f);
  const pageAttr = (html.match(/data-biobel-page="([a-z]+)"/) || [])[1] || '?';
  const mainId = (html.match(/<(?:main|section) id="([A-Za-z]+)"/) || [])[1] || '?';
  const scriptsLocais = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(s => !s.startsWith('http')).map(s => s.split('?')[0].split('#')[0]);   // tira o ?v=NN (cache-busting)
  const idsHtml = [...html.matchAll(/\bid="([^"$\{]+)"/g)].map(m => m[1]);
  return { arquivo: f, pageAttr, mainId, scriptsLocais, tamanho: kb(f), qtdIds: idsHtml.length };
});

// ---- Mapa de navegação (extraído de biobel-shell.js, fonte da verdade) ----
const shell = existe('biobel-shell.js') ? ler('biobel-shell.js') : '';
const mapaPaginas = (shell.match(/const PAGES=\{[^}]*\}/) || [''])[0];

// ---- Levanta dados de cada JS compartilhado ----
const infoJs = JS_COMPARTILHADOS.filter(existe).map(f => {
  const codigo = ler(f);
  const usadoEm = infoPaginas.filter(p => p.scriptsLocais.includes(f)).map(p => p.arquivo);
  const funcoes = [...codigo.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m => m[1]);
  return { arquivo: f, tamanho: kb(f), usadoEm, qtdFuncoes: new Set(funcoes).size };
});

// ---- Chaves de localStorage (biobel_*), varrendo todos os JS compartilhados ----
const todoCodigoJs = JS_COMPARTILHADOS.filter(existe).map(ler).join('\n');
const chaves = [...new Set([...todoCodigoJs.matchAll(/['"](biobel_[a-z0-9_]+)['"]/g)].map(m => m[1]))].sort();
const grupos = {};
chaves.forEach(k => { const p = k.split('_')[1]; (grupos[p] = grupos[p] || []).push(k); });
const gruposOrdenados = Object.entries(grupos).sort((a, b) => b[1].length - a[1].length);

// ---- Seções de código comentadas (/* ===== Nome ===== */), no biobel-app.js ----
const secoesCodigo = existe('biobel-app.js')
  ? [...ler('biobel-app.js').matchAll(/\/\* ={3,}\s*([^*]+?)\s*={3,} \*\//g)].map(m => m[1].trim())
  : [];

// ---- CDNs usados (de qualquer página) ----
const cdns = new Set();
infoPaginas.forEach(p => {
  [...ler(p.arquivo).matchAll(/<script src="(https:[^"]+)"/g)].forEach(m => cdns.add(m[1]));
});

// ---- Versão do sistema (agora vive em biobel-shell.js, compartilhada) ----
const versao = (shell.match(/>v([\d.]+)<\/span>/) || [])[1] || '?';
const dataV = (shell.match(/Atualizado em (\d\d\/\d\d\/\d{4})/) || [])[1] || '?';

let md = `# 🗺️ Mapa automático do sistema (gerado por \`node tools/mapa.js\`)

> **Não edite à mão** — este arquivo é regenerado. Explicações humanas: [ESTRUTURA.md](ESTRUTURA.md).
> Gerado a partir do estado real do repositório — painel na versão **v${versao}** (${dataV}), compartilhada por \`biobel-shell.js\` entre as ${infoPaginas.length} páginas.

## Páginas do painel (${infoPaginas.length})
| Arquivo | data-biobel-page | id do conteúdo | Tamanho | IDs no HTML | Scripts locais próprios |
|---|---|---|---|---|---|
${infoPaginas.map(p => `| \`${p.arquivo}\` | \`${p.pageAttr}\` | \`${p.mainId}\` | ${p.tamanho} | ${p.qtdIds} | ${p.scriptsLocais.filter(s => !JS_COMPARTILHADOS.includes(s)).join(', ') || '—'} |`).join('\n')}

## Mapa de navegação (de \`biobel-shell.js\`)
\`\`\`js
${mapaPaginas || '(não encontrado)'}
\`\`\`
⚠️ Os nomes internos (\`caixa\`, \`info\`, \`campanhas\`) não batem sempre com os nomes de arquivo — confira sempre os dois lados.

## Arquivos JavaScript compartilhados
| Arquivo | Tamanho | Funções (aprox.) | Usado em |
|---|---|---|---|
${infoJs.map(j => `| \`${j.arquivo}\` | ${j.tamanho} | ${j.qtdFuncoes} | ${j.usadoEm.length === infoPaginas.length ? 'todas as ' + infoPaginas.length + ' páginas' : j.usadoEm.join(', ')} |`).join('\n')}

## Outros arquivos
| Arquivo | Tamanho |
|---|---|
| index.html | ${kb('index.html')} |
| login.html | ${kb('login.html')} |
| biobel-design-system.css | ${kb('biobel-design-system.css')} |
| biobel-ux-refinement.css | ${kb('biobel-ux-refinement.css')} |
| biobel-app.css | ${kb('biobel-app.css')} |
| service-worker.js | ${kb('service-worker.js')} |

## Seções do código JavaScript em \`biobel-app.js\` (comentários \`/* ===== Nome ===== */\`)
Para achar uma: \`grep -n "===== Nome" biobel-app.js\`
${secoesCodigo.map(s => '- ' + s).join('\n')}

## Bibliotecas externas (CDN)
${[...cdns].map(c => '- ' + c).join('\n')}

## Chaves de dados no navegador (localStorage): ${chaves.length}
Prefixo comum \`biobel_\`. Agrupadas pelo 1º termo depois do prefixo:

${gruposOrdenados.map(([g, ks]) => `**${g}** (${ks.length}): ` + ks.map(k => '`' + k + '`').join(', ')).join('\n\n')}
`;
fs.mkdirSync(path.join(raiz, 'docs'), { recursive: true });
fs.writeFileSync(path.join(raiz, 'docs', 'MAPA_AUTOMATICO.md'), md);
console.log(`✅ docs/MAPA_AUTOMATICO.md gerado — ${infoPaginas.length} páginas, ${infoJs.length} JS compartilhados, ${secoesCodigo.length} seções de código, ${chaves.length} chaves de dados`);

// ---- Arquivo único pra colar/anexar em IAs de chat que não conseguem abrir o repositório ----
const partes = [
  ['AGENTS.md', 'GUIA PRINCIPAL'], ['docs/ESTRUTURA.md', 'ESTRUTURA'],
  ['docs/CONVENCOES.md', 'CONVENÇÕES'], ['docs/PUBLICACAO.md', 'PUBLICAÇÃO']
];
let ctx = `# CONTEXTO COMPLETO DO PROJETO BIOBEL (arquivo único para colar/anexar em uma IA)\n\n` +
  `> Gerado automaticamente por \`node tools/mapa.js\` — NÃO edite à mão. Versão do sistema: v${versao}.\n` +
  `> Instrução para a IA: leia tudo abaixo antes de responder. Depois, o usuário vai enviar a(s) página(s) do painel (ex.: dashboard.html) e/ou os arquivos JS compartilhados (biobel-app.js, biobel-shell.js) e dizer o que quer mudar.\n` +
  `> Responda em português simples, com emojis e negrito nas palavras-chave. Diga o que testou e o que não conseguiu testar.\n\n`;
partes.forEach(([f, t]) => { ctx += `\n\n---\n## ===== ${t} (${f}) =====\n\n` + ler(f).trim() + '\n'; });
fs.writeFileSync(path.join(raiz, 'docs', 'CONTEXTO_PARA_IA.md'), ctx);
console.log(`✅ docs/CONTEXTO_PARA_IA.md gerado — ${(ctx.length / 1024).toFixed(0)} KB (arquivo único para IAs de chat)`);
