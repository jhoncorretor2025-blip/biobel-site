#!/usr/bin/env node
/**
 * Gera docs/MAPA_AUTOMATICO.md a partir do dashboard.html real.
 * Rode depois de mudanças grandes:   node tools/mapa.js
 * (Não edite o MAPA_AUTOMATICO.md na mão — ele é sobrescrito. Explicações humanas ficam em docs/ESTRUTURA.md)
 */
const fs = require('fs');
const path = require('path');
const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'dashboard.html'), 'utf8');
const kb = f => { try { return (fs.statSync(path.join(raiz, f)).size / 1024).toFixed(0) + ' KB'; } catch (e) { return '—' } };

const abas = [...html.matchAll(/<section id="([A-Za-z]+Tab)"/g)].map(m => m[1]);
const botoesAba = [...html.matchAll(/id="(tab[A-Za-z]+)"[^>]*onclick="showTab\('([a-z]+)'\)"/g)].map(m => `${m[1]} → showTab('${m[2]}')`);
const secoesCodigo = [...html.matchAll(/\/\* ={3,}\s*([^*]+?)\s*={3,} \*\//g)].map(m => m[1].trim());
const funcoes = [...html.matchAll(/^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/gm)].map(m => m[1]);
const chaves = [...new Set([...html.matchAll(/['"](biobel_[a-z0-9_]+)['"]/g)].map(m => m[1]))].sort();
const cdns = [...new Set([...html.matchAll(/<script src="(https:[^"]+)"/g)].map(m => m[1]))];
const versao = (html.match(/id="versaoSistema"[^>]*>(v[\d.]+)</) || [])[1] || '?';
const dataV = (html.match(/id="versaoSistema"[^>]*onclick="mostrarToast\('[^']*em (\d\d\/\d\d\/\d{4})/) || [])[1] || '?';

// agrupa chaves por prefixo (2º pedaço: biobel_adm_*, biobel_equipe_* ...)
const grupos = {};
chaves.forEach(k => { const p = k.split('_')[1]; (grupos[p] = grupos[p] || []).push(k); });
const gruposOrdenados = Object.entries(grupos).sort((a, b) => b[1].length - a[1].length);

let md = `# 🗺️ Mapa automático do sistema (gerado por \`node tools/mapa.js\`)

> **Não edite à mão** — este arquivo é regenerado. Explicações humanas: [ESTRUTURA.md](ESTRUTURA.md).
> Gerado a partir do \`dashboard.html\` versão **${versao}** (${dataV}).

## Arquivos e tamanhos
| Arquivo | Tamanho |
|---|---|
| dashboard.html | ${kb('dashboard.html')} |
| index.html | ${kb('index.html')} |
| login.html | ${kb('login.html')} |
| style.css / extras.css | ${kb('style.css')} / ${kb('extras.css')} |
| service-worker.js | ${kb('service-worker.js')} |

## Abas do dashboard (\`<section id="...Tab">\`)
${abas.map(a => '- `' + a + '`').join('\n')}

Botões de aba: ${botoesAba.length ? botoesAba.map(b => '`' + b + '`').join(', ') : '(não detectados)'}

## Seções do código JavaScript (comentários \`/* ===== Nome ===== */\`)
Para achar uma: \`grep -n "===== Nome" dashboard.html\`
${secoesCodigo.map(s => '- ' + s).join('\n')}

## Funções globais: ${funcoes.length}
Para achar uma: \`grep -n "^function nome\\|^async function nome" dashboard.html\`

## Bibliotecas externas (CDN)
${cdns.map(c => '- ' + c).join('\n')}

## Chaves de dados no navegador: ${chaves.length}
Prefixo comum \`biobel_\`. Agrupadas pelo 1º termo depois do prefixo (chaves terminadas em \`_\` são prefixos + sufixo dinâmico):

${gruposOrdenados.map(([g, ks]) => `**${g}** (${ks.length}): ` + ks.map(k => '`' + k + '`').join(', ')).join('\n\n')}
`;
fs.mkdirSync(path.join(raiz, 'docs'), { recursive: true });
fs.writeFileSync(path.join(raiz, 'docs', 'MAPA_AUTOMATICO.md'), md);
console.log(`✅ docs/MAPA_AUTOMATICO.md gerado — ${abas.length} abas, ${secoesCodigo.length} seções de código, ${funcoes.length} funções, ${chaves.length} chaves de dados`);

// ---- Arquivo único pra colar/anexar em IAs de chat que não conseguem abrir o repositório ----
const ler = f => fs.readFileSync(path.join(raiz, f), 'utf8').trim();
const partes = [
  ['AGENTS.md', 'GUIA PRINCIPAL'], ['docs/ESTRUTURA.md', 'ESTRUTURA'],
  ['docs/CONVENCOES.md', 'CONVENÇÕES'], ['docs/PUBLICACAO.md', 'PUBLICAÇÃO']
];
let ctx = `# CONTEXTO COMPLETO DO PROJETO BIOBEL (arquivo único para colar/anexar em uma IA)\n\n` +
`> Gerado automaticamente por \`node tools/mapa.js\` — NÃO edite à mão. Versão do sistema: ${versao}.\n` +
`> Instrução para a IA: leia tudo abaixo antes de responder. Depois, o usuário vai enviar o \`dashboard.html\` (ou trechos dele) e dizer o que quer mudar.\n` +
`> Responda em português simples, com emojis e negrito nas palavras-chave. Diga o que testou e o que não conseguiu testar.\n\n`;
partes.forEach(([f, t]) => { ctx += `\n\n---\n## ===== ${t} (${f}) =====\n\n` + ler(f) + '\n'; });
fs.writeFileSync(path.join(raiz, 'docs', 'CONTEXTO_PARA_IA.md'), ctx);
console.log(`✅ docs/CONTEXTO_PARA_IA.md gerado — ${(ctx.length/1024).toFixed(0)} KB (arquivo único para IAs de chat)`);
