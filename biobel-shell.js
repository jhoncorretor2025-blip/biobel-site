/* Biobel — shell compartilhado. v11.67 */
const BIOBEL_VERSION="v11.67";
(function(){
"use strict";
const PAGES={dashboard:"dashboard.html",caixa:"operacao.html",equipe:"equipe.html",campanhas:"vendas.html",info:"analises.html",alertas:"alertas.html",config:"config.html",adm:"administracao.html",backup:"backup.html"};
// Os módulos (recognition, planilha-leitura, planilha-processamento, planilha-comparacao) são <script> no HTML,
// ANTES do biobel-app.js — o navegador garante a ordem. Nada a esperar; mantido só por compatibilidade.
window.biobelModulesReady=Promise.resolve();
window.BIOBEL_PAGES=PAGES;
const p=document.body&&document.body.dataset?document.body.dataset.biobelPage:"dashboard";
const ROOT=(document.body&&document.body.dataset&&document.body.dataset.biobelRoot)||"./";
const pageHref=k=>ROOT+PAGES[k];
const a=k=>p===k?" active":"";
function montar(){
 const m=document.getElementById("biobel-shell"); if(!m||m.dataset.ready==="yes") return;
 m.innerHTML =
 '<header class="biobel-shared-header">'+
 '<div class="biobel-header-tools">'+
 '<div class="biobel-search-wrap"><label for="inputBuscaGlobal" class="sr-only">Buscar no sistema</label><input id="inputBuscaGlobal" type="text" aria-label="Buscar no sistema" placeholder="🔍 Buscar (ex: aluguel, meta...)" autocomplete="off" oninput="renderResultadosBuscaGlobal&&renderResultadosBuscaGlobal()" onfocus="renderResultadosBuscaGlobal&&renderResultadosBuscaGlobal()" style="width:100%;background:#0b1728;border:1px solid #1c2c42;border-radius:8px;padding:7px 10px;font-size:12px;color:#dce5f2;outline:none;"><div id="resultadosBuscaGlobal" style="display:none;position:absolute;top:100%;left:0;right:0;background:#0f172a;border:1px solid #1e2c42;border-radius:10px;margin-top:4px;max-height:320px;overflow-y:auto;z-index:200;"></div></div>'+
 '<span class="selo-app-instalado no-print" style="font-size:11px;color:#0ea97a;font-weight:800;background:rgba(14,169,122,.12);border:1px solid rgba(14,169,122,.35);border-radius:8px;padding:4px 8px;">📲 App</span>'+
 '<a href="backup.html" class="no-print biobel-header-backup" title="Abrir Backup" style="display:inline-flex;align-items:center;gap:5px;background:#0b1728;border:1px solid #1c2c42;border-radius:8px;padding:7px 10px;color:#cbd5e1;font-size:11px;text-decoration:none;font-weight:800;">💾 Backup</a><button id="btnInstalarApp" type="button" onclick="instalarAppBiobel()" class="no-print" style="display:none;background:#0b1728;border:1px solid #1c2c42;border-radius:8px;padding:7px 10px;color:#cbd5e1;font-size:11px;">📲 Instalar app</button>'+
 '<button id="versaoSistema" type="button" class="no-print" onclick="mostrarToast(\'📅 Sistema atualizado em 07/10/2026 — versão \'+BIOBEL_VERSION+\')" style="font-size:12px;color:#93a3ba;font-weight:800;background:#0b1728;border:1px solid #1c2c42;border-radius:8px;padding:5px 9px;cursor:pointer;" title="Versão atual do sistema Biobel" >'+BIOBEL_VERSION+'</button>'+
 '<span id="indicadorUltimoSalvamento" class="no-print" style="font-size:11px;color:#27d7a0;font-weight:700;display:none;white-space:nowrap;"></span>'+
 '<span id="nomePlanilhaAtivaHeader" class="no-print" style="font-size:11px;color:#93a3ba;font-weight:700;"></span>'+
 '<span id="connBadge" class="no-print conn-badge conn-connecting">🟡 Conectando...</span>'+
 '<div class="no-print" style="display:flex;align-items:center;gap:2px;border:1px solid #1c2c42;border-radius:8px;overflow:hidden;"><button onclick="ajustarFonteBiobel(-1)" style="background:transparent;border:none;color:#93a3ba;padding:5px 8px;font-size:12px;font-weight:800;cursor:pointer;">A-</button><button onclick="ajustarFonteBiobel(0)" style="background:transparent;border:none;border-left:1px solid #1c2c42;border-right:1px solid #1c2c42;color:#93a3ba;padding:5px 8px;font-size:12px;font-weight:800;cursor:pointer;">A</button><button onclick="ajustarFonteBiobel(1)" style="background:transparent;border:none;color:#93a3ba;padding:5px 8px;font-size:12px;font-weight:800;cursor:pointer;">A+</button></div>'+
 '<button id="themeToggleBtn" onclick="toggleTheme()" class="no-print" style="background:#0b1728;border:1px solid #1c2c42;border-radius:8px;padding:7px 10px;color:#cbd5e1;font-size:11px;"><span id="themeToggleIcon">🌙</span> <span id="themeToggleLabel">Modo claro</span></button>'+
 '<button id="btnModoCompacto" onclick="alternarModoCompacto()" class="no-print" style="background:#0b1728;border:1px solid #1c2c42;border-radius:8px;padding:7px 10px;color:#cbd5e1;font-size:11px;">↕️ Compacto</button>'+
 '<button id="btnColapsarTudo" onclick="alternarColapsoTodosCards()" class="no-print" style="background:#0b1728;border:1px solid #1c2c42;border-radius:8px;padding:7px 10px;color:#cbd5e1;font-size:11px;">▾ Minimizar tudo</button>'+
 '<button onclick="iniciarTourGuiado()" class="no-print" style="background:none;border:none;color:#93a3ba;font-size:11px;text-decoration:underline;cursor:pointer;">❓ Tour</button><button onclick="confirmLogout()" class="no-print" style="background:none;border:none;color:#93a3ba;font-size:11px;text-decoration:underline;cursor:pointer;">Sair</button>'+
 '</div>'+
 '<div class="biobel-header-brand"><div class="biobel-brand-left"><img id="logoHeaderBiobel" src="./logo_biobel_gravatai_256.jpg" alt="Logo da loja" style="width:44px;height:44px;object-fit:contain;border-radius:8px;"><div><h1 id="biobelTituloPagina">Biobel — Visão Geral</h1><p class="text-sm text-slate-400">Leitura diária da planilha + histórico do fechamento da gaveta</p><p style="font-size:11px;color:#27d7a0;margin:3px 0 0;">🧭 Páginas independentes com dados compartilhados</p></div></div><label style="cursor:pointer;background:#0ea97a;color:#04241a;padding:9px 13px;border-radius:11px;font-size:12px;font-weight:800;white-space:nowrap;">Carregar Excel/CSV<input id="fileInput" type="file" multiple accept=".xlsx,.xls,.csv" class="hidden"></label></div></header>'+
 '<div id="faixaErroConexao" class="no-print" style="display:none;background:linear-gradient(90deg,#3a0f16,#2a0a10);border-bottom:1px solid rgba(251,113,133,.4);padding:10px 16px;"><div style="max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;"><span class="biobel-faixa-erro-texto" style="font-size:12px;color:#fca5b1;">🔴 Não foi possível conectar à planilha.</span><button onclick="loadGoogleSheet()" style="background:#fb7185;color:#3a0f16;border:none;border-radius:9px;padding:7px 14px;font-weight:800;font-size:12px;">🔄 Tentar novamente</button></div></div>'+
 '<div id="biobelLoadingPlanilha" class="no-print" style="display:none;align-items:center;gap:10px;background:linear-gradient(90deg,#0b1728,#0f172a);border-bottom:1px solid #1e2c42;padding:9px 16px;font-size:12px;color:#93a3ba;"></div>'+
 '<nav class="biobel-nav-direct no-print" aria-label="Navegação principal"><div class="biobel-nav-direct-inner"><strong class="biobel-nav-brand">🟢 BioBel</strong>'+
 '<span class="biobel-nav-group-label">Acompanhar</span><a class="'+a("dashboard")+'" href="'+PAGES.dashboard+'">🏠 Visão Geral</a><a class="'+a("info")+'" href="'+PAGES.info+'">📊 Análises</a><a class="'+a("alertas")+'" href="'+PAGES.alertas+'">🚨 Alertas</a>'+
 '<span class="biobel-nav-group-label">Operar</span><a class="'+a("caixa")+'" href="'+PAGES.caixa+'">💰 Operação</a><a class="'+a("equipe")+'" href="'+PAGES.equipe+'">👥 Equipe</a><a class="'+a("campanhas")+'" href="'+PAGES.campanhas+'">📣 Vendas</a>'+
 '<span class="biobel-nav-group-label">Administrar</span><a class="'+a("adm")+'" href="'+PAGES.adm+'">⚙️ Administração</a><a class="'+a("fornecedores")+'" href="'+ROOT+'administracao/fornecedor.html">🤝 Fornecedores</a><a class="'+a("backup")+'" href="'+PAGES.backup+'">💾 Backup</a><a class="'+a("config")+'" href="'+PAGES.config+'">🔧 Configuração</a>'+
 '</div></nav><div id="biobelBreadcrumb" class="biobel-breadcrumb no-print" aria-label="Trilha de navegação"></div><nav class="biobel-mobile-direct no-print"><a data-page="dashboard" href="#" title="Visão Geral">🏠<small>Início</small></a><a data-page="caixa" href="#" title="Operação">💰<small>Operação</small></a><a data-page="equipe" href="#" title="Equipe">👥<small>Equipe</small></a><a data-page="campanhas" href="#" title="Vendas">📣<small>Vendas</small></a><button type="button" id="btnMobileMoreBiobel" onclick="toggleMenuMobileBiobel()" title="Abrir mais áreas" aria-expanded="false">☰<small>Mais</small></button></nav><div id="biobelMobileMoreMenu" class="biobel-mobile-more-menu no-print" aria-hidden="true"><div class="biobel-mobile-more-backdrop" onclick="toggleMenuMobileBiobel(false)"></div><div class="biobel-mobile-more-panel"><div class="biobel-mobile-more-head"><strong>Mais áreas</strong><button type="button" onclick="toggleMenuMobileBiobel(false)" aria-label="Fechar menu Mais">✕</button></div><a data-page="info" href="#" title="Análises e indicadores">📊 Análises</a><a data-page="alertas" href="#" title="Alertas e pendências">🚨 Alertas</a><a data-page="config" href="#" title="Configuração">🔧 Configuração</a><a data-page="adm" href="#" title="Administração">⚙️ Administração</a><a data-page="fornecedores" href="#" title="Fornecedores">🤝 Fornecedores</a><a data-page="backup" href="#" title="Backup">💾 Backup</a></div></div>';
 window.renderResultadosBuscaGlobal=function(){
  const input=document.getElementById("inputBuscaGlobal"), box=document.getElementById("resultadosBuscaGlobal");
  if(!input||!box)return;
  const q=(input.value||"").trim().toLowerCase();
  if(!q){box.style.display="none";box.innerHTML="";return;}
  const itens=[
   ["dashboard","🏠 Visão Geral","Dashboard, meta, caixa, faturamento, resumo"],
   ["caixa","💰 Operação","Fechamento de caixa, entradas, saídas"],
   ["equipe","👥 Equipe","Funcionários, ponto, equipe"],
   ["campanhas","📣 Vendas","Vendas, campanhas, produtos"],
   ["info","📊 Análises","Indicadores, gráficos, desempenho"],
   ["alertas","🚨 Alertas","Pendências, avisos, atenção"],
   ["adm","⚙️ Administração","Fornecedores, boletos, cadastros"],
   ["config","🔧 Configuração","Preferências, metas, sistema"],
   ["fornecedores","🤝 Fornecedores","Fornecedor, compras, boletos, marcas"],
   ["backup","💾 Backup","Exportação, segurança, cópias"]
  ];
  const achados=itens.filter(x=>(x[1]+" "+x[2]).toLowerCase().includes(q));
  const textoPagina=(document.querySelector("main")?.innerText||"").toLowerCase();
  const nesta=textoPagina.includes(q);
  let html=achados.map(x=>'<a class="biobel-search-result" href="'+(x[0]==="fornecedores"?ROOT+"administracao/fornecedor.html":(hrefMapBusca(x[0])))+'"><strong>'+x[1]+'</strong><small>'+x[2]+'</small></a>').join("");
  if(nesta)html='<div class="biobel-search-current">🔎 <strong>"'+q+'"</strong> também aparece nesta página.</div>'+html;
  if(!html)html='<div class="biobel-search-empty">Nenhuma área encontrada. Tente: fornecedor, funcionário, venda, caixa ou boleto.</div>';
  box.innerHTML=html;box.style.display="block";
 };
 function hrefMapBusca(k){return pageHref(k);}
 document.addEventListener("click",function(e){
  const wrap=document.querySelector(".biobel-search-wrap");
  if(wrap&&!wrap.contains(e.target)){const box=document.getElementById("resultadosBuscaGlobal");if(box)box.style.display="none";}
 });
 function configurarShellNavegacaoInterna(){
  const nomes={dashboard:"🏠 Visão Geral",caixa:"💰 Operação",equipe:"👥 Equipe",campanhas:"📣 Vendas",info:"📊 Análises",alertas:"🚨 Alertas",config:"🔧 Configuração",adm:"⚙️ Administração",fornecedores:"🤝 Fornecedores",backup:"💾 Backup"};
  const hrefMap={dashboard:pageHref("dashboard"),caixa:pageHref("caixa"),equipe:pageHref("equipe"),campanhas:pageHref("campanhas"),info:pageHref("info"),alertas:pageHref("alertas"),config:pageHref("config"),adm:pageHref("adm"),backup:pageHref("backup"),fornecedores:ROOT+"administracao/fornecedor.html"};
  m.querySelectorAll("a[href]").forEach(link=>{
   const href=link.getAttribute("href");
   const hit=Object.keys(PAGES).find(k=>PAGES[k]===href);
   if(hit)link.setAttribute("href",hrefMap[hit]);
  });
  const logo=m.querySelector("#logoHeaderBiobel");if(logo)logo.src=ROOT+"logo_biobel_gravatai_256.jpg";
  m.querySelectorAll("[data-page]").forEach(link=>{
   const key=link.dataset.page;if(hrefMap[key])link.setAttribute("href",hrefMap[key]);
   link.classList.toggle("active",p===key);
  });
  const moreBtn=m.querySelector("#btnMobileMoreBiobel");if(moreBtn)moreBtn.classList.toggle("active",["fornecedores","adm","info","alertas","config","backup"].includes(p));
  m.querySelectorAll(".biobel-nav-direct-inner a").forEach(link=>{if(!link.getAttribute("title"))link.setAttribute("title",link.textContent.trim());});
  m.querySelectorAll(".biobel-nav-direct-inner a.active").forEach(link=>link.setAttribute("aria-current","page"));
  const tituloBase={dashboard:"Biobel — Visão Geral",caixa:"Biobel — Operação",equipe:"Biobel — Equipe",campanhas:"Biobel — Vendas",info:"Biobel — Análises",alertas:"Biobel — Alertas",config:"Biobel — Configuração",adm:"Biobel — Administração",fornecedores:"Biobel — Fornecedores",backup:"Biobel — Backup"};
  const tituloEl=m.querySelector("#biobelTituloPagina"); if(tituloEl) tituloEl.textContent=tituloBase[p]||"Biobel";
  const bc=m.querySelector("#biobelBreadcrumb");
  if(bc){
   if(p==="dashboard")bc.innerHTML="<span>🏠 Você está em <strong>Visão Geral</strong></span>";
   else if(p==="fornecedores")bc.innerHTML="<a href='"+hrefMap.adm+"'>⚙️ Administração</a><span>›</span><strong>🤝 Fornecedores</strong>";
   else bc.innerHTML="<a href='"+hrefMap.dashboard+"'>🏠 Visão Geral</a><span>›</span><strong>"+(nomes[p]||"Página interna")+"</strong>";
   if(p!=="dashboard")bc.insertAdjacentHTML("afterbegin","<a class='biobel-breadcrumb-back' href='"+hrefMap.dashboard+"'>← Voltar</a><span class='biobel-breadcrumb-sep'>|</span>");
  }
 }
 window.toggleMenuMobileBiobel=function(force){
  const menu=document.getElementById("biobelMobileMoreMenu");if(!menu)return;
  const abrir=typeof force==="boolean"?force:!menu.classList.contains("show");
  menu.classList.toggle("show",abrir);menu.setAttribute("aria-hidden",abrir?"false":"true");
  const btn=document.getElementById("btnMobileMoreBiobel");if(btn)btn.setAttribute("aria-expanded",abrir?"true":"false");
 };
 configurarShellNavegacaoInterna();
 const versaoTela=document.getElementById("versaoSistemaTela");
 if(versaoTela) versaoTela.textContent=BIOBEL_VERSION;
 m.dataset.ready="yes";
}
// Rede de proteção: se o biobel-app.js não terminar de carregar (erro de sintaxe, erro logo no início, arquivo
// faltando...), o selo ficaria "Conectando..." pra sempre com tudo zerado — e parece que a planilha não está
// sendo lida. Em vez disso, avisa com clareza. O biobel-app.js marca window.__biobelAppCarregou na última linha.
function avisarFalhaCarregamento(){
 if(window.__biobelAppCarregou) return;
 const selo=document.getElementById("connBadge");
 if(selo){selo.className="no-print conn-badge conn-error";selo.textContent="🔴 Sistema com erro";}
 if(document.getElementById("biobelFalhaCarregamento")) return;
 const faixa=document.createElement("div");
 faixa.id="biobelFalhaCarregamento";faixa.className="no-print";faixa.setAttribute("role","alert");
 faixa.style.cssText="position:sticky;top:0;z-index:9999;background:#7f1d1d;color:#fff;padding:10px 16px;font-size:13px;font-weight:700;text-align:center;border-bottom:2px solid #fb7185;";
 faixa.innerHTML="⚠️ O sistema não terminou de carregar — os valores na tela <u>não são reais</u>. Aperte <b>Ctrl+Shift+R</b>. Se continuar assim, avise quem cuida do sistema (erro no arquivo principal).";
 document.body.insertBefore(faixa,document.body.firstChild);
}
window.addEventListener("load",()=>setTimeout(avisarFalhaCarregamento,6000));
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",montar,{once:true});else montar();
})();