import axios from 'axios'
import { resolveByFedAddress } from './federation'
var Promise = require('es6-promise').Promise
import StellarSdk from 'stellar-sdk'

export const FCHAIN_API = "https://api.fchain.io"

  //1. 请求api.fchain.io?asset={code}&issuer={issuer}.得到联邦地址和account_id，
  /**
   {
    "asset": "CNY",
    "issuer": "GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX",
    "services": [
    {
    "federation_address": "bank*alipay.com",
    "description": "bank service",
    "description_cn": "银行"
    },
    {
    "federation_address": "alipay*alipay.com",
    "description": "alipay service",
    "description_cn": "支付宝"
    }
    ]
  } 
   */
  //2. 根据联邦地址请求，得到extra_fields属性，组成新的界面，由用户填写数据（可能不填写？）
  //3. 填写完数据，拆分联邦地址（服务器组成新的url去请求上一步填写的数据）,
  //添加参数：type=quote,account_id={account_id},address=用户的恒星地址，asset_code={},asset_issuer={},再加上第2步用户填写的数据
  //  如： 
  //使用get方式请求,拿到结果，
  /**
   {
     "stellar_address":"alipay*ripplefox.com",
     "account_id":"GAAQVUICYDKE3GIQIEF7WFFJ2SQ2DQWBQ7PM4NXYGPFTCJ4N3P465CNY",
     "memo_type":"text",
     "memo":"50144586A194052",
     "send":[{
       "amount":3,
       "code":"CNY",
       "issuer":"GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX"
      }]
    }
    */
    //4. 根据上边接收到的数据，创建发送资产界面，由用户确认是否发送





/**
 * 查询咨询提现的相关说明（主要是联邦地址和充值说明）
 */
export function getAssetWithdrawUrl(code,issuer){
  return axios.get(`${FCHAIN_API}/withdraw_index?asset=${code}&issuer=${issuer}`)
    .then(response=>{

      console.log(response)
      let data = response.data
      if(typeof data ==='string'){
        data = newJson.replaceAll("\\\\", "\\\\\\\\");  
        data = newJson.replaceAll("\\'", "\\\\'");  
        data = newJson.replaceAll("\\\"", "\\\\\"");  
        data = JSON.parse(data)
      }
      return new Promise((resolve,reject)=>{
        if(!data.services){
          reject('not supported')
        }else{
          resolve(data)
        }
      })
    })
}

/**
 * 提交数据到 url
 * @param {*} url 
 */
export function submitQuote(url,data){
  url = `${url}?type=quote`
  for(var p in data){
    url += `&${p}=${data[p]}`
  }
  console.log(`submite withdraw quote url : ${url}`)
  return axios.get(url)
}

/**
 * sep 0006 标准的提现流程
 * 1. 请求stellar.toml，拿到FEDERATION_SERVER
 * 2. GET请求${FEDERATION_SERVER}/federation，参数：
 * {
 *    type:   forward
 *    forward_type:   bank_account或crypto   //多语问题,自己处理，针对bank_account，无法确认用户提交是否为正常的银行，银行卡等
 *    asset_code: 提现的币种（选择bank_account时不可填写） 
 *    dest: 提现的目标账户，可以是BTC ETH等的地址
 *    dest_extra: 可选，提现备注（如果是提现到其他网络上）
 *    account_id: 当前账户地址
 * }
 * 3. 根据返回结果构造表单，
 * {
 *    account_id: 提现到哪个账户
 *    memo_type: 备注类型
 *    memo: 备注内容
 *    eta:  预计用时： X秒
 *    min_amount: 一次提现最小值
 *    max_amount: 一次提现最大值
 *    fee_fixed: 固定收费
 *    fee_percent: 费率
 *     最终收费计算方式：  mny + fee_fixed + mny*fee_percent
 *     extra_info: Object类型：额外信息，目前没有用处理
 * }
 * 或者返回的错误信息（501），包含error字段
 * 4. 用户填写提现金额，自动计算相应的费用后，得到实际到账金额（用户可以填写实际到账金额，然后反算一个应发金额）
 * 5. 用户填写完成后，提示相应的信息，用户确认后，调用发送功能
 * 
 */

export function queryWithdrawInfo(domain, asset_code, address, forward_type = 'crypto', dest,dest_extra=''){
  if(dest === null || typeof dest === 'undefined' || dest === ''){
    return new Promise((resolve,reject)=>{
      reject(new Error('DW.Error.NoDest'))
    })
  }
  return StellarSdk.StellarTomlResolver.resolve(domain)
    .then(data=>{
      if(data.FEDERATION_SERVER){
        let fed = data.FEDERATION_SERVER
        if(!fed.endsWith('/federation')){
          fed+='/fedration'
        }
        dest_extra = dest_extra === null ? '':dest_extra
        let url = `${fed}?type=forward&forward_type=${forward_type}&asset_code=${asset_code}&dest=${dest}&dest_extra=${dest_extra}&account_id=${address}`
        return axios.get(url)
      }
      throw new Error('DW.Error.NoWithdrawService')
    })
}


