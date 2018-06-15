/**
 * fchain.io自定义接口
 */
import axios from 'axios'
var moment = require('moment')
import { Decimal } from 'decimal.js'
var parseString = require('xml2js').parseString
import { CORS_PROXY } from './gateways'


const host = 'https://api.fchain.io/v2'

/**
 * 查询资产价格
 * @param {Array} assets 资产数组
 */
export function getAssetPrice(assets){
  if(assets === null || assets.length ===0)throw new Error('no assets')
  let t = new Date().getTime()
  let uri = `${host}/api/price?r=${t}&data=`+encodeURIComponent(JSON.stringify(assets))
  return axios.get(uri)
}

/** 
 * 查询充值提现记录
 * curl -X GET --header 'Accept: application/json' 'http://127.0.0.1:5000/api/dwrecords?account=GBIZJJMFITQLABS4OUBD6CCN6SXIOYX6456K6EXWZYFT3523AZPJWAPU&asset_code=XCN&asset_issuer=GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY'
 * @param { String } account 
 * @param { String } asset code
 * @param { String } asset issuer
 * @return { Object } { 'deposit':[{'amount':'1','tx_id':1,'time':1}], 'withdraw': [{'amount':'1','tx_id':1,'time':1}] }
 */
export function getDepositAndWithdrawRecords(account, asset_code, asset_issuer){
  if(account === null || asset_code  === null || asset_issuer === null)throw new Error('params invalid')
  let t = new Date().getTime()
  let uri = `${host}/api/dwrecords/?r=${t}&account=${account}&asset_code=${asset_code}&asset_issuer=${asset_issuer}`
  return axios.get(uri)
}

/**
 * 查询账户的委单信息
 * @param { String } account 账户地址
 * @param { Long } start_time 起始时间 ,默认前24小时的
 * @param { Long } end_time 结束时间，默认当前时间
  # 已测试
    # curl -X GET --header 'Accept: application/json' 'http://localhost:5000/api/effectrecords?account=GBHJ7RYCFW3TJOYZINV4EUURMYRLOGOUMZ5PBAHO2ERPTK6CHT7MKNYR&start_time=1515814331&end_time=1518013856'
    # [
    # {
    #     "base_asset": "XCN", # 买入的 asset
    #     "type": "canceled", # 取消的订单
    #     "amount": "0.4000000", # counter_asset 的数量
    #     "tx": "72b807ff4b98518ee93bed49dc27580f56b9e0e1391d8450e60d113a969b351d",
    #     "counter_asset": "XLM", # 卖出的 asset
    #     "counter_issuer": null,
    #     "price": "2.4800000", # 2.48 XCN/XLM (base_asset/counter_asset)
    #     "base_issuer": "GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY",
    #     "time": 15180063040.4300000
    # },
    # ]
 */
export function getAllEffectOffers(account,start_time,end_time){
  if(!start_time){
    start_time = Number(moment().subtract(24,"hours").format('x'))
  }
  if(!end_time){
    end_time = new Date().getTime()
  }
  start_time = new Decimal(start_time).div( 1000).round().toNumber()
  end_time = new Decimal(end_time).div( 1000).round().toNumber()
  if(account === null)throw new Error('params invalid')
  let uri = `${host}/api/effectrecords/?account=${account}&start_time=${start_time}&end_time=${end_time}`
  return axios.get(uri, {timeout: 60000})
}

const FCHAIN_FEED_URL = 'https://fchain.io/feed/'

export function getFchainRss(){
  return new Promise((resolve,reject) => {
    if(!cordova.plugin.http){
      reject('error')
      return
    }
    let t = new Date().getTime()
    let url = FCHAIN_FEED_URL +'?r='+t
    if(cordova.platformId === 'browser'){
      url = CORS_PROXY+FCHAIN_FEED_URL
    }
    cordova.plugin.http.get(url, {},  {}, (response) => {
      let data = response.data
      parseString(data, (err,result)=>{
        let channel = result.rss.channel
        if(channel && channel.length > 0){
          //主要字段： title（数组）,pubDate数组，link（数组）,content:encoded(数组)
          resolve(channel[0].item.map(d=>{
            return {
              'title': d.title[0], 
              'date': moment(d.pubDate[0]).format('YYYY-MM-DD HH:mm:ss'), 
              'link': d.link[0],
              'content': d['content:encoded'][0] 
            }
          }))
        }else{
          resolve([])
        }

      })

    }, (response) => {
        reject(response.error)
    });

  })
}