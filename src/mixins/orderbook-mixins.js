/*
 * 委单的数据
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-03-08 16:04:43 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-05-28 14:21:25
 * @License MIT 
 */

import { mapState, mapActions, mapGetters} from 'vuex'
import { listenOrderbook } from '@/api/orderbook'
import { cancel as cancelOffer }  from '@/api/offer'
import { DEFAULT_INTERVAL } from '@/api/gateways'
import { getAsset } from '@/api/assets'
import { myofferConvert } from '@/api/offer'
import {Decimal} from 'decimal.js'

export default {
  data(){
    return {
      distance: null,
      maxdistance: null,
      working: false,
      timeInterval: null
    }
  },
  computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      assetAccounts: state => state.asset.assets,
      selectedTrade: state => state.accounts.selectedTradePair.tradepair,
      selectedTradeIndex: state => state.accounts.selectedTradePair.index,
      bids: state => state.accounts.selectedTradePair.bids,//买单
      asks: state => state.accounts.selectedTradePair.asks,//卖单
      my: state => state.accounts.selectedTradePair.my.records,
      onpause: state => state.onpause,
      locale: state => state.app.locale

    }),
    ...mapGetters([
      'balances'
    ]),
    decimal(){
      if(this.selectedTrade.to.code === 'BTC'){
        return 8
      }
      return 4
    },
    BaseAsset(){
      return this.selectedTrade.from
    },
    CounterAsset(){
      return this.selectedTrade.to
    },
    bidsdata(){
      let dep = new Decimal(0)
      let newdata = this.bids.map(obj=>{
        let amount = new Decimal(obj.amount)
        dep = dep.add(amount)
        return Object.assign({}, obj, {
          origin: obj,
          num: amount.toFixed(4),
          price: new Decimal(obj.price).toFixed(this.decimal),
          amount: amount.times(obj.price_r.d).dividedBy(obj.price_r.n).toFixed(2),
          depth: Number(dep.toFixed(2)),
        })
      })
      newdata.forEach(ele=>{
        ele.percent = Number(new Decimal(ele.depth).times(100).dividedBy(dep).toFixed(2))
        ele.blank = 100 - ele.percent
      })
      return newdata
    },
    asksdata(){
      let dep = new Decimal(0)
      let newdata = this.asks.map(obj => {
        let amount = new Decimal(obj.amount)
        let num = amount.times(obj.price)
        dep = dep.add(num);
        return Object.assign({}, obj, {
          amount: amount.toFixed(2),
          price: new Decimal(obj.price).toFixed(this.decimal),
          num: num.toFixed(4),
          depth: dep.toFixed(2),
          origin: obj,
        });
      })
      newdata.forEach(ele=>{
        ele.percent =  Number(new Decimal(ele.depth).times(100).dividedBy(dep).toFixed(2))
        ele.blank = 100 - ele.percent
      })
      return newdata
    },

  },
  beforeDestroy: function() {
    if(this.timeInterval!=null){
      clearInterval(this.timeInterval)
    }
  },
 
  watch: {
    onpause(val){
      if(val){
        if(this.timeInterval){
          clearInterval(this.timeInterval)
        }
      }else{
        if(!this.timeInterval){
          this.setup()
        }
      }
    },
  },
  mounted(){
    this.setup();
  },
  beforeUpdate(){
    if(!this.timeInterval){
      this.setup()
    }
  },
  methods: {
    ...mapActions({
      getAssetsAccount:'assetsAccount',
      deleteTradePair: 'deleteTradePair',
      addTradePair: 'addTradePair',
      switchTradePair: 'switchTradePair',
      selectTradePair: 'selectTradePair',
      queryOrderBook: 'queryOrderBook',
      switchSelectedTradePair: 'switchSelectedTradePair'

    }),
    setup(){
      this.fetchData()
      this.timeInterval = setInterval(()=>{this.fetchData()},DEFAULT_INTERVAL)
      this.fetchData()
    },
    //查询买单和卖单
    fetchData(){
      //console.log((new Date()).toTimeString())
      this.load().then(data=>{console.log("")}).catch(err=>{
        console.error(err)
      })
    },
    load(){
      return Promise.all([this.queryOrderBook()])
    }
    
  }
}