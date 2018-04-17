// 第三方应用接口内容
// 1. 获取G地址
// 2. 支付
// 3. pathpayment支付
// 4. 加密信息
// 5. 备份非敏感数据
// 6. 恢复非敏感数据
// 7. 授信

export function FFWScript(address, data = {}){
  // return [
  //   'if(!window.FFW){'
  //     ,'window.FFW = {};'
  //     ,'FFW.address="',address,'";'
  //     ,'FFW.pay = function(destination,'


  //   ,'};'
  // ].join('')
  let appdata = Object.assign({contacts:[], myaddresses:[]},data);
  return 
    `if(!window.FFW){
      window.FFW = {};
      FFW.address = "${address}";
      FFW.pay = function(destination,code,issuer,amount,memo_type,memo){ 
        var params = { type:'pay',destination: destination, code: code, issuer: issuer, amount: amount, memo_type: memo_type, memo: memo };
        cordova_iab.postMessage(JSON.stringify(params));
      };
      FFW.pathPayment = function(destination,code,issuer,amount,memo_type,memo){ 
        var params = { type:'pathPayment',destination: destination, code: code, issuer: issuer, amount: amount, memo_type: memo_type, memo: memo };
        cordova_iab.postMessage(JSON.stringify(params));
      };
      FFW.sign = function(data){
        var params = { type: 'sign', data: data};
        cordova_iab.postMessage(JSON.stringify(params));
      };
      FFW.contacts = "${appdata.contacts}";
      FFW.myaddresses = "${data.myaddresses}";
      FFW.backup = function(contacts,myaddresses){
        var params = { type: 'backup', contacts: contacts, myaddresses: myaddresses};
        cordova_iab.postMessage(JSON.stringify(params));
      };
      FFW.trust = function(code,issuer){
        var params = { type: 'backup', contacts: contacts, myaddresses: myaddresses};
        cordova_iab.postMessage(JSON.stringify(params));
      };
    };`
}

