/*
 * K线图全屏界面
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-02-01 17:03:07 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-03-06 20:21:47
 * @License MIT 
 */
<template>
  <div class="page">
    <k :base="BaseAsset" :counter="CounterAsset" :incremental="true" 
      :showTitle="true" ref="kgraph" :fullscreen="true"/>
    <div class="clear"></div>
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
  </div>
</template>

<script>
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

    }
  },
  computed: {
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
  },
  beforeMount () {
    
  },
  mounted () {
    
  },
  methods: {
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

    toBuy(){
      this.$router.push({name: 'TradeBuySell', params: {flag: 'buy'}})
    },
    toSell(){
      this.$router.push({name: 'TradeBuySell', params: {flag: 'sell'}})
    }

  },
  components: {
    K
  }
}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/trade.styl'
.footer-btns
  position: relative
</style>
