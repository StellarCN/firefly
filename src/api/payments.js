import StellarSdk from 'stellar-sdk'
import { getServer }  from './server'
import { findAccount } from './storage'
import { encrypt, decrypt } from './crypt'
var Promise = require('es6-promise').Promise

// fetch payments 
// return page
export function fetchPayments(address,order='desc',limit=200){
  return getServer().payments().forAccount(address).order(order).limit(limit).call();
}

// convert 
export function convertRecords(address,rows){
  var data = [];
  for(var i=0,n=rows.length;i<n;i++){
    var r = rows[i];
    var t = { "id": r.id, "type": r.type };
    //console.log(`---------------------convert row---------`)
    //console.log(r.transaction())//返回的promise
    switch(r.type){
      case 'payment':
      case 'path_payment':
        t.isInbound = r.to === address;
        t.counterparty = t.isInbound ? r.from : r.to;
        t.asset = r.asset_type == "native" ? {code: "XLM"} : {code:r.asset_code, issuer: r.asset_issuer};
        t.amount = parseFloat(r.amount);
        break;
      case 'create_account':
        t.isInbound = r.account === address;
        t.counterparty = t.isInbound ? r.source_account : r.account;
        t.asset = {code: "XLM"};
        t.amount = parseFloat(r.starting_balance);
        break;
      default:
      
    }
    data.push(t);
  } 
  return data;
}

let _payment_stream = undefined


export function listenPaymentStream(address,handler){
  closePaymentStream();
  _payment_stream = getServer().payments().forAccount(address).stream({
    onmessage: res => {
      handler(res);
    }
  });


}

export function closePaymentStream(){
  if(_payment_stream){
    _payment_stream();
    _payment_stream = undefined;
  }
}

export function getPaymentStream(){
  return _payment_stream
}
