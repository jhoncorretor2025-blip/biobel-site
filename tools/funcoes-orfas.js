#!/usr/bin/env node
/**
 * Procura FUNÇÕES ÓRFÃS: definidas em algum arquivo mas que NINGUÉM chama (nem em .js, nem em onclick do HTML).
 *
 *     node tools/funcoes-orfas.js
 *
 * Por que existe: ao dividir o sistema em páginas (29/09) e ao reescrever a leitura da planilha (05/10), chamadas de
 * inicialização ficaram para trás e RECURSOS PARARAM DE RODAR SEM ERRO NENHUM por semanas:
 *   - buscarClimaAutomaticoHoje()      -> o clima de hoje nunca mais era detectado (cartão ficava em "—");
 *   - initLogoBiobelUI(), initMetasLongoPrazoUI(), initLinkTrabalheConoscoUI(), initProvedorEmailUI()
 *                                      -> a tela de Configuração aparecia com TODOS os campos vazios, mesmo com tudo salvo.
 * Uma função órfã é o sintoma clássico: o código existe, mas o "liga" sumiu.
 *
 * É uma AUDITORIA (informativa): sai com código 0. Mostra só as órfãs NOVAS, que não estão na lista CONHECIDAS abaixo.
 * Ao criar uma função, chame-a. Ao confirmar que uma órfã é lixo, apague-a; ao confirmar que é intencional, anote aqui.
 */
const fs = require('fs');
const path = require('path');
const raiz = path.join(__dirname, '..');

// Órfãs já analisadas em 06/10/2026 (cada uma com o motivo). A lista deve ENCOLHER com o tempo.
const CONHECIDAS = {
  // --- recursos que PERDERAM a chamada e merecem ser religados (decisão do dono) ---
  salvarUltimaLeituraPlanilha: 'sem ela, "mostrar a última leitura salva" (offline/instantâneo) nunca funciona; perdeu a chamada no v11.33',
  carregarMesAtualViaGviz: 'leitor de reserva (gviz) que deixou de ser usado na reescrita da leitura (v11.29/v11.33)',
  carregarPlanilhaViaGoogleVisualizationDireta: 'idem: leitor de reserva (gviz)',
  // --- intencionais / código morto / falso positivo ---
  setPlanilhaLoading: 'a faixa de status do topo foi removida de propósito no v11.10',
  printDaily: 'código morto: nenhuma tela chama e o #daySelect não existe mais',
  iniciarAssistenteOperacional: 'falso positivo: é o nome de uma função auto-executável (IIFE), roda sozinha',
  // --- ainda NÃO analisadas (verificar antes de apagar) ---
  abrirAbaCadastro: '', alternarMenuFerramentas: '', alternarMenuMais: '', ativarModoApresentacao: '', entrarFornecedores: '',
  formatarDataCurtaFinanceira: '', gerarDatasComerciais: '', gerarRelatorioMensalPDF: '', initFonteBiobel: '', initModoCompacto: '',
  irParaFerramenta: '', irParaSecaoAdm: '', irParaTabViaMenu: '', period: '', renderHistoricoPrecoFornecedor: '',
  salvarDadosFornecedor: '', tituloCard: '', toggleLegend: '',
};

const arquivos = [];
for (const dir of ['.', 'administracao']) {
  const d = path.join(raiz, dir);
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) {
    if ((f.endsWith('.js') && f !== 'service-worker.js') || f.endsWith('.html')) arquivos.push(path.join(dir, f));
  }
}
const textos = arquivos.map((f) => [f, fs.readFileSync(path.join(raiz, f), 'utf8')]);
const tudo = textos.map(([, t]) => t).join('\n');

const definidas = new Map();
for (const [f, t] of textos) {
  for (const m of t.matchAll(/(?:^|[\s;{}(])(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)) if (!definidas.has(m[1])) definidas.set(m[1], f);
}
const orfas = [];
for (const [nome, f] of definidas) {
  const usos = (tudo.match(new RegExp('(?<![\\w$.])' + nome.replace(/\$/g, '\\$') + '(?![\\w$])', 'g')) || []).length;
  if (usos <= 1) orfas.push([nome, f]);   // 1 = só a própria definição
}
const novas = orfas.filter(([n]) => !(n in CONHECIDAS));
const sumiram = Object.keys(CONHECIDAS).filter((n) => !orfas.some(([o]) => o === n));

console.log(`Funções definidas: ${definidas.size} | órfãs: ${orfas.length} (${orfas.length - novas.length} já conhecidas, ${novas.length} NOVAS)`);
if (novas.length) {
  console.log('\n⚠️  ÓRFÃS NOVAS — alguém definiu (ou deixou de chamar) estas funções. Algum recurso pode ter parado:');
  novas.sort().forEach(([n, f]) => console.log(`   ${n.padEnd(44)} ${f}`));
  console.log('\n   Para cada uma: (a) falta a chamada que a liga? religue. (b) é lixo? apague. (c) é intencional? anote em CONHECIDAS.');
} else {
  console.log('✅ Nenhuma órfã nova.');
}
if (sumiram.length) console.log(`\nℹ️  Boas notícias — estas "conhecidas" já não são órfãs (podem sair da lista): ${sumiram.join(', ')}`);
process.exit(0);
