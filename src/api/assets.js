// stellar assets
import StellarSdk from 'stellar-sdk'
import axios from 'axios'

export function getAsset(code, issuer) {
  if (typeof code == 'object') {
    issuer = code.issuer;
    code = code.code;
  }
  console.log(`---code=${code},issuer:${issuer}`)
  console.log(!issuer || issuer === 'stellar.org')
  console.log(code === 'XLM')
  if(!issuer || issuer === 'stellar.org'){
    if(code === 'XLM')return  new StellarSdk.Asset.native();
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