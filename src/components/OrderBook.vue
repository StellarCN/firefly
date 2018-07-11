/**
 * 委单表格
 * 有买单、卖单、我的委单
 * 点击买单或卖单，会触发@change事件，将当前页面的数据发送出去
 */
<template>
  <scroll :refresh="load">
    <!--菜单-->
    <!-- <div class="ordermenu">
      <div :class="'buyoffer offermenu' + (active==='buy'?' active':'')" 
          @click.stop="active='buy'">{{$t('Trade.BuyOffer')}}</div>
      <div :class="'selloffer offermenu' + (active==='sell'?' active':'')" 
          @click.stop="active='sell'">{{$t('Trade.SellOffer')}}</div>
      <div :class="'myoffer offermenu' + (active==='myoffer'?' active':'')" 
          @click.stop="active='myoffer'">{{$t('Trade.MyOffer')}}({{myofferlen}})</div>
      <div :class="'myoffer offermenu' + (active==='myTradeHistory'?' active':'')" 
          @click.stop="active='myTradeHistory'">{{$t('History.Trade')}}</div>
    </div> -->

    <v-tabs class="tabs-bg-dark" grow slider-color="primary" color="transparent">
        <v-tab @click.stop="active='buy'">{{$t('Trade.BuyOffer')}}</v-tab>
        <v-tab @click.stop="active='sell'">{{$t('Trade.SellOffer')}}</v-tab>
        <v-tab @click.stop="active='myoffer'">{{$t('Trade.MyOffer')}}({{myofferlen}})</v-tab>
        <v-tab @click.stop="active='myTradeHistory'">{{$t('History.Trade')}}</v-tab>
      </v-tabs>

    <card class="offer-card" padding="10px 10px">
      <div class="buyoffer-table offer-table" v-if="active === 'buy'" slot="card-content">
        <div class="table-head font-13">
          <div class="headcol">{{$t('Trade.Price')}}</div>
          <div class="headcol">{{BaseAsset.code}}</div>
          <div class="headcol">{{CounterAsset.code}}</div>
          <div class="headcol">{{$t('Trade.Depth')}}</div>
        </div>
        <div class="table-row font-13" 
          v-for="(item,index) in bidsdata" :key="index"
          :style="'background: linear-gradient(to right,#303034 0%,#303034 '
            +item.blank+'%,#216549 0%,#216549 ' + item.percent +'%);'"
          @click.stop="chooseItem('buy',item)"
          >
          <div class="b-row price">{{item.price}}</div>
          <div class="b-row">{{[locale.key,item.amount] | I18NNumberFormat }}</div>
          <div class="b-row">{{[locale.key,item.num] | I18NNumberFormat}}</div>
          <div class="b-row depth">{{[locale.key,item.depth] | I18NNumberFormat}}</div>
        </div>
      </div>
      <div class="selloffer-table offer-table" v-if="active === 'sell'" slot="card-content">
        <div class="table-head font-13">
          <div class="headcol price">{{$t('Trade.Price')}}</div>
          <div class="headcol">{{BaseAsset.code}}</div>
          <div class="headcol">{{CounterAsset.code}}</div>
          <div class="headcol depth">{{$t('Trade.Depth')}}</div>
        </div>
        <div class="table-row font-13" 
          v-for="(item,index) in asksdata" :key="index"
          :style="'background: linear-gradient(to left,#303034 0%,#303034 '
            +item.blank+'%,#733520 0%,#733520 ' + item.percent +'%);'"
            @click.stop="chooseItem('sell',item)"
          >
          <div class="b-row price">{{item.price}}</div>
          <div class="b-row">{{[locale.key,item.amount] | I18NNumberFormat}}</div>
          <div class="b-row">{{[locale.key,item.num] | I18NNumberFormat}}</div>
          <div class="b-row depth">{{[locale.key,item.depth] | I18NNumberFormat}}</div>
        </div>
      </div>
      <div class="myoffer-table offer-table" v-if="active === 'myoffer'" slot="card-content">
        <div class="table-head font-13">
          <div class="headcol">{{$t('Trade.Price')}}</div>
          <div class="headcol">{{BaseAsset.code}}</div>
          <div class="headcol">{{CounterAsset.code}}</div>
          <div class="headcol"></div>
        </div>
        <div class="table-row font-13" 
          v-for="(item,index) in myoffers" :key="index" :class='item.type'>
          <div class="b-row price" >{{item.price}}</div>
          <div class="b-row" v-if="item.type==='buy'">+{{[locale.key,Number(item.base)] | I18NNumberFormat}}</div>
          <div class="b-row" v-else>-{{[locale.key,Number(item.amount)] | I18NNumberFormat}}</div>
          <div class="b-row" v-if="item.type==='buy'">-{{[locale.key,Number(item.amount)] | I18NNumberFormat}}</div>
          <div class="b-row" v-else>+{{[locale.key,Number(item.base)] | I18NNumberFormat}}</div>
          <div class="b-row depth">
            <span class="working" v-if="working && delindex===index"></span>
            <a v-else href="javascript:void(0)"   @click.stop="cancelMyOffer(item,index)">{{$t('Trade.Cancel')}}</a>
          </div>
        </div>
      </div>
      
      <div class="myoffer-table offer-table" v-if="active === 'myTradeHistory'" slot="card-content">
        <div class="table-head font-13">
          <div class="headcol">{{$t('deal_price')}}</div>
          <div class="headcol">{{BaseAsset.code}}</div>
          <div class="headcol">{{CounterAsset.code}}</div>    
          <div class="headcol">{{$t('status')}}</div>      
        </div>
        <div class="table-row font-13" 
          v-for="(item,index) in deals" :key="index" :class='item.type'>
          <div class="b-row price" >{{item.price}}</div>
          <div class="b-row" v-if="assetEqBaseAsset(item)">-{{item.sold_amount}}&nbsp;</div>
          <div class="b-row" v-else>+{{item.bought_amount}}&nbsp;</div>
          
          <div class="b-row" v-if="assetEqCounterAsset(item)">-{{item.sold_amount}}&nbsp;</div>
          <div class="b-row" v-else>+{{item.bought_amount}}&nbsp;</div>

          <div class="b-row">{{$t(item.type)}}</div>
        </div>
      </div>

      <password-sheet v-if="needpwd" @cancel="cancelpwd" @ok="rightPwd" />

    </card>
  </scroll>
