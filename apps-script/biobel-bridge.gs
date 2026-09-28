/** BIOBEL — Ponte Google Apps Script */
function doGet(e){
  var p=(e&&e.parameter)||{};
  var callback=p.callback||"";
  try{
    if(p.action==="writeCell"){
      var id=String(p.spreadsheetId||p.id||"").trim();
      var sheetName=String(p.sheetName||p.sheet||"").trim();
      var cell=String(p.cell||p.range||"").trim().toUpperCase();
      var value=String(p.value||p.horario||"").trim();
      if(!id) return responder({success:false,error:"ID da planilha não informado."},callback);
      if(!/^\\d{2}\\.\\d{2}$/.test(sheetName)) return responder({success:false,error:"Aba inválida. Use o formato DD.MM."},callback);
      if(cell!=="O26") return responder({success:false,error:"Por segurança, esta ponte só permite gravar em O26."},callback);
      if(!/^\\d{2}:\\d{2}$/.test(value)) return responder({success:false,error:"Horário inválido. Use HH:MM."},callback);
      var ss=SpreadsheetApp.openById(id);
      var sh=ss.getSheetByName(sheetName);
      if(!sh) return responder({success:false,error:"Aba "+sheetName+" não encontrada."},callback);
      sh.getRange("O26").setValue(value);
      SpreadsheetApp.flush();
      return responder({success:true,written:true,spreadsheetId:id,sheetName:sheetName,cell:"O26",value:value},callback);
    }
    if(p.id||p.spreadsheetId){
      var rid=String(p.id||p.spreadsheetId).trim();
      var book=SpreadsheetApp.openById(rid);
      var sheets={};
      book.getSheets().forEach(function(sh){
        var values=sh.getDataRange().getValues();
        sheets[sh.getName()]=values.map(function(row){
          return row.map(function(v){
            if(v instanceof Date) return Utilities.formatDate(v,Session.getScriptTimeZone(),"dd/MM/yyyy HH:mm:ss");
            return v;
          });
        });
      });
      return responder({success:true,sheets:sheets},callback);
    }
    return responder({success:false,error:"Ação não informada."},callback);
  }catch(err){
    return responder({success:false,error:String(err&&err.message?err.message:err)},callback);
  }
}
function doPost(e){return doGet(e);}
function responder(obj,callback){
  var json=JSON.stringify(obj);
  if(callback&&/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(callback)){
    return ContentService.createTextOutput(callback+"("+json+");").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
