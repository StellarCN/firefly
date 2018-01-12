import StellarSdk from 'stellar-sdk'
import {getServer} from './server'

export function getTradeAggregation(base,counter,start_time,end_time,resolution){
    return getServer().tradeAggregation(base,counter,start_time,end_time,resolution).call();
}

export function getTradeAggregation5min(base,counter,start_time,end_time){
    return getServer().tradeAggregation(base,counter,start_time,end_time,RESOLUTION_5MIN).call();
}

export function getTradeAggregation15min(base,counter,start_time,end_time){
    return getServer().tradeAggregation(base,counter,start_time,end_time,RESOLUTION_5MIN).call();
}

export function getTradeAggregation1hour(base,counter,start_time,end_time){
    return getServer().tradeAggregation(base,counter,start_time,end_time,RESOLUTION_1HOUR).call();
}

export function getTradeAggregation1day(base,counter,start_time,end_time){
    return getServer().tradeAggregation(base,counter,start_time,end_time,RESOLUTION_1DAY).call();
}

export function getTradeAggregation1week(base,counter,start_time,end_time){
    return getServer().tradeAggregation(base,counter,start_time,end_time,RESOLUTION_1WEEK).call();
}



//5 minutes (300000), 15 minutes (900000), 1 hour (3600000), 1 day (86400000) and 1 week (604800000)
export const RESOLUTION_5MIN = 300000
export const RESOLUTION_15MIN = 900000
export const RESOLUTION_1HOUR = 3600000
export const RESOLUTION_1DAY = 86400000
export const RESOLUTION_1WEEK = 604800000

// == stream == 
// tradeaggregation stream instance
var _stream = undefined;

// listen on orderbook stream
// @param buyAsset: buying asset
export function listenTradeAggregationStream(options,handler){
    closeTradeAggregationStream();
  _stream = getServer().tradeAggregation(
      options.base,
      options.counter,
      options.start_time,
      options.end_time,
      options.resolution || RESOLUTION_5MIN
  ).stream({
    onmessage:res=>{
      handler(res)
    }
  });
}

// close orderbook stream
export function closeTradeAggregationStream(){
  if(_stream){
    _stream();
    _stream = undefined;
  }

}

