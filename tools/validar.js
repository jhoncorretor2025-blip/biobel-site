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
// Arquitetura de páginas separadas (desde v10.39): funções podem estar em arquivos .js
// compartilhados, referenciados via <script src="arquivo.js">. Carrega o texto desses
// arquivos locais (ignora CDN https://...) só para checar se handlers existem — não valida
// a sintaxe deles aqui (isso já é validado quando o próprio arquivo roda pelo Node).
const srcsLocais = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(s => !s.startsWith('http'));
let codigoExterno = '';
srcsLocais.forEach(src => {
  const caminho = path.join(path.dirname(arquivo), src);
  if (fs.existsSync(caminho)) codigoExterno += '\n' + fs.readFileSync(caminho, 'utf8');
});
if (srcsLocais.length) ok(`Lendo ${srcsLocais.length} script(s) local(is) referenciado(s): ${srcsLocais.join(', ')}`);
let codigoTodo = codigoExterno;
scripts.forEach((s, i) => {
  codigoTodo += '\n' + s;
  try { new Function(s); ok(`Script inline #${i} com sintaxe válida`); }
  catch (e) { erro(`Script inline #${i} com erro de sintaxe: ${e.message}`); }
});
const codigoInlineDoArquivo = scripts.join('\n');

// 2) balanceamento
const cont = (re) => (html.match(re) || []).length;
const dA = cont(/<div[\s>]/g), dF = cont(/<\/div>/g);
dA === dF ? ok(`<div> balanceados (${dA})`) : erro(`<div> desbalanceados: ${dA} abertos x ${dF} fechados`);
const sA = cont(/<section[\s>]/g), sF = cont(/<\/section>/g);
sA === sF ? ok(`<section> balanceadas (${sA})`) : erro(`<section> desbalanceadas: ${sA} x ${sF}`);

// 3) ids órfãos
const idsHtml = [...html.matchAll(/\bid="([^"$\{]+)"/g)].map(m => m[1]);
const idsSet = new Set(idsHtml);
// Importante: em scripts compartilhados entre páginas (arquitetura desde v10.39), o mesmo
// arquivo .js referencia getElementById de elementos de VÁRIAS páginas — cada uma só tem os
// seus próprios. Por isso essa checagem específica usa só o código DESTE arquivo (inline),
// não o codigoExterno, senão toda página reportaria "órfãos" que na verdade são de outra página.
const usados = new Set([...codigoInlineDoArquivo.matchAll(/getElementById\(\s*['"]([^'"$\{]+)['"]\s*\)/g)].map(m => m[1]));
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


// 8) referências locais de arquivos (não bloqueia arquivos legados conhecidos)
const REFERENCIAS_LOCAIS_CONHECIDAS = new Set(['script.js']);
const refs = [];
for (const m of html.matchAll(/<(?:script[^>]+src|link[^>]+href|img[^>]+src|iframe[^>]+src)=["']([^"'#]+)["']/gi)) {
  const ref = m[1].trim();
  if (!ref || /^(?:https?:|\/\/|data:|mailto:|tel:|javascript:)/i.test(ref)) continue;
  refs.push(ref.split('?')[0].split('#')[0].replace(/^\//, ''));
}
const refsUnicas = [...new Set(refs)];
function existeReferenciaLocal(ref) {
  const raizSite = path.join(__dirname, '..');
  const base = [path.join(raizSite, 'dashboard.html'), path.join(raizSite, 'index.html'), path.join(raizSite, 'login.html')].includes(path.resolve(arquivo))
    ? raizSite : path.dirname(path.resolve(arquivo));
  return fs.existsSync(path.resolve(base, ref));
}
const refsFaltando = refsUnicas.filter(ref => !existeReferenciaLocal(ref));
const refsLegadas = refsFaltando.filter(ref => REFERENCIAS_LOCAIS_CONHECIDAS.has(ref));
const refsNovas = refsFaltando.filter(ref => !REFERENCIAS_LOCAIS_CONHECIDAS.has(ref));
refsNovas.length ? erro('Referências locais quebradas: ' + refsNovas.join(', '))
                  : ok(`Referências locais válidas (${refsUnicas.length}); ${refsLegadas.length} legado(s) conhecido(s)`);

// 9) localStorage: chaves literais precisam usar o prefixo do projeto.
const chavesStorage = [...html.matchAll(/localStorage\.(?:getItem|setItem|removeItem)\(\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const chavesStorageForaPadrao = [...new Set(chavesStorage.filter(k => !k.startsWith('biobel_')))];
chavesStorageForaPadrao.length
  ? erro('Chaves literais de localStorage sem prefixo biobel_: ' + chavesStorageForaPadrao.join(', '))
  : ok(`Chaves literais de localStorage padronizadas (biobel_) — ${new Set(chavesStorage).size} encontradas`);

// 10) indicadores de dívida técnica — avisos, não bloqueiam publicação.
const ocorrenciasDate = (html.match(/\bnew\s+Date\s*\(/g) || []).length;
const anosFixos = [...new Set((html.match(/\b20\d{2}\b/g) || []).filter(a => a !== '2026'))];
const inlineCount = handlers.length;
if (ocorrenciasDate > 0) aviso(`Há ${ocorrenciasDate} uso(s) de new Date(); ao alterar datas, prefira obterAgoraBrasilia()`);
if (html.includes('2026')) aviso('Há referências ao ano 2026; ao alterar cálculos de datas, não fixe o ano atual no código');
if (anosFixos.length) aviso('Há anos literais adicionais no arquivo: ' + anosFixos.join(', '));
if (inlineCount > 0) aviso(`Há ${inlineCount} handler(s) inline (onclick/onchange/etc.); não é necessário migrar tudo agora`);

// 11) resumo estrutural para facilitar auditoria futura.
ok(`Resumo estrutural: ${idsHtml.length} IDs, ${definidas.size} funções detectadas, ${new Set(chavesStorage).size} chaves literais de localStorage, ${refsUnicas.length} referências locais`);

// 10) <style> abertos/fechados corretamente. Um <style> aberto duas vezes (ou sem fechar) faz o navegador
//     IGNORAR a primeira regra do bloco seguinte, sem dar erro nenhum — já quebrou os cards da tela
//     inicial em silêncio. Aqui só olhamos o HTML (fora de <script>).
(function(){
  const semScripts = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  let nivel = 0, aninhado = false, abertos = 0, fechados = 0;
  for (const m of semScripts.matchAll(/<style[^>]*>|<\/style>/gi)) {
    if (m[0].startsWith('</')) { fechados++; nivel--; }
    else { abertos++; nivel++; if (nivel > 1) aninhado = true; }
  }
  if (aninhado) erro('Há um <style> aberto dentro de outro <style> (falta um </style>). O CSS depois dele pode ser ignorado pelo navegador.');
  else if (abertos !== fechados) erro(`<style> desbalanceados: ${abertos} abertos x ${fechados} fechados.`);
  else ok(`<style> balanceados (${abertos})`);
})();

console.log(`\n${erros ? '🚫 REPROVADO' : '🟢 APROVADO'} — ${erros} erro(s), ${avisos} aviso(s)`);
process.exit(erros ? 1 : 0);
