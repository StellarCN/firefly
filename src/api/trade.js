import StellarSdk from 'stellar-sdk'
import {getServer} from './server'


export function getTrades( buyAsset,sellAsset,order="desc", limit = 200){
  let builder = getServer().trades().forAssetPair(sellAsset, buyAsset)
  builder.url.addQuery("limit", limit+'');
  builder.url.addQuery("order", order);
  return builder.call()
}




// == stream == 
// trade stream instance
var _stream = undefined;

// listen on trade stream
export function listenTradeStream(buyAsset,sellAsset,order="desc", limit = 200){
  closeTradeStream();
  let builder = getServer().trades().forAssetPair(sellAsset, buyAsset)
  builder.url.addQuery("limit", limit+'');
  builder.url.addQuery("order", order);
  
  _stream = builder.stream({
    onmessage:res=>{
      handler(res)
    }
  });
}

// close orderbook stream
export function closeTradeStream(){
  if(_stream){
    _stream();
    _stream = undefined;
  }

}