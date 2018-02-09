/**
 * fchain.io自定义接口
 */
import axios from 'axios'


const host = 'http://40.125.213.185:8081'

export function getAssetPrice(assets){
  let uri = `${host}/api/price?data=`+encodeURIComponent(JSON.stringify(assets))
  return axios.get(uri)
}