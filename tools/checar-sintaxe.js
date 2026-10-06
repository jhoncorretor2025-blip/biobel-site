#!/usr/bin/env node
/**
 * Checagem RÁPIDA (~1 segundo) de tudo que, se estiver errado, deixa o sistema PARADO.
 *
 *     node tools/checar-sintaxe.js
 *
 * RODE ANTES DE TODO COMMIT. (Com o workflow tools/github-validar.yml instalado em .github/workflows/,
 * o GitHub também roda isto sozinho a cada envio: ❌ vermelho no commit = NÃO ignore.)
 *
 * Por que existe: em 05/10/2026 um erro de sintaxe no biobel-app.js (função sem o `)();` no final)
 * fez o navegador descartar o arquivo inteiro. O sistema ficou parado em "Conectando..." com tudo
 * zerado e ~17 commits tentaram "consertar a leitura da planilha" sem que ninguém olhasse a
 * sintaxe — nenhum podia funcionar. Esta checagem pega isso em 1 segundo.
 *
 * Confere:
 *   1. Sintaxe de cada arquivo .js do projeto (raiz, administracao/, tools/).
 *   2. Sintaxe de cada <script> escrito dentro dos .html.
 *   3. Cada <script src="..."> local aponta pra um arquivo que existe.
 *   4. Nas páginas que carregam o biobel-app.js: os módulos vêm ANTES dele, todos presentes.
 *   5. <style> aberto dentro de outro / sem fechar (o navegador ignora CSS em silêncio).
 *
 * Sai com código 1 se achar qualquer ❌.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const raiz = path.join(__dirname, '..');
let erros = 0, avisos = 0, conferidos = 0;
const erro = (m) => { erros++; console.log('❌ ' + m); };
const aviso = (m) => { avisos++; console.log('⚠️  ' + m); };

// Módulos que o biobel-app.js usa já no carregamento. Ao criar um módulo novo, inclua aqui e nas páginas.
const MODULOS_OBRIGATORIOS = [
  'biobel-recognition.js',
  'biobel-planilha-leitura.js',
  'biobel-planilha-processamento.js',
  'biobel-planilha-comparacao.js',
];
const REFERENCIAS_CONHECIDAS = new Set(['script.js']); // legado: index.html aponta pra um script.js que não existe
const limparSrc = (s) => s.split('?')[0].split('#')[0]; // tira o cache-busting (?v=11.43)

function listar(pasta, ext) {
  const dir = path.join(raiz, pasta);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(ext)).map((f) => path.join(pasta, f));
}
const arquivosJs = [...listar('.', '.js'), ...listar('administracao', '.js'), ...listar('tools', '.js')];
const arquivosHtml = [...listar('.', '.html'), ...listar('administracao', '.html')];

function checarSintaxe(texto, nome) {
  try {
    new vm.Script(texto, { filename: nome });
    return null;
  } catch (e) {
    // e.stack começa com "arquivo:linha\n<código>\n   ^^^\nSyntaxError: mensagem"
    const partes = String(e.stack || e.message).split('\n').filter(Boolean);
    return partes.slice(0, 3).join(' | ') + ' | ' + e.message;
  }
}

// 1) arquivos .js
for (const f of arquivosJs) {
  conferidos++;
  const msg = checarSintaxe(fs.readFileSync(path.join(raiz, f), 'utf8'), f);
  if (msg) erro(`${f} TEM ERRO DE SINTAXE (o navegador descarta o arquivo inteiro): ${msg}`);
}

// 2..5) arquivos .html
for (const f of arquivosHtml) {
  const html = fs.readFileSync(path.join(raiz, f), 'utf8');
  const dirHtml = path.dirname(path.join(raiz, f));

  // 2) scripts inline (ignora JSON/templates: só <script> comum ou type=text/javascript|module)
  [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)].forEach((m, i) => {
    const attrs = m[1] || '';
    if (/\bsrc\s*=/.test(attrs)) return;
    const tipo = (attrs.match(/\btype\s*=\s*["']([^"']+)["']/i) || [])[1];
    if (tipo && !/^(text\/javascript|module|application\/javascript)$/i.test(tipo)) return;
    if (!m[2].trim()) return;
    conferidos++;
    const msg = checarSintaxe(m[2], `${f} (script inline #${i})`);
    if (msg) erro(`${f}: script inline #${i} com erro de sintaxe: ${msg}`);
  });

  // 3) scripts locais existem
  const srcs = [...html.matchAll(/<script[^>]*\bsrc\s*=\s*"([^"]+)"/gi)].map((m) => m[1]).filter((s) => !/^(https?:)?\/\//.test(s));
  for (const src of srcs) {
    const alvo = path.join(dirHtml, limparSrc(src));
    if (fs.existsSync(alvo)) continue;
    const msg = `${f}: <script src="${src}"> aponta pra um arquivo que NÃO existe.`;
    REFERENCIAS_CONHECIDAS.has(limparSrc(src)) ? aviso(msg + ' (legado conhecido)') : erro(msg);
  }

  // 4) ordem dos módulos nas páginas do painel
  const nomes = srcs.map((s) => path.basename(limparSrc(s)));
  const iApp = nomes.indexOf('biobel-app.js');
  if (iApp >= 0) {
    const faltando = MODULOS_OBRIGATORIOS.filter((m) => !nomes.includes(m));
    const depois = MODULOS_OBRIGATORIOS.filter((m) => nomes.indexOf(m) > iApp);
    if (faltando.length) erro(`${f}: módulo(s) NÃO carregado(s): ${faltando.join(', ')} (precisam de <script src> ANTES do biobel-app.js).`);
    else if (depois.length) erro(`${f}: módulo(s) carregado(s) DEPOIS do biobel-app.js: ${depois.join(', ')}. Mova para antes.`);
  }

  // 5) <style> aninhado / desbalanceado (fora de <script>)
  const semScripts = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  let nivel = 0, aninhado = false, abertos = 0, fechados = 0;
  for (const m of semScripts.matchAll(/<style[^>]*>|<\/style>/gi)) {
    if (m[0].startsWith('</')) { fechados++; nivel--; } else { abertos++; nivel++; if (nivel > 1) aninhado = true; }
  }
  if (aninhado) erro(`${f}: há um <style> aberto dentro de outro (falta um </style>). O CSS seguinte pode ser ignorado.`);
  else if (abertos !== fechados) erro(`${f}: <style> desbalanceados (${abertos} abertos x ${fechados} fechados).`);
}

console.log(`\nConferidos: ${arquivosJs.length} arquivos .js, ${arquivosHtml.length} páginas .html, ${conferidos} blocos de código.`);
console.log(erros ? `🚫 REPROVADO — ${erros} erro(s), ${avisos} aviso(s). NÃO publique antes de corrigir.`
                  : `🟢 APROVADO — 0 erro(s), ${avisos} aviso(s).`);
process.exit(erros ? 1 : 0);
