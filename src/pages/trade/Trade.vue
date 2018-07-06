/*
 * 新交易界面
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-02-05 10:51:54 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-07-06 12:27:18
 * @License MIT 
 */
<template>
  <div class="page">
    <!-- toolbar -->
    <trade-pair-tool-bar @choseTradePair="choseTradePair" @switchTradePair="switchTradePair"/>

    <div class="content trade-content">
      <!--K线图-->
      <k :base="BaseAsset" :counter="CounterAsset" :incremental="true" :showTitle="true" ref="kgraph"/>
      
      <!--买单卖单委单成交-->
      <order-book ref="orderbook"/>

    </div>
    <!-- 买卖按钮 -->
    <div class="flex-row full-width footer-btns">
      <div class="flex1 btn-flex">
        <div class="full-width btn-buy" color="primary" @click="toBuy">
          <div>{{$t('Trade.Buy')}}  {{BaseAsset.code}}</div>
          <div class="available">{{$t('Available')}}{{CounterAsset.code}}:{{CounterBalance.balance|| 0 }}</div>
        </div>
      </div>
      <div class="flex1 btn-flex">
        <div class="full-width btn-sell" color="error" @click="toSell">
          <div>{{$t('Trade.Sell')}}  {{BaseAsset.code}}</div>
          <div class="available">{{$t('Available')}}{{BaseAsset.code}}:{{BaseBalance.balance||0}}</div>
        </div>
      </div>
    </div>

    <password-sheet v-if="needpwd" @cancel="cancelpwd" @ok="rightPwd" />


  </div>  
</template>

<script>
"use strict";
import { mapState, mapActions, mapGetters} from 'vuex'
import K from '@/components/K'
import Card from '@/components/Card'
import BottomNotice from '@/components/BottomNotice'
import Loading from '@/components/Loading'
import OrderBook from '@/components/OrderBook'
import TradePairToolBar from '@/components/TradePairToolBar'
import { listenOrderbook } from '@/api/orderbook'
import { getTrades } from '@/api/trade'
import { cancel as cancelOffer, myofferConvert, offer as doOffer }  from '@/api/offer'
import { getAsset, isNativeAsset } from '@/api/assets'
import { DEFAULT_INTERVAL } from '@/api/gateways'
import { getXdrResultCode } from '@/api/xdr'
import  defaultsDeep  from 'lodash/defaultsDeep'
import PasswordSheet from '@/components/PasswordSheet'


export default {
  data(){
    return {
      needpwd: false,
    }
  },

  beforeMount () {
    
  },
  computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      assetAccounts: state => state.asset.assets,
      bids: state => state.accounts.selectedTradePair.bids,//买单
      asks: state => state.accounts.selectedTradePair.asks,//卖单
      my: state => state.accounts.selectedTradePair.my.records,
      selectedTrade: state => state.accounts.selectedTradePair.tradepair,
      selectedTradeIndex: state => state.accounts.selectedTradePair.index,
      assethosts: state => state.asset.assethosts,

    }),
    ...mapGetters([
      'balances',
      'native',
      'reserve',
      'base_reserve'
    ]),
    
    BaseAsset(){
      return this.selectedTrade.from
    },
    BaseBalance(){
      if(isNativeAsset(this.BaseAsset)){
        return this.nativeBalance()
      }else{
        return this.assetBalance(this.BaseAsset)
      }
    },
    CounterAsset(){
      return this.selectedTrade.to
    },
    CounterBalance(){
      return this.assetBalance(this.CounterAsset)
    },
    LatestPrice(){
      if(this.latestTrade){
        let p = Number(this.latestTrade[0].base_amount)/Number(this.latestTrade[0].counter_amount)
        return Number(p.toFixed(7))+''
      }else{
        return null
      }
    },
    tradeBalance(){
      if(this.tradeType === 'buy'){
        return this.CounterBalance.balance || 0
      }else if(this.tradeType === 'sell'){
        console.log(this.BaseAsset,this.BaseBalance.balance)
        return this.BaseBalance.balance  
      }else{
        return null
      }
    },
    tradeBalanceInt(){
      return this.tradeBalance - this.tradeBalance % (10 ** (String(parseInt(this.tradeBalance * 10**7)).length -1 )  /10**7)
    },
    
  },
  mounted () {
    
  },

  methods: {
    ...mapActions({ }),
    nativeBalance(){
      let d = defaultsDeep({}, this.balances.filter(item=>isNativeAsset(item))[0])
      let t = this.native.balance - this.reserve - this.base_reserve - 0.0001
      if(t < 0 ) t = 0 
      d.balance = Number(t.toFixed(7))
      return d;
    },
    assetBalance(asset){
      //return defaultsDeep({}, this.balances.filter(item=> item.code === asset.code && item.issuer === asset.issuer)[0])
      let isNative = isNativeAsset(asset)
      let data = this.balances.filter(item => {
        if(isNative){
          return isNativeAsset(item)
        }else{
          return asset.code ===item.code && asset.issuer === item.issuer
        }
      })
      if(data.length === 0)return _.defaultsDeep({balance: 0}, asset)
      return _.defaultsDeep({}, data[0])
    },
    choseTradePair({index,tradepair}){//选择交易对
      this.$nextTick(()=>{
        this.$refs.kgraph.reload()
        this.$refs.orderbook.reload()
      })
    },
    //交换了交易队
    switchTradePair(){
      this.$nextTick(()=>{
        this.$refs.kgraph.reload()
        this.$refs.orderbook.reload()
      })
    },
    toBuy(){
      this.$router.push({name: 'TradeBuySell', params: {flag: 'buy'}})
    },
    toSell(){
      this.$router.push({name: 'TradeBuySell', params: {flag: 'sell'}})
    },
    cancelpwd(){
      this.needpwd = false
    },
    rightPwd(){
      this.needpwd = false
    },


  },

  components: {
    K,
    Card,
    BottomNotice,
    Loading,
    OrderBook,
    TradePairToolBar,
    PasswordSheet,
  }
  


}
</script>

<style lang="stylus"  scoped>
@require '~@/stylus/trade.styl'
</style>
