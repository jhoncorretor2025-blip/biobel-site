#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const shell = fs.readFileSync(path.join(root, 'biobel-shell.js'), 'utf8');
const match = shell.match(/BIOBEL_VERSION\s*=\s*"([^"]+)"/);
if (!match) {
  console.error('❌ BIOBEL_VERSION não encontrada no biobel-shell.js');
  process.exit(1);
}
const version = match[1].replace(/^v/, '');

const pages = [
  'dashboard.html','operacao.html','equipe.html','vendas.html','analises.html',
  'alertas.html','config.html','administracao.html','administracao/fornecedor.html','backup.html'
];

let errors = 0;
for (const file of pages) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const refs = [...html.matchAll(/(?:\?|&)v=([^"'&\s>]+)/g)].map(m => m[1]);
  const unique = [...new Set(refs)];
  const bad = unique.filter(v => v !== version);
  if (bad.length) {
    console.error(`❌ ${file}: cache-busting ${bad.join(', ')}; esperado ${version}`);
    errors++;
  } else {
    console.log(`✅ ${file}: ${version}`);
  }
}

if (errors) {
  console.error('\n🚫 Versionamento inconsistente.');
  process.exit(1);
}
console.log(`\n🟢 Versionamento consistente: v${version}`);
