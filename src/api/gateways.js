import axios from 'axios'

//app版本号
export const APP_VERSION = '1.0.1'

export const APP_GITHUB = 'https://github.com/stellarcn/firefly'


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
      code: 'BTC',
      issuer: 'GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH'
    }
  },
  {
    from: {
      code: 'XLM'
    },
    to: {
      code: 'CNY',
      issuer: 'GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX'
    }
  },
  {
    from: {
      code: 'XLM'
    },
    to: {
      code: 'HKDC',
      issuer: 'GA4BYMUO5D7OLGVJWZ2D5FCWU7SB63FNZ4QUU574SMNA6ELK5TZD3SO3'
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
  }


}


export const BASE_RESERVE = 10


let _default_trade_pair = undefined
// 默认交易对从fchain获取
const API_TRADE_PAIR = `https://api.fchain.io/tradepairs`
export function defaultTradePairsAPI(){
  axios.get(API_TRADE_PAIR)
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

