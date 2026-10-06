/* Biobel — reconhecimento motivacional de vendas. v11.48
   Responsabilidade: avisar, NO DIA, quando entra uma venda boa na planilha.

   ┌─ PARA MUDAR VALORES OU MENSAGENS: edite SÓ a lista FAIXAS logo abaixo. Nada mais precisa mudar. ─┐
   Faixas (venda individual; "acima" = estritamente maior que o valor):
     acima de R$ 150  → "Boa venda"            (aviso pequeno, some sozinho)
     acima de R$ 200  → "Parabéns"             (venda acima da média)
     acima de R$ 350  → "SUPER venda"          (mensagem grande)

   Regras de comportamento (não mexa sem motivo — cada uma evita um problema real):
   1. SÓ vendas de HOJE (data de Brasília) disparam aviso. Vendas de outros dias — mês antigo aberto para comparar,
      dado corrigido na planilha, aparelho que ficou desligado — são marcadas como vistas em silêncio.
   2. Cada venda é avisada UMA vez por aparelho (histórico em localStorage "biobel_vendas_motivacionais_v3").
   3. Aparelho que já usava a versão anterior (histórico "..._v2"): as vendas que já estão na planilha são marcadas
      como vistas em silêncio — senão baixar o piso para R$ 150 dispararia tudo de uma vez.
   4. Aparelho novo (sem histórico): marca tudo como visto e comemora só a MAIOR venda de hoje, se houver.
   5. Vendas novas chegando juntas entram numa FILA (maior primeiro). Cada aviso fica um tempo mínimo na tela;
      "Boa venda" some sozinho; "Parabéns" e "SUPER venda" ficam até fechar, a menos que haja outro esperando.
   6. Só roda depois de uma leitura REAL da planilha (evento biobel:data-updated) — nunca com os dados de exemplo.
   7. Nomes vêm da planilha: entram na tela só por textContent (nunca innerHTML).
*/
(function(){
"use strict";

/* ===================== FAIXAS — do maior valor para o menor ===================== */
const FAIXAS=[
 { id:'super', acima:350,
   icone:'🏆🔥✨', fundo:'linear-gradient(145deg,#4a1d00,#b45309,#f59e0b)', borda:'3px solid #fde68a',
   largura:'min(780px,calc(100vw - 24px))', padding:'34px 58px 30px 26px', tamIcone:'clamp(44px,9vw,76px)', tamTitulo:'clamp(23px,5.4vw,34px)', tamTexto:'clamp(15px,3.2vw,18px)',
   minMs:12000, fechaSozinha:false, brilho:true,
   titulo:n=>'🚀 SUPER VENDA'+(n?', '+n:'')+'! 🚀',
   texto:v=>'PARABÉNS! Você acaba de fazer uma SUPER venda de '+v+'! 🔥\n\nQue resultado incrível! Seu atendimento, sua dedicação e sua energia fizeram a diferença. Continue assim — você está mostrando que consegue ir cada vez mais longe! 🌟💪' },
 { id:'acima', acima:200,
   icone:'👏💚✨', fundo:'linear-gradient(145deg,#063d2d,#0b6b4d)', borda:'2px solid #27d7a0',
   largura:'min(580px,calc(100vw - 28px))', padding:'24px 50px 22px 20px', tamIcone:'40px', tamTitulo:'20px', tamTexto:'13.5px',
   minMs:8000, fechaSozinha:false, brilho:false,
   titulo:n=>'👏 PARABÉNS'+(n?', '+n:'')+'!',
   texto:v=>'Você fez uma venda acima da média: '+v+'! 💚\n\nExcelente trabalho — continue atendendo seus clientes com esse mesmo carinho. 🚀✨' },
 { id:'boa', acima:150,
   icone:'👍', fundo:'linear-gradient(145deg,#0f2a3d,#14546b)', borda:'2px solid #38bdf8',
   largura:'min(420px,calc(100vw - 28px))', padding:'16px 46px 15px 16px', tamIcone:'26px', tamTitulo:'17px', tamTexto:'13px',
   minMs:6000, fechaSozinha:true, brilho:false,
   titulo:n=>'Boa venda'+(n?', '+n:'')+'!',
   texto:v=>'Venda de '+v+'. Continue assim! 💚' }
];
const CHAVE='biobel_vendas_motivacionais_v3', CHAVE_ANTIGA='biobel_vendas_motivacionais_v2', LIMITE_HISTORICO=1500;

const faixaDe=valor=>FAIXAS.find(f=>valor>f.acima)||null;
const fmt=valor=>typeof money==='function'?money(valor):('R$ '+valor.toFixed(2).replace('.',','));
const porValorDesc=(a,b)=>Number(b.valor)-Number(a.valor);

/* ===================== Exibição (fila) ===================== */
const fila=[]; let atual=null, timerMin=null;

function garantirCss(){
 if(document.getElementById('reconhecimentoVendaCss'))return;
 const st=document.createElement('style'); st.id='reconhecimentoVendaCss';
 st.textContent='@keyframes reconhecimentoEntra{from{opacity:0;transform:translateX(-50%) translateY(-16px) scale(.95)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}'+
  '@keyframes reconhecimentoBrilho{0%,100%{box-shadow:0 20px 55px rgba(0,0,0,.42),0 0 0 0 rgba(251,191,36,.6)}50%{box-shadow:0 20px 55px rgba(0,0,0,.42),0 0 38px 10px rgba(251,191,36,.6)}}'+
  '@media (prefers-reduced-motion:reduce){#celebracaoVendaBiobel{animation:none!important}}';
 document.head.appendChild(st);
}
function fechar(){
 clearTimeout(timerMin); timerMin=null;
 if(atual){ atual.el.remove(); atual=null; }
 if(fila.length) setTimeout(proxima,250);
}
function proxima(){ if(atual||!fila.length)return; exibir(fila.shift()); }
function exibir(venda){
 const valor=Number(venda?.valor)||0, faixa=faixaDe(valor);
 if(!faixa){ proxima(); return; }
 garantirCss();
 const nome=String(venda?.vendedora||'').trim();
 const el=document.createElement('div'); el.id='celebracaoVendaBiobel'; el.setAttribute('role','status'); el.setAttribute('aria-live','polite'); el.setAttribute('data-faixa',faixa.id);
 el.style.cssText='position:fixed;top:88px;left:50%;transform:translateX(-50%);color:#fff;border-radius:20px;box-shadow:0 20px 55px rgba(0,0,0,.42);z-index:10060;text-align:center;'+
  'width:'+faixa.largura+';padding:'+faixa.padding+';background:'+faixa.fundo+';border:'+faixa.borda+';'+
  'animation:reconhecimentoEntra .35s ease-out'+(faixa.brilho?',reconhecimentoBrilho 1.6s ease-in-out .35s 4':'')+';';
 const close=document.createElement('button'); close.type='button'; close.textContent='×'; close.setAttribute('aria-label','Fechar reconhecimento');
 close.style.cssText='position:absolute;right:10px;top:9px;width:34px;height:34px;border:0;border-radius:9px;background:rgba(255,255,255,.14);color:#fff;font-size:26px;font-weight:900;cursor:pointer;';
 close.onclick=fechar; el.appendChild(close);
 const icon=document.createElement('div'); icon.id='reconhecimentoVendaIcon'; icon.style.cssText='font-size:'+faixa.tamIcone+';margin-bottom:5px;line-height:1.1;'; icon.textContent=faixa.icone; el.appendChild(icon);
 const title=document.createElement('div'); title.id='reconhecimentoVendaTitulo'; title.style.cssText='font-size:'+faixa.tamTitulo+';font-weight:900;line-height:1.25;'; title.textContent=faixa.titulo(nome); el.appendChild(title);
 const body=document.createElement('div'); body.id='reconhecimentoVendaTexto'; body.style.cssText='margin-top:9px;font-size:'+faixa.tamTexto+';line-height:1.6;white-space:pre-line;'; body.textContent=faixa.texto(fmt(valor)); el.appendChild(body);
 document.body.appendChild(el);
 atual={el,faixa,minPassou:false};
 // Tempo mínimo na tela. Depois dele: se há outro esperando, passa para o próximo; "Boa venda" some sozinha.
 timerMin=setTimeout(()=>{ if(!atual)return; atual.minPassou=true; if(fila.length||atual.faixa.fechaSozinha) fechar(); },faixa.minMs);
}
function enfileirar(venda){
 fila.push(venda);
 if(!atual) proxima();
 else if(atual.minPassou) fechar();   // o atual já cumpriu o tempo mínimo: dá lugar ao novo
}
function mostrarReconhecimentoVenda(venda){ if(faixaDe(Number(venda?.valor)||0)) enfileirar(venda); }

/* ===================== Detecção de vendas novas ===================== */
function lerLista(chave){
 try{ const t=localStorage.getItem(chave); if(t===null)return null; const l=JSON.parse(t); return Array.isArray(l)?l:[]; }catch(e){ return null; }
}
function chaveHoje(){
 const ag=typeof obterAgoraBrasilia==='function'?obterAgoraBrasilia():new Date();
 return String(ag.getDate()).padStart(2,'0')+'.'+String(ag.getMonth()+1).padStart(2,'0');   // mesmo formato do nome da aba: "06.10"
}
function verificarVendasMotivacionais(){
 const todas=[];
 (Array.isArray(daysData)?daysData:[]).forEach(d=>(d.registrosVendas||[]).forEach((v,idx)=>{ if(faixaDe(Number(v?.valor)||0)) todas.push({...v,dia:d.dia,_idx:idx}); }));
 // A hora fica FORA da assinatura: preencher a hora depois não pode fazer a mesma venda ser comemorada de novo.
 const assinatura=v=>[v.dia,v._idx,v.vendedora||'',Number(v.valor).toFixed(2)].join('|');
 const atuais=todas.map(assinatura), hoje=chaveHoje();
 let vistas=lerLista(CHAVE);
 if(vistas===null){
  // Primeira leitura real com esta versão neste aparelho.
  vistas=[];
  const jaUsavaAntes=lerLista(CHAVE_ANTIGA)!==null;           // regra 3: migração silenciosa
  if(!jaUsavaAntes){                                           // regra 4: aparelho novo comemora só a maior de hoje
   const deHoje=todas.filter(v=>String(v.dia)===hoje).sort(porValorDesc);
   if(deHoje.length) enfileirar(deHoje[0]);
  }
 }else{
  todas.filter(v=>String(v.dia)===hoje && !vistas.includes(assinatura(v))).sort(porValorDesc).forEach(enfileirar);   // regras 1 e 5
 }
 // União (não substituição): uma leitura parcial ou outro mês aberto não pode "esquecer" vendas e causar reaviso.
 const salvas=vistas.concat(atuais.filter(a=>!vistas.includes(a))).slice(-LIMITE_HISTORICO);
 try{ localStorage.setItem(CHAVE,JSON.stringify(salvas)); }catch(e){}
}

window.mostrarReconhecimentoVenda=mostrarReconhecimentoVenda;
window.verificarVendasMotivacionais=verificarVendasMotivacionais;
// Dá acesso às faixas (e à fila) para teste e ajuste fino pelo console, sem editar o arquivo.
window.biobelReconhecimento={ faixas:FAIXAS, faixaDe:v=>{const f=faixaDe(Number(v)||0);return f?f.id:null;}, tamanhoFila:()=>fila.length, faixaAtual:()=>atual?atual.faixa.id:null, fechar:fechar };
window.addEventListener('biobel:data-updated',()=>setTimeout(verificarVendasMotivacionais,700));
})();
