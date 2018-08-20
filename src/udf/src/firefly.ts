//萤火钱包数据返回
import { RequestParams } from './helpers';

export const URL_PREFIX = 'firefly_trade_mock'

export class FFWAPI {

  private _datafeedUrl: string;
  private _horizonServer:string;
  private _key:string;
  private _baseCode: string;              //资产编码
  private _baseIssuer: string|undefined;
  private _counterCode: string;
  private _counterIssuer: string|undefined;
  private _params?: RequestParams;

  public constructor(datafeedUrl :string, params?: RequestParams){
    this._datafeedUrl = datafeedUrl;
    let index = datafeedUrl.indexOf(URL_PREFIX);
    this._params = params;
    this._key = datafeedUrl.substring(index+URL_PREFIX.length+1, datafeedUrl.length);
    this._horizonServer = datafeedUrl.substring(0, index)
    let assets_split = this._key.split('-');
    let base = assets_split[0]
    let counter = assets_split[1]
    if(base.indexOf('_')>0){
      let _base = base.split('_');
      this._baseCode = _base[0];
      this._baseIssuer = _base[1];
    }else{
      this._baseCode = 'XLM';
    }
    if(counter.indexOf('_') >0){
      let _counter = counter.split('_');
      this._counterCode = _counter[0];
      this._counterIssuer = _counter[1];
    }else{
      this._counterCode = 'XLM';
    }
  }

  public handle<T>(urlPath: string):Promise<T>{
    if('config' === urlPath){
      return this.config();
    }
    if('symbols' === urlPath){
      return this.symbol();
    }
    if('history' === urlPath){
      return this.history();
    }

    return Promise.reject("no emplements");
  }

  //获取config内容
  public config():Promise<any>{
    return new Promise((resolve,reject) => {
      let result = {
        supports_search: true,
        supports_group_request: false,
        supported_resolutions: ["1", "5", "15", "60", "1D", "1W"],
        supports_marks: true,
        supports_time: true,
        exchanges:[{
          value: 'firefly',
          name:  'firefly',
          desc:  'firefly',
        }],
        symbols_types:[{ name: 'bitcoin', value: 'bitcoin' }]
      }
      resolve(result);
    });
  }

  /**
   * 商品解析
   */
  public symbol():Promise<any>{
    return new Promise((resolve,reject) => {
      resolve({
        name: this._baseCode + '/' + this._counterCode,
        ticker: this._baseCode + '/' + this._counterCode,
        description: '',
        type: 'bitcoin',
        exchange: 'firefly',
        "exchange-traded":"firefly",
        "exchange-listed":"firefly",
        timezone: 'UTC',
        minmov: 1,
        // pricescale: 0.0000001,
        "pricescale":100,
        minmov2: 0,
        // pointvalue: 1,
        has_intraday: true,
        "intraday_multipliers": ['1'], 
        supported_resolutions: ["1", "5", "15", "60", "1D", "1W"],
        has_seconds: false,
        has_daily: true,
        has_weekly_and_monthly: false,
        has_empty_bars: true,
        has_no_volume: false,
        volume_precision: 7,
        currency_code:this._counterCode,
        "regular_session": "24x7"
      })
    });
  }

  /**
   * 返回K线数据
   * https://horizon.stellar.org/trade_aggregations?base_asset_type=native&counter_asset_type=credit_alphanum12&counter_asset_code=XCN&counter_asset_issuer=GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY&start_time=1534150599762&end_time=1534151611026&resolution=60000&order=desc
   */
  public history():Promise<any>{
    
    let _path = new tradeAggregationsParams(this._baseCode, this._baseIssuer, this._counterCode, this._counterIssuer, this._params);
    console.log('--------------------------read history:'+this._horizonServer+'trade_aggregations?'+ _path.params)
    return fetch(this._horizonServer+'trade_aggregations?'+ _path.params)
    .then((response: Response) => response.text())
  	.then((responseTest: string) => {
      let result = JSON.parse(responseTest)
      let records = result._embedded.records
      
      if(records.length === 0){
        return {s: 'no_data', t:[], o:[], h:[],l:[],c:[],v:[], v2:[]}
      }
      let t:number[] = [],o:number[]=[],h:number[]=[],l:number[]=[],c:number[]=[],v:number[]=[],v2:number[]=[];
      records.reverse().forEach((item:any) => {
        t.push(item.timestamp/1000);
        c.push(Number(item.close));
        o.push(Number(item.open));
        h.push(Number(item.high));
        l.push(Number(item.low));
        v.push(Number(item.base_volume));
        v2.push(Number(item.counter_volume));
      });
      console.log('----------data--------')
      console.log({ s: 'ok', t, o, h,l,c,v, v2 })
      return { s: 'ok', t, o, h,l,c,v, v2 };

    });
  }



}

const ASSET_TYPE_4 = 'credit_alphanum4';
const ASSET_TYPE_12 = 'credit_alphanum12';
//segment duration as millis since epoch. 
//Supported values are 1 minute (60000), 5 minutes (300000), 15 minutes (900000), 1 hour (3600000), 1 day (86400000) and 1 week (604800000).
const RESOLUTIONS:{[key:string]:number} = {
  "1": 60000,//1minutes
  "5":300000,
  "15":900000,
  "60":3600000,
  "1D":86400000,
  "D":86400000,
  "W":604800000,
  "1W":604800000
}

class tradeAggregationsParams {
  private order:string = 'desc';
  private _params:string;

  public constructor(baseAssetCode:string, baseAssetIssuer:string|undefined,
    counterAssetCode:string, counterAssetIssuer:string|undefined,
    params?: RequestParams){
      if(this.isNativeAsset(baseAssetCode, baseAssetIssuer)){
        this._params = 'base_asset_type=native'
      }else{
        this._params = 'base_asset_type=' ;
        if(baseAssetCode.length<5){
          this._params += ASSET_TYPE_4;
        }else{
          this._params += ASSET_TYPE_12;
        }
        this._params += '&base_asset_code=' + baseAssetCode + '&base_asset_issuer=' + baseAssetIssuer;
      }
      if(this.isNativeAsset(counterAssetCode, counterAssetIssuer)){
        this._params += '&counter_asset_type=native'
      }else{
        this._params += '&counter_asset_type='
        if(counterAssetCode.length < 5){
          this._params += ASSET_TYPE_4;
        }else{
          this._params += ASSET_TYPE_12;
        }
        this._params += '&counter_asset_code=' + counterAssetCode + '&counter_asset_issuer=' + counterAssetIssuer;
      }
      if(params!==undefined){
        this._params += '&start_time=' + params['from'] + '000&end_time=' + params['to'] + '000';
        let resolution = RESOLUTIONS[params['resolution'].toString()]//["1", "15", "60", "1D", "1W"]
        this._params += '&resolution='+resolution +'&limit=200&order='+this.order
      }
  }

  private isNativeAsset(code:string,issuer:string|undefined): boolean{
    if(code === 'XLM' && issuer === undefined){
      return true;
    }
    return false;
  }
  //=XCN&counter_asset_issuer=
  //GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY&
  //start_time=1533830400000&
  //end_time=1534210986767&
  //resolution=60000&
  //order=desc

  public get params():string{
    return this._params;
  }
}
