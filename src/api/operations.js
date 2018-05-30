import StellarSdk from 'stellar-sdk'
import { getServer } from './server'
import { address as getAddress } from './account'

export const ASSET_TRUST_LIMIT = "707382697076.89"

// change trust
// @param limit 0 means delete trust
// 707382697076.89   FIREFLY的charcode
// 100000000000
export function changeTrust(seed,code, issuer, limit=ASSET_TRUST_LIMIT) {
  var address = getAddress(seed)
  var asset = new StellarSdk.Asset(code, issuer);
  console.debug('Turst asset', asset, limit);
  return getServer().loadAccount(address).then((account)=>{
    //account.incrementSequenceNumber();
   // StellarSdk.Network.usePublicNetwork();
    var op = StellarSdk.Operation.changeTrust({
      asset: asset,
      limit: limit.toString()
    });
    console.log(account)
    var tx = new StellarSdk.TransactionBuilder(account).addOperation(op).build();
    tx.sign(StellarSdk.Keypair.fromSecret(seed));
    return getServer().submitTransaction(tx);
  });
};


export function  trustAll(seed, assets = [], limit=ASSET_TRUST_LIMIT){
  var address = getAddress(seed)

  return getServer().loadAccount(address).then((account)=>{
    
    var tx = new StellarSdk.TransactionBuilder(account)
    for(var i =0,n=assets.length; i<n ; i++ ){
      let op = trustOption(assets[i].code, assets[i].issuer)
      tx = tx.addOperation(op)
    }
    tx = tx.build();
    tx.sign(StellarSdk.Keypair.fromSecret(seed));
    return getServer().submitTransaction(tx);
  });
}

export function trustOption(code,issuer, limit = ASSET_TRUST_LIMIT){
  var asset = new StellarSdk.Asset(code, issuer);
  //StellarSdk.Network.usePublicNetwork();
  var op = StellarSdk.Operation.changeTrust({
    asset: asset,
    limit: limit.toString()
  });
  return op;
}

export function setData(seed,name,value){
  var opt = { name: name, value: value ? value : null}
  console.debug('manageData:', name, '-', value);
  var address = getAddress(seed)
  return getServer().loadAccount(address).then((account) => {
    //account.incrementSequenceNumber();
    var op = StellarSdk.Operation.manageData(opt);
    var tx = new StellarSdk.TransactionBuilder(account).addOperation(op).build();
    tx.sign(StellarSdk.Keypair.fromSecret(seed));
    return getServer().submitTransaction(tx);
  });
}

export function setDatas(seed,values){
  if(values === null)throw new Error('null value')
  var opt = JSON.parse(JSON.stringify(values))
  console.debug(opt)
  var address = getAddress(seed)
  return getServer().loadAccount(address).then((account) => {
    //account.incrementSequenceNumber();
    var op = StellarSdk.Operation.manageData(opt);
    var tx = new StellarSdk.TransactionBuilder(account).addOperation(op).build();
    tx.sign(StellarSdk.Keypair.fromSecret(seed));
    return getServer().submitTransaction(tx);
  });
}

export function setOption(seed, name, value) {
  var opt = {};
  opt[name] = value
  return setOptions(seed,opt)
}

export function setOptions(seed, values) {
  let opt = JSON.parse(JSON.stringify(values))
  let address = getAddress(seed)
  return getServer().loadAccount(address).then((account) => {
    let op = StellarSdk.Operation.setOptions(opt);
    let tx = new StellarSdk.TransactionBuilder(account).addOperation(op).build();
    tx.sign(StellarSdk.Keypair.fromSecret(seed));
    return getServer().submitTransaction(tx);
  })
}
