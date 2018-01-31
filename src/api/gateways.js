import axios from 'axios'

export const APP_NAME = 'firefly'

//app版本号
export const APP_VERSION = '1.2.6'

export const APP_GITHUB = 'https://github.com/stellarcn/firefly'

export const OFFICIAL_SITE = 'https://fchain.io'

// APP 最新版本信息
export const CHECK_UPDATE = 'https://stellarcn.github.io/firefly/version.json'
//default interval : 4000ms
export const DEFAULT_INTERVAL = 4000

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


export const BASE_RESERVE = 0.5

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

export function checkUpdate(){
  return axios.get(CHECK_UPDATE)
    .then(response => {
      // let platform = 'android'
      let platform = cordova.platformId
      let data = response.data[platform]
      return Promise.resolve(data)
    })
}
