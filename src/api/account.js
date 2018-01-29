import NP from 'number-precision'
import StellarSdk from 'stellar-sdk'
import { getServer} from './server'
import { readAccountData } from './storage'
import { encrypt, decrypt } from './crypt'
import { importAccountFromData } from './qr'
import { getAsset } from './assets'
import { BASE_RESERVE } from './gateways'
var Promise = require('es6-promise').Promise

// create random account
export function random(){
  var keypair = StellarSdk.Keypair.random();
  return {address: keypair.publicKey(), seed:keypair.secret()};
}

// generate public address from secret key
export function address(seed) {
  var keypair = StellarSdk.Keypair.fromSecret(seed);
  console.log(keypair)
  return keypair.publicKey();
}
// validate address
export function isValidateAddress(address){
  //return StellarSdk.Keypair.isValidPublicKey(address);
  return StellarSdk.StrKey.isValidEd25519PublicKey(address)
}

// get account info
// return Pomise
export function getAccountInfo(address){
  console.log(` get accountinfo ${address}`)
  return getServer().accounts().accountId(address).call();
}

// sign in
export function signin(address,password){
  return readAccountData(address,passowrd)
    .then(account => {
      return new Promise((resolve,reject)=>{
        if(null === account || typeof account === 'undefined'){
          reject('Error.PasswordWrong')
        }else{
          resolve(account)
        }
      })
    })
}

export function getMemo (type, memo) {
  if (memo) {
    switch (type.toUpperCase()) {
    case 'ID':
      return StellarSdk.Memo.id(memo);
    case 'TEXT':
      return StellarSdk.Memo.text(memo);
    case 'HASH':
      return StellarSdk.Memo.hash(memo);
    }
  } else {
    return StellarSdk.Memo.none();
  }
  throw new Error('UnSupportMemo');
}

/**
 * 校验余额是否足够
 * @param {*} assetdata
 * @param {*} amount
 * @param {*} balances
 */
function checkBalance(assetdata,amount,balances){
  for(var i=0,n=balances.length;i<n;i++){
    let assettype = balances[i].asset_type
    if('native' === assettype && assetdata.code === 'XLM'){
      if(Number(amount) > Number(balances[i].balance))throw new Error('Error.NotEnoughAsset')
    }
    let assetcode = balances[i].asset_code
    let assetissuer = balances[i].asset_issuer
    if(assetdata.code === assetcode &&  assetdata.issuer === assetissuer){
      if(Number(amount) > Number(balances[i].balance))throw new Error('Error.NotEnoughAsset')
    }
  }
}

function checkAssetAvailable(assetdata,balances){
  if('XLM' === assetdata.code)return true
  let flag = false
  for(var i=0,n=balances.length;i<n;i++){
    let assetcode = balances[i].asset_code
    let assetissuer = balances[i].asset_issuer
    if(assetdata.code === assetcode &&  assetdata.issuer === assetissuer){

    }
  }
}

// send asset
// return Promise
export function send(seed,address,target,assetdata,amount,memo_type,memo_value,base_reserve){
  let amountstr = NP.round(Number(amount), 7).toString();//Math.round(amount, 7)
  address = address ? address : address(address)
  let asset = getAsset(assetdata.code , assetdata.issuer)
  let server  = getServer()
  return server.loadAccount(address).then(acc=>{
    //判断资产是否不够
    let balances = acc.balances
    checkBalance(assetdata, amount, balances)
    return server.loadAccount(target)
      .then(tacc=>{
          //判断当前用户是否接收本资产？
          checkAssetAvailable(assetdata,tacc.balances)
         //acc.incrementSequenceNumber();
          var payment = StellarSdk.Operation.payment({destination: target,asset: asset,amount: amountstr})
          var memo = getMemo(memo_type, memo_value);
          var tx = new StellarSdk.TransactionBuilder(acc, {memo:memo}).addOperation(payment).build();
          tx.sign(StellarSdk.Keypair.fromSecret(seed));
          return server.submitTransaction(tx);
      })
      .catch(err=>{
        if('Error.NotEnoughAsset' === err.message)throw err
        //账户状态是404才会调用创建账户功能
        if(err.data && err.data.status === 404){
          //新建用户只能发XLM
          if(assetdata.code!='XLM')throw new Error('Error.AccountNotFund')
            //是否资产不足
            var reserve = 2 * ( base_reserve || BASE_RESERVE )
            if(Number(amount)< reserve)throw new Error('Error.NotEnoughAssetToFundAccount')
            console.log('创建账户')
            //创建账户
            var createaccount = StellarSdk.Operation.createAccount({destination: target,startingBalance: amount})
            var memo = getMemo(memo_type, memo_value);
            var tx = new StellarSdk.TransactionBuilder(acc, {memo:memo}).addOperation(createaccount).build();
            tx.sign(StellarSdk.Keypair.fromSecret(seed));
            return server.submitTransaction(tx);
        }else{
          throw err
        }
      })

  })// end of loadAccount
}

// account stream
var _stream = undefined;

export function listenAccountStream(address,handler){
  closeAccountStream();
  _stream = getServer().accounts().accountId(address).stream({
    onmessage: res => {
      handler(res);
    }
  });


}

export function closeAccountStream(){
  if(_stream){
    _stream();
    _stream = undefined;
  }
}

export function getStream(){
  return _stream
}


// account fund
export function fund(seed,target, amount, memo_type, memo_value) {
  amount = round(amount, 7);
  var _address = address(seed)
  return getServer().loadAccount(_address).then((account) => {
    //account.incrementSequenceNumber();
    var payment = StellarSdk.Operation.createAccount({
      destination: target,
      startingBalance: amount.toString()
    });
    var memo = getMemo(memo_type, memo_value);
    var tx = new StellarSdk.TransactionBuilder(account, {memo:memo}).addOperation(payment).build();
    tx.sign(StellarSdk.Keypair.fromSecret(seed));
    return getServer().submitTransaction(tx);
  });
}

export function isValidSeed(seed){
  return StellarSdk.StrKey.isValidEd25519SecretSeed(seed)
}

/**
 * 导入账户
 * 1. 直接导入私钥
 * 2. 导入的是stargaze的账户类型
 */
export function importAccount(data){
  return importAccountFromData(data)
}

export function shortAddress(address){
  if (!address || address.length < 20) {
    return address;
  }
  var start = address.substring(0, 8);
  var end = address.substring(address.length - 8);
  return start + '...' + end;
}

export function miniAddress(address){
  if (!address || address.length < 12) {
    return address;
  }
  var start = address.substring(0, 4);
  var end = address.substring(address.length - 4);
  return start + '...' + end;
}

export function isValidMemo(type, memo) {
  let valid = true;
  try {
    switch (type.toUpperCase()) {
      case 'ID':
        StellarSdk.Memo.id(memo);
        break;
      case 'TEXT':
        StellarSdk.Memo.text(memo);
        break;
      case 'HASH':
        StellarSdk.Memo.hash(memo);
        break;
      case 'RETURN':
        StellarSdk.Memo.return(memo);
        break;
      default:
        valid = false;
    }
  } catch (err) {
    valid = false;
  }
  return valid;
};
