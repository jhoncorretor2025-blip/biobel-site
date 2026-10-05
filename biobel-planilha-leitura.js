/* ============================================================
   BIOBEL — LEITURA DE PLANILHAS
   v11.41 — leitura principal e fallbacks preservados.
   As funções abaixo dependem de utilitários globais do núcleo
   (por exemplo: processarLinhasDoDia, normalizarNomeAba,
   obterAgoraBrasilia e fetchBiobelComTimeout).
   ============================================================ */

function lerAbaGoogleGvizJSONP(spreadsheetId, sheetName, timeoutMs=9000){
 return new Promise((resolve,reject)=>{
  const cb='__biobelGviz_'+Date.now()+'_'+Math.random().toString(36).slice(2);
  const script=document.createElement('script');
  let finalizado=false;
  const limpar=()=>{try{delete window[cb];}catch(e){window[cb]=undefined;}script.remove();clearTimeout(timer);};
  const timer=setTimeout(()=>{if(finalizado)return;finalizado=true;limpar();reject(new Error('Tempo esgotado ao ler a aba '+sheetName+'.'));},timeoutMs);
  window[cb]=(payload)=>{
   if(finalizado)return;
   finalizado=true;limpar();
   if(payload?.status==='error' || !payload?.table){
    reject(new Error(payload?.errors?.[0]?.detailed_message || payload?.errors?.[0]?.message || ('Aba '+sheetName+' não pôde ser lida.')));
    return;
   }
   const cols=Array.isArray(payload.table.cols)?payload.table.cols:[];
   const rows=Array.isArray(payload.table.rows)?payload.table.rows:[];
   const matrix=rows.map(row=>{
    const out=new Array(cols.length).fill(null);
    (row?.c||[]).forEach((cell,idx)=>{
     if(!cell)return;
     // Para horário (coluna L), prioriza o valor formatado, que chega como HH:MM/HH:MM:SS.
     // Nas demais colunas, prioriza o valor bruto para preservar números usados nos cálculos.
     out[idx]=(idx===11 && cell.f!=null) ? cell.f : (cell.v!=null ? cell.v : (cell.f??null));
    });
    return out;
   });
   resolve(matrix);
  };
  script.onerror=()=>{if(finalizado)return;finalizado=true;limpar();reject(new Error('O Google não respondeu à aba '+sheetName+'.'));};
  const tqx=encodeURIComponent('out:json;responseHandler:'+cb);
  script.src='https://docs.google.com/spreadsheets/d/'+encodeURIComponent(spreadsheetId)+'/gviz/tq?tqx='+tqx+'&sheet='+encodeURIComponent(sheetName)+'&_biobel_cache_bust='+Date.now();
  document.head.appendChild(script);
 });
}

async function carregarMesAtualViaGviz(spreadsheetId){
 const agora=typeof obterAgoraBrasilia==='function'?obterAgoraBrasilia():new Date();
 const ano=agora.getFullYear(), mes=agora.getMonth()+1, diaAtual=agora.getDate();
 const nomes=[];
 for(let dia=1;dia<=diaAtual;dia++) nomes.push(String(dia).padStart(2,'0')+'.'+String(mes).padStart(2,'0'));
 const resultados=[];
 // No máximo 5 abas por lote para não saturar o navegador.
 for(let i=0;i<nomes.length;i+=5){
  const lote=nomes.slice(i,i+5);
  const lidos=await Promise.all(lote.map(async sheetName=>{
   try{
    const rows=await lerAbaGoogleGvizJSONP(spreadsheetId,sheetName);
    const dados=processarLinhasDoDia(sheetName,rows);
    return {dados,ok:true};
   }catch(err){
    console.warn('Fallback Google Sheets — '+sheetName+':',err);
    return null;
   }
  }));
  lidos.filter(Boolean).forEach(x=>resultados.push(x.dados));
 }
 if(!resultados.length) throw new Error('O modo de recuperação não encontrou nenhuma aba diária legível.');
 return resultados.sort((a,b)=>{
  const [da,ma]=String(a.dia).split('.').map(Number),[db,mb]=String(b.dia).split('.').map(Number);
  return (ma*100+da)-(mb*100+db);
 });
}

