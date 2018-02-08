/*
 * K线图全屏界面
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-02-01 17:03:07 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-02-08 11:39:38
 * @License MIT 
 */
<template>
  <div class="page">
    <k :base="BaseAsset" :counter="CounterAsset" :incremental="true" 
      :showTitle="true" ref="kgraph" :fullscreen="true" height="100vh"/>
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
  },
  beforeMount () {
    
  },
  mounted () {
    
  },
  methods: {
    
  },
  components: {
    K
  }
}
</script>

<style lang="stylus" scoped>

</style>
