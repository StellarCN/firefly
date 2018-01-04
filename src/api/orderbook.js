import StellarSdk from 'stellar-sdk'
import {getServer} from './server'

// get orderbook
// return Promise
export function getOrderbook(sellAsset, buyAsset){
  return getServer().orderbook(sellAsset, buyAsset).call();
}


// orderbook stream instance
var _stream = undefined;

// listen on orderbook stream
// @param buyAsset: buying asset
export function listenOrderbook(sellAsset, buyAsset,handler){
  closeOrderbookStream();
  _stream = getServer().orderbook(buyAsset,sellAsset).stream({
    onmessage:res=>{
      handler(res)
    }
  });
}

// close orderbook stream
export function closeOrderbookStream(){
  if(_stream){
    _stream();
    _stream = undefined;
  }

}

