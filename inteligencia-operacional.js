/* BIOBEL v10.13 — INTELIGÊNCIA OPERACIONAL
   12 melhorias sobre a arquitetura v10.12.
   Fonte de negócio: dados já carregados da planilha.
   Sem banco novo. localStorage somente para preferências/rascunhos locais.
*/
(function(){
"use strict";
var K="biobel_inteligencia_v10_13";
function data(){return Array.isArray(window.daysData)?window.daysData:[]}
function num(v){return Number(String(v==null?"":v).replace(/\./g,"").replace(",","."))||0}
function money(v){try{return typeof window.money==="function"?window.money(num(v)):new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(num(v))}catch(e){return "R$ "+num(v).toFixed(2)}}
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]})}
function toast(x){if(typeof window.mostrarToast==="function")window.mostrarToast(x)}
function stats(arr){arr=arr||data();var total=arr.reduce(function(s,x){return s+num(x.sales)},0),count=arr.filter(function(x){return num(x.sales)>0}).length;return{total:total,count:count,avg:count?total/count:0}}
function sellers(arr){var o={};(arr||data()).forEach(function(d){Object.entries(d.vendedoras||{}).forEach(function(x){o[x[0]]=(o[x[0]]||0)+num(x[1])})});return Object.entries(o).sort(function(a,b){return b[1]-a[1]})}
function median(a){a=a.slice().sort(function(x,y){return x-y});if(!a.length)return 0;var m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2}
function period(arr,mode){var n=arr.length;if(mode==="metade1")return arr.slice(0,Math.floor(n/2));if(mode==="metade2")return arr.slice(Math.floor(n/2));return arr}
function inject(){
 if(document.getElementById("bio13css"))return;
 var s=document.createElement("style");s.id="bio13css";s.textContent=
 ".bio13{margin-top:12px}.bio13grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.bio13card{background:#0d1a2c;border:1px solid #20334e;border-radius:16px;padding:14px}.bio13card h3{margin:0 0 10px;font-size:14px}.bio13muted{color:#93a3ba;font-size:12px;line-height:1.5}.bio13row{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid #20334e;font-size:12px}.bio13row:last-child{border-bottom:0}.bio13green{color:#27d7a0}.bio13yellow{color:#ffbf47}.bio13red{color:#ff6174}.bio13badge{display:inline-block;padding:3px 7px;border-radius:99px;background:rgba(39,215,160,.1);color:#27d7a0;font-size:10px;font-weight:900}.bio13form{display:flex;gap:6px;flex-wrap:wrap}.bio13form input,.bio13form select{flex:1;min-width:120px;background:#081426;color:#fff;border:1px solid #29405e;border-radius:8px;padding:9px}.bio13btn{background:#0b1728;color:#dce5f2;border:1px solid #29405e;border-radius:8px;padding:8px 10px;font-weight:800;cursor:pointer}.bio13btn:hover{border-color:#27d7a0;color:#27d7a0}@media(max-width:760px){.bio13grid{grid-template-columns:1fr}.bio13form input,.bio13form select,.bio13btn{width:100%;min-height:42px}}body.light-mode .bio13card{background:#fff;border-color:#dde3ea}body.light-mode .bio13form input,body.light-mode .bio13form select{background:#f8fafc;color:#0f172a;border-color:#cbd5e1}";
 document.head.appendChild(s)
}
function ensure(){
 var c=document.getElementById("centralTab");if(!c||document.getElementById("bio13"))return;
 var s=document.createElement("div");s.id="bio13";s.className="bio13";
 s.innerHTML='<div class="bio13grid">'+
 '<section class="bio13card"><h3>🚦 Semáforo operacional</h3><div id="bio13Traffic"></div></section>'+
 '<section class="bio13card"><h3>🎯 Meta progressiva + previsão</h3><div id="bio13Goal"></div></section>'+
 '</div>'+
 '<div class="bio13grid">'+
 '<section class="bio13card"><h3>📊 Comparador automático</h3><div id="bio13Compare"></div></section>'+
 '<section class="bio13card"><h3>👥 Evolução das vendedoras</h3><div id="bio13Sellers"></div></section>'+
 '</div>'+
 '<div class="bio13grid">'+
 '<section class="bio13card"><h3>🔮 Previsão de fechamento</h3><div id="bio13Forecast"></div></section>'+
 '<section class="bio13card"><h3>🚨 Detector de anomalias</h3><div id="bio13Anomaly"></div></section>'+
 '</div>'+
 '<div class="bio13grid">'+
 '<section class="bio13card"><h3>🗓️ Calendário comercial inteligente</h3><div id="bio13Calendar"></div></section>'+
 '<section class="bio13card"><h3>🌧️ Clima × vendas</h3><div id="bio13Climate"></div></section>'+
 '</div>'+
 '<div class="bio13grid">'+
 '<section class="bio13card"><h3>💡 Ações recomendadas</h3><div id="bio13Actions"></div></section>'+
 '<section class="bio13card"><h3>📑 Relatório gerencial</h3><div class="bio13form"><button class="bio13btn" onclick="bio13Report()">Gerar relatório</button><button class="bio13btn" onclick="bio13Report(true)">Imprimir</button></div><div id="bio13Report"></div></section>'+
 '</div>'+
 '<section class="bio13card"><h3>🔍 Busca Global 2.0</h3><div class="bio13form"><input id="bio13Search" placeholder="Ex.: vendas, Maria, maior dia, abaixo da meta, chuva"><button class="bio13btn" onclick="bio13Search()">Pesquisar</button></div><div id="bio13SearchResult" class="bio13muted">Pesquise números e padrões dos dados carregados.</div></section>';
 c.appendChild(s)
}
function render(){
ensure();inject();if(!document.getElementById("bio13"))return;
var d=data(),t=stats(d),goal=typeof window.getSalesGoal==="function"?num(window.getSalesGoal()):0,days=d.length||1,avg=t.avg,half=Math.floor(d.length/2),a=stats(d.slice(0,half)),b=stats(d.slice(half)),delta=a.total?((b.total-a.total)/a.total*100):0;
var dailyNeeded=goal>0?Math.max((goal-t.total)/Math.max(days-half,1),0):0;
var projected=avg*(d.length||30),leader=sellers(d)[0];
var vals=d.map(function(x){return num(x.sales)}).filter(function(x){return x>0}),med=median(vals),sd=vals.length?Math.sqrt(vals.reduce(function(s,x){return s+Math.pow(x-med,2)},0)/vals.length):0;
var anomalies=d.filter(function(x){var v=num(x.sales);return v>0&&sd>0&&Math.abs(v-med)>2*sd});
var sem=t.total<=0?["🔴","Sem vendas carregadas","red"]:goal&&t.total<goal*.7?["🔴","Abaixo de 70% da meta","red"]:goal&&t.total<goal*.9?["🟡","Atenção à meta","yellow"]:["🟢","Operação dentro do ritmo","green"];
document.getElementById("bio13Traffic").innerHTML='<div style="font-size:24px">'+sem[0]+'</div><b class="bio13'+sem[2]+'">'+sem[1]+'</b><p class="bio13muted">Faturamento '+money(t.total)+' em '+t.count+' dias com venda.</p>';
document.getElementById("bio13Goal").innerHTML=goal?'<div class="bio13row"><span>Meta restante</span><b>'+money(Math.max(goal-t.total,0))+'</b></div><div class="bio13row"><span>Necessário por dia restante</span><b>'+money(dailyNeeded)+'</b></div><div class="bio13row"><span>Ritmo atual</span><b>'+money(avg)+'/dia</b></div>':'<span class="bio13muted">Meta não configurada na planilha/sistema.</span>';
document.getElementById("bio13Compare").innerHTML='<div class="bio13row"><span>1ª metade</span><b>'+money(a.total)+'</b></div><div class="bio13row"><span>2ª metade</span><b>'+money(b.total)+'</b></div><div class="bio13row"><span>Variação</span><b class="'+(delta>=0?"bio13green":"bio13red")+'">'+(delta>=0?"+":"")+delta.toFixed(1)+'%</b></div>';
document.getElementById("bio13Sellers").innerHTML=leader?'<div class="bio13row"><span>🏆 Líder atual</span><b>'+esc(leader[0])+'</b></div>'+sellers(d).slice(0,5).map(function(x,i){return '<div class="bio13row"><span>#'+(i+1)+' '+esc(x[0])+'</span><b>'+money(x[1])+'</b></div>'}).join(""):'<span class="bio13muted">A planilha não trouxe dados de vendedoras.</span>';
document.getElementById("bio13Forecast").innerHTML='<div class="bio13row"><span>Projeção pelo ritmo atual</span><b>'+money(projected)+'</b></div><div class="bio13row"><span>Média diária</span><b>'+money(avg)+'</b></div><p class="bio13muted">É uma projeção matemática, não uma garantia de fechamento.</p>';
document.getElementById("bio13Anomaly").innerHTML=anomalies.length?anomalies.slice(-8).map(function(x){return '<div class="bio13row"><span>⚠️ Dia '+esc(x.dia)+'</span><b>'+money(x.sales)+'</b></div>'}).join(""):'<span class="bio13muted">Nenhuma anomalia estatística forte detectada no período carregado.</span>';
var calendar=window.biobelCalendarioComercial||window.calendarioComercial||[];
document.getElementById("bio13Calendar").innerHTML=Array.isArray(calendar)&&calendar.length?calendar.slice(0,8).map(function(x){return '<div class="bio13row"><span>🗓️ '+esc(x.nome||x.titulo||x.data)+'</span><span class="bio13badge">planejar</span></div>'}).join(""):'<p class="bio13muted">Nenhum calendário estruturado foi encontrado. As datas comerciais existentes continuam acessíveis nas áreas atuais.</p>';
var climate=d.filter(function(x){return x.chuva!=null||x.weather||x.clima||x.temperatura!=null});document.getElementById("bio13Climate").innerHTML=climate.length?'<div class="bio13row"><span>Registros com clima</span><b>'+climate.length+'</b></div><p class="bio13muted">A estrutura de clima disponível foi detectada. Use a análise existente para detalhamento por dia.</p>':'<p class="bio13muted">Não encontrei campos climáticos diretamente em daysData; a análise climática existente do BioBel permanece preservada.</p>';
var actions=[];if(goal&&t.total<goal)actions.push("🎯 Revisar ritmo diário para recuperar a meta.");if(anomalies.length)actions.push("🚨 Conferir os dias fora do padrão.");if(leader)actions.push("👥 Acompanhar evolução das vendedoras além do ranking.");if(t.count===0)actions.push("📥 Conferir se a planilha do período foi carregada.");if(!actions.length)actions.push("✅ Nenhuma ação crítica automática encontrada.");document.getElementById("bio13Actions").innerHTML=actions.map(function(x){return '<div class="bio13row">'+x+'</div>'}).join("");
document.getElementById("bio13Report").innerHTML='<p class="bio13muted">Última visão: '+new Date().toLocaleString("pt-BR")+' · faturamento '+money(t.total)+' · meta '+money(goal)+' · projeção '+money(projected)+'.</p>';
}
window.bio13Report=function(print){render();var t=stats(data()),goal=typeof window.getSalesGoal==="function"?num(window.getSalesGoal()):0,d= data(),avg=t.avg,proj=avg*(d.length||30),html="<h2>BioBel v10.13 — Relatório Gerencial</h2><p>Faturamento: "+money(t.total)+"<br>Meta: "+money(goal)+"<br>Dias com venda: "+t.count+"<br>Média diária: "+money(avg)+"<br>Projeção pelo ritmo atual: "+money(proj)+"</p>";document.getElementById("bio13Report").innerHTML=html;if(print)window.print()};
window.bio13Search=function(){var q=(document.getElementById("bio13Search").value||"").toLowerCase(),d=data(),t=stats(d),out=[];if(/venda|fatur/.test(q))out.push("💰 Faturamento: "+money(t.total));if(/meta/.test(q)){var g=typeof window.getSalesGoal==="function"?num(window.getSalesGoal()):0;out.push("🎯 Meta: "+money(g)+" · atingimento: "+(g?(t.total/g*100).toFixed(1)+"%":"não configurada"))}if(/maior|melhor/.test(q)){var z=d.slice().sort(function(a,b){return num(b.sales)-num(a.sales)})[0];if(z)out.push("🏆 Maior venda/dia: "+esc(z.dia)+" · "+money(z.sales))}if(/abaixo|pior/.test(q)){var z=d.slice().filter(function(x){return num(x.sales)>0}).sort(function(a,b){return n(a.sales)-n(b.sales)})[0];if(z)out.push("📉 Menor venda/dia: "+esc(z.dia)+" · "+money(z.sales))}if(/vended|maria|ranking/.test(q)){var s=sellers(d);if(s.length)out.push("👥 Liderança: "+esc(s[0][0])+" · "+money(s[0][1]))}if(!out.length)out.push("🔎 Não encontrei uma resposta específica. Tente: faturamento, meta, maior dia, abaixo da meta ou ranking.");document.getElementById("bio13SearchResult").innerHTML=out.map(function(x){return '<div class="bio13row">'+x+'</div>'}).join("")};
var n=window.showTab;window.showTab=function(tab){if(n)n(tab);if(tab==="central"){setTimeout(render,50)}};
function init(){inject();ensure();render()}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();