/* Biobel — leitura de planilha para comparação. v11.59
   Responsabilidade: carregar uma planilha sem alterar a planilha ativa,
   usada exclusivamente pela rotina de comparação de meses.
   Dependências mantidas no núcleo: extractSpreadsheetId(),
   getAppsScriptProxyUrl(), normalizarNomeAba() e processarLinhasDoDia().
*/
/*
 * Planilhas integradas no código — respaldo para quando a lista salva do navegador sumir.
 * Não substituem a planilha principal; ficam disponíveis como fontes secundárias de leitura.
 */
const BIOBEL_PLANILHAS_INTEGRADAS = [
 {
  id:'2026-09',
  nome:'Setembro/2026 · Planilha secundária',
  url:'https://docs.google.com/spreadsheets/d/1o99UbEDpc0wgnjAfF0D0DQZcLdR53zBMW3Cieqoa1IQ/edit?usp=sharing'
 }
];

async function lerDadosPlanilhaSemAtivar(url){
 const id=extractSpreadsheetId(url);
 if(!id) throw new Error('Link da planilha inválido.');
 const proxyUrl=getAppsScriptProxyUrl();
 let found=0;
 const novosDias=[];
 if(proxyUrl){
  const chamadaUrl=proxyUrl+(proxyUrl.includes('?')?'&':'?')+'id='+encodeURIComponent(id)+'&_t='+Date.now();
  const resp=await fetch(chamadaUrl,{cache:'no-store'});
  if(!resp.ok) throw new Error('HTTP '+resp.status);
  const data=await resp.json();
  if(data.error) throw new Error(data.error);
  for(const sheetName in (data.sheets||{})){
   const nomeNormalizado=normalizarNomeAba(sheetName);
   if(!nomeNormalizado) continue;
   novosDias.push(processarLinhasDoDia(nomeNormalizado,data.sheets[sheetName]));
   found++;
  }
 }else{
  const exportUrl='https://docs.google.com/spreadsheets/d/'+id+'/export?format=xlsx&_biobel_cache_bust='+Date.now();
  const response=await fetch(exportUrl,{cache:'no-store'});
  if(!response.ok) throw new Error('HTTP '+response.status);
  const buf=await response.arrayBuffer();
  const wb=XLSX.read(buf,{type:'array'});
  for(const sheetName of wb.SheetNames){
   const nomeNormalizado=normalizarNomeAba(sheetName);
   if(!nomeNormalizado) continue;
   const rows=XLSX.utils.sheet_to_json(wb.Sheets[sheetName],{header:1,defval:null,raw:true});
   novosDias.push(processarLinhasDoDia(nomeNormalizado,rows));
   found++;
  }
 }
 if(found===0||novosDias.length===0) throw new Error('Nenhuma aba de dia válida foi encontrada na planilha.');
 return novosDias;
}
