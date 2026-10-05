/* Biobel — reconhecimento motivacional de vendas. v11.31
   Responsabilidade: detectar novas vendas acima de R$ 200 e exibir o reconhecimento.
   Mantém as funções públicas originais para compatibilidade com o restante do sistema.
*/
(function(){
"use strict";
function mostrarReconhecimentoVenda(venda){
 const valor=Number(venda?.valor)||0; if(valor<=200)return;
 const nome=String(venda?.vendedora||'Vendedora').trim();
 const valorFmt=typeof money==='function'?money(valor):('R$ '+valor.toFixed(2).replace('.',','));
 const mega=valor>400; let el=document.getElementById('celebracaoVendaBiobel');
 if(!el){ el=document.createElement('div'); el.id='celebracaoVendaBiobel';
  el.style.cssText='position:fixed;top:88px;left:50%;transform:translateX(-50%);width:min(580px,calc(100vw - 28px));color:#fff;border-radius:20px;padding:24px 50px 22px 20px;box-shadow:0 20px 55px rgba(0,0,0,.42);z-index:10060;text-align:center;';
  const close=document.createElement('button'); close.type='button'; close.textContent='×'; close.setAttribute('aria-label','Fechar reconhecimento');
  close.style.cssText='position:absolute;right:10px;top:9px;width:34px;height:34px;border:0;border-radius:9px;background:rgba(255,255,255,.14);color:#fff;font-size:26px;font-weight:900;cursor:pointer;'; close.onclick=()=>el.remove(); el.appendChild(close);
  const icon=document.createElement('div'); icon.id='reconhecimentoVendaIcon'; icon.style.cssText='font-size:40px;margin-bottom:5px;'; el.appendChild(icon);
  const title=document.createElement('div'); title.id='reconhecimentoVendaTitulo'; title.style.cssText='font-size:20px;font-weight:900;line-height:1.3;'; el.appendChild(title);
  const body=document.createElement('div'); body.id='reconhecimentoVendaTexto'; body.style.cssText='margin-top:9px;font-size:13.5px;line-height:1.6;white-space:pre-line;'; el.appendChild(body); document.body.appendChild(el); }
 el.style.background=mega?'linear-gradient(145deg,#542400,#b45309,#d97706)':'linear-gradient(145deg,#063d2d,#0b6b4d)';
 el.style.border=mega?'2px solid #fbbf24':'2px solid #27d7a0';
 const icon=el.querySelector('#reconhecimentoVendaIcon'), title=el.querySelector('#reconhecimentoVendaTitulo'), body=el.querySelector('#reconhecimentoVendaTexto');
 if(icon)icon.textContent=mega?'🏆🔥✨':'👏💚✨'; if(title)title.textContent=mega?'🚀 MEGA PARABÉNS, '+nome+'! 🚀':'👏 PARABÉNS, '+nome+'!';
 if(body)body.textContent=mega ? 'Você acaba de fazer uma MEGA venda de '+valorFmt+'! 🔥\n\nQue resultado incrível! Seu atendimento, sua dedicação e sua energia fizeram a diferença. Continue assim — você está mostrando que consegue ir cada vez mais longe! 🌟💪' : 'Você fez uma venda de '+valorFmt+'! 💚\n\nEstá acima de R$ 200 e merece ser reconhecida! Excelente trabalho, continue aproveitando cada oportunidade e atendendo seus clientes com esse mesmo carinho. 🚀✨';
 el.style.display='block'; }
function verificarVendasMotivacionais(){
 const todas=[]; (Array.isArray(daysData)?daysData:[]).forEach(d=>(d.registrosVendas||[]).forEach((v,idx)=>{ if(Number(v?.valor)>200)todas.push({ ...v, dia:d.dia, _idx:idx }); }));
 if(!todas.length)return; const assinatura=v=>[v.dia,v._idx,v.vendedora||'',Number(v.valor).toFixed(2),v.hora||''].join('|'); const assinaturas=todas.map(assinatura);
 let vistas=[]; try{vistas=JSON.parse(localStorage.getItem('biobel_vendas_motivacionais_v2')||'[]');if(!Array.isArray(vistas))vistas=[];}catch(e){vistas=[];}
 if(vistas.length===0){ const destaque=todas.slice().sort((a,b)=>Number(b.valor)-Number(a.valor))[0]; mostrarReconhecimentoVenda(destaque); }
 else{ const novas=todas.filter(v=>!vistas.includes(assinatura(v))).sort((a,b)=>Number(b.valor)-Number(a.valor)); novas.forEach((v,i)=>setTimeout(()=>mostrarReconhecimentoVenda(v),i*900)); }
 try{localStorage.setItem('biobel_vendas_motivacionais_v2',JSON.stringify(assinaturas.slice(-300)));}catch(e){} }
window.mostrarReconhecimentoVenda=mostrarReconhecimentoVenda; window.verificarVendasMotivacionais=verificarVendasMotivacionais;
window.addEventListener('biobel:data-updated',()=>setTimeout(verificarVendasMotivacionais,700)); setTimeout(verificarVendasMotivacionais,1800);})();