</template>

<script>
import Card from './Card'
import { mapState, mapActions, mapGetters} from 'vuex'
import { listenOrderbook } from '@/api/orderbook'
import { cancel as cancelOffer }  from '@/api/offer'
import { DEFAULT_INTERVAL } from '@/api/gateways'
import { getAsset,isNativeAsset } from '@/api/assets'
import Scroll from '@/components/Scroll'
import { myofferConvert } from '@/api/offer'
import {Decimal} from 'decimal.js'
import { getXdrResultCode } from '@/api/xdr'
import PasswordSheet from './PasswordSheet'
var moment = require('moment')

export default {
  data(){
    return {
      distance: null,
      maxdistance: null,
      active:'buy',//查看buy还是sell还是myoffer
      working: false,
      delindex: -1,
      timeInterval: null,
      // deals:[],
      needpwd: false,
    }
  },
  props:{
    activeTab:{
      type:String,
      default: 'buy'
    },
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
      islogin: state => state.accounts.accountData.seed ? true:false,
      alloffers: state => state.account.alloffers,

    }),
    ...mapGetters([
      'balances',
    ]),
    decimal(){
      if(this.selectedTrade.to.code === 'BTC'){
        return 7
      }
      return 4
    },
    baseDecimal(){
      if(this.selectedTrade.from.code === 'BTC'){
        return 7
      }
      return 4
    },
    BaseAsset(){
      return this.selectedTrade.from
    },
    CounterAsset(){
      return this.selectedTrade.to
    },
    myofferlen(){
      return this.myoffers.length;
    },
    myoffers(){
      if(this.my){
        let data = myofferConvert(this.BaseAsset,this.CounterAsset,this.my)
        data.forEach(item=>{
          item.price = Number(item.price).toFixed(7)
          item.base = Number(item.base).toFixed(7)
          item.amount = Number(item.amount).toFixed(7)
        })
        return data
      }
      return []
    },
    bidsdata(){
      let dep = new Decimal(0),adep = new Decimal(0)
      let newdata = this.bids.map(obj=>{
        let amount = new Decimal(obj.amount)
        let realAmount = amount.times(obj.price_r.d).dividedBy(obj.price_r.n)
        dep = dep.add(amount)
        adep = adep.add(realAmount)
        return Object.assign({}, obj, {
          origin: obj,
          num: amount.toFixed(this.decimal),
          price: new Decimal(obj.price).toFixed(this.decimal),
          amount: realAmount.toFixed(this.baseDecimal),
          depth: Number(dep.toFixed(this.decimal)),
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
        adep = adep.add(amount)
        return Object.assign({}, obj, {
          amount: amount.toFixed(this.baseDecimal),
          price: new Decimal(obj.price).toFixed(this.decimal),
          num: num.toFixed(this.decimal),
          depth: dep.toFixed(this.decimal),
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
    deals(){
      return this.filterOffers()
    }

  },
  beforeDestroy: function() {
    this.$store.commit('CLEAN_ALL_OFFERS')
    this.clean()
  },
 
  watch: {
    activeTab(){
      console.log(this.activeTab)
      this.active = this.activeTab
    },
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
      switchSelectedTradePair: 'switchSelectedTradePair',
      queryMyOffers: 'queryMyOffers',
      orderBookStreamHandler: 'orderBookStreamHandler',
      getAllOffers: 'getAllOffers',

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
      let queryOffersFn = new Promise((resolve,reject)=>{
        this.queryAllOffers()
        resolve()
      })
      return Promise.all([this.queryOrderBook(), this.queryMyOffers(), queryOffersFn])
    },
    //撤消委单
    cancelMyOffer(item,index){
      if(!this.islogin){
        this.needpwd = true;
        return;
      }
      if(this.working ) return
      if(!this.accountData.seed)return
      this.working = true
      this.delindex = index
      cancelOffer(this.accountData.seed,item)
        .then(data=>{
          this.$toasted.show(this.$t('Trade.CancelOfferSuccess'))
          this.working = false
          this.delindex = -1
          //this.queryMyOffers()
          //查询盘面
          try{
            this.load().then(()=>{}).catch(err=>{console.error(err)});
          }catch(err){
            console.error(err)
          }
        })
        .catch(err=>{
          console.log('-----cancel----- error-----')
          console.log(err)
          this.$toasted.show(this.$t('Error.CancelOfferFailed'))
          let errcode = getXdrResultCode(err);
          if(errcode){
            //this.$toasted.error(this.$t(errcode));
            this.$toasted.show( this.$t(errorcode))
          }
          this.working = false
          this.delindex = -1
        })
    },
    chooseItem(type,data){
      this.$emit('choose',{type,data})
    },
    filterOffers(){
      if(this.alloffers){
        let key1 = this.BaseAsset.code + (isNativeAsset(this.BaseAsset) ? '' : this.BaseAsset.issuer)
        let key2 = this.CounterAsset.code + (isNativeAsset(this.CounterAsset) ? '' : this.CounterAsset.issuer)
        //过滤掉不是当前要显示的数据，价格，如果当前的买和卖是反着的，则重新计算价格
        return this.alloffers.filter(item=>{
          let t1 = null,t2 = null
          if(item.sold_asset_code){
            t1 = item.sold_asset_code + ( (isNativeAsset(item.sold_asset_code, item.sold_asset_issuer) ? '': item.sold_asset_issuer) )
          }else{
            t1 = item.counter_asset + ( (isNativeAsset(item.counter_asset, item.counter_issuer) ? '': item.counter_issuer) )
          }

          if(item.bought_asset_code){
            t2 = item.bought_asset_code + ( (isNativeAsset(item.bought_asset_code, item.bought_asset_issuer) ? '': item.bought_asset_issuer) )
          }else{
            t2 = item.base_asset + ( (isNativeAsset(item.base_asset, item.base_issuer) ? '': item.base_issuer) )
          }
          
          if((key1 === t1 && key2 === t2) || (key1 === t2 && key2 === t1)){
            return true
          }
          return false
        })
        .map(item=>{
          let t1 = null,t2 = null
          if(item.sold_asset_code){
            t1 = item.sold_asset_code + ( (isNativeAsset(item.sold_asset_code, item.sold_asset_issuer) ? '': item.sold_asset_issuer) )
          }else{
            t1 = item.counter_asset + ( (isNativeAsset(item.counter_asset, item.counter_issuer) ? '': item.counter_issuer) )
          }

          if(item.bought_asset_code){
            t2 = item.bought_asset_code + ( (isNativeAsset(item.bought_asset_code, item.bought_asset_issuer) ? '': item.bought_asset_issuer) )
          }else{
            t2 = item.base_asset + ( (isNativeAsset(item.base_asset, item.base_issuer) ? '': item.base_issuer) )
          }
          let obj = null
          if(item.bought_asset_code === null || typeof item.bought_asset_code ==='undefined'
             || item.bought_amount ===null || typeof item.bought_amount === 'undefined' ){
            let cancelObj = {
              bought_asset_code: item.base_asset,
              bought_asset_issuer: item.base_issuer,
              sold_asset_code: item.counter_asset,
              sold_asset_issuer: item.counter_issuer,
              sold_amount:item.amount,
              bought_amount:new Decimal(item.amount).times(item.price).toFixed(7)
            }
            obj = Object.assign({}, item, cancelObj)
          }else{
            obj= Object.assign({}, item)
          }
          if(t1 === key2 && t2 === key1){
            if(item.price_r){
              obj.price = new Decimal(item.price_r.d).dividedBy(item.price_r.n).toFixed(7)
            }else{
              obj.price = new Decimal(1).dividedBy(item.price).toFixed(7)
            }
          }
          return obj;
          
        })
      }
      return []
    },
    queryAllOffers(){
      //暂时只查询一周的委单数据
      let start_time = Number(moment().subtract(100,"days").format('x'))
      let end_time = Number(moment().format('x'))
      let address = this.account.address
      return this.getAllOffers({
        account: address,
        start_time,
        end_time
      })
      // getAllEffectOffers(address, start_time, end_time)
      //   .then(response=>{
      //     if(!response.data)return;
      //     console.log('----response--data--')
      //     console.log(response.data)
      //     this.deals = response.data.map(item=>{
      //       let total = item.amount
      //       let d = null
      //       if(item.price_r){
      //         d = new Decimal(total).times(item.price_r.d).div(item.price_r.n).toFixed(7)
      //       }else{
      //         d = new Decimal(total).div(item.price).toFixed(7)
      //       }
      //       return Object.assign({}, item, { amount: d, total, 
      //         counter_issuer: item.counter_issuer ? item.counter_issuer : 'stellar.org',
      //         base_issuer: item.base_issuer ? item.base_issuer : 'stellar.org',
      //         price: Number(item.price)
      //       })
      //     }).filter(item=>{
      //       let key1 = item.base_asset + item.base_issuer + item.counter_asset+item.counter_issuer
      //       let key2 = item.counter_asset + item.counter_issuer + item.base_asset+item.base_issuer
      //       let from = this.selectedTrade.from
      //       let to = this.selectedTrade.to
      //       let key01 = from.code + from.issuer + to.code + to.issuer
      //       let key02 = to.code + to.issuer + from.code + from.issuer
      //       if(key01===key1 && key02 === key2){
      //         item.itype = 'buy'
      //         return true
      //       }else if(key01===key2 && key02 === key1){
      //         item.itype = 'sell'
              
      //         if(item.type === 'finished'){
      //           let t = item.amount
      //           item.amount = item.total
      //           item.total = t
      //         }else{
      //           item.price = Number(new Decimal(1).div(item.price).toFixed(7))
      //         }
      //         return true
      //       }else{
      //         return false
      //       }
      //     })

      //     this.deals.forEach(item=>{
      //       item.price = Number(item.price).toFixed(7)
      //       item.total = Number(item.total).toFixed(7)
      //       item.amount = Number(item.amount).toFixed(7)
      //     })

      //   })
      //   .catch(err=>{
      //     console.error(err)
      //     if(err.message){
      //       this.$toasted.error(err.message)
      //     }
      //   })
    },
    cancelpwd(){
      // this.$router.back()
      this.needpwd = false
    },
    rightPwd(){
      this.needpwd = false
    },
    assetEqBaseAsset(item){
      let codeeq = item.sold_asset_code === this.BaseAsset.code
      if(!codeeq)return false
      let isNA = isNativeAsset(item.sold_asset_code, item.sold_asset_issuer)
      let isNAB = isNativeAsset(this.BaseAsset)
      if(isNA && isNAB)return true
      return item.sold_asset_issuer === this.BaseAsset.issuer
    },
    assetEqCounterAsset(item){
      let codeeq = item.sold_asset_code === this.CounterAsset.code
      if(!codeeq)return false
      let isNA = isNativeAsset(item.sold_asset_code, item.sold_asset_issuer)
      let isNAB = isNativeAsset(this.CounterAsset)
      if(isNA && isNAB)return true
      return item.sold_asset_issuer === this.CounterAsset.issuer
    }
   
  },
  components: {
    Card,
    Scroll,
    PasswordSheet,
  }
}
</script>

<style lang="stylus" scoped>
@require './orderbook.styl'
</style>
 
