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
