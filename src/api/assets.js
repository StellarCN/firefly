// stellar assets
import StellarSdk from 'stellar-sdk'
import axios from 'axios'


/**
 * 验证是否为官方XLM资产（stronghold发行了XLM资产，存在重名）
 * @param {String | Object} _code 
 * @param {String} _issuer 
 */
export function isNativeAsset(_code,_issuer){
  let code=null,issuer=null;
  if(typeof _code === 'object'){
    code = _code.code
    issuer = _code.issuer
  }else{
    code = _code
    issuer = _issuer
  }
  if(code!='XLM')return false
  if(issuer && issuer!='stellar.org')return false
  return true
}

export function getAsset(code, issuer) {
  if (typeof code == 'object') {
    issuer = code.issuer;
    code = code.code;
  }
  if(isNativeAsset(code,issuer)){
    return new StellarSdk.Asset.native();
  }else{
   return new StellarSdk.Asset(code, issuer);
  }
}

export const ALL_HOSTS_URL = 'https://api.fchain.io/asset_host'
//查询所有的资产的host
export function allHosts(){
  return axios.get(ALL_HOSTS_URL)
}
//查询某个资产的host
export function assetHost(issuer){
  return axios.get(ALL_HOSTS_URL+'?issuer='+issuer)
}


export function assetKey(base,counter){
  let result = `${base.code}`
  if(base.issuer && 'stellar.org'!== base.issuer){
    result += '-' + base.issuer
  }
  result += '_' + counter.code
  if(counter.issuer && 'stellar.org'!== counter.issuer){
    result += '-' + counter.issuer
  }
  return result;
}