/* ============================================================
   BIOBEL — PROCESSAMENTO DE PLANILHAS
   v11.34 — processamento diário preservado.
   Responsabilidade: transformar as linhas de uma aba diária
   em um registro normalizado para daysData.

   Dependências mantidas no núcleo:
   findPaymentTotals, extrairValorPorRotulo, textoNormalizadoPlanilha,
   obterValorCelulaPlanilha, valorPlanilhaPreenchido, numeroPlanilha,
   colunaExcel, extrairFechamentoCaixaDaPlanilha, extractSellerTotals,
   extractSellerDetalhes, countTransactions, extractTipoVendaTotais,
   extractProdutosVendidos, extractHorariosPico, extractTurnos,
   extractGeneroTotais, extractVendasIndividuais,
   extractPrimeiraUltimaVenda, extractHorariosVendas,
   extractRegistrosVendas.
   ============================================================ */

function processarLinhasDoDia(sheetName, rows){
 const pagamentos=findPaymentTotals(rows);
 const initialInfo=extrairValorPorRotulo(rows,v=>textoNormalizadoPlanilha(v).includes('inicio do caixa'));
 const retiradaInfo=extrairValorPorRotulo(rows,v=>textoNormalizadoPlanilha(v).includes('retirada do caixa'));

 const {dinheiro,debito,credito,pix}=pagamentos;
 const totalPagamentos=dinheiro+debito+credito+pix;
 // P2 é a célula oficial usada pelo painel para o valor "Vendido hoje".
 // Algumas leituras do Google/Apps Script não entregam o valor calculado da fórmula de P2.
 // Por isso guardamos a leitura direta e, se ela vier vazia, usamos o total diário já calculado
 // a partir dos pagamentos da mesma aba — que deve coincidir com P2.
 let vendaP2=obterValorCelulaPlanilha(rows,1,15,0);

 // Fonte oficial da venda diária: soma dos totais de pagamento.
 // Isso evita que alterações de layout/fórmulas em "Entrada do dia" façam o
 // sistema capturar uma célula errada e transformar dezenas de milhares em milhões.
 let sales=totalPagamentos;
 let salesCelula='TOTAL_PAGAMENTOS';

 // Fallback somente quando a planilha não trouxe nenhum total de pagamento.
 // Nesse caso, tenta localizar "Entrada do dia" nos formatos antigos.
 if(sales>0 && (!Number.isFinite(vendaP2) || vendaP2<=0)){
  vendaP2=sales;
 }
 if(sales<=0){
  sales=0;
  salesCelula=null;
  for(let r=0;r<rows.length&&sales===0;r++){
   for(let c=0;c<(rows[r]?.length||0)&&sales===0;c++){
    const cel=rows[r]?.[c];
    if(typeof cel!=='string'||!textoNormalizadoPlanilha(cel).includes('entrada do dia')) continue;
    for(let cc=c+1;cc<Math.min(c+3,rows[r].length);cc++){
     const bruto=rows[r][cc];
     if(valorPlanilhaPreenchido(bruto)){ sales=numeroPlanilha(bruto); salesCelula=colunaExcel(cc)+String(r+1); break; }
    }
   }
  }
  if(sales===0&&valorPlanilhaPreenchido(rows[1]?.[15])){ sales=numeroPlanilha(rows[1][15]); salesCelula='P2'; }
 }

 const fechamentoInfo=extrairFechamentoCaixaDaPlanilha(rows);
 const closing=fechamentoInfo.encontrado ? fechamentoInfo.valor : null;

 const vendedoras=extractSellerTotals(rows);
 const vendedorasDetalhe=extractSellerDetalhes(rows);
 const qtdVendas=countTransactions(rows);
 const tipoVenda=extractTipoVendaTotais(rows);
 const produtos=extractProdutosVendidos(rows);
 const horarios=extractHorariosPico(rows);
 const {porTurno,porTurnoVend,totalComTurno}=extractTurnos(rows);
 const genero=extractGeneroTotais(rows);
 const vendasIndividuais=extractVendasIndividuais(rows);
 const {primeiraVenda,ultimaVenda}=extractPrimeiraUltimaVenda(rows);
 const horariosVendas=extractHorariosVendas(rows);
 const registrosVendas=extractRegistrosVendas(rows);
 const vendasSemHorario=registrosVendas.filter(v=>v.horario===null || v.horario===undefined).length;

 const diferencaVendasPagamentos=sales>0 ? sales-totalPagamentos : 0;

 return {
  dia:sheetName,
  initial:initialInfo.valor,
  initialEncontrado:initialInfo.encontrado,
  initialCelula:initialInfo.celula,
  sales,
  salesCelula,
  vendaP2,

  withdrawals:retiradaInfo.valor,
  withdrawalsEncontrado:retiradaInfo.encontrado,
  withdrawalsCelula:retiradaInfo.celula,
  closing,
  closingEncontrado:fechamentoInfo.encontrado,
  closingCelula:fechamentoInfo.celula,
  dinheiro,debito,credito,pix,totalPagamentos,diferencaVendasPagamentos,
  vendedoras,qtdVendas,vendedorasDetalhe,tipoVenda,produtos,horarios,porTurno,porTurnoVend,totalComTurno,genero,
  vendasIndividuais,primeiraVenda,ultimaVenda,horariosVendas,registrosVendas,vendasSemHorario
 };
}

