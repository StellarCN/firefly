/**
 * 委单表格
 * 有买单、卖单、我的委单
 * 点击买单或卖单，会触发@change事件，将当前页面的数据发送出去
 */
<template>
  <scroll :refresh="load">
    <!--菜单-->
    <div class="ordermenu">
      <div :class="'buyoffer offermenu' + (active==='buy'?' active':'')" 
          @click.stop="active='buy'">{{$t('Trade.BuyOffer')}}</div>
      <div :class="'selloffer offermenu' + (active==='sell'?' active':'')" 
          @click.stop="active='sell'">{{$t('Trade.SellOffer')}}</div>
      <div :class="'myoffer offermenu' + (active==='myoffer'?' active':'')" 
          @click.stop="active='myoffer'">{{$t('Trade.MyOffer')}}</div>
      <!-- <div :class="'myoffer offermenu' + (active==='myTradeHistory'?' active':'')" 
          @click.stop="active='myTradeHistory'">{{$t('Trade.MyTradeHistory')}}</div> -->
    </div>

    <card class="offer-card" padding="10px 10px">
      <div class="buyoffer-table offer-table" v-if="active === 'buy'" slot="card-content">
        <div class="table-head body-2">
          <div class="headcol">{{$t('Trade.Price')}}</div>
          <div class="headcol">{{BaseAsset.code}}</div>
          <div class="headcol">{{CounterAsset.code}}</div>
          <div class="headcol">{{$t('Trade.Depth')}}</div>
        </div>
        <div class="table-row body-2" 
          v-for="(item,index) in bidsdata" :key="index"
          :style="'background: linear-gradient(to right,#303034 0%,#303034 '
            +item.blank+'%,#216549 0%,#216549 ' + item.percent +'%);'"
          @click.stop="chooseItem('buy',item)"
          >
          <div class="b-row price">{{item.price}}</div>
          <div class="b-row">{{item.amount}}</div>
          <div class="b-row">{{item.num}}</div>
          <div class="b-row depth">{{item.depth}}</div>
        </div>
      </div>
      <div class="selloffer-table offer-table" v-if="active === 'sell'" slot="card-content">
        <div class="table-head body-2">
          <div class="headcol price">{{$t('Trade.Price')}}</div>
          <div class="headcol">{{BaseAsset.code}}</div>
          <div class="headcol">{{CounterAsset.code}}</div>
          <div class="headcol depth">{{$t('Trade.Depth')}}</div>
        </div>
        <div class="table-row body-2" 
          v-for="(item,index) in asksdata" :key="index"
          :style="'background: linear-gradient(to left,#303034 0%,#303034 '
            +item.blank+'%,#733520 0%,#733520 ' + item.percent +'%);'"
            @click.stop="chooseItem('sell',item)"
          >
          <div class="b-row price">{{item.price}}</div>
          <div class="b-row">{{item.amount}}</div>
          <div class="b-row">{{item.num}}</div>
          <div class="b-row depth">{{item.depth}}</div>
        </div>
      </div>
      <div class="myoffer-table offer-table" v-if="active === 'myoffer'" slot="card-content">
        <div class="table-head body-2">
          <div class="headcol">{{$t('Trade.Price')}}</div>
          <div class="headcol">{{BaseAsset.code}}</div>
          <div class="headcol">{{CounterAsset.code}}</div>
          <div class="headcol">&nbsp;</div>
          
        </div>
        <div class="table-row body-2" 
          v-for="(item,index) in myoffers" :key="index" :class='item.type'>
          <div class="b-row price" >{{Number(item.price.toFixed(4))}}</div>
          <div class="b-row" v-if="item.type==='buy'">+{{Number(item.base.toFixed(4))}}</div>
          <div class="b-row" v-else>-{{Number(item.amount.toFixed(4))}}</div>
          <div class="b-row" v-if="item.type==='buy'">-{{Number(item.amount.toFixed(4))}}</div>
          <div class="b-row" v-else>+{{Number(item.base.toFixed(4))}}</div>
          <div class="b-row depth">
            <span class="working" v-if="working && delindex===index"></span>
            <a v-else href="javascript:void(0)"   @click.stop="cancelMyOffer(item,index)">{{$t('Trade.Cancel')}}</a>
          </div>
        </div>
      </div>
      <!-- <div class="myoffer-table offer-table" v-if="active === 'myTradeHistoryr'" slot="card-content">
        <div class="table-head body-2">
          <div class="headcol">{{$t('Trade.Price')}}</div>
          <div class="headcol">{{BaseAsset.code}}</div>
          <div class="headcol">{{CounterAsset.code}}</div>
          <div class="headcol">&nbsp;</div>
          
        </div>
        <div class="table-row body-2" 
          v-for="(item,index) in myoffers" :key="index" :class='item.type'>
          <div class="b-row price" >{{Number(item.price.toFixed(4))}}</div>
          <div class="b-row" v-if="item.type==='buy'">{{item.base}}</div>
          <div class="b-row" v-else>{{item.amount}}</div>
          <div class="b-row" v-if="item.type==='buy'">{{item.amount}}</div>
          <div class="b-row" v-else>{{item.base}}</div>
          <div class="b-row depth">
            <span class="working" v-if="working && delindex===index"></span>
            <a v-else href="javascript:void(0)" error @click.stop="cancelMyOffer(item,index)">{{$t('Trade.Cancel')}}</a>
          </div>
        </div>
      </div> -->
    </card>
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
export default {
  data(){
    return {
      distance: null,
      maxdistance: null,
      active:'buy',//查看buy还是sell还是myoffer
      working: false,
      delindex: -1,
      timeInterval: null,
    }
  },
  props:{
    activeTab:{
      type:String,
      default: 'buy'
    },
    pairIndex: {
      type: Number,
      default: null
    },
    blank:{
      type: Boolean,
      default: false
    }
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
      onpause: state => state.onpause,

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
    // active: {
    //   getter: function(){
    //     return this.activetab
    //   },
    //   setter: function(value){
    //     this.emit()
    //   }
    // },
    BaseAsset(){
      return this.selectedTrade.from
    },
    CounterAsset(){
      return this.selectedTrade.to
    },
    myoffers(){
      if(this.blank)return []
      if(this.my){
        return myofferConvert(this.BaseAsset,this.CounterAsset,this.my)
      }
      return []
    },
    bidsdata(){
      if(this.blank)return []
      let data = []
      let dep = 0
      let n=this.bids.length
      for(var i=0;i<n;i++){
        let obj = Object.assign({}, this.bids[i])
        obj.num = Number(obj.amount).toFixed(4)
        obj.price = Number(obj.price).toFixed(this.decimal)
        obj.amount = (obj.num / obj.price).toFixed(2)
        dep += Number(obj.num)
        obj.depth = dep.toFixed(2)
        obj.origin = this.bids[i]
        data.push(obj)
      }
      data.forEach(ele=>{
        let p = ele.depth / dep
        ele.percent = Number((p * 100).toFixed(2))
        ele.blank = 100 - ele.percent
      })
      return data
    },
    asksdata(){
      if(this.blank)return []
      let data = []
      let dep = 0
      // for (ask of asks){

      // }
      let n=this.asks.length
      for(var i=0;i<n;i++){
        let obj = Object.assign({}, this.asks[i])
        obj.amount = Number(obj.amount).toFixed(2)
        obj.price = Number(obj.price).toFixed(this.decimal)
        obj.num = (obj.price * obj.amount).toFixed(4)
        dep += Number(obj.num)
        obj.depth = dep.toFixed(2)
        obj.origin = this.asks[i]
        data.push(obj)
      }
      data.forEach(ele=>{
        let p = ele.depth / dep
        ele.percent = Number((p * 100).toFixed(2))
        ele.blank = 100 - ele.percent
      })
      return data
    },

  },
  beforeDestroy: function() {
    console.log('OrderBook before Destroy......................--------------------------------..')
    if(this.timeInterval!=null){
      clearInterval(this.timeInterval)
    }
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
        if(!this.timeInterval && !this.blank){
          this.setup()
        }
      }
    },
    blank(val){
      if(this.timeInterval){
          clearInterval(this.timeInterval)
       }
      if(!val){
        this.setup()
      }
    },//end of blank
  },
  mounted(){
    this.setup();
  },
  beforeUpdate(){
    if(!this.blank && !this.timeInterval){
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
      orderBookStreamHandler: 'orderBookStreamHandler'

    }),
    setup(){
      if(this.blank)return
      if(this.selectedTradeIndex === this.pairIndex){
        this.fetchData()
        this.timeInterval = setInterval(()=>{this.fetchData()},DEFAULT_INTERVAL)
        this.$nextTick(function(){
          this.$emit('intervalChanged',this.timeInterval)
        })
        this.fetchData()

      }
    },
    //查询买单和卖单
    fetchData(){
      //console.log((new Date()).toTimeString())
      this.load().then(data=>{console.log("")}).catch(err=>{
        console.error(err)
      })
    },
    load(){
      return Promise.all([this.queryOrderBook(), this.queryMyOffers()])
    },
    //撤消委单
    cancelMyOffer(item,index){
      if(this.working ) return
      if(!this.accountData.seed)return
      this.working = true
      this.delindex = index
      cancelOffer(this.accountData.seed,item)
        .then(data=>{
          this.$toasted.show(this.$t('Trade.CancelOfferSuccess'))
          this.queryMyOffers()
          this.working = false
          this.delindex = -1
        })
        .catch(err=>{
          console.log('-----cancel----- error-----')
          console.log(err)
          this.$toasted.show(this.$t('Error.CancelOfferFailed'))
          this.working = false
          this.delindex = -1
        })
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
@require '../stylus/color.styl'
.ordermenu
  display: flex
  font-size: 16px
  padding-top: 10px
  margin-bottom: 3px
  color: $secondarycolor.font
  .offermenu
    display: flex
    padding-left: 20px
    padding-right: 20px
  .offermenu.active
    border-bottom: 2px solid $primarycolor.green
.table-head
  display: flex
  font-size: 18px
  color: $secondarycolor.font
  padding-top: 2px
  padding-bottom: 2px
  .headcol
    flex: 1
    text-align: right
  .headcol:nth-child(1)
    text-align: left
.table-row
  display: flex
  font-size: 18px
  color: $secondarycolor.font
  padding-top: 10px
  /*margin-bottom: 20px*/
  .b-row
    flex: 1
    text-align: right
    padding-right: 1px
  .b-row.price
    text-align: left
  .b-row.depth
    text-align: right
    &>a
      color: $primarycolor.green
    

.working
    display: block
    width: 20px
    height: 20px
    float: right
    background: url(../assets/img/refresh-icon.png) no-repeat center center
    background-size: 16px 16px
    animation: rotate 2s infinite
    animation-timing-function: linear
    margin: auto auto

.buy
  padding: 5px;
  color: $primarycolor.green
.sell
  padding: 5px;
  color: $primarycolor.red
</style>
 
