import StellarSdk from 'stellar-sdk'
import {getServer} from './server'


export function getTrades( buyAsset,sellAsset,order="desc", limit = 200){
  let builder = getServer().trades().forAssetPair(sellAsset, buyAsset)
  builder.url.addQuery("limit", limit+'');
  builder.url.addQuery("order", order);
  return builder.call()
}