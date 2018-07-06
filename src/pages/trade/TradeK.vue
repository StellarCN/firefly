/*
 * K线图全屏界面
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-02-01 17:03:07 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-05-25 16:32:48
 * @License MIT 
 */
<template>
  <div class="page">
    <k :base="BaseAsset" :counter="CounterAsset" :incremental="true" 
      :showTitle="true" ref="kgraph"/>
    <div class="clear"></div>
    <order-book />
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
import FullK from '@/components/FullK'
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
import  defaultsDeep  from 'lodash/defaultsDeep'

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
      let d = defaultsDeep({}, this.balances.filter(item=>isNativeAsset(item))[0])
      let t = this.native.balance - this.reserve - this.base_reserve - 0.0001
      if(t < 0 ) t = 0 
      d.balance = Number(t.toFixed(7))
      return d;
    },
    assetBalance(asset){
      return defaultsDeep({}, this.balances.filter(item=> item.code === asset.code && item.issuer === asset.issuer)[0])
    },

    toBuy(){
      this.$router.push({name: 'TradeBuySell', params: {flag: 'buy'}})
    },
    toSell(){
      this.$router.push({name: 'TradeBuySell', params: {flag: 'sell'}})
    }

  },
  components: {
    'k': FullK,
    OrderBook,
  }
}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/trade.styl'
.footer-btns
  position: relative
.page
  width: 100%
  padding-left: 0
  padding-left:  constant(safe-area-inset-left)
  padding-left:  env(safe-area-inset-left)
  padding-right: 0
  padding-right: constant(safe-area-inset-right)
  padding-right: env(safe-area-inset-right)
</style>
