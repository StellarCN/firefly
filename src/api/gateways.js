import axios from 'axios'
import pkg from '../../package'
import { isNativeAsset } from './assets'

export const APP_NAME = 'firefly'

//app版本号
export const APP_VERSION = pkg.version

export const APP_GITHUB = pkg.github

export const OFFICIAL_SITE = 'https://fchain.io'

// APP 最新版本信息
export const CHECK_UPDATE = 'https://raw.githubusercontent.com/StellarCN/firefly/master/package.json'
//资产说明
export const ASSET_INFO_BASE_URL = 'https://raw.githubusercontent.com/StellarCN/firefly/docs/assets/'

//default interval : 1分钟
export const DEFAULT_INTERVAL = 60000

export const FED_NETWORK_BIND_ADDRESS = 'bind*fed.network'
//通账池
export const INFLATION_POOL = [
  {
    host:'xlmpool.com',
    address: 'GA3FUYFOPWZ25YXTCA73RK2UGONHCO27OHQRSGV3VCE67UEPEFEDCOPA'
  }
]


//默认交易对
export const TRADE_PAIRS = [

  {
    from: {
      code: 'XLM'
    },
    to: {
      code: 'XCN',
      issuer: 'GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY'
    }
  },
  {
    from: {
      code: 'XLM'
    },
    to: {
      code: 'BTC',
      issuer: 'GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH'
    }
  },
  {
    from: {
      code: 'XLM'
    },
    to: {
      code: 'ETH',
      issuer: 'GBETHKBL5TCUTQ3JPDIYOZ5RDARTMHMEKIO2QZQ7IOZ4YC5XV3C2IKYU'
    }
  }
]


export const ASSETS_ISSUER_HOST = {
  'XLM': {
    code: 'XLM',
    host: 'stellar.org'
  },
  'GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX': {
    code: 'CNY',
    host: 'ripplefox.com'
  },

  'GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH': {
    code: 'BTC',
    host: 'naobtc.com'
  },

  'GA4BYMUO5D7OLGVJWZ2D5FCWU7SB63FNZ4QUU574SMNA6ELK5TZD3SO3': {
    code: 'HKDC',
    host: 'cryptomover.com'
  },

  'GBETHKBL5TCUTQ3JPDIYOZ5RDARTMHMEKIO2QZQ7IOZ4YC5XV3C2IKYU': {
    code: 'ETH',
    host: 'fchain.io'
  },

  'GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY': {
    code: 'XCN',
    host: 'fchain.io'
  }


}

export const NO_FUNDINS = ['XCN-GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY','CNY-GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX']

export const BASE_RESERVE = 0.5

//fee 100stroops 
export const BASE_FEE = 0.00001

// 默认axios超时时间
export const AXIOS_DEFAULT_TIMEOUT = 5000

let _default_trade_pair = undefined
// 默认交易对从fchain获取
const API_TRADE_PAIR = `https://api.fchain.io/tradepairs`
export function defaultTradePairsAPI(){
  axios.get(API_TRADE_PAIR,{
    timeout: AXIOS_DEFAULT_TIMEOUT
  })
    .then(response=>{
      let data = response.data
      if(data.tradepairs){
        _default_trade_pair = data.tradepairs
      }
    })
    .catch(err=>{
      console.log(err)
      //_default_trade_pair = TRADE_PAIRS
    })
}

export function getDefaultTradePairs(){
  return _default_trade_pair || TRADE_PAIRS
}

export function getPackageJson(){
  return axios.get(CHECK_UPDATE)
}

//获取资产的说明信息
export function getAssetInfo(asset_code,asset_issuer){
  if(isNativeAsset(asset_code, asset_issuer)){
    return axios.get(`${ASSET_INFO_BASE_URL}${asset_code}.json`)
  }else{
    return axios.get(`${ASSET_INFO_BASE_URL}${asset_code}-${asset_issuer}.json`)
  }
}

export const COINS_ICON = {
  ARAD:   'icon-ARDR',
  ARK:    'icon-ARK',
  ZRX:    'icon-ZRX',
  BTM:    'icon-BTM',
  KMD:    'icon-KMD',
  REP:    'icon-REP',
  AE:     'icon-AE',
  DOGE:   'icon-DOGE',
  BTS:    'icon-BTS',
  SC:     'icon-SC',
  MKR:    'icon-MKR',
  XVG:    'icon-XVG',
  STRAT:    'icon-STRAT',
  BCN: 'icon-BCN',
  WAVES: 'icon-WAVES',
  PPT: 'icon-PPT',
  WTC: 'icon-WTC',
  STEEN: 'icon-STEEN',
  ICX: 'icon-ICX',
  ZEC: 'icon-ZEC',
  XRB: 'icon-XRB',
  OMG: 'icon-OMG',
  QUMT: 'icon-QUMT',
  LSK: 'icon-LSK',
  BTG: 'icon-BTG',
  MOBI: 'icon-MOBI',
  TAU: 'icon-TAU',
  VEN: 'icon-VEN',
  USDT: 'icon-USDT',
  XEM: 'icon-XEM',
  MIOTA: 'icon-MIOTA',
  DASH: 'icon-DASH',
  EOS: 'icon-EOS',
  XMR: 'icon-XMR',
  ADA: 'icon-ADA',
  NEO: 'icon-NEO',
  BCH: 'icon-BCH',
  ETC: 'icon-ETC',
  LTC: 'icon-LTC',
  XRP: 'icon-XRP',
  XLM: 'icon-XLM',
  ETH: 'icon-ETH',
  BTC: 'icon-btc',
  XEL: 'icon-xel',
  XFF: 'icon-XFF'
  
}

export const FF_ICON = 'icon-zhanwei'

export const DEFAULT_ICON = 'icon-XLM'

export const WORD_ICON = {
  'W':'icon-shouzimuzhanweiW',
  'A':'icon-shouzimuzhanwei'
}

export const CORS_PROXY = "https://cors-anywhere.herokuapp.com/"

export function getVersionInfo(){
  if(!chcp){
    return new Promise((resolve,reject)=> reject('Error'))
  }
  return new Promise((resolve,reject)=>{
    chcp.getVersionInfo((err,data)=>{
      if(err){
        reject(err)
      }else{
        resolve(data)
      }
    })
  })
}

//获取节点地址的pin值信息
export function getAddressPinInfo(url){
  return axios.get(url)
}