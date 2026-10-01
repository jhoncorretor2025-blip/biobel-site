
(function(){
"use strict";
var K="biobel_central_v10_59";var K_OLD="biobel_central_v10_39",S={tasks:[],agenda:[],stock:[],occ:[],maint:[],accounts:[]};
try{
 var atualLocal=JSON.parse(localStorage.getItem(K)||"{}")||{};
 var antigoLocal=JSON.parse(localStorage.getItem(K_OLD)||"{}")||{};
 S=Object.assign(S,antigoLocal,atualLocal);
 if(Object.keys(atualLocal).length===0 && Object.keys(antigoLocal).length) localStorage.setItem(K,JSON.stringify(S));
}catch(e){}
function save(){try{localStorage.setItem(K,JSON.stringify(S));}catch(e){}}
function n(v){if(typeof v==="number")return isNaN(v)?0:v;return Number(String(v||"").replace(/\./g,"").replace(",","."))||0}
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

// --- Resumo executivo do dia: feito para leitura rápida da dona ---
var agora=typeof obterAgoraBrasilia==="function"?obterAgoraBrasilia():new Date();
var hojeChave=String(agora.getDate()).padStart(2,"0")+"."+String(agora.getMonth()+1).padStart(2,"0");
var diaHoje=a.find(function(q){return q.dia===hojeChave;});
var ultimoDia=a.slice().sort(function(q,r){
 var [dq,mq]=String(q.dia).split(".").map(Number),[dr,mr]=String(r.dia).split(".").map(Number);
 return (mq*100+dq)-(mr*100+dr);
}).pop()||null;
var dResumo=diaHoje||ultimoDia;
var nomeDiaResumo=dResumo?dResumo.dia:"—";
var qtdResumo=dResumo?(Number(dResumo.qtdVendas)||0):0;
var vendaResumo=dResumo?(Number(dResumo.sales)||0):0;
var ticketResumo=qtdResumo>0?vendaResumo/qtdResumo:0;
var turnosResumo=dResumo?.porTurno||{};
var manhaResumo=turnosResumo["manhã"]||{qtd:0,valor:0};
var meioResumo=turnosResumo["meio-dia"]||{qtd:0,valor:0};
var tardeResumo=turnosResumo["tarde"]||{qtd:0,valor:0};
var vendResumo=dResumo?.vendedoras||{};
var nomesVendResumo=Object.keys(vendResumo).filter(function(k){return Number(vendResumo[k])>0;}).sort(function(q,r){return Number(vendResumo[r])-Number(vendResumo[q]);});
var listaVendResumo=nomesVendResumo.length ? nomesVendResumo.map(function(nome){
 return '<div class="co12seller"><span>👤 '+esc(nome)+'</span><strong>'+m(vendResumo[nome])+'</strong></div>';
}).join("") : '<div class="co12muted">Sem vendas individuais identificadas.</div>';

var labelResumo=diaHoje?"Hoje":"Último dia lançado";
var qtdTurnosValidos=(Number(manhaResumo.qtd)||0)+(Number(meioResumo.qtd)||0)+(Number(tardeResumo.qtd)||0);

b.innerHTML=`
<div class="co12hero co12-hero-new">
 <div class="co12-hero-copy">
  <span class="co12-eyebrow">🧭 CENTRAL OPERACIONAL</span>
  <h2>Tudo que a dona precisa entender rapidamente</h2>
  <small>Resumo do dia, indicadores de gestão e ferramentas operacionais em uma única visão.</small>
 </div>
 <div class="co12-hero-actions">
  <span class="co12-source-badge">📊 Dados da planilha</span>
  <button onclick="showTab('dashboard')" aria-label="Voltar para a Visão Geral">← Voltar</button>
 </div>
</div>

<section class="co12-section co12-now-section" aria-labelledby="co12AgoraTitle">
 <div class="co12-section-head">
  <div>
   <span class="co12-section-kicker">AGORA</span>
   <h2 id="co12AgoraTitle">📍 Visão do dia</h2>
   <p>Os números que merecem atenção primeiro.</p>
  </div>
 </div>

 <div class="co12-kpis-12">
  <article class="co12-kpi co12-span-3"><small>Faturamento do período</small><strong>${m(t.t)}</strong><span>acumulado na planilha ativa</span></article>
  <article class="co12-kpi co12-span-3"><small>Meta</small><strong>${m(t.g)}</strong><span>objetivo configurado</span></article>
  <article class="co12-kpi co12-span-3"><small>Atingimento</small><strong>${t.g?t.p.toFixed(1)+"%":"—"}</strong><span>${t.g?"do objetivo mensal":"meta não configurada"}</span></article>
  <article class="co12-kpi co12-span-3"><small>Dias com venda</small><strong>${t.c}</strong><span>dias com faturamento registrado</span></article>
 </div>

 <section class="co12dia-resumo co12-day-card">
  <div class="co12dia-top">
   <div>
    <span class="co12dia-label">📅 ${labelResumo}</span>
    <h3>${nomeDiaResumo}${diaHoje?' · '+agora.toLocaleDateString("pt-BR"):""}</h3>
    <small>Visão gerencial rápida do último movimento registrado.</small>
   </div>
   <div class="co12dia-badge ${diaHoje?'is-today':''}">${diaHoje?"DADOS DE HOJE":"SEM DADOS DE HOJE"}</div>
  </div>
  <div class="co12dia-kpis">
   <article><small>💰 Vendas do dia</small><strong>${m(vendaResumo)}</strong></article>
   <article><small>👥 Atendimentos</small><strong>${qtdResumo}</strong></article>
   <article><small>🧾 Média por venda</small><strong>${m(ticketResumo)}</strong></article>
   <article><small>🕒 Primeiro → último</small><strong>${esc(dResumo?.primeiraVenda||"—")} → ${esc(dResumo?.ultimaVenda||"—")}</strong></article>
  </div>
  <div class="co12dia-grid">
   <div>
    <h4>🌅 Atendimentos por turno</h4>
    <div class="co12turno"><span>Manhã</span><strong>${Number(manhaResumo.qtd||0)}</strong><small>${m(manhaResumo.valor||0)}</small></div>
    <div class="co12turno"><span>Meio-dia</span><strong>${Number(meioResumo.qtd||0)}</strong><small>${m(meioResumo.valor||0)}</small></div>
    <div class="co12turno"><span>Tarde</span><strong>${Number(tardeResumo.qtd||0)}</strong><small>${m(tardeResumo.valor||0)}</small></div>
    ${qtdTurnosValidos!==qtdResumo&&qtdResumo>0?'<div class="co12note">ℹ️ '+qtdResumo+' atendimentos no dia; '+qtdTurnosValidos+' estão classificados por turno.</div>':""}
   </div>
   <div>
    <h4>👥 Quanto cada atendente registrou</h4>
    <div class="co12seller-list">${listaVendResumo}</div>
    <div class="co12note">O valor considera as vendas identificadas por atendente na planilha.</div>
   </div>
  </div>
  <div class="co12dia-leitura" aria-live="polite">💡 <strong>Leitura rápida:</strong> ${qtdResumo>0?'o dia teve '+qtdResumo+' atendimento'+(qtdResumo===1?'':'s')+', média de '+m(ticketResumo)+' por venda, com '+Number(manhaResumo.qtd||0)+' pela manhã e '+Number(tardeResumo.qtd||0)+' à tarde.':'ainda não há atendimentos registrados com valor neste dia.'}</div>
 </section>

 <section class="co12-alert-center" aria-labelledby="co12AlertTitle">
  <div class="co12-alert-head">
   <div>
    <span class="co12-section-kicker">ATENÇÃO</span>
    <h3 id="co12AlertTitle">🔔 Precisa da sua atenção</h3>
   </div>
   <span class="co12-alert-label">pendências operacionais</span>
  </div>
  <div id="cnot" class="co12-alert-content" aria-live="polite"></div>
 </section>
</section>

<section class="co12-section" aria-labelledby="co12GestaoTitle">
 <div class="co12-section-head">
  <div>
   <span class="co12-section-kicker">GESTÃO</span>
   <h2 id="co12GestaoTitle">🧭 Acompanhar e agir</h2>
   <p>Tarefas, agenda, ocorrências e manutenção ficam em uma área única.</p>
  </div>
 </div>

 <div class="co12-grid-12">
  <section class="co12-panel co12-span-6">
   <div class="co12-panel-head"><div><h3>📌 Tarefas + Agenda</h3><span>organize o que precisa ser feito</span></div></div>

   <div class="co12-subform">
    <div class="co12-subform-title">Nova tarefa</div>
    <div class="co12-form co12-form-3">
     <label class="co12-field"><span>Tarefa</span><input id="ct" placeholder="Ex.: conferir caixa" autocomplete="off"></label>
     <label class="co12-field"><span>Data</span><input id="cd" type="date" aria-label="Data da tarefa"></label>
     <button onclick="cAddTask()" class="co12-btn primary">Adicionar tarefa</button>
    </div>
   </div>
   <div id="ctlist" class="co12-list" aria-live="polite"></div>

   <div class="co12-subform co12-subform-separator">
    <div class="co12-subform-title">Novo compromisso</div>
    <div class="co12-form co12-form-3">
     <label class="co12-field"><span>Compromisso</span><input id="ca" placeholder="Ex.: reunião com fornecedor" autocomplete="off"></label>
     <label class="co12-field"><span>Data</span><input id="cad" type="date" aria-label="Data do compromisso"></label>
     <button onclick="cAddAgenda()" class="co12-btn secondary">Agendar</button>
    </div>
   </div>
   <div id="calist" class="co12-list" aria-live="polite"></div>
  </section>

  <section class="co12-panel co12-span-6">
   <div class="co12-panel-head"><div><h3>📝 Ocorrências</h3><span>registre fatos que precisam ficar documentados</span></div></div>
   <div class="co12-form co12-form-3">
    <label class="co12-field"><span>Ocorrência</span><input id="on" placeholder="Ex.: problema no caixa" autocomplete="off"></label>
    <label class="co12-field"><span>Responsável</span><input id="or" placeholder="Ex.: Alessandra" autocomplete="off"></label>
    <button onclick="cOcc()" class="co12-btn primary">Registrar ocorrência</button>
   </div>
   <div id="olist" class="co12-list" aria-live="polite"></div>
  </section>

  <section class="co12-panel co12-span-6">
   <div class="co12-panel-head"><div><h3>🛠️ Manutenção</h3><span>acompanhe serviços e custos</span></div></div>
   <div class="co12-form co12-form-4">
    <label class="co12-field"><span>Equipamento / serviço</span><input id="mn" placeholder="Ex.: ar-condicionado" autocomplete="off"></label>
    <label class="co12-field"><span>Data</span><input id="md" type="date" aria-label="Data da manutenção"></label>
    <label class="co12-field"><span>Custo</span><input id="mc" type="number" step=".01" placeholder="0,00" inputmode="decimal"></label>
    <button onclick="cMaint()" class="co12-btn primary">Registrar</button>
   </div>
   <div id="mlist" class="co12-list" aria-live="polite"></div>
  </section>

  <section class="co12-panel co12-span-6">
   <div class="co12-panel-head"><div><h3>📊 Painel executivo</h3><span>leitura rápida do desempenho</span></div></div>
   <div class="co12-executive-grid">
    <div class="co12-metric"><small>Ticket médio diário</small><strong>${m(t.c?t.t/t.c:0)}</strong></div>
    <div class="co12-metric"><small>Tendência</small><strong>${delta>5?"📈 Acelerando":delta<-5?"📉 Desacelerando":"➡️ Estável"}</strong><span>${delta.toFixed(1)}% no recorte interno</span></div>
    <div class="co12-metric"><small>Melhor dia</small><strong>${esc((a.slice().sort(function(q,r){return n(r.sales)-n(q.sales)})[0]||{}).dia||"—")}</strong></div>
   </div>
  </section>
 </div>
</section>

<section class="co12-section" aria-labelledby="co12AdmTitle">
 <div class="co12-section-head">
  <div>
   <span class="co12-section-kicker">ADMINISTRAÇÃO</span>
   <h2 id="co12AdmTitle">⚙️ Ferramentas de apoio</h2>
   <p>Recursos que você usa quando precisa aprofundar ou registrar informações.</p>
  </div>
 </div>

 <div class="co12-grid-12">
  <section class="co12-panel co12-span-5">
   <div class="co12-panel-head"><div><h3>🎯 Simuladores</h3><span>faça uma conta rápida sem alterar a planilha</span></div></div>
   <div class="co12-form co12-form-2">
    <label class="co12-field"><span>Venda média por dia</span><input id="cg" type="number" placeholder="Ex.: 1500" inputmode="decimal"></label>
    <button onclick="cGoal()" class="co12-btn secondary">Simular meta</button>
   </div>
   <div id="cgr" class="co12-result" aria-live="polite"></div>
   <div class="co12-form co12-form-2 co12-subform-separator">
    <label class="co12-field"><span>Comissão</span><input id="cc" type="number" placeholder="Ex.: 3" inputmode="decimal"></label>
    <button onclick="cComm()" class="co12-btn secondary">Simular comissão</button>
   </div>
   <div id="ccr" class="co12-result" aria-live="polite"></div>
  </section>

  <section class="co12-panel co12-span-7">
   <div class="co12-panel-head"><div><h3>💳 Contas + conciliação</h3><span>controle local para conferir com a planilha</span></div></div>
   <div class="co12-form co12-form-4">
    <label class="co12-field"><span>Descrição</span><input id="cb" placeholder="Ex.: fornecedor"></label>
    <label class="co12-field"><span>Valor</span><input id="cv" type="number" step=".01" placeholder="0,00" inputmode="decimal"></label>
    <label class="co12-field"><span>Tipo</span><select id="cty" aria-label="Tipo da conta"><option>Receber</option><option>Pagar</option></select></label>
    <button onclick="cAccount()" class="co12-btn primary">Registrar</button>
   </div>
   <div id="clist" class="co12-list" aria-live="polite"></div>
   <div class="co12-panel-actions">
    <button onclick="cRecon()" class="co12-btn secondary">🔎 Comparar com planilha</button>
    <div id="crec" class="co12-result" aria-live="polite"></div>
   </div>
  </section>

  <section class="co12-panel co12-span-7">
   <div class="co12-panel-head"><div><h3>📦 Estoque + compras</h3><span>identifique rapidamente o que está abaixo do mínimo</span></div></div>
   <div class="co12-form co12-form-4">
    <label class="co12-field"><span>Produto</span><input id="sn" placeholder="Ex.: shampoo"></label>
    <label class="co12-field"><span>Quantidade atual</span><input id="sq" type="number" placeholder="Atual" inputmode="numeric"></label>
    <label class="co12-field"><span>Quantidade mínima</span><input id="sm" type="number" placeholder="Mínimo" inputmode="numeric"></label>
    <button onclick="cStock()" class="co12-btn primary">Salvar estoque</button>
   </div>
   <div id="slist" class="co12-list" aria-live="polite"></div>
  </section>

  <section class="co12-panel co12-span-5">
   <div class="co12-panel-head"><div><h3>📤 Exportações</h3><span>gere uma cópia sem alterar a planilha</span></div></div>
   <div class="co12-export-grid">
    <button onclick="cExport('csv')" class="co12-btn secondary">CSV</button>
    <button onclick="cExport('txt')" class="co12-btn secondary">TXT</button>
    <button onclick="window.print()" class="co12-btn primary">PDF / Imprimir</button>
   </div>
   <p class="co12-muted">Os arquivos são gerados a partir dos dados atualmente carregados.</p>
  </section>

  <section class="co12-panel co12-span-12">
   <div class="co12-panel-head"><div><h3>🤖 Assistente interno</h3><span>consulte os dados atuais da Central em linguagem simples</span></div></div>
   <div class="co12-form co12-form-assistant">
    <label class="co12-field"><span>Pergunta</span><input id="ask" placeholder="Ex.: quanto faturamos? qual a tendência? quem vendeu mais?" autocomplete="off"></label>
    <button onclick="cAsk()" class="co12-btn primary">Perguntar</button>
   </div>
   <div id="ans" class="co12ans" aria-live="polite">Consulta os dados atuais da planilha.</div>
  </section>
 </div>
</section>
`;

var today=new Date().toISOString().slice(0,10);
document.getElementById("cd").value=today;document.getElementById("cad").value=today;
document.getElementById("ctlist").innerHTML=S.tasks.map(function(q){return '<div class="co12row">'+(q.done?"✅":"⬜")+" "+esc(q.text)+' <small>'+br(q.date)+'</small> <button aria-label="'+(q.done?"Reabrir tarefa ":"Concluir tarefa ")+esc(q.text)+'" onclick="cTask(\''+q.id+'\')">'+(q.done?"Reabrir":"Concluir")+'</button></div>'}).join("")||"<small>Sem tarefas.</small>";
document.getElementById("calist").innerHTML=S.agenda.map(function(q){return '<div class="co12row">📅 '+esc(q.text)+" — "+br(q.date)+' <button aria-label="Excluir compromisso '+esc(q.text)+'" onclick="cDel(\'agenda\',\''+q.id+'\')">×</button></div>'}).join("")||"<small>Agenda vazia.</small>";
var no=[];S.tasks.filter(function(q){return !q.done&&q.date<=today}).forEach(function(q){no.push("🚨 "+esc(q.text))});S.stock.filter(function(q){return n(q.q)<=n(q.min)}).forEach(function(q){no.push("📦 Estoque baixo: "+esc(q.name))});S.maint.filter(function(q){return q.date&&q.date<=today}).forEach(function(q){no.push("🛠️ Manutenção: "+esc(q.name))});document.getElementById("cnot").innerHTML=no.length?no.map(function(q){return '<div class="co12row">'+q+"</div>"}).join(""):"<span class='co12ok'>✅ Nenhuma pendência crítica.</span>";
document.getElementById("clist").innerHTML=S.accounts.map(function(q){return '<div class="co12row">'+(q.type==="Pagar"?"🔴":"🟢")+" "+esc(q.name)+" — "+m(q.value)+' <button aria-label="Excluir conta '+esc(q.name)+'" onclick="cDel(\'accounts\',\''+q.id+'\')">×</button></div>'}).join("")||"<small>Sem contas locais.</small>";
document.getElementById("slist").innerHTML=S.stock.map(function(q){var low=n(q.q)<=n(q.min);return '<div class="co12row">📦 '+esc(q.name)+" "+q.q+"/"+q.min+" — "+(low?"<b class='co12danger'>COMPRAR</b>":"<b class='co12ok'>OK</b>")+' <button aria-label="Excluir produto '+esc(q.name)+' do estoque" onclick="cDel(\'stock\',\''+q.id+'\')">×</button></div>'}).join("")||"<small>Sem estoque cadastrado.</small>";
document.getElementById("olist").innerHTML=S.occ.map(function(q){return '<div class="co12row">📝 '+esc(q.text)+" — "+esc(q.resp)+' <button aria-label="Excluir ocorrência '+esc(q.text)+'" onclick="cDel(\'occ\',\''+q.id+'\')">×</button></div>'}).join("")||"<small>Sem ocorrências.</small>";
document.getElementById("mlist").innerHTML=S.maint.map(function(q){return '<div class="co12row">🛠️ '+esc(q.name)+" — "+br(q.date)+" — "+m(q.cost)+' <button aria-label="Excluir manutenção '+esc(q.name)+'" onclick="cDel(\'maint\',\''+q.id+'\')">×</button></div>'}).join("")||"<small>Sem manutenções.</small>";
}
function ensure(){if(document.getElementById("co12"))return;var s=document.createElement("section");s.id="centralTab";s.className="hidden co12-page-shell";var d=document.createElement("div");d.id="co12";s.appendChild(d);document.body.appendChild(s)}
function css(){if(document.getElementById("co12css"))return;var s=document.createElement("style");s.id="co12css";s.textContent=".co12hero{display:flex;justify-content:space-between;gap:15px;padding:18px;border:1px solid #1e2c42;border-radius:16px;background:#0b1728}.co12hero b{color:#27d7a0;font-size:11px}.co12hero h2{margin:5px 0;font-size:21px}.co12hero small,.co12muted{color:#93a3ba}.co12kpis,.co12grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:12px}.co12kpis{grid-template-columns:repeat(4,1fr)}.co12focus-wrap{margin-top:14px}.co12focus-title{display:flex;justify-content:space-between;align-items:end;gap:10px;margin-bottom:8px;padding:0 2px}.co12focus-title strong{font-size:14px;color:#dce5f2}.co12focus-title span{font-size:11px;color:#93a3ba}.co12focus-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.co12focus-grid section{min-width:0}.co12kpis>div,.co12grid section{background:#0b1728;border:1px solid #1e2c42;border-radius:16px;padding:14px}.co12kpis small{color:#93a3ba}.co12kpis strong{display:block;font-size:20px;margin-top:4px}.co12grid h3{font-size:14px;margin:0 0 10px}.co12form{display:flex;gap:6px;flex-wrap:wrap;margin:7px 0}.co12form input,.co12form select{flex:1;min-width:120px;background:#0f172a;color:#dce5f2;border:1px solid #1e2c42;border-radius:9px;padding:9px 11px;font-size:13px}.co12form input:focus,.co12form select:focus{outline:none;border-color:#27d7a0}.co12grid button,.co12form button{background:#0ea97a;color:#04241a;border:none;border-radius:9px;padding:9px 14px;font-weight:800;cursor:pointer}.co12grid button:hover,.co12form button:hover{filter:brightness(1.1)}.co12hero button{background:#0b1728;color:#dce5f2;border:1px solid #1e2c42;border-radius:9px;padding:9px 14px;font-weight:700;cursor:pointer}.co12hero button:hover{border-color:#27d7a0;color:#27d7a0}.co12row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 0;border-bottom:1px solid #1e2c42;font-size:12px}.co12row button{background:transparent;color:#93a3ba;border:1px solid #1e2c42;border-radius:8px;padding:4px 9px;font-size:11px;font-weight:700;cursor:pointer;flex-shrink:0}.co12row button:hover{color:#fb7185;border-color:rgba(251,113,133,.5)}.co12row small{color:#93a3ba}.co12ok{color:#27d7a0}.co12danger{color:#fb7185}.co12ans{padding:10px;background:#0b1728;border-radius:9px;font-size:12px}@media(max-width:760px){.co12hero{display:block}.co12kpis,.co12grid,.co12focus-grid{grid-template-columns:1fr}.co12focus-title{display:block}.co12focus-title span{display:block;margin-top:3px}.co12form input,.co12form select,.co12form button{width:100%;min-height:42px}}.co12dia-resumo{margin-top:14px;background:linear-gradient(180deg,#0b1728,#0f172a);border:1px solid #1e2c42;border-radius:18px;padding:16px}.co12dia-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}.co12dia-label{font-size:11px;color:#93a3ba;font-weight:800}.co12dia-top h3{margin:3px 0 2px;font-size:20px}.co12dia-top small{color:#93a3ba}.co12dia-badge{font-size:10px;font-weight:900;color:#27d7a0;background:rgba(39,215,160,.08);border:1px solid rgba(39,215,160,.2);border-radius:999px;padding:6px 9px}.co12dia-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-top:14px}.co12dia-kpis>div{background:#0b1728;border:1px solid #1e2c42;border-radius:12px;padding:11px}.co12dia-kpis small,.co12turno small{color:#93a3ba}.co12dia-kpis strong{display:block;font-size:19px;margin-top:4px}.co12dia-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}.co12dia-grid>div{background:#0b1728;border:1px solid #1e2c42;border-radius:12px;padding:11px}.co12dia-grid h4{font-size:12.5px;margin:0 0 8px}.co12turno{display:grid;grid-template-columns:1fr auto auto;gap:8px;padding:8px 0;border-top:1px solid #1e2c42;font-size:12px}.co12turno strong{font-size:14px}.co12seller{display:flex;justify-content:space-between;gap:8px;padding:9px 0;border-top:1px solid #1e2c42;font-size:12px}.co12seller strong{font-size:14px}.co12note{font-size:10.5px;color:#93a3ba;margin-top:9px}.co12dia-leitura{margin-top:10px;padding:10px 12px;border-radius:11px;background:rgba(39,215,160,.06);border:1px solid rgba(39,215,160,.18);font-size:11.5px;color:#cbd5e1;line-height:1.5}@media(max-width:760px){.co12dia-kpis,.co12dia-grid{grid-template-columns:1fr 1fr}.co12dia-kpis>div:last-child{grid-column:1/-1}}";s.textContent+="
.co12-page-shell{width:min(calc(100% - 40px),1480px);margin:0 auto;padding:24px 0 70px;}
.co12-hero-new{align-items:center;padding:22px 24px;margin-bottom:18px;border-radius:20px;background:linear-gradient(135deg,#0b1728,#0a1524);border-color:#213653;box-shadow:0 18px 42px rgba(0,0,0,.16);}
.co12-hero-copy{min-width:0}.co12-eyebrow,.co12-section-kicker{font-size:10px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#27d7a0;}
.co12-hero-copy h2{margin:6px 0 4px;font-size:25px;line-height:1.12;letter-spacing:-.02em}.co12-hero-copy small{font-size:12px;line-height:1.5;color:#93a3ba;}
.co12-hero-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end}.co12-source-badge{padding:7px 10px;border-radius:999px;border:1px solid rgba(79,156,255,.18);background:rgba(79,156,255,.06);color:#75b5ff;font-size:10.5px;font-weight:800;white-space:nowrap}
.co12-section{margin-top:20px}.co12-section-head{display:flex;justify-content:space-between;align-items:end;gap:16px;margin-bottom:10px;padding:0 2px}.co12-section-head h2{margin:4px 0 2px;font-size:17px;font-weight:900;color:#f6f9fd}.co12-section-head p{margin:0;color:#6f8199;font-size:11px;line-height:1.4}
.co12-kpis-12,.co12-grid-12{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:12px}.co12-span-3{grid-column:span 3}.co12-span-5{grid-column:span 5}.co12-span-6{grid-column:span 6}.co12-span-7{grid-column:span 7}.co12-span-12{grid-column:1/-1}
.co12-kpi{position:relative;min-width:0;padding:14px 15px;border:1px solid #1e2c42;border-radius:15px;background:linear-gradient(145deg,#0d1a2c,#0b1728);overflow:hidden}.co12-kpi:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:#27d7a0}.co12-kpi:nth-child(2):before{background:#4f9cff}.co12-kpi:nth-child(3):before{background:#fbbf24}.co12-kpi:nth-child(4):before{background:#a78bfa}.co12-kpi small{display:block;color:#93a3ba;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.05em}.co12-kpi strong{display:block;margin-top:7px;color:#f6f9fd;font-size:23px;line-height:1.05;letter-spacing:-.03em}.co12-kpi span{display:block;margin-top:5px;color:#657994;font-size:10px;line-height:1.35}
.co12-day-card{margin-top:12px;background:linear-gradient(180deg,#0b1728,#0a1525);border-color:#223754;box-shadow:0 16px 35px rgba(0,0,0,.12)}
.co12dia-badge{transition:.18s}.co12dia-badge.is-today{background:rgba(39,215,160,.12);border-color:rgba(39,215,160,.25)}
.co12-alert-center{margin-top:12px;padding:14px 16px;border-radius:15px;background:linear-gradient(135deg,rgba(79,156,255,.07),rgba(39,215,160,.04));border:1px solid rgba(79,156,255,.18)}.co12-alert-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:7px}.co12-alert-head h3{margin:3px 0 0;font-size:14px;color:#f6f9fd}.co12-alert-label{font-size:9.5px;font-weight:800;color:#75b5ff;border:1px solid rgba(79,156,255,.18);background:rgba(79,156,255,.06);padding:5px 8px;border-radius:999px;text-transform:uppercase}.co12-alert-content:empty{min-height:4px}.co12-alert-content .co12row{padding:8px 0}
.co12-panel{min-width:0;padding:15px;border:1px solid #1e2c42;border-radius:16px;background:#0b1728;box-shadow:0 10px 26px rgba(0,0,0,.08)}
.co12-panel-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:12px}.co12-panel-head h3{margin:0;font-size:13.5px;font-weight:900;color:#eef4fb}.co12-panel-head span{display:block;margin-top:3px;color:#6f8199;font-size:10px;line-height:1.4}
.co12-subform{padding-top:1px}.co12-subform-title{font-size:10px;font-weight:900;color:#27d7a0;text-transform:uppercase;letter-spacing:.06em;margin-bottom:7px}.co12-subform-separator{margin-top:15px;padding-top:15px;border-top:1px solid #1e2c42}
.co12-form{display:grid;gap:9px;align-items:end}.co12-form-2{grid-template-columns:1fr auto}.co12-form-3{grid-template-columns:minmax(0,1.4fr) minmax(130px,.7fr) auto}.co12-form-4{grid-template-columns:1.5fr .75fr .75fr auto}.co12-form-assistant{grid-template-columns:1fr auto}
.co12-field{display:block;min-width:0}.co12-field>span{display:block;margin-bottom:5px;color:#93a3ba;font-size:9.5px;font-weight:800}.co12-field input,.co12-field select{width:100%;box-sizing:border-box;background:#081321;color:#dce5f2;border:1px solid #263a55;border-radius:10px;padding:9px 10px;font-size:12px;outline:none;min-height:40px}.co12-field input::placeholder{color:#52667d}.co12-field input:focus,.co12-field select:focus{border-color:#27d7a0;box-shadow:0 0 0 3px rgba(39,215,160,.11)}
.co12-btn{min-height:40px;border-radius:10px;border:1px solid #29405e;padding:9px 12px;font-size:10.5px;font-weight:900;cursor:pointer;white-space:nowrap;transition:transform .15s,filter .15s,border-color .15s}.co12-btn:hover{transform:translateY(-1px);filter:brightness(1.06)}.co12-btn:focus-visible{outline:none;box-shadow:0 0 0 4px rgba(39,215,160,.14)}.co12-btn.primary{background:#0ea97a;color:#04241a;border-color:#0ea97a}.co12-btn.secondary{background:rgba(79,156,255,.09);color:#75b5ff;border-color:rgba(79,156,255,.26)}
.co12-list{margin-top:9px}.co12-result{margin-top:7px;padding:9px 10px;border-radius:10px;background:#091524;border:1px solid #1b2d46;color:#cbd5e1;font-size:11px;line-height:1.45}.co12-muted{margin-top:9px;color:#71839a;font-size:10.5px;line-height:1.5}
.co12-executive-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.co12-metric{padding:11px 12px;border-radius:11px;background:#091524;border:1px solid #1b2d46}.co12-metric small{display:block;color:#71839a;font-size:9.5px;font-weight:800}.co12-metric strong{display:block;margin-top:5px;color:#f6f9fd;font-size:18px;line-height:1.1}.co12-metric span{display:block;margin-top:4px;color:#71839a;font-size:9px}
.co12-export-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
.co12-panel-actions{margin-top:9px}.co12ans{line-height:1.5}
.co12seller-list{display:flex;flex-direction:column;gap:0}
.co12row{min-width:0}.co12row button{font-size:10px}
.co12-row-action-label{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
@media(max-width:1180px){.co12-page-shell{width:min(calc(100% - 30px),1180px)}.co12-span-3{grid-column:span 6}.co12-span-5,.co12-span-7{grid-column:span 6}.co12-form-4{grid-template-columns:1fr 1fr}.co12-form-4 .co12-btn{grid-column:1/-1}.co12-form-3{grid-template-columns:1fr 1fr}.co12-form-3 .co12-btn{grid-column:1/-1}}
@media(max-width:760px){.co12-page-shell{width:100%;box-sizing:border-box;padding:14px 14px 88px}.co12-hero-new{display:block;padding:17px 16px}.co12-hero-actions{justify-content:flex-start;margin-top:12px}.co12-source-badge{font-size:10px}.co12-section{margin-top:16px}.co12-section-head{display:block}.co12-section-head h2{font-size:16px}.co12-kpis-12,.co12-grid-12{grid-template-columns:1fr}.co12-span-3,.co12-span-5,.co12-span-6,.co12-span-7,.co12-span-12{grid-column:1/-1}.co12-kpi strong{font-size:22px}.co12-form,.co12-form-2,.co12-form-3,.co12-form-4,.co12-form-assistant{grid-template-columns:1fr}.co12-form .co12-btn,.co12-form-4 .co12-btn{grid-column:auto}.co12-export-grid{grid-template-columns:1fr}.co12-executive-grid{grid-template-columns:1fr 1fr}.co12-executive-grid .co12-metric:last-child{grid-column:1/-1}.co12-alert-head{align-items:flex-start}.co12-alert-label{margin-top:2px}.co12-field input,.co12-field select,.co12-btn{min-height:44px;font-size:16px}.co12-panel{padding:14px}.co12-panel-head h3{font-size:13px}.co12-panel-head span{font-size:10.5px}.co12dia-kpis{grid-template-columns:1fr 1fr}.co12dia-kpis>div:last-child{grid-column:1/-1}.co12dia-grid{grid-template-columns:1fr}.co12dia-top h3{font-size:18px}}
@media(max-width:430px){.co12-executive-grid{grid-template-columns:1fr}.co12-executive-grid .co12-metric:last-child{grid-column:auto}.co12-hero-copy h2{font-size:21px}.co12-alert-head{display:block}.co12-alert-label{display:inline-flex;margin-top:7px}}
@media(prefers-reduced-motion:reduce){.co12-btn,.co12-panel,.co12-kpi{transition:none!important}}
@media print{.co12-page-shell{width:100%;padding:0}.co12-hero-new,.co12-alert-center,.co12-section-head{box-shadow:none}.co12-panel,.co12-kpi,.co12-day-card{break-inside:avoid}
}
";document.head.appendChild(s)}
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
window.cExport=function(type){var t=st(),z="Biobel Central\nFaturamento: "+m(t.t)+"\nMeta: "+m(t.g)+"\nAtingimento: "+(t.g?t.p.toFixed(1)+"%":"—")+"\nDias com venda: "+t.c;var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([type==="csv"?"Campo;Valor\nFaturamento;"+t.t+"\nMeta;"+t.g+"\nDias;"+t.c:z],{type:type==="csv"?"text/csv":"text/plain"}));a.download="biobel-central."+type;a.click()}
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
