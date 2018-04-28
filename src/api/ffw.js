// 第三方应用接口内容
// 1. 获取G地址
// 2. 支付
// 3. pathpayment支付
// 4. 加密信息
// 5. 备份非敏感数据
// 6. 恢复非敏感数据
// 7. 授信

export const FFW_EVENT_TYPE_PAY = 'pay'
export const FFW_EVENT_TYPE_PATHPAYMENT = 'pathPayment'
export const FFW_EVENT_TYPE_SIGN = 'sign'
export const FFW_EVENT_TYPE_BACKUP = 'backup'
export const FFW_EVENT_TYPE_RECOVERY = 'recovery'
export const FFW_EVENT_TYPE_TRUST = 'trust'

export function FFWScript(address, data = {}){
  // return [
  //   'if(!window.FFW){'
  //     ,'window.FFW = {};'
  //     ,'FFW.address="',address,'";'
  //     ,'FFW.pay = function(destination,'


  //   ,'};'
  // ].join('')
  let appdata = Object.assign({contacts:[], myaddresses:[]},data);
  return `if(!window.FFW){
      window.FFW = {};
      FFW.address = "${address}";
      FFW.contacts = "${appdata.contacts}";
      FFW.myaddresses = "${data.myaddresses}";
      
      FFW.pay = function(data,callback){ 
        var params = { type:'pay',destination: data.destination, code: data.code, issuer: data.issuer, amount: data.amount, memo_type: data.memo_type, memo: data.memo,callback:callback };
        cordova_iab.postMessage(JSON.stringify(params));
      };
      FFW.pathPayment = function(data,callback){ 
        var params = { type:'pathPayment',destination: data.destination, code: data.code, issuer: data.issuer, amount: data.amount, memo_type: data.memo_type, memo: data.memo,callback:callback };
        cordova_iab.postMessage(JSON.stringify(params));
      };
      FFW.sign = function(data,callback){
        var params = { type: 'sign', data: data, callback: callback};
        cordova_iab.postMessage(JSON.stringify(params));
      };

      FFW.backup = function(callback){
        var params = { type: 'backup', callback: callback};
        cordova_iab.postMessage(JSON.stringify(params));
      };
      FFW.recovery = function(data,callback){
        var params = { type: 'recovery', data: data, callback: callback};
        cordova_iab.postMessage(JSON.stringify(params));
      };
      FFW.trust = function(code,issuer,callback){
        var params = { type: 'trust', code: code, issuer: issuer,callback:callback};
        cordova_iab.postMessage(JSON.stringify(params));
      };
      
    };`
}

