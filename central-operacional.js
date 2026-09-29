
(function(){
"use strict";
var K="biobel_central_v10_35",S={tasks:[],agenda:[],stock:[],occ:[],maint:[],accounts:[]};
try{S=Object.assign(S,JSON.parse(localStorage.getItem(K)||"{}")||{});}catch(e){}
function save(){try{localStorage.setItem(K,JSON.stringify(S));}catch(e){}}
function n(v){return Number(String(v||"").replace(".","").replace(",","."))||0}
function esc(v){return String(v||"").replace(/[&<>"']/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]})}
function br(v){if(!v)return "—";var p=v.split("-");return p.length===3?p[2]+"/"+p[1]+"/"+p[0]:v}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function m(v){return typeof money==="function"?money(n(v)):new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n(v))}
function d(){
 try{
  return Array.isArray(daysData) ? daysData : (Array.isArray(window.daysData) ? window.daysData : []);
 }catch(e){
  return Array.isArray(window.daysData) ? window.daysData : [];
 }
}
function st(){var a=d(),t=a.reduce(function(x,y){return x+n(y.sales)},0),g=typeof getSalesGoal==="function"?n(getSalesGoal()):0;return{a:a,t:t,g:g,p:g?t/g*100:0,c:a.filter(function(x){return n(x.sales)>0}).length}}
function render(){
ensure();var t=st(),a=t.a,b=document.getElementById("co12");
if(!b)return;
var mid=Math.floor(a.length/2),x=a.slice(0,mid).reduce(function(s,y){return s+n(y.sales)},0),y=a.slice(mid).reduce(function(s,z){return s+n(z.sales)},0),delta=x?((y-x)/x*100):0;
b.innerHTML='<div class="co12hero"><div><b>🧭 CENTRAL OPERACIONAL · v10.36</b><h2>Tudo que precisa de atenção em um só lugar</h2><small>Vendas continuam vindo da planilha. Registros desta Central ficam somente no armazenamento local do navegador.</small></div><button onclick="showTab(\'dashboard\')">← Voltar</button></div>'+
'<div class="co12kpis"><div><small>Faturamento</small><strong>'+m(t.t)+'</strong></div><div><small>Meta</small><strong>'+m(t.g)+'</strong></div><div><small>Atingimento</small><strong>'+(t.g?t.p.toFixed(1)+"%":"—")+'</strong></div><div><small>Dias com venda</small><strong>'+t.c+'</strong></div></div>'+
'<div class="co12grid"><section><h3>📌 Tarefas + agenda</h3><div class="co12form"><input id="ct" placeholder="Tarefa"><input id="cd" type="date"><button onclick="cAddTask()">Adicionar</button></div><div id="ctlist"></div><div class="co12form"><input id="ca" placeholder="Compromisso"><input id="cad" type="date"><button onclick="cAddAgenda()">Agendar</button></div><div id="calist"></div></section><section><h3>🔔 Notificações</h3><div id="cnot"></div></section></div>'+
'<div class="co12grid"><section><h3>📊 Painel executivo</h3><p>Ticket médio diário: <b>'+m(t.c?t.t/t.c:0)+'</b></p><p>Tendência: <b>'+(delta>5?"📈 Acelerando":delta<-5?"📉 Desacelerando":"➡️ Estável")+'</b> ('+delta.toFixed(1)+'%)</p><p>Melhor dia: <b>'+esc((a.slice().sort(function(q,r){return n(r.sales)-n(q.sales)})[0]||{}).dia||"—")+'</b></p></section><section><h3>🎯 Simuladores</h3><div class="co12form"><input id="cg" type="number" placeholder="Venda/dia"><button onclick="cGoal()">Simular meta</button></div><div id="cgr"></div><div class="co12form"><input id="cc" type="number" placeholder="Comissão %"><button onclick="cComm()">Simular comissão</button></div><div id="ccr"></div></section></div>'+
'<div class="co12grid"><section><h3>💳 Contas + conciliação</h3><div class="co12form"><input id="cb" placeholder="Descrição"><input id="cv" type="number" step=".01" placeholder="Valor"><select id="cty"><option>Receber</option><option>Pagar</option></select><button onclick="cAccount()">Registrar</button></div><div id="clist"></div><button onclick="cRecon()">🔎 Comparar com planilha</button><div id="crec"></div></section><section><h3>📦 Estoque + compras</h3><div class="co12form"><input id="sn" placeholder="Produto"><input id="sq" type="number" placeholder="Atual"><input id="sm" type="number" placeholder="Mínimo"><button onclick="cStock()">Salvar</button></div><div id="slist"></div></section></div>'+
'<div class="co12grid"><section><h3>📝 Ocorrências</h3><div class="co12form"><input id="on" placeholder="Ocorrência"><input id="or" placeholder="Responsável"><button onclick="cOcc()">Registrar</button></div><div id="olist"></div></section><section><h3>🛠️ Manutenção</h3><div class="co12form"><input id="mn" placeholder="Equipamento/serviço"><input id="md" type="date"><input id="mc" type="number" step=".01" placeholder="Custo"><button onclick="cMaint()">Registrar</button></div><div id="mlist"></div></section></div>'+
'<div class="co12grid"><section><h3>📤 Exportações</h3><button onclick="cExport(\'csv\')">CSV</button> <button onclick="cExport(\'txt\')">TXT</button> <button onclick="window.print()">PDF / Imprimir</button><p class="co12muted">Central de exportações sem alterar a planilha.</p></section><section><h3>🤖 Assistente interno</h3><div class="co12form"><input id="ask" placeholder="faturamento, meta, tendência, vendedora"><button onclick="cAsk()">Perguntar</button></div><div id="ans" class="co12ans">Consulta os dados atuais da planilha.</div></section></div>';
var today=new Date().toISOString().slice(0,10);
document.getElementById("cd").value=today;document.getElementById("cad").value=today;
document.getElementById("ctlist").innerHTML=S.tasks.map(function(q){return '<div class="co12row">'+(q.done?"✅":"⬜")+" "+esc(q.text)+' <small>'+br(q.date)+'</small> <button onclick="cTask(\''+q.id+'\')">'+(q.done?"Reabrir":"Concluir")+'</button></div>'}).join("")||"<small>Sem tarefas.</small>";
document.getElementById("calist").innerHTML=S.agenda.map(function(q){return '<div class="co12row">📅 '+esc(q.text)+" — "+br(q.date)+' <button onclick="cDel(\'agenda\',\''+q.id+'\')">×</button></div>'}).join("")||"<small>Agenda vazia.</small>";
var no=[];S.tasks.filter(function(q){return !q.done&&q.date<=today}).forEach(function(q){no.push("🚨 "+esc(q.text))});S.stock.filter(function(q){return n(q.q)<=n(q.min)}).forEach(function(q){no.push("📦 Estoque baixo: "+esc(q.name))});S.maint.filter(function(q){return q.date&&q.date<=today}).forEach(function(q){no.push("🛠️ Manutenção: "+esc(q.name))});document.getElementById("cnot").innerHTML=no.length?no.map(function(q){return '<div class="co12row">'+q+"</div>"}).join(""):"<span class='co12ok'>✅ Nenhuma pendência crítica.</span>";
document.getElementById("clist").innerHTML=S.accounts.map(function(q){return '<div class="co12row">'+(q.type==="Pagar"?"🔴":"🟢")+" "+esc(q.name)+" — "+m(q.value)+' <button onclick="cDel(\'accounts\',\''+q.id+'\')">×</button></div>'}).join("")||"<small>Sem contas locais.</small>";
document.getElementById("slist").innerHTML=S.stock.map(function(q){var low=n(q.q)<=n(q.min);return '<div class="co12row">📦 '+esc(q.name)+" "+q.q+"/"+q.min+" — "+(low?"<b class='co12danger'>COMPRAR</b>":"<b class='co12ok'>OK</b>")+' <button onclick="cDel(\'stock\',\''+q.id+'\')">×</button></div>'}).join("")||"<small>Sem estoque cadastrado.</small>";
document.getElementById("olist").innerHTML=S.occ.map(function(q){return '<div class="co12row">📝 '+esc(q.text)+" — "+esc(q.resp)+' <button onclick="cDel(\'occ\',\''+q.id+'\')">×</button></div>'}).join("")||"<small>Sem ocorrências.</small>";
document.getElementById("mlist").innerHTML=S.maint.map(function(q){return '<div class="co12row">🛠️ '+esc(q.name)+" — "+br(q.date)+" — "+m(q.cost)+' <button onclick="cDel(\'maint\',\''+q.id+'\')">×</button></div>'}).join("")||"<small>Sem manutenções.</small>";
}
function ensure(){if(document.getElementById("co12"))return;var s=document.createElement("section");s.id="centralTab";s.className="hidden max-w-7xl mx-auto p-4 md:p-6";var d=document.createElement("div");d.id="co12";s.appendChild(d);document.body.appendChild(s)}
function css(){if(document.getElementById("co12css"))return;var s=document.createElement("style");s.id="co12css";s.textContent=".co12hero{display:flex;justify-content:space-between;gap:15px;padding:18px;border:1px solid #29405e;border-radius:16px;background:#0d1a2c}.co12hero b{color:#27d7a0;font-size:11px}.co12hero h2{margin:5px 0;font-size:21px}.co12hero small,.co12muted{color:#93a3ba}.co12kpis,.co12grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:12px}.co12kpis{grid-template-columns:repeat(4,1fr)}.co12kpis>div,.co12grid section{background:#0d1a2c;border:1px solid #20334e;border-radius:16px;padding:14px}.co12kpis small{color:#93a3ba}.co12kpis strong{display:block;font-size:20px;margin-top:4px}.co12grid h3{font-size:14px;margin:0 0 10px}.co12form{display:flex;gap:6px;flex-wrap:wrap;margin:7px 0}.co12form input,.co12form select{flex:1;min-width:120px;background:#081426;color:#fff;border:1px solid #29405e;border-radius:8px;padding:9px}.co12grid button,.co12hero button{background:#0b1728;color:#dce5f2;border:1px solid #29405e;border-radius:8px;padding:8px 10px;font-weight:800}.co12row{padding:8px 0;border-bottom:1px solid #20334e;font-size:12px}.co12row small{color:#93a3ba}.co12ok{color:#27d7a0}.co12danger{color:#ff6174}.co12ans{padding:10px;background:#0b1728;border-radius:9px;font-size:12px}@media(max-width:760px){.co12hero{display:block}.co12kpis,.co12grid{grid-template-columns:1fr}.co12form input,.co12form select,.co12form button{width:100%;min-height:42px}}";document.head.appendChild(s)}
window.cAddTask=function(){var x=document.getElementById("ct");if(!x.value)return;S.tasks.push({id:uid(),text:x.value,date:document.getElementById("cd").value,done:false});x.value="";save();render()}
window.cAddAgenda=function(){var x=document.getElementById("ca");if(!x.value)return;S.agenda.push({id:uid(),text:x.value,date:document.getElementById("cad").value});x.value="";save();render()}
window.cTask=function(id){var x=S.tasks.find(function(q){return q.id===id});if(x)x.done=!x.done;save();render()}
window.cDel=function(t,id){S[t]=S[t].filter(function(q){return q.id!==id});save();render()}
window.cAccount=function(){var x=document.getElementById("cb"),v=document.getElementById("cv");if(!x.value||!v.value)return;S.accounts.push({id:uid(),name:x.value,value:n(v.value),type:document.getElementById("cty").value});x.value="";v.value="";save();render()}
window.cStock=function(){var x=document.getElementById("sn");if(!x.value)return;S.stock.push({id:uid(),name:x.value,q:n(document.getElementById("sq").value),min:n(document.getElementById("sm").value)});x.value="";save();render()}
window.cOcc=function(){var x=document.getElementById("on");if(!x.value)return;S.occ.push({id:uid(),text:x.value,resp:document.getElementById("or").value});x.value="";save();render()}
window.cMaint=function(){var x=document.getElementById("mn");if(!x.value)return;S.maint.push({id:uid(),name:x.value,date:document.getElementById("md").value,cost:n(document.getElementById("mc").value)});x.value="";save();render()}
window.cGoal=function(){var t=st(),v=n(document.getElementById("cg").value);document.getElementById("cgr").innerHTML="Projeção: <b>"+m(v*t.a.length)+"</b>. Diferença para meta: <b>"+m(v*t.a.length-t.g)+"</b>."}
window.cComm=function(){var t=st(),v=n(document.getElementById("cc").value);document.getElementById("ccr").innerHTML="Comissão estimada: <b>"+m(t.t*v/100)+"</b>."}
window.cRecon=function(){var t=st(),r=S.accounts.filter(function(x){return x.type==="Receber"}).reduce(function(a,x){return a+n(x.value)},0);document.getElementById("crec").innerHTML="<small>Planilha: "+m(t.t)+" • Receber local: "+m(r)+" • Diferença: "+m(t.t-r)+" (informativa).</small>"}
window.cExport=function(type){var t=st(),z="Biobel Central v10.36\nFaturamento: "+m(t.t)+"\nMeta: "+m(t.g)+"\nAtingimento: "+(t.g?t.p.toFixed(1)+"%":"—")+"\nDias com venda: "+t.c;var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([type==="csv"?"Campo;Valor\nFaturamento;"+t.t+"\nMeta;"+t.g+"\nDias;"+t.c:z],{type:type==="csv"?"text/csv":"text/plain"}));a.download="biobel-central-v10-12."+type;a.click()}
window.cAsk=function(){var q=document.getElementById("ask").value.toLowerCase(),t=st(),a=/meta/.test(q)?"🎯 Meta: "+m(t.g)+". Atingimento: "+(t.g?t.p.toFixed(1)+"%":"não configurada"):/tend|cres|queda/.test(q)?"📈 Veja o painel executivo para a tendência calculada sobre as duas metades do período.":/vended/.test(q)?"👥 Os dados de vendedoras vêm da planilha carregada.":"💰 Faturamento atual: "+m(t.t)+" em "+t.c+" dias com venda.";document.getElementById("ans").innerHTML=a}
var old=window.showTab;window.showTab=function(tab){ensure();var ct=document.getElementById("centralTab");if(ct)ct.classList.add("hidden");if(tab==="central"){if(old)old("dashboard");document.querySelectorAll("main[id$='Tab'],section[id$='Tab']").forEach(function(x){x.classList.add("hidden")});document.getElementById("centralTab").classList.remove("hidden");document.title="Central Operacional — Biobel";render();return}if(old)old(tab)}
function nav(){var d=document.querySelector(".biobel-nav-links");if(d&&!document.getElementById("navCentralBtn")){var b=document.createElement("button");b.id="navCentralBtn";b.className="biobel-nav-item";b.innerHTML="🧭 <span>Central</span>";b.onclick=function(){showTab("central")};d.insertBefore(b,d.children[1]||null)}var m=document.getElementById("menuMaisDropdown");if(m&&!document.getElementById("mobCentral")){var x=document.createElement("button");x.id="mobCentral";x.innerHTML="🧭 Central Operacional";x.onclick=function(){m.style.display="none";showTab("central")};m.insertBefore(x,m.children[1]||null)}}
window.renderCentralOperacional=render;
window.addEventListener('biobel:data-updated',function(){
  var tab=document.getElementById('centralTab');
  if(tab && !tab.classList.contains('hidden')) render();
});
function init(){ensure();css();nav();render()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
window.addEventListener("load",nav,{once:true})
})();
/* v10.16 — Navegação protegida de Configuração e Administração.
   Este bloco fica separado para corrigir a navegação sem mexer no núcleo do leitor de planilha. */
(function(){
 "use strict";
 function abrirAreaProtegida(tab){
  try{
   if(typeof window.showTab!=="function") throw new Error("showTab indisponível");
   window.showTab(tab);
   window.scrollTo({top:0,behavior:"smooth"});
  }catch(e){
   console.error("Biobel: erro ao abrir "+tab,e);
   var alvo=document.getElementById(tab+"Tab");
   if(alvo){
    document.querySelectorAll("main[id$='Tab'],section[id$='Tab']").forEach(function(el){el.classList.add("hidden");});
    alvo.classList.remove("hidden");
    window.scrollTo({top:0,behavior:"smooth"});
   }
   if(typeof window.mostrarToast==="function") window.mostrarToast("⚠️ A área foi aberta, mas uma rotina interna apresentou erro.");
  }
 }
 function fecharMenus(){
  try{ if(typeof window.fecharNovosMenus==="function") window.fecharNovosMenus(); }catch(e){}
  var m=document.getElementById("menuAdmin");
  if(m) m.classList.remove("open");
 }
 function aplicar(){
  var menu=document.getElementById("menuAdmin");
  if(menu){
   var botoes=menu.querySelectorAll("button");
   if(botoes[0]) botoes[0].onclick=function(){abrirAreaProtegida("adm");fecharMenus();};
   if(botoes[1]) botoes[1].onclick=function(){abrirAreaProtegida("config");fecharMenus();};
  }
  var grupo=document.querySelector(".biobel-nav-group #menuAdmin");
  if(grupo){
   var gatilho=grupo.parentElement ? grupo.parentElement.querySelector(":scope > .biobel-nav-item") : null;
   if(gatilho) gatilho.onclick=function(){
    try{
     if(typeof window.alternarNovoMenu==="function") window.alternarNovoMenu("menuAdmin");
     else grupo.classList.toggle("open");
    }catch(e){grupo.classList.toggle("open");}
   };
  }
  var mobile=document.getElementById("menuMobileMais");
  if(mobile){
   Array.from(mobile.querySelectorAll("button")).forEach(function(btn){
    var texto=(btn.textContent||"").toLowerCase();
    if(texto.indexOf("administração")!==-1) btn.onclick=function(){abrirAreaProtegida("adm");fecharMenus();};
    if(texto.indexOf("configuração")!==-1) btn.onclick=function(){abrirAreaProtegida("config");fecharMenus();};
   });
  }
  // A versão exibida no cabeçalho pertence ao dashboard principal.
  // Não sobrescrever versaoSistema aqui: isso fazia a Central voltar visualmente para a v10.16.
 }
 if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",aplicar,{once:true});
 else aplicar();
 window.addEventListener("load",aplicar,{once:true});
})();
