//二维码相关的内容
//参考自  https://github.com/johansten/stargazer/blob/master/docs/qr-codes.md
// 生成名片信息（用于生成二维码）
// json数据格式
import StellarSdk from 'stellar-sdk'
import StellarHDWallet from '../libs/stellar-hd-wallet/src/stellar-hd-wallet'


export function exportNameCard(account){
 /*
  let data = {
    "stellar": {
      "account":  {
        "name":account.name, //账户名称
        "id": account.address, //地址  
        "fed": account.federationAddress, //联邦地址
        "memo": account.memo,//备注
      }
    }
  }
  */
  // let data =account.address
  // return JSON.stringify(data)
  return account.address||account
}

// 导出账户，包括公私钥信息
export function exportAccount(account,accountData){
  let data = {
    "stellar": {
      "account": {
        "name":account.name, //账户名称
        //id: account.address, //地址  
        //"fed": account.federationAddress, //联绑地址
        //"inflate": account.inflationAddress,//通账地址
        "memo": account.memo,//备注
      },
      "key": accountData.seed // 私钥地址
    }
  }
  let firefly = JSON.stringify(data)
  console.log(firefly)
  return firefly
}

export function exportMnemonic(name,mnemonic){
  let data = {
    "stellar": {
      "account": {
        "name": name
      },
      "mnemonic": mnemonic //助记词
    }
  }
  let firefly = JSON.stringify(data)
  console.log(firefly)
  return firefly
}

/**
 * 从exportMnemonic的数据结构中查看mnemonic
 * @param {String} data 
 */
export function getMnemonicFromData(data, language){
  if(data === null)return {status: false}
  if(typeof data === 'undefined')return {status: false}
  if(StellarHDWallet.validateMnemonic(data, language)){
    return {
      status: true,
      mnemonic: data
    }
  }
  try{
    data = JSON.parse(data)
    if(data && data.stellar && data.stellar.mnemonic){
      return { status: true, mnemonic: data.stellar.mnemonic}
    }
    return { status: false }
  }catch(err){
    return {status: false}
  }

}

export function exportPayment(account,amount,asset_code,asset_issuer,memo_type,memo){
  let data  = {
      "stellar": {
          "payment": {
              "destination":  account.address,
              //"network":      NETWORK_CODE, // (*)
              "amount":       amount,
              "asset": {      // (**)
                  "code":     asset_code,
                  "issuer":   asset_issuer
              },
              "memo": {       
                  "type":     memo_type,
                  "value":    memo
              }
          }
      }
  }
  return JSON.stringify(data)
}

export function importContact(data){
  if(data === null)return {status: false}
  if(typeof data === 'undefined')return {status: false}
  if(typeof data === 'object'){
    return getContactFromJSON(jsondata)
  }
  if(typeof data === 'string'){
    data = data.trim()
    try{
      var jsondata = JSON.parse(data)
      return getContactFromJSON(jsondata)
    }catch(e){
      let ok = StellarSdk.StrKey.isValidEd25519PublicKey(data)
      if(ok){
        return {status: true, ret: {stellar_id:data}}
      }
    }
  }
  return { status: false }
}
function getContactFromJSON(data){
  console.log(data)
  console.log(typeof data)
  let account = data.stellar.account
  if(account){
    // stargaze格式
    let name = account.name //contact name
    let stellar_id = account.id  //contact address
    let federationAddress = account.fed //contact federation address default is null
    let memo_type = account.memoType  // contact memo type ,default is null
    let memo = account.memo //contact memo default is null
    if(stellar_id){
      return {status: true, ret: {name,stellar_id,federationAddress,memo_type,memo}}
    }
  }
  return {status:false}
}

/**
 * 导入账户
 * 1. 直接导入私钥
 * 2. 导入的是stargaze的账户类型
 */
export function importAccountFromData(data){
  if(data === null)return {status: false}
  if(typeof data === 'undefined')return {status: false}
  if(typeof data === 'object'){
    return getSeedFromJSON(jsondata)
  }
  if(typeof data === 'string'){
    data = data.trim()
    try{
      var jsondata = JSON.parse(data)
      return getSeedFromJSON(jsondata)
    }catch(e){
      console.error(e)
      let ok = StellarSdk.StrKey.isValidEd25519SecretSeed(data)
      if(ok){
        return {status: true, seed: data}
      }
    }
  }
  return { status: false }
}

function getSeedFromJSON(data){
  let stellar = data.stellar
  if(stellar){
    // stargaze格式
    let seed = stellar.key
    if(seed){
      return {status: true, seed, data}
    }
  }
  return {status:false}
}