//充值提现相应的接口

import axios from 'axios'
import { getServer} from './server'
import { federation } from './federation'
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