/* ============================================================
   Extratores e utilitários de transformação da planilha
   v11.35 — mantidos fora do núcleo da aplicação.
   Dependências externas preservadas: normalizarNome(),
   extrairHoraDoValor(), extrairFracaoTempo() e formatarHoraFracao().
   ============================================================ */
function findPaymentTotals(rows){
 // Procura a linha "total" da seção FORMA DE PAGAMENTO (colunas: nº, Dinheiro, Débito, Crédito, Pix)
 for(let r=0;r<rows.length;r++){
  const label=String(rows[r]?.[0]??'').trim().toLowerCase();
  if(label==='total'){
   const dinheiro=numeroPlanilha(rows[r][1]);
   const debito=numeroPlanilha(rows[r][2]);
   const credito=numeroPlanilha(rows[r][3]);
   const pix=numeroPlanilha(rows[r][4]);
   return {dinheiro,debito,credito,pix};
  }
 }
 return {dinheiro:0,debito:0,credito:0,pix:0};
}

function extractSellerTotals(rows){
 // Cada linha de venda tem: nº (col A), Dinheiro/Débito/Crédito/Pix (col B-E), vendedora (col F).
 // Soma o valor da venda (uma das 4 colunas de pagamento) por vendedora, até achar a linha "total".
 const totals = {};
 for(let r=0;r<rows.length;r++){
  const rownum = rows[r]?.[0];
  const label = String(rownum??'').trim().toLowerCase();
  if(label==='total') break;
  if(typeof rownum!=='number') continue;
  const vendedora = rows[r]?.[5];
  if(!vendedora || typeof vendedora!=='string' || !vendedora.trim()) continue;
  const nome = normalizarNome(vendedora);
  let valorVenda = 0;
  for(const c of [1,2,3,4]){
   const v = rows[r]?.[c];
   if(typeof v==='number') valorVenda += v;
  }
  if(valorVenda>0) totals[nome] = (totals[nome]||0) + valorVenda;
 }
 return totals;
}

function extractSellerDetalhes(rows){
 // Igual extractSellerTotals, mas tambem conta quantas vendas cada vendedora fez, em qual forma
 // de pagamento (Dinheiro/Débito/Crédito/Pix) — tanto a QUANTIDADE quanto o VALOR em R$ de cada uma.
 const detalhes = {};
 const colunaParaForma = {1:'dinheiro',2:'debito',3:'credito',4:'pix'};
 for(let r=0;r<rows.length;r++){
  const rownum = rows[r]?.[0];
  const label = String(rownum??'').trim().toLowerCase();
  if(label==='total') break;
  if(typeof rownum!=='number') continue;
  const vendedora = rows[r]?.[5];
  if(!vendedora || typeof vendedora!=='string' || !vendedora.trim()) continue;
  const nome = normalizarNome(vendedora);
  if(!detalhes[nome]) detalhes[nome]={total:0,qtd:0,dinheiro:0,debito:0,credito:0,pix:0,dinheiroValor:0,debitoValor:0,creditoValor:0,pixValor:0};
  for(const c of [1,2,3,4]){
   const v = rows[r]?.[c];
   if(typeof v==='number' && v>0){
    detalhes[nome].total += v;
    detalhes[nome].qtd += 1;
    detalhes[nome][colunaParaForma[c]] += 1;
    detalhes[nome][colunaParaForma[c]+'Valor'] += v;
   }
  }
 }
 return detalhes;
}

