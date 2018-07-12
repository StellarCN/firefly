import NP from 'number-precision'
import StellarSdk from 'stellar-sdk'
import { getServer} from './server'
import { readAccountData } from './storage'
import { encrypt, decrypt } from './crypt'
import { importAccountFromData } from './qr'
import { getAsset, isNativeAsset } from './assets'
import { BASE_RESERVE } from './gateways'
var Promise = require('es6-promise').Promise
import StellarHDWallet from '../libs/stellar-hd-wallet/src/stellar-hd-wallet'


// create random account
export function random(){
  var keypair = StellarSdk.Keypair.random();
  return {address: keypair.publicKey(), seed:keypair.secret()};
}
/**
 * 随机生成助记词
 * @param {string} language 语言
 */
export function randomByMnemonic(language = 'english'){
  return StellarHDWallet.generateMnemonic({language, entropyBits: 128})//生成24个字符串
}
/**
 * 根据mnemonic生成账户
 * @param {String} mnemonic 
 * @param { string } language 语言,默认值  english
 */
export function fromMnemonic(mnemonic,language = 'english'){
  return StellarHDWallet.fromMnemonic(mnemonic, undefined, language);
}

export function validateMnemonic(mnemonic, language = 'english'){
  return StellarHDWallet.validateMnemonic(mnemonic, language)
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
    if('native' === assettype && isNativeAsset(assetdata)){
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
  if(isNativeAsset(assetdata))return true
  let flag = false
  for(var i=0,n=balances.length;i<n;i++){
    let assetcode = balances[i].asset_code
    let assetissuer = balances[i].asset_issuer
    if(assetdata.code === assetcode &&  assetdata.issuer === assetissuer){
      flag = true
    }
  }
  return flag
}

// send asset
// return Promise
export function send(seed,pubkey,target,assetdata,amount,memo_type,memo_value,base_reserve){
  console.log(`address: ${pubkey}, target: ${target}`)
  let amountstr = NP.round(Number(amount), 7).toString();//Math.round(amount, 7)
  pubkey = pubkey ? pubkey : address(seed)
  let asset = getAsset(assetdata.code , assetdata.issuer)
  let server  = getServer()
  return server.loadAccount(pubkey).then(acc=>{
    //判断资产是否不够
    let balances = acc.balances
    checkBalance(asset, amount, balances)
    return server.loadAccount(target)
      .then(tacc=>{
          //判断当前用户是否接收本资产？
          let flag = checkAssetAvailable(asset,tacc.balances)
          if(!flag)throw new Error('')
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
          if(!isNativeAsset(asset)){
            throw new Error('Error.UnFundNeedXLM')
          }
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
export function listenAccountStream(address,handler,errfn){
  closeAccountStream();
  _stream = getServer().accounts().accountId(address).stream({
    onmessage: res => {
      handler(res);
    },
    onerror: err => {
      errfn(err)
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

export function canSend(nativeBalance, reserve, amount, baseFee, numOps){
  return (10000000 * (nativeBalance - reserve - amount) - baseFee * numOps) >= 0;
}

export function sendByPathPayment(seed, destination, record, memo_type,memo_value){
  
  let _address = address(seed)
  let server  = getServer()
  return server.loadAccount(_address).then(account=>{
    let path = record.path.map(item => { return getAsset(item.asset_code, item.asset_issuer)})
    let sendAsset = record.source_asset_type === 'native' ? new StellarSdk.Asset.native():
          new StellarSdk.Asset(record.source_asset_code, record.source_asset_issuer);
    let destAsset = record.destination_asset_type === 'native' ? new StellarSdk.Asset.native():
    new StellarSdk.Asset(record.destination_asset_code, record.destination_asset_issuer);
    let opt = StellarSdk.Operation.pathPayment({
      sendAsset	: sendAsset,
      sendMax: record.source_amount,
      destination: destination,
      destAsset: destAsset,
      destAmount: record.destination_amount,
      path: path,
      source: _address
    });
    console.log('-----path payment----')
    console.log({
      sendAsset	: sendAsset,
      sendMax: record.source_amount,
      destination: destination,
      destAsset: destAsset,
      destAmount: record.destination_amount,
      path: path,
      source: _address
    })
    console.log(account)
    let builder = new StellarSdk.TransactionBuilder(account).addOperation(opt)

    if(isValidMemo(memo_type,memo_value)){
      var memo = getMemo(memo_type, memo_value);
      builder.addMemo(memo)
    }
    let tx = builder.build()
    tx.sign(StellarSdk.Keypair.fromSecret(seed));
    return server.submitTransaction(tx);
  })



}


/**
 * 判断是否为英文
 * @param {String} mnemonic 
 */
let PATTERN_ENGLISH = new RegExp("[A-Za-z]+");

export function isEnglishMnemonic(mnemonic){
  return PATTERN_ENGLISH.test(mnemonic);
}

let PATTERN_CHINESE = new RegExp("[\u4E00-\u9FA5]+");
/**
 * 判断是否为中文
 * @param {string} mnemonic 
 */
export function isChineseMnemonic(mnemonic){
  return PATTERN_CHINESE.test(mnemonic);
}
