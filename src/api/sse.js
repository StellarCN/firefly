// 使用sse获取相应的消息推送
var EventSource = (typeof window === 'undefined') ? require('eventsource') : window.EventSource;

let host = ''

let _account_es,_payment_es, _trade_es ;

/**
 * 监听账户的stream
 * @param {String} address 账户G地址
 * @param {Function} success_fn 成功的处理函数
 * @param {Function} err_fn 失败的处理函数
 */
export function ListenAccountStream(address,success_fn, err_fn){
  CloseAccountStream()
  let url = `${host}/accounts/${address}?r=`+new Date().getTime()
  console.log('account stream url----'+url)
  _account_es = new EventSourceHandler(url,{ success_fn, err_fn
  })
  _account_es.listen()
}

/**
 * 关闭账户的监听
 */
export function CloseAccountStream(){
  if(_account_es){
    _account_es.close()
  }
}


export function ListenPaymentStream(address, cursor = '', success_fn, err_fn){
  ClosePaymentStream()
  let url = `${host}/accounts/${address}/payments?order=desc&limit=20&r=`+new Date().getTime()
  _payment_es = new EventSourceHandler(url,{
    cursor, success_fn, err_fn
  })
  _payment_es.listen()
}


export function ClosePaymentStream(){
  if(_payment_es){
    _payment_es.close()
  }
}


export function ListenTradeStream(address, cursor = '',success_fn, err_fn){
  CloseTradeStream()
  let url = `${host}/accounts/${address}/trades?order=desc&limit=20&r=`+new Date().getTime()
  _trade_es = new EventSourceHandler(url,{
    cursor, success_fn, err_fn
  })
  _trade_es.listen()
}


export function CloseTradeStream(){
  if(_trade_es){
    _trade_es.close()
  }
}


class EventSourceHandler{

  constructor(url,options){
    this.url = url
    this.success_fn = options.success_fn
    this.err_fn = options.err_fn
    this.es = null;
    this.timeout = null;
    this.cursor = options.cursor || ''
  }

  reconnectTimeout = 15*1000

  //监听
  listen(){
    var createTimeout = () => {
      this.timeout = setTimeout(() => {
        this.es.close();
        this.es = createEventSource();
      }, this.reconnectTimeout);
    };

    var createEventSource = () => {
      try {
        console.log('--------create es---')
        console.log(this)
        console.log(this.url)
        let uri = this.url
        if(this.cursor){
          uri += '&cursor='+this.cursor
        }
        this.es = new EventSource(uri);
      } catch (err) {
        if(this.err_fn){
          this.err_fn(err)
        }
        return false;
      }

      createTimeout();

      this.es.onmessage = message => {
        var result = message.data ? JSON.parse(message.data) : message;
        console.log('------get message---')
        console.log(result)
        if (result.paging_token) {
          //this.url.setQuery("cursor", result.paging_token);
          this.cursor = cursor
        }
        clearTimeout(this.timeout);
        createTimeout();
        this.success_fn(result);
      };

      this.es.onerror = error => {
        if (this.err_fn) {
          this.err_fn(error);
        }
      };

      return this.es;
    };

    createEventSource();
  }

  //关闭
  close(){
    if(this.timeout){
      clearTimeout(this.timeout)
    }
    if(this.es){
      this.es.close()
      this.es = null
    }
  }

  _parseRecord(json) {
    if (!json._links) {
      return json;
    }
    forEach(json._links, (n, key) => {
      // If the key with the link name already exists, create a copy
      if (typeof json[key] != 'undefined') {
        json[`${key}_attr`] = json[key];
      }
      json[key] = this._requestFnForLink(n);
    });
    return json;
  }





}