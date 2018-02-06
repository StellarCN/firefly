import StellarSdk from 'stellar-sdk'
import { getServer } from './server'
import { address as getAddress } from './account'

// change trust
// @param limit 0 means delete trust
export function changeTrust(seed,code, issuer, limit="100000000000") {
  var address = getAddress(seed)
  var asset = new StellarSdk.Asset(code, issuer);
  console.debug('Turst asset', asset, limit);
  return getServer().loadAccount(address).then((account)=>{
    //account.incrementSequenceNumber();
    StellarSdk.Network.usePublicNetwork();
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
