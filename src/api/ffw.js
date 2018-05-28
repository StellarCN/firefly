// 第三方应用接口内容
// 1. 获取G地址
// 2. 支付
// 3. pathpayment支付
// 4. 加密信息
// 5. 备份非敏感数据
// 6. 恢复非敏感数据
// 7. 授信
import pkg from '../../package'



export const FFW_EVENT_TYPE_PAY = 'pay'
export const FFW_EVENT_TYPE_PATHPAYMENT = 'pathPayment'
export const FFW_EVENT_TYPE_SIGN = 'sign'
export const FFW_EVENT_TYPE_BACKUP = 'backup'
export const FFW_EVENT_TYPE_RECOVERY = 'recovery'
export const FFW_EVENT_TYPE_TRUST = 'trust'
export const FFW_EVENT_TYPE_SIGNXDR = 'signXDR'

export function FFWScript(address, data = {}, isIos = false, platform){
  // return [
  //   'if(!window.FFW){'
  //     ,'window.FFW = {};'
  //     ,'FFW.address="',address,'";'
  //     ,'FFW.pay = function(destination,'


  //   ,'};'
  // ].join('')
  let method = isIos ? 'window.webkit.messageHandlers.cordova_iab' : 'cordova_iab'
  let appdata = Object.assign({contacts:[], myaddresses:[]},data);
  let version = pkg.version
  return `if(!window.FFW){
      window.FFW = {};
      FFW.version = "${version}";
      FFW.platform = "${platform}";
      FFW.address = "${address}";
      FFW.contacts = "${appdata.contacts}";
      FFW.myaddresses = "${data.myaddresses}";
      FFW.callbackObjs = {}

      FFW.addCallback = function(id,fn){
        FFW.callbackObjs[id] = fn;
      };

      FFW.callback = function(id, data){
        var fn = FFW.callbackObjs[id]
        if(fn === undefined){
          fn = window[id];
        }
        if(fn === undefined){
          throw new Error('no callback function');
          return
        }
        fn.apply(this,[data]);
        delete FFW.callbackObjs[id];    
      };

      FFW.pay = function(data,callback){ 
        var params = { type:'pay',destination: data.destination, code: data.code, issuer: data.issuer, amount: data.amount, memo_type: data.memo_type, memo: data.memo};
        if(typeof callback === 'function'){
          var id = 'FFW_CB_' + new Date().getTime();
          FFW.addCallback(id, callback);
          params['callback'] = id;
        }else{
          params['callback'] = callback;
        }
        try{
          ${method}.postMessage(JSON.stringify(params));  
        }catch(err){
          console.error(err);
          FFW.callback(params['callback'] ,{code:"fail",message:err.message});
        }
      };
      FFW.pathPayment = function(data,callback){ 
        var params = { type:'pathPayment',destination: data.destination, code: data.code, issuer: data.issuer, amount: data.amount, memo_type: data.memo_type, memo: data.memo };
        if(typeof callback === 'function'){
          var id = 'FFW_CB_' + new Date().getTime();
          FFW.addCallback(id, callback);
          params['callback'] = id;
        }else{
          params['callback'] = callback;
        }
        try{
          ${method}.postMessage(JSON.stringify(params));  
        }catch(err){
          console.error(err);
          FFW.callback(params['callback'] ,{code:"fail",message:err.message});
        }
      };

      FFW.sign = function(data,callback){
        var params = { type: 'sign', data: data};
        if(typeof callback === 'function'){
          var id = 'FFW_CB_' + new Date().getTime();
          FFW.addCallback(id, callback);
          params['callback'] = id;
        }else{
          params['callback'] = callback;
        }
        try{
          ${method}.postMessage(JSON.stringify(params));  
        }catch(err){
          console.error(err);
          FFW.callback(params['callback'] ,{code:"fail",message:err.message});
        }
      };

      FFW.signXDR = function(data,message,callback){
        var params = { type: 'signXDR', data: data, message: message };
        if(typeof callback === 'function'){
          var id = 'FFW_CB_' + new Date().getTime()
          FFW.addCallback(id, callback)
          params['callback'] = id
        }else{
          params['callback'] = callback
        }
        try{
          ${method}.postMessage(JSON.stringify(params));  
        }catch(err){
          console.error(err);
          FFW.callback(params['callback'] ,{code:"fail",message:err.message});
        }
      };


      FFW.backup = function(callback){
        var params = { type: 'backup'};
        if(typeof callback === 'function'){
          var id = 'FFW_CB_' + new Date().getTime();
          FFW.addCallback(id, callback);
          params['callback'] = id;
        }else{
          params['callback'] = callback;
        }
        try{
          ${method}.postMessage(JSON.stringify(params));  
        }catch(err){
          console.error(err);
          FFW.callback(params['callback'] ,{code:"fail",message:err.message});
        }
      };
      FFW.recovery = function(data,callback){
        var params = { type: 'recovery', data: data };
        if(typeof callback === 'function'){
          var id = 'FFW_CB_' + new Date().getTime();
          FFW.addCallback(id, callback);
          params['callback'] = id;
        }else{
          params['callback'] = callback;
        }
        try{
          ${method}.postMessage(JSON.stringify(params));  
        }catch(err){
          console.error(err);
          FFW.callback(params['callback'] ,{code:"fail",message:err.message});
        }
      };
      FFW.trust = function(code,issuer,callback){
        var params = { type: 'trust', code: code, issuer: issuer };
        if(typeof callback === 'function'){
          var id = 'FFW_CB_' + new Date().getTime();
          FFW.addCallback(id, callback);
          params['callback'] = id;
        }else{
          params['callback'] = callback;
        }
        try{
          ${method}.postMessage(JSON.stringify(params));  
        }catch(err){
          console.error(err);
          FFW.callback(params['callback'] ,{code:"fail",message:err.message});
        }
      };
      
    };`
}