function extractTipoVendaTotais(rows){
 // Conta quantos atendimentos foram presenciais e quantos online, olhando a coluna "tipo de venda" (G),
 // e também soma o valor de cada venda (não só a quantidade), pra dar pra usar em filtros.
 // Importante: só conta se a venda teve valor de verdade (mesmo critério de countTransactions) —
 // sem essa checagem, linhas do molde com "presencial" pré-preenchido mas sem pagamento inflavam a contagem.
 const totais = {presencial:0, online:0, presencialValor:0, onlineValor:0};
 for(let r=0;r<rows.length;r++){
  const rownum = rows[r]?.[0];
  const label = String(rownum??'').trim().toLowerCase();
  if(label==='total') break;
  if(typeof rownum!=='number') continue;
  const tipo = rows[r]?.[6];
  if(!tipo || typeof tipo!=='string') continue;
  const t = tipo.trim().toLowerCase();
  if(t!=='presencial' && t!=='online') continue;
  let valorVenda = 0;
  for(const c of [1,2,3,4]){
   const v = rows[r]?.[c];
   if(typeof v==='number') valorVenda += v;
  }
  if(valorVenda<=0) continue;
  totais[t]++;
  totais[t+'Valor'] += valorVenda;
 }
 return totais;
}

function extractPrimeiraUltimaVenda(rows){
 // Usa a coluna "temp" (L) — mesma coluna já usada em Horários de Pico —
 // mas aqui guarda o horário exato da primeira e da última venda do dia.
 let primeira=null, ultima=null;
 for(let r=0;r<rows.length;r++){
  const rownum = rows[r]?.[0];
  const label = String(rownum??'').trim().toLowerCase();
  if(label==='total') break;
  if(typeof rownum!=='number') continue;
  const frac = extrairFracaoTempo(rows[r]?.[11]);
  if(frac===null) continue;
  if(primeira===null || frac<primeira) primeira=frac;
  if(ultima===null || frac>ultima) ultima=frac;
 }
 return { primeiraVenda: formatarHoraFracao(primeira), ultimaVenda: formatarHoraFracao(ultima) };
}

function extractHorariosVendas(rows){
 // Lista o horário exato (em fração do dia) de cada venda individual, em ordem crescente —
 // usada pra calcular os "intervalos sem vendas" (maiores gaps de tempo entre uma venda e outra).
 const horarios = [];
 for(let r=0;r<rows.length;r++){
  const rownum = rows[r]?.[0];
  const label = String(rownum??'').trim().toLowerCase();
  if(label==='total') break;
  if(typeof rownum!=='number') continue;
  let valorVenda = 0;
  for(const c of [1,2,3,4]){
   const v = rows[r]?.[c];
   if(typeof v==='number') valorVenda += v;
  }
  if(valorVenda<=0) continue;
  const frac = extrairFracaoTempo(rows[r]?.[11]);
  if(frac===null) continue;
  horarios.push(frac);
 }
 return horarios.sort((a,b)=>a-b);
}

