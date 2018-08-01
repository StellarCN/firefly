// 第三方应用接口内容
// 1. 获取G地址
// 2. 支付
// 3. pathpayment支付
// 4. 加密信息
// 5. 备份非敏感数据
// 6. 恢复非敏感数据
// 7. 授信
import pkg from '../../package'
var sjcl = require('sjcl')


export const FFW_EVENT_TYPE_PAY = 'pay'
export const FFW_EVENT_TYPE_PATHPAYMENT = 'pathPayment'
export const FFW_EVENT_TYPE_SIGN = 'sign'
export const FFW_EVENT_TYPE_BACKUP = 'backup'
export const FFW_EVENT_TYPE_RECOVERY = 'recovery'
export const FFW_EVENT_TYPE_TRUST = 'trust'
export const FFW_EVENT_TYPE_SIGNXDR = 'signXDR'
export const FFW_EVENT_TYPE_SCAN = 'scan'
export const FFW_EVENT_TYPE_SHARE = 'share'
export const FFW_EVENT_TYPE_BALANCES = 'balances'//查询账户余额

export function FFWScript(address, data = {}, isIos = false, platform, locale = 'zh_cn'){
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
  let uuid = device.uuid
  if(uuid){
    let uuidhash = sjcl.hash.sha256.hash(uuid)
    uuid = sjcl.codec.hex.fromBits(uuidhash)
  }
  let contactstr = JSON.stringify(appdata.contacts)
  let myaddressstr = JSON.stringify(appdata.myaddresses)
  return `if(!window.FFW){
      window.FFW = {};
      FFW.version = "${version}";
      FFW.platform = "${platform}";
      FFW.address = "${address}";
      FFW.contacts = ${contactstr};
      FFW.myaddresses = ${myaddressstr};
      FFW.uuid = "${uuid}";
      FFW.locale = "${locale}";
      FFW.callbackObjs = {}

      FFW.addCallback = function(id,fn){
        FFW.callbackObjs[id] = fn;
      };

      FFW.callback = function(id, data){
        var fn = FFW.callbackObjs[id];
        if(fn === undefined){
          fn = window[id];
        }
        if(fn === undefined){
          throw new Error('no callback function');
          return;
        }
        fn.apply(this,[data]);
        delete FFW.callbackObjs[id]; 
      };

      FFW.balances = function(callback){
        var params = { type:'balances'};
        params = genParams(params, callback);
        try{
          ${method}.postMessage(JSON.stringify(params));  
        }catch(err){
          console.error(err);
          FFW.callback(params['callback'] ,{code:"fail",message:err.message});
        }
      };

      FFW.pay = function(data,callback){
        var params = { type:'pay',destination: data.destination, code: data.code, issuer: data.issuer, amount: data.amount, memo_type: data.memo_type, memo: data.memo};
        params = genParams(params, callback);
        try{
          ${method}.postMessage(JSON.stringify(params));  
        }catch(err){
          console.error(err);
          FFW.callback(params['callback'] ,{code:"fail",message:err.message});
        }
      };
      FFW.pathPayment = function(data,callback){ 
        var params = { type:'pathPayment',destination: data.destination, code: data.code, issuer: data.issuer, amount: data.amount, memo_type: data.memo_type, memo: data.memo };
        params = genParams(params, callback);
        try{
          ${method}.postMessage(JSON.stringify(params));  
        }catch(err){
          console.error(err);
          FFW.callback(params['callback'] ,{code:"fail",message:err.message});
        }
      };

      FFW.sign = function(data,callback){
        var params = { type: 'sign', data: data};
        params = genParams(params, callback);
        try{
          ${method}.postMessage(JSON.stringify(params));  
        }catch(err){
          console.error(err);
          FFW.callback(params['callback'] ,{code:"fail",message:err.message});
        }
      };

      FFW.signXDR = function(data,message,callback){
        var params = { type: 'signXDR', data: data, message: message };
        params = genParams(params, callback);
        try{
          ${method}.postMessage(JSON.stringify(params));  
        }catch(err){
          console.error(err);
          FFW.callback(params['callback'] ,{code:"fail",message:err.message});
        }
      };


      FFW.backup = function(callback){
        var params = { type: 'backup'};
        params = genParams(params, callback);
        try{
          ${method}.postMessage(JSON.stringify(params));  
        }catch(err){
          console.error(err);
          FFW.callback(params['callback'] ,{code:"fail",message:err.message});
        }
      };
      FFW.recovery = function(data,callback){
        var params = { type: 'recovery', data: data };
        params = genParams(params, callback);
        try{
          ${method}.postMessage(JSON.stringify(params));  
        }catch(err){
          console.error(err);
          FFW.callback(params['callback'] ,{code:"fail",message:err.message});
        }
      };
      FFW.trust = function(code,issuer,callback){
        var params = { type: 'trust', code: code, issuer: issuer };
        params = genParams(params, callback);
        try{
          ${method}.postMessage(JSON.stringify(params));  
        }catch(err){
          console.error(err);
          FFW.callback(params['callback'] ,{code:"fail",message:err.message});
        }
      };

      FFW.scan = function(callback){
        var params = { type: 'scan'};
        params = genParams(params, callback);
        try{
          ${method}.postMessage(JSON.stringify(params));  
        }catch(err){
          console.error(err);
          FFW.callback(params['callback'] ,{code:"fail",message:err.message});
        }
      };

      FFW.share = function(options,callback){
        var params = { type: 'share', options: options };
        params = genParams(params, callback);
        try{
          ${method}.postMessage(JSON.stringify(params));  
        }catch(err){
          console.error(err);
          FFW.callback(params['callback'] ,{code:"fail",message:err.message});
        }
      };

      FFW.fireEvent = function(type, data, callback){
        var params = { type: type, data: data};
        params = genParams(params, callback);
        try{
          ${method}.postMessage(JSON.stringify(params));  
        }catch(err){
          console.error(err);
          FFW.callback(params['callback'] ,{code:"fail",message:err.message});
        }
      };

      function genParams(param, callback){
        var params = Object.assign({}, param);
        if(typeof callback === 'function'){
          var id = 'FFW_CB_' + new Date().getTime();
          FFW.addCallback(id, callback);
          params['callback'] = id;
        }else{
          params['callback'] = callback;
        }
        return params;
      };
      
    };`
}

