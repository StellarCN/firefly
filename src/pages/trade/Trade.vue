/*
 * 新交易界面
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-02-05 10:51:54 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-02-06 17:18:00
 * @License MIT 
 */
<template>
  <div class="page">
    <!-- toolbar -->
    <v-toolbar color="primary" dark app dense :clipped-left='true'>
      <v-btn icon @click="back"><v-icon>keyboard_arrow_left</v-icon></v-btn>
      <div class="toolbar__title toolbar-title white--text textcenter tb-title flex-row">
        <div class="flex1">&nbsp;</div>
        <div class="flex2 textcenter">
          <div class="tb-code">{{BaseAsset.code}}</div>
          <div class="tb-issuer" v-if="assethosts[BaseAsset.code]">{{assethosts[BaseAsset.code]}}</div>
          <div class="tb-issuer" v-else-if="assethosts[BaseAsset.issuer]">{{assethosts[BaseAsset.issuer]}}</div>
          <div class="tb-issuer" v-else>{{BaseAsset.issuer | miniaddress}}</div>
        </div>
        <div class="flex1 textcenter tb-icon"><i class="icons material-icons">&#xE8D4;</i></div>
        <div class="flex2 textcenter">
          <div class="tb-code">{{CounterAsset.code}}</div>
          <div class="tb-issuer" v-if="assethosts[CounterAsset.code]">{{assethosts[CounterAsset.code]}}</div>
          <div class="tb-issuer" v-else-if="assethosts[CounterAsset.issuer]">{{assethosts[CounterAsset.issuer]}}</div>
          <div class="tb-issuer" v-else>{{CounterAsset.issuer | miniaddress}}</div>
        </div>
        <div class="flex1 tb-icon" @click.stop="showChoseTradeDlg = true"><i class="icons material-icons">keyboard_arrow_down</i></div>
        <div class="flex1">&nbsp;</div>
      </div>
      <v-btn icon style="visibility:hidden;"><v-icon class="back-icon"></v-icon></v-btn>
    </v-toolbar>

    <!--  选择交易队内容 -->
    <v-dialog v-model="showChoseTradeDlg" fullscreen transition="dialog-bottom-transition" :overlay=false>
      <v-toolbar color="primary" dark app dense :clipped-left='true'>
        <v-btn icon @click="showChoseTradeDlg = false"><v-icon>keyboard_arrow_left</v-icon></v-btn>
        <div class="toolbar__title toolbar-title white--text textcenter tb-title">{{$t("Trade.SelfSelection")}}</div>
        <v-btn icon style="visibility:hidden;"><v-icon class="back-icon"></v-icon></v-btn>
      </v-toolbar>
      <v-card class="dlg-content">
        <div v-for="(item,index) in tradepairs" :key="index" :class="'flex-row row100 ' + (isChoosenTrade(item.from,item.to) ? 'active':'')" @click="choseTrade(index,item)">
          <div class="flex2">&nbsp;</div>
          <div class="flex3 textcenter">
            <div class="tb-code">{{item.from.code}}</div>
            <div class="tb-issuer" v-if="assethosts[item.from.code]">{{assethosts[item.from.code]}}</div>
            <div class="tb-issuer" v-else-if="assethosts[item.from.issuer]">{{assethosts[item.from.issuer]}}</div>
            <div class="tb-issuer" v-else>{{item.from.issuer | miniaddress}}</div>
          </div>
          <div class="flex2 textcenter tb-icon"><i class="icons material-icons">&#xE8D4;</i></div>
          <div class="flex3 textcenter">
            <div class="tb-code">{{item.to.code}}</div>
            <div class="tb-issuer" v-if="assethosts[item.to.code]">{{assethosts[item.to.code]}}</div>
            <div class="tb-issuer" v-else-if="assethosts[item.to.issuer]">{{assethosts[item.to.issuer]}}</div>
            <div class="tb-issuer" v-else>{{item.to.issuer | miniaddress}}</div>
          </div>
          <div class="flex2">&nbsp;</div>
        </div>
      </v-card>
    </v-dialog>

    <div class="content">
      <!--K线图-->
      <k :base="BaseAsset" :counter="CounterAsset" :incremental="true" :showTitle="true" />
      
      <!--买单卖单委单成交-->
      <order-book ref="orderbook"/>

    </div>




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
import { listenOrderbook } from '@/api/orderbook'
import { getTrades } from '@/api/trade'
import { cancel as cancelOffer, myofferConvert, offer as doOffer }  from '@/api/offer'
import { getAsset, isNativeAsset } from '@/api/assets'
import { DEFAULT_INTERVAL } from '@/api/gateways'
import { getXdrResultCode } from '@/api/xdr'
import _ from 'lodash'

export default {
  data(){
    return {
      showChoseTradeDlg: false,

    }
  },

  beforeMount () {
    
  },
  computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      assetAccounts: state => state.asset.assets,
      tradepairs: state => state.accounts.accountData.tradepairs,
      selectedTrade: state => state.accounts.selectedTradePair.tradepair,
      selectedTradeIndex: state => state.accounts.selectedTradePair.index,
      bids: state => state.accounts.selectedTradePair.bids,//买单
      asks: state => state.accounts.selectedTradePair.asks,//卖单
      my: state => state.accounts.selectedTradePair.my.records,
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
        return this.nativeBalance
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
    ...mapActions({
      switchTradePair: 'switchTradePair',
      selectTradePair: 'selectTradePair',
    }),
    nativeBalance(){
      let d = _.defaultsDeep({}, this.balances.filter(item=>isNativeAsset(item))[0])
      let t = this.native.balance - this.reserve - this.base_reserve - 0.0001
      if(t < 0 ) t = 0 
      d.balance = Number(t.toFixed(7))
      return d;
    },
    assetBalance(asset){
      return _.defaultsDeep({}, this.balances.filter(item=> item.code === asset.code && item.issuer === asset.issuer)[0])
    },
    back(){
      this.$router.back()
    },
    isChoosenTrade(from, to){
      let key = this.BaseAsset.code + this.BaseAsset.issuer + this.CounterAsset.code + this.CounterAsset.issuer
      let key2 = from.code + from.issuer + to.code + to.issuer
      return key === key2
    },
    choseTrade(index,tradepair){//选择交易对
      this.selectTradePair({index, tradepair})
      this.showChoseTradeDlg = false
    },

  },

  components: {
    K,
    Card,
    BottomNotice,
    Loading,
    OrderBook,
    


  }
  


}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.tb-title
  width: 100vw
  padding-top: 2px
.tb-code
  font-size: 16px
  line-height: 24px
.tb-issuer
  font-size: 14px
  line-height: 16px
  vertical-align: top
.tb-icon
  padding-top: 8px
  .material-icons
    font-size: 24px
.dlg-content
  padding-top: 20px!important
.row100
  width: 100vw
  &.active
    color: $primarycolor.green
</style>
