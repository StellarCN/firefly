import StellarSdk from 'stellar-sdk'
import {getServer} from './server'

/**
 * 获取交易的集合数据
 * @param {Object} base asset
 * @param {Object} counter asset
 * @param {long} start_time 起始时间
 * @param {long} end_time 截止时间
 * @param {long} resolution 时间间隔
 */
export function getTradeAggregation(base,counter,start_time,end_time,resolution,limit,order){
    return getServer().tradeAggregation(base,counter,start_time,end_time,resolution)
            .order(order||'asc').limit(limit||200).call();
}
/**
 * 获取时间区间内每5分钟的成交数据
 * @param {*} base 
 * @param {*} counter 
 * @param {*} start_time 
 * @param {*} end_time 
 */
 export function getTradeAggregation1min(base,counter,start_time,end_time,limit){
     return getTradeAggregation(base, counter, start_time, end_time, RESOLUTION_1MIN,limit)
}

export function getTradeAggregation15min(base,counter,start_time,end_time,limit){
    return getTradeAggregation(base, counter, start_time, end_time, RESOLUTION_15MIN,limit)
}

export function getTradeAggregation1hour(base,counter,start_time,end_time,limit){
    return getTradeAggregation(base, counter, start_time, end_time, RESOLUTION_1HOUR,limit)
}

export function getTradeAggregation1day(base,counter,start_time,end_time,limit){
    return getTradeAggregation(base, counter, start_time, end_time, RESOLUTION_1DAY,limit)
}

export function getTradeAggregation1week(base,counter,start_time,end_time,limit){
    return getTradeAggregation(base, counter, start_time, end_time, RESOLUTION_1WEEK,limit)
}

//1 minutes (60000), 15 minutes (900000), 1 hour (3600000), 1 day (86400000) and 1 week (604800000)
export const RESOLUTION_1MIN  =     60000
export const RESOLUTION_15MIN =    900000
export const RESOLUTION_1HOUR =   3600000
export const RESOLUTION_1DAY  =  86400000
export const RESOLUTION_1WEEK = 604800000


/*
 * 后台不支持SSE，取消掉，采用定时循环的方式
// == stream == 
// tradeaggregation stream instance
var _stream = undefined;

// listen on orderbook stream
// @param buyAsset: buying asset
export function listenTradeAggregationStream(options,handler){
    console.log(`---------list trade aggregation`)
    let opt = Object.assign({ resolution: RESOLUTION_5MIN}, options)
    console.log(opt)
    closeTradeAggregationStream();
  let builder = getServer().tradeAggregation(
    opt.base,
    opt.counter,
    opt.start_time,
    opt.end_time,
    opt.resolution
  );
  builder.order('asc')
  _stream = builder.stream({
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
*/
