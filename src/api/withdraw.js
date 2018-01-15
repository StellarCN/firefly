import axios from 'axios'
import { resolveByFedAddress } from './federation'
var Promise = require('es6-promise').Promise

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
 * 2. GET请求FEDERATION_SERVER，参数：
 * {
 *    type:   forward
 *    forward_type:   bank_account或crypto
 *    asset_code: 提现的币种
 *    dest: 提现的目标账户
 *    dest_extra: 可选，提现备注（如果是抽现到其他网络上）
 *    
 * }
 * 3. 根据返回结果构造表单，由用户确认提交
 * 
 */
