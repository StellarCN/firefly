/*
 * 轻量化的委单，只显示买单和卖单
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-02-28 11:19:05 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-07-11 14:08:33
 * @License MIT 
 */

<template>
  <scroll :refresh="load">
  <div class="flex-row order-book-lite">
   <div class="flex1">   
    <card class="offer-card" padding="10px 10px" margin="0px 2px 0px 0px">
      <div class="buyoffer-table offer-table" slot="card-content">
        <div class="buyoffer offermenu">{{$t('Trade.BuyOffer')}}</div>
        <div class="table-row font-13" 
          v-for="(item,index) in bidsdata" :key="index"
          :style="'background: linear-gradient(to right,#303034 0%,#303034 '
            +item.blank+'%,#216549 0%,#216549 ' + item.percent +'%);'"
          @click.stop="chooseItem('buy',item)"
          >
          <div class="b-row price">{{item.price}}</div>
          <div class="b-row">{{[locale.key,item.amount] | I18NNumberFormat }}</div>
        </div>
      </div>
    </card>
   
     </div>
     <div class="flex1">
   
    <card class="offer-card" padding="10px 10px" margin="0px 0px 0px 2px">
      <div class="selloffer-table offer-table"  slot="card-content">
        <div class="selloffer offermenu">{{$t('Trade.SellOffer')}}</div>

        <div class="table-row font-13" 
          v-for="(item,index) in asksdata" :key="index"
          :style="'background: linear-gradient(to left,#303034 0%,#303034 '
            +item.blank+'%,#733520 0%,#733520 ' + item.percent +'%);'"
            @click.stop="chooseItem('sell',item)"
          >
          <div class="b-row price">{{item.price}}</div>
          <div class="b-row">{{[locale.key,item.amount] | I18NNumberFormat}}</div>
        </div>
      </div>

    </card>
   </div>
  </div>

  </scroll>
</template>

<script>
import Card from './Card'
import { mapState, mapActions, mapGetters} from 'vuex'
import { listenOrderbook } from '@/api/orderbook'
import { cancel as cancelOffer }  from '@/api/offer'
import { DEFAULT_INTERVAL } from '@/api/gateways'
import { getAsset } from '@/api/assets'
import Scroll from '@/components/Scroll'
import { myofferConvert } from '@/api/offer'
import {Decimal} from 'decimal.js'

export default {
  data(){
    return {
      distance: null,
      maxdistance: null,
      working: false,
      timeInterval: null,
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
      locale: state => state.app.locale,

    }),
    ...mapGetters([
      'balances',
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
      let dep = new Decimal(0),adep = new Decimal(0)
      let newdata = this.bids.map(obj=>{
        let amount = new Decimal(obj.amount)
        let realamount = amount.times(obj.price_r.d).dividedBy(obj.price_r.n)
        dep = dep.add(amount)
        adep = adep.add(realamount)
        return Object.assign({}, obj, {
          origin: obj,
          num: amount.toFixed(4),
          price: new Decimal(obj.price).toFixed(this.decimal),
          amount: realamount.toFixed(4),
          depth: Number(dep.toFixed(4)),
          originDepth: adep.toNumber()
        })
      })
      newdata.forEach(ele=>{
        ele.percent = Number(new Decimal(ele.depth).times(100).dividedBy(dep).toFixed(2))
        ele.blank = 100 - ele.percent
      })
      return newdata
    },
    asksdata(){
      let dep = new Decimal(0),adep = new Decimal(0)
      let newdata = this.asks.map(obj => {
        let amount = new Decimal(obj.amount)
        let num = amount.times(obj.price)
        dep = dep.add(num);
        adep = adep.add(amount);
        return Object.assign({}, obj, {
          amount: amount.toFixed(4),
          price: new Decimal(obj.price).toFixed(this.decimal),
          num: num.toFixed(4),
          depth: dep.toFixed(4),
          origin: obj,
          originDepth: adep.toNumber()
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
    this.reload()
  },
  beforeUpdate(){
    
  },
  methods: {
    ...mapActions({
      getAssetsAccount:'assetsAccount',
      deleteTradePair: 'deleteTradePair',
      addTradePair: 'addTradePair',
      switchTradePair: 'switchTradePair',
      selectTradePair: 'selectTradePair',
      queryOrderBook: 'queryOrderBook',
      queryMyOffers: 'queryMyOffers',
      switchSelectedTradePair: 'switchSelectedTradePair',

    }),

    reload(){
      this.clean()
      this.setup()
    },
    clean(){
      if(this.timeInterval!=null){
        clearInterval(this.timeInterval)
      }
    },
    setup(){
      this.fetchData()
      this.timeInterval = setInterval(()=>{this.fetchData()},DEFAULT_INTERVAL)
      this.$nextTick(function(){
        this.$emit('intervalChanged',this.timeInterval)
      })
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
      return Promise.all([this.queryOrderBook(),this.queryMyOffers()])
    },
    chooseItem(type,data){
      this.$emit('choose',{type,data})
    }
   
  },
  components: {
    Card,
    Scroll
  }
}
</script>

<style lang="stylus" scoped>
@require './orderbook.styl'
.order-book-lite
  padding-top: 20px
.offermenu
  text-align: center
  font-size: 16px
  color: $secondarycolor.font
  padding-bottom: 8px
</style>
 