function extractGeneroTotais(rows){
 // Usa a coluna "genero" (J). Só conta linhas com vendedora preenchida (venda real) —
 // a planilha vem com "mulher" pré-preenchido em todo o molde de 60 linhas, mesmo nas vazias.
 // Também exige valor de venda > 0 (mesmo critério de countTransactions), pra bater com a contagem oficial de vendas.
 const totais = {mulher:{qtd:0,valor:0}, homem:{qtd:0,valor:0}};
 for(let r=0;r<rows.length;r++){
  const rownum = rows[r]?.[0];
  const label = String(rownum??'').trim().toLowerCase();
  if(label==='total') break;
  if(typeof rownum!=='number') continue;
  const vendedoraRaw = rows[r]?.[5];
  if(!vendedoraRaw || typeof vendedoraRaw!=='string' || !vendedoraRaw.trim()) continue; // sem vendedora = linha vazia do molde
  const generoRaw = rows[r]?.[9];
  if(!generoRaw || typeof generoRaw!=='string') continue;
  const g = generoRaw.trim().toLowerCase();
  if(g!=='mulher' && g!=='homem') continue;
  let valorVenda = 0;
  for(const c of [1,2,3,4]){
   const v = rows[r]?.[c];
   if(typeof v==='number') valorVenda += v;
  }
  if(valorVenda<=0) continue;
  totais[g].qtd += 1;
  totais[g].valor += valorVenda;
 }
 return totais;
}

function extractTurnos(rows){
 // Usa a coluna "turno de atendimento" (K) que já vem pronta na planilha (manhã/meio-dia/tarde).
 // Exige valor de venda > 0 (mesmo critério das outras contagens), pra não inflar com linhas vazias do molde.
 const porTurno = {};
 const porTurnoVend = {};
 const turnosValidos = ['manhã','meio-dia','tarde'];
 let totalComTurno = 0;
 for(let r=0;r<rows.length;r++){
  const rownum = rows[r]?.[0];
  const label = String(rownum??'').trim().toLowerCase();
  if(label==='total') break;
  if(typeof rownum!=='number') continue;
  const turnoRaw = rows[r]?.[10];
  if(!turnoRaw || typeof turnoRaw!=='string') continue;
  const turno = turnoRaw.trim();
  if(!turnosValidos.includes(turno)) continue; // ignora valores estranhos tipo #VALUE!
  let valorVenda = 0;
  for(const c of [1,2,3,4]){
   const v = rows[r]?.[c];
   if(typeof v==='number') valorVenda += v;
  }
  if(valorVenda<=0) continue;
  if(!porTurno[turno]) porTurno[turno] = {qtd:0, valor:0};
  porTurno[turno].qtd += 1;
  porTurno[turno].valor += valorVenda;
  totalComTurno++;

  const vendedoraRaw = rows[r]?.[5];
  if(vendedoraRaw && typeof vendedoraRaw==='string' && vendedoraRaw.trim()){
   const nome = normalizarNome(vendedoraRaw);
   if(!porTurnoVend[turno]) porTurnoVend[turno] = {};
   if(!porTurnoVend[turno][nome]) porTurnoVend[turno][nome] = {qtd:0, valor:0};
   porTurnoVend[turno][nome].qtd += 1;
   porTurnoVend[turno][nome].valor += valorVenda;
  }
 }
 return {porTurno, porTurnoVend, totalComTurno};
}

function extractHorariosPico(rows){
 // Conta quantas vendas, o valor total e quanto foi em dinheiro, em cada hora do dia (coluna L, "temp").
 const porHora = {};
 for(let r=0;r<rows.length;r++){
  const rownum = rows[r]?.[0];
  const label = String(rownum??'').trim().toLowerCase();
  if(label==='total') break;
  if(typeof rownum!=='number') continue;
  const hora = extrairHoraDoValor(rows[r]?.[11]);
  if(hora===null || hora<0 || hora>23) continue;
  const dinheiro = typeof rows[r]?.[1]==='number' ? rows[r][1] : 0;
  let valorVenda = 0;
  for(const c of [1,2,3,4]){
   const v = rows[r]?.[c];
   if(typeof v==='number') valorVenda += v;
  }
  if(!porHora[hora]) porHora[hora] = {qtd:0, valor:0, dinheiro:0};
  porHora[hora].qtd += 1;
  porHora[hora].valor += valorVenda;
  porHora[hora].dinheiro += dinheiro;
 }
 return porHora;
}

