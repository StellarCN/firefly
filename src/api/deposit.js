//充值提现相应的接口

import axios from 'axios'
import { getServer} from './server'
import { federation } from './federation'
import StellarSdk from 'stellar-sdk'
var Promise = require('es6-promise').Promise

/**
 * 根据域名查询到相应的充值提示信息
 * 1. 查询toml，得到DEPOSIT_SERVER
 * 2. 根据DEPOSIT_SERVER查询数据
 * @param {*} domain 
 */
export function queryDeposit(domain,asset,address){
  return federation(domain).then(toml=>{
    if(toml.DEPOSIT_SERVER){
      let url = `${toml.DEPOSIT_SERVER}/?address=${address}&asset=${asset.code}`
      return axios.get(url)
    }else{
      throw new Error('DW.Error.NoDepositService')
    }
  })
}

/**
 * =====sep 0006 标准的充值接口
 * 1. 拿到stellar.toml中的DEPOSIT_SERVER 
 * 2. 请求DEPOSIT_SERVER，GET请求，参数：asset_code（必填），account(必填)，memo_type(可选)，memo(可选)
 * 3. 拿到结果，JSON格式，
 * {
 *    how: 一般是恒星地址，
 *    eta: 可选 int , 预估多长时间后充值会生效 
 *    min_account: 可选，float ， 最小充值金额
 *    max_account: 可选，float ，最大充值金额
 *    fee_fixed: 可选，float， 固定的充值费用
 *    fee_percent: 可选，float，充值费率
 *    extra_info： 可选，object，
 * }
 * 4. 根据充值内容给用户提示相应的信息，都是文本内容
 * 
 */  
export function queryStandardDeposite(homedomain,asset_code,address){
  return StellarSdk.StellarTomlResolver.resolve(homedomain)
    .then(data => {
      let uri = data.DEPOSIT_SERVER
      if(uri){
        if(!uri.endsWith('/deposit')){
          uri += '/deposit'
        }
        let url = `${uri}?asset_code=${asset_code}&account=${address}`
        return axios.get(url)
      }
      throw new Error('DW.Error.NoDepositService')
    })
}