function parseGoogleVisualizationJson(texto){
 const bruto=String(texto||'').trim();
 const inicio=bruto.indexOf('{');
 const fim=bruto.lastIndexOf('}');
 if(inicio<0||fim<=inicio) throw new Error('Resposta do Google Visualization inválida.');
 const obj=JSON.parse(bruto.slice(inicio,fim+1));
 if(obj.status==='error') throw new Error(obj.errors?.[0]?.detailed_message || obj.errors?.[0]?.message || 'Google Visualization retornou erro.');
 const tabela=obj.table;
 if(!tabela) throw new Error('Google Visualization não retornou tabela.');
 const cols=Array.isArray(tabela.cols)?tabela.cols:[];
 const rows=Array.isArray(tabela.rows)?tabela.rows:[];
 return rows.map(row=>{
  const out=new Array(cols.length).fill(null);
  (row?.c||[]).forEach((cell,idx)=>{
   if(!cell)return;
   out[idx]=(idx===11 && cell.f!=null) ? cell.f : (cell.v!=null ? cell.v : (cell.f??null));
  });
  return out;
 });
}
async function lerAbaGoogleVisualizationDireta(spreadsheetId,sheetName){
 const url='https://docs.google.com/spreadsheets/d/'+encodeURIComponent(spreadsheetId)+'/gviz/tq?tqx=out:json&sheet='+encodeURIComponent(sheetName)+'&_biobel_cache_bust='+Date.now();
 const resp=await fetchBiobelComTimeout(url,{cache:'no-store'},10000);
 if(!resp.ok) throw new Error('Google Visualization HTTP '+resp.status);
 const texto=await resp.text();
 const rows=parseGoogleVisualizationJson(texto);
 if(!rows.length) throw new Error('A aba '+sheetName+' está vazia ou não pode ser lida.');
 return rows;
}
async function carregarPlanilhaViaGoogleVisualizationDireta(spreadsheetId){
 const agora=typeof obterAgoraBrasilia==='function'?obterAgoraBrasilia():new Date();
 const mes=String(agora.getMonth()+1).padStart(2,'0');
 const diaAtual=agora.getDate();
 const nomes=[];
 for(let dia=1;dia<=diaAtual;dia++) nomes.push(String(dia).padStart(2,'0')+'.'+mes);
 const resultados=[];
 for(let i=0;i<nomes.length;i+=4){
  const lote=nomes.slice(i,i+4);
  const lidos=await Promise.all(lote.map(async nome=>{
   try{
    const rows=await lerAbaGoogleVisualizationDireta(spreadsheetId,nome);
    return processarLinhasDoDia(nome,rows);
   }catch(err){
    console.warn('Google Visualization direto — '+nome+':',err);
    return null;
   }
  }));
  lidos.filter(Boolean).forEach(d=>resultados.push(d));
 }
 if(!resultados.length) throw new Error('Nenhuma aba diária foi lida diretamente pelo Google.');
 return resultados.sort((a,b)=>{
  const [da,ma]=String(a.dia).split('.').map(Number),[db,mb]=String(b.dia).split('.').map(Number);
  return (ma*100+da)-(mb*100+db);
 });
}

function fetchBiobelComTimeout(url, options={}, timeoutMs=12000){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),timeoutMs);
 return fetch(url,{...options,signal:controller.signal}).finally(()=>clearTimeout(timer));
}
async function lerPlanilhaDiretaXlsx(spreadsheetId){
 const exportUrl='https://docs.google.com/spreadsheets/d/'+encodeURIComponent(spreadsheetId)+'/export?format=xlsx&_biobel_cache_bust='+Date.now();
 const response=await fetchBiobelComTimeout(exportUrl,{cache:'no-store'},15000);
 if(!response.ok) throw new Error('Google XLSX HTTP '+response.status);
 const buf=await response.arrayBuffer();
 const wb=XLSX.read(buf,{type:'array'});
 const novosDias=[];
 for(const sheetName of wb.SheetNames){
  const nomeNormalizado=normalizarNomeAba(sheetName);
  if(!nomeNormalizado) continue;
  const rows=XLSX.utils.sheet_to_json(wb.Sheets[sheetName],{header:1,defval:null,raw:true});
  novosDias.push(processarLinhasDoDia(nomeNormalizado,rows));
 }
 if(!novosDias.length) throw new Error('Nenhuma aba diária foi encontrada no XLSX.');
 return novosDias.sort((a,b)=>{
  const [da,ma]=String(a.dia).split('.').map(Number),[db,mb]=String(b.dia).split('.').map(Number);
  return (ma*100+da)-(mb*100+db);
 });
}
async function lerPlanilhaViaAppsScript(spreadsheetId,proxyUrl,timeoutMs=12000){
 const chamadaUrl=proxyUrl+(proxyUrl.includes('?')?'&':'?')+'id='+encodeURIComponent(spreadsheetId)+'&_t='+Date.now();
 const resp=await fetchBiobelComTimeout(chamadaUrl,{cache:'no-store'},timeoutMs);
 if(!resp.ok) throw new Error('Apps Script HTTP '+resp.status);
 const data=await resp.json();
 if(data.error) throw new Error(String(data.error));
 const novosDias=[];
 for(const sheetName in (data.sheets||{})){
  const nomeNormalizado=normalizarNomeAba(sheetName);
  if(!nomeNormalizado) continue;
  novosDias.push(processarLinhasDoDia(nomeNormalizado,data.sheets[sheetName]));
 }
 if(!novosDias.length) throw new Error('A ponte não encontrou abas diárias.');
 return novosDias.sort((a,b)=>{
  const [da,ma]=String(a.dia).split('.').map(Number),[db,mb]=String(b.dia).split('.').map(Number);
  return (ma*100+da)-(mb*100+db);
 });
}
function salvarUltimaLeituraPlanilha(spreadsheetId,dados){
 try{
  localStorage.setItem('biobel_ultima_leitura_planilha_v1',JSON.stringify({
   spreadsheetId,
   savedAt:new Date().toISOString(),
   days:dados
  }));
 }catch(e){ console.warn('Não consegui guardar a última leitura da planilha:',e); }
}
function restaurarUltimaLeituraPlanilha(spreadsheetId){
 try{
  const raw=localStorage.getItem('biobel_ultima_leitura_planilha_v1');
  if(!raw)return false;
  const snap=JSON.parse(raw);
  if(snap?.spreadsheetId!==spreadsheetId || !Array.isArray(snap.days) || !snap.days.length)return false;
  daysData=snap.days;
  render();
  window.dispatchEvent(new CustomEvent('biobel:data-updated'));
  const badge=document.getElementById('connBadge');
  if(badge){
   const dt=snap.savedAt?new Date(snap.savedAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'—';
   badge.className='conn-badge conn-connecting';
   badge.textContent='🟡 Dados salvos às '+dt+' · atualizando...';
  }
  return true;
 }catch(e){ return false; }
}