function extractProdutosVendidos(rows){
 // Soma a quantidade e o valor de cada produto vendido, olhando as colunas
 // "produto que foram vendidos" (H) e "qt de produtos" (I).
 const produtos = {};
 for(let r=0;r<rows.length;r++){
  const rownum = rows[r]?.[0];
  const label = String(rownum??'').trim().toLowerCase();
  if(label==='total') break;
  if(typeof rownum!=='number') continue;
  const produto = rows[r]?.[7];
  if(!produto || typeof produto!=='string' || !produto.trim()) continue;
  const nome = produto.trim();
  const qt = rows[r]?.[8];
  let valorVenda = 0;
  for(const c of [1,2,3,4]){
   const v = rows[r]?.[c];
   if(typeof v==='number') valorVenda += v;
  }
  if(!produtos[nome]) produtos[nome] = {qtd:0, valor:0};
  produtos[nome].qtd += (typeof qt==='number' ? qt : 1);
  produtos[nome].valor += valorVenda;
 }
 return produtos;
}

function countTransactions(rows){
 // Conta quantas linhas de venda existem (uma linha = um atendimento/venda), até achar a linha "total".
 let qtd = 0;
 for(let r=0;r<rows.length;r++){
  const rownum = rows[r]?.[0];
  const label = String(rownum??'').trim().toLowerCase();
  if(label==='total') break;
  if(typeof rownum!=='number') continue;
  let valorVenda = 0;
  for(const c of [1,2,3,4]){
   const v = rows[r]?.[c];
   if(typeof v==='number') valorVenda += v;
  }
  if(valorVenda>0) qtd++;
 }
 return qtd;
}

function extractVendasIndividuais(rows){
 // Lista o valor de cada venda individual do dia (soma das colunas de pagamento por linha),
 // usada pra detectar vendas muito fora do padrão (possível erro de digitação).
 const valores = [];
 for(let r=0;r<rows.length;r++){
  const rownum = rows[r]?.[0];
  const label = String(rownum??'').trim().toLowerCase();
  if(label==='total') break;
  if(typeof rownum!=='number') continue;
  let valorVenda = 0;
  for(const c of [1,2,3,4]){
   const v = rows[r]?.[c];
   if(typeof v==='number') valorVenda += v;
  }
  if(valorVenda>0) valores.push(valorVenda);
 }
 return valores;
}

function extractRegistrosVendas(rows){
 // Igual extractVendasIndividuais, mas guarda o contexto completo de cada venda
 // (vendedora, turno, quantidade de itens) — usado no card de "Recordes de Vendas Individuais".
 const registros = [];
 for(let r=0;r<rows.length;r++){
  const rownum = rows[r]?.[0];
  const label = String(rownum??'').trim().toLowerCase();
  if(label==='total') break;
  if(typeof rownum!=='number') continue;
  let valorVenda = 0;
  for(const c of [1,2,3,4]){
   const v = rows[r]?.[c];
   if(typeof v==='number') valorVenda += v;
  }
  if(valorVenda<=0) continue;
  const vendedoraRaw = rows[r]?.[5];
  const vendedora = (vendedoraRaw && typeof vendedoraRaw==='string' && vendedoraRaw.trim()) ? normalizarNome(vendedoraRaw) : null;
  const turnoRaw = rows[r]?.[10];
  const turno = (turnoRaw && typeof turnoRaw==='string' && ['manhã','meio-dia','tarde'].includes(turnoRaw.trim())) ? turnoRaw.trim() : null;
  const qtdItensRaw = rows[r]?.[8];
  const qtdItens = (typeof qtdItensRaw==='number' && qtdItensRaw>0) ? qtdItensRaw : null;
  const horarioFrac = extrairFracaoTempo(rows[r]?.[11]);
  registros.push({ valor: valorVenda, vendedora, turno, qtdItens, horario: horarioFrac, hora: formatarHoraFracao(horarioFrac) });
 }
 return registros;
}

function numeroPlanilha(v){
 if(typeof v==='number' && Number.isFinite(v)) return v;
 if(v===null || v===undefined) return 0;
 let s=String(v).trim();
 if(!s) return 0;
 s=s.replace(/R\$/gi,'').replace(/\s/g,'');
 if(s.includes(',') && s.includes('.')) s=s.replace(/\./g,'').replace(',','.');
 else if(s.includes(',')) s=s.replace(',','.');
 else if((s.match(/\./g)||[]).length>1) s=s.replace(/\./g,'');
 const n=Number(s);
 return Number.isFinite(n) ? n : 0;
}

