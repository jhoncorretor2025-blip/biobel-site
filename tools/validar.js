#!/usr/bin/env node
/**
 * Validador do dashboard.html — rode SEMPRE antes de publicar:
 *     node tools/validar.js            (valida ./dashboard.html)
 *     node tools/validar.js caminho.html
 *
 * O que confere:
 *   1. Sintaxe de cada <script> inline (new Function)
 *   2. Balanceamento de <div> e <section>
 *   3. IDs usados em getElementById('...') que não existem no HTML (ids órfãos)
 *   4. IDs duplicados no HTML
 *   5. Funções chamadas em onclick/onchange/etc. que não estão definidas
 *   6. Funções definidas duas vezes (a última vence — costuma ser bug)
 *   7. Versão do sistema: texto visível e mensagem do toast precisam bater
 * Sai com código 1 se achar ERRO. Avisos (⚠️) não bloqueiam, mas vale olhar.
 */
const fs = require('fs');
const path = require('path');
const arquivo = process.argv[2] || path.join(__dirname, '..', 'dashboard.html');
const html = fs.readFileSync(arquivo, 'utf8');
let erros = 0, avisos = 0;
const ok = m => console.log('✅ ' + m);
const erro = m => { erros++; console.log('❌ ' + m); };
const aviso = m => { avisos++; console.log('⚠️  ' + m); };

// IDs órfãos históricos, já confirmados como inofensivos (código legado que checa com if(!el)).
// Se aparecer um id NOVO fora desta lista, é bug — crie o elemento ou remova a chamada.
const ORFAOS_CONHECIDOS = new Set(['avgClosing','avisoPoucosDadosGastos','bannerEnviarContadoraCompleto',
  'btnRefreshCompleto','btnToggleLegendCompleto','maxClosing','salesDays','selectedClosing','selectedDay',
  'tableBody','toastBiobel','totalClosing','totalSales']);

// 1) sintaxe
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
let codigoTodo = '';
scripts.forEach((s, i) => {
  codigoTodo += '\n' + s;
  try { new Function(s); ok(`Script inline #${i} com sintaxe válida`); }
  catch (e) { erro(`Script inline #${i} com erro de sintaxe: ${e.message}`); }
});

// 2) balanceamento
const cont = (re) => (html.match(re) || []).length;
const dA = cont(/<div[\s>]/g), dF = cont(/<\/div>/g);
dA === dF ? ok(`<div> balanceados (${dA})`) : erro(`<div> desbalanceados: ${dA} abertos x ${dF} fechados`);
const sA = cont(/<section[\s>]/g), sF = cont(/<\/section>/g);
sA === sF ? ok(`<section> balanceadas (${sA})`) : erro(`<section> desbalanceadas: ${sA} x ${sF}`);

// 3) ids órfãos
const idsHtml = [...html.matchAll(/\bid="([^"$\{]+)"/g)].map(m => m[1]);
const idsSet = new Set(idsHtml);
const usados = new Set([...codigoTodo.matchAll(/getElementById\(\s*['"]([^'"$\{]+)['"]\s*\)/g)].map(m => m[1]));
const orfaos = [...usados].filter(id => !idsSet.has(id));
const novos = orfaos.filter(id => !ORFAOS_CONHECIDOS.has(id));
novos.length ? erro('getElementById para ids que NÃO existem no HTML: ' + novos.join(', '))
             : ok(`Nenhum id órfão novo (${orfaos.length} legados conhecidos e tolerados)`);

// 4) ids duplicados
const vistos = {}, dups = new Set();
idsHtml.forEach(id => { if (vistos[id]) dups.add(id); vistos[id] = true; });
dups.size ? aviso('IDs duplicados no HTML: ' + [...dups].join(', ')) : ok('Sem ids duplicados');

// 5) handlers inline apontando pra funções inexistentes
const definidas = new Set();
[...codigoTodo.matchAll(/(?:^|[\s;{}])(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)].forEach(m => definidas.add(m[1]));
[...codigoTodo.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>)/g)].forEach(m => definidas.add(m[1]));
const NATIVAS = new Set(['alert','confirm','prompt','if','return','event','this','document','window','localStorage','sessionStorage','setTimeout','history','location','navigator','parseInt','parseFloat','Number','String','Math','Date','JSON','Array','Object','showTab']);
const handlers = [...html.matchAll(/\bon(?:click|change|input|blur|focus|submit|keydown|keyup)="([^"]+)"/g)].map(m => m[1]);
const faltando = new Set();
handlers.forEach(h => {
  [...h.matchAll(/(?:^|[;\s(!&|{}])([A-Za-z_$][\w$]*)\s*\(/g)].forEach(m => {
    const nome = m[1];
    if (!definidas.has(nome) && !NATIVAS.has(nome) && !/^(?:this|el|e)$/.test(nome)) faltando.add(nome);
  });
});
// remove métodos encadeados óbvios (ex: .style.display...) — só sobra o que parece função global
const faltandoReal = [...faltando].filter(n => !html.includes('.' + n + '(') || definidas.has(n));
faltandoReal.length ? erro('Handlers inline chamam funções que não existem: ' + faltandoReal.join(', '))
                    : ok(`Todos os handlers inline apontam pra funções existentes (${handlers.length} conferidos)`);

// 6) funções definidas duas vezes
const contagemFn = {};
[...codigoTodo.matchAll(/^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/gm)].forEach(m => { contagemFn[m[1]] = (contagemFn[m[1]] || 0) + 1; });
const repetidas = Object.entries(contagemFn).filter(([, n]) => n > 1).map(([f, n]) => `${f}(${n}x)`);
repetidas.length ? aviso('Funções definidas mais de uma vez (a última vence): ' + repetidas.join(', '))
                 : ok('Nenhuma função definida em duplicidade');

// 7) versão
const spanV = html.match(/id="versaoSistema"[^>]*onclick="mostrarToast\('[^']*versão (v[\d.]+)'\)"[^>]*>(v[\d.]+)</);
if (!spanV) aviso('Não achei o span #versaoSistema — a versão não foi conferida');
else if (spanV[1] !== spanV[2]) erro(`Versão inconsistente: toast diz ${spanV[1]} mas o texto visível diz ${spanV[2]}`);
else ok(`Versão do sistema consistente: ${spanV[2]}`);

console.log(`\n${erros ? '🚫 REPROVADO' : '🟢 APROVADO'} — ${erros} erro(s), ${avisos} aviso(s)`);
process.exit(erros ? 1 : 0);