function colunaExcel(indiceZero){
 let n=Number(indiceZero);
 if(!Number.isFinite(n)||n<0) return '?';
 let s='';
 do{ s=String.fromCharCode(65+(n%26))+s; n=Math.floor(n/26)-1; }while(n>=0);
 return s;
}

function obterValorCelulaPlanilha(rows,r,c,profundidade){
 if(profundidade>3) return 0;
 const bruto=rows?.[r]?.[c];
 if(typeof bruto==='number' && Number.isFinite(bruto)) return bruto;
 if(bruto===null||bruto===undefined) return 0;
 const texto=String(bruto).trim();
 const ref=texto.match(/^=\$?([A-Z]{1,3})\$?(\d+)$/i);
 if(ref){
  const letras=ref[1].toUpperCase(), linha=Number(ref[2])-1;
  let col=0;
  for(let i=0;i<letras.length;i++) col=col*26+(letras.charCodeAt(i)-64);
  return obterValorCelulaPlanilha(rows,linha,col-1,profundidade+1);
 }
 return numeroPlanilha(bruto);
}

function valorPlanilhaPreenchido(bruto){
 if(typeof bruto==='number') return Number.isFinite(bruto);
 if(bruto===null||bruto===undefined) return false;
 const s=String(bruto).trim();
 if(!s) return false;
 return Number.isFinite(numeroPlanilha(bruto));
}

function textoNormalizadoPlanilha(v){
 return String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
}

function ehRotuloFechamentoCaixa(v){
 const t=textoNormalizadoPlanilha(v);
 return ((t.includes('fechamento')&&t.includes('caixa')) ||
         t.includes('saldo final do caixa') ||
         t==='saldo final' ||
         t.includes('valor que ficou no caixa'));
}

function extrairFechamentoCaixaDaPlanilha(rows){
 const rotulos=[];
 for(let r=0;r<rows.length;r++){
  for(let c=0;c<(rows[r]?.length||0);c++){
   if(ehRotuloFechamentoCaixa(rows[r]?.[c])) rotulos.push({r,c});
  }
 }
 if(!rotulos.length) return {encontrado:false,valor:null,celula:null,rotulo:null};

 // A planilha já usa os dois formatos:
 // 26/09 -> rótulo acima e valor abaixo (M24 -> M25)
 // 28/09 -> valor acima e rótulo abaixo (M25 -> M26)
 // Portanto, só avaliamos células imediatamente ligadas ao rótulo e preferimos ABAIXO.
 for(let i=rotulos.length-1;i>=0;i--){
  const {r,c}=rotulos[i];
  const ordem=[
   {r:r+1,c},
   {r:r-1,c},
   {r,c:c+1},
   {r,c:c-1}
  ];
  for(const x of ordem){
   if(x.r<0||x.r>=rows.length||x.c<0) continue;
   const bruto=rows[x.r]?.[x.c];
   if(!valorPlanilhaPreenchido(bruto)) continue;
   return {
    encontrado:true,
    valor:numeroPlanilha(bruto),
    celula:colunaExcel(x.c)+String(x.r+1),
    rotulo:colunaExcel(c)+String(r+1)
   };
  }
 }
 const ultimo=rotulos[rotulos.length-1];
 return {encontrado:false,valor:null,celula:null,rotulo:colunaExcel(ultimo.c)+String(ultimo.r+1)};
}

function extrairValorPorRotulo(rows, predicado){
 for(let r=0;r<rows.length;r++){
  for(let c=0;c<(rows[r]?.length||0);c++){
   if(!predicado(rows[r]?.[c])) continue;
   for(const dr of [1,-1]){
    const rr=r+dr;
    if(rr<0||rr>=rows.length) continue;
    const bruto=rows[rr]?.[c];
    if(valorPlanilhaPreenchido(bruto)) return {encontrado:true,valor:numeroPlanilha(bruto),celula:colunaExcel(c)+String(rr+1)};
   }
  }
 }
 return {encontrado:false,valor:0,celula:null};
}
