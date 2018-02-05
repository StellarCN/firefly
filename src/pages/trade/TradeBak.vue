/**
 * 交易界面
 */
<template>
  <div class="page">
    <toolbar :title="$t(title)" :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
      :shadow="false"
    />
    <swiper :options="swiperOptionTop" class="gallery-top tradepairs-wrapper" ref="swiperTop">
      <swiper-slide 
        v-for="(item,index) in this.tradepairs"
        v-bind:item="item"
        v-bind:index="index"
        v-bind:key="index"
      >
        <div class="pair-wrapper">
          <div class="pair-from">
            <div class="pair-from-code">{{item.from.code}}</div>
            <div class="pair-from-issuer" v-if="assethosts[item.from.code]">{{assethosts[item.from.code]}}</div>
            <div class="pair-from-issuer" v-else-if="assethosts[item.from.issuer]">{{assethosts[item.from.issuer]}}</div>
            <div class="pair-from-issuer" v-else>{{item.from.issuer | miniaddress}}</div>
          </div>
          <div class="pair-icon">
            <v-icon color="white">&#xE8D4;</v-icon>
          </div>
          <div class="pair-to">
            <div class="pair-to-code">{{item.to.code}}</div>
            <div class="pair-to-issuer" v-if="assethosts[item.to.code]">{{assethosts[item.to.code]}}</div>
            <div class="pair-to-issuer" v-else-if="assethosts[item.to.issuer]">{{assethosts[item.to.issuer]}}</div>
            <div class="pair-to-issuer" v-else>{{item.to.issuer | miniaddress}}</div>
            </div>
        </div>
      </swiper-slide>
    </swiper>
    <swiper :options="swiperOptionContent" class="gallery-content" ref="swiperContent">
      <swiper-slide 
        v-for="(item,index) in this.tradepairs"
        v-bind:item="item"
        v-bind:index="index"
        v-bind:key="index"
      >
        <div class="content">
          <card class="mytrade" padding="10px">
            <div class="card-content" slot="card-content">
              <div class="pair-show">
                <div class="pair-from">
                  <div class="code">{{item.from.code}}</div>
                  <div class="issuer" v-if="assethosts[item.from.code]">{{assethosts[item.from.code]}}</div>
                  <div class="issuer" v-else-if="assethosts[item.from.issuer]">{{assethosts[item.from.issuer]}}</div>
                  <div class="issuer" v-else>{{item.from.issuer | miniaddress}}</div>
                </div>
                <div class="pair-icon" @click.stop="switchPair">
                  <i class="icons material-icons">&#xE8D4;</i>
                </div>
                <div class="pair-to">
                  <div class="code">{{item.to.code}}</div>
                  <div class="issuer" v-if="assethosts[item.to.code]">{{assethosts[item.to.code]}}</div>
                  <div class="issuer" v-else-if="assethosts[item.to.issuer]">{{assethosts[item.to.issuer]}}</div>
                  <div class="issuer" v-else>{{item.to.issuer | miniaddress}}</div>
                </div>
              </div>
              <!--上次的成交价格-->
              <div class="price" v-show="LatestPrice">
                <span class="num">{{LatestPrice}}</span>
                <span class="code">{{CounterAsset.code}}</span>
              </div>
              <!--买卖按钮组-->
              <div v-if="!tradeSwitch" class="btn-group">
                <v-btn class="primary btn-buy" @click.stop="switchToBuy">{{$t('Trade.Buy')}}</v-btn>
                <v-btn class="error btn-sell" @click.stop="switchToSell">{{$t('Trade.Sell')}}</v-btn>
              </div>
              <v-slide-y-transition>
              <v-flex xs12 v-if='tradeSwitch && (selectedTradeIndex === index)' class="tradebox swiper-no-swiping">
                <v-card dark  color=''v-bind:style="'width: 100% !important'">
                  <v-card-text flex>
                    <v-text-field  dark required  clearable hide-details v-bind:style="'width: 90% !important'"
                      :prefix="$t('Trade.UnitPrice')" 
                      v-model='price'
                      type="number"
                      :tabindex = '0'
                      :color="tradeType ==='buy'? 'primary':'error'"
                    ></v-text-field>
                    <!--数量-->
                    <v-text-field  dark required hide-details clearable  v-bind:style="'width: 90% !important'"
                      :prefix="$t('Amount')"
                      v-model="amount"  
                      type="number" name="amount" 
                      :tabindex = '1'
                      :color="tradeType ==='buy'? 'primary':'error'"
                      ></v-text-field>
                    <v-slider v-model="num"  hide-details 
                      class="buy-amount-slider"
                      dark
                      max=100 step=10 ticks
                      append-icon='keyboard_tab'  v-bind:style="'width: 90% !important'"
                      :append-icon-cb = 'toMax'
                      :color="tradeType ==='buy'? 'primary':'error'"
                      ></v-slider>
                    <!--总额，自动计算-->
                    <v-text-field v-model="total"   name="total" dark
                      :prefix="$t('Trade.Total')"
                      :suffix="CounterBalance.code"
                      :value="total"
                      type="number" hide-details  v-bind:style="'width: 90% !important'"
                      :tabindex = '2'
                      :color="tradeType ==='buy'? 'primary':'error'"
                      ></v-text-field>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn icon @click.native="tradeSwitch = !tradeSwitch;clearTradeCard()">
                      <v-icon>{{ !tradeSwitch ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}</v-icon>
                    </v-btn>
                    <v-spacer></v-spacer>
                    <!-- <v-btn flat>Share</v-btn> -->
                    <v-btn flat color="error" v-if="tradeType === 'sell'"@click.stop="doTrade">
                      {{$t("Trade.Sell")}}
                    </v-btn>
                    <v-btn flat color="primary" v-else @click.stop="doTrade">{{$t("Trade.Buy")}}</v-btn>
                  
                  </v-card-actions>
                  </v-card>
              </v-flex>
              </v-slide-y-transition>

              <!--可用余额-->
              <div  class="available">
                <div class="from">{{$t('Available')}}:{{CounterBalance.balance|| 0 }}&nbsp;{{CounterAsset.code}}</div>
                <v-spacer/>
                <div class="to">{{$t('Available')}}:{{BaseBalance.balance||0}}&nbsp;{{BaseAsset.code}}</div>
              </div>
            
            </div>
          </card>
          <order-book :blank="selectedTradeIndex != index" :ref="'orderbook'+index" 
                      :pairIndex="index" 
                      @intervalChanged="intervalChanged"
                      :activeTab="activeTab"
                      @choose="choose"
                      />
        </div>
      </swiper-slide>
    </swiper>
    <bottom-notice :show.sync="notice" :text="noticeText">    </bottom-notice>
    <loading :show="working" :loading="submitting" :success="submitSuccess" :fail='submitFail' :color="tradeType==='sell'?'red':'green'"/>
  </div>
</template>

<script>
"use strict";
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import BottomNotice from '@/components/BottomNotice'
import Loading from '@/components/Loading'
import { mapState, mapActions, mapGetters} from 'vuex'
import { listenOrderbook } from '@/api/orderbook'
import { getTrades } from '@/api/trade'
import { cancel as cancelOffer }  from '@/api/offer'
import { getAsset } from '@/api/assets'
import { myofferConvert } from '@/api/offer'
import { offer as doOffer } from '@/api/offer'
import OrderBook from '@/components/OrderBook'
import { DEFAULT_INTERVAL } from '@/api/gateways'
import { getXdrResultCode } from '@/api/xdr'
export default {
  data(){
    return {
      title: 'Menu.TradeCenter',
      showmenuicon: false,
      showbackicon: true,

      
      tradeSwitch: false,
      justify: false,
      price: 0,
      amount: 0,
      num: null,
      tradeType: null,
      total: 0,
      activeTab: 'buy',

      working: false,
      submitting: false,
      submitSuccess: false,
      submitFail: false,

      orderBookInterval: null,
      orderBookInterval_d : null,
      tradeInterval: null,//查询最新一次交易数据的interval
      latestTrade: null ,//最新的一次交易数据     
      
      noticeText: '',  
      notice: false,

      swiperOptionContent: {
          notNextTick: true,
          spaceBetween: 10
      },
      swiperOptionTop: {
          notNextTick: true,
          spaceBetween: 10,
          centeredSlides: true,
          slidesPerView: 'auto',
          touchRatio: 0.2,
          slideToClickedSlide: true
      }
    }
  },
  beforeDestroy () {
    console.log('Trade will destroy...................')
    console.log(this.orderBookInterval)
    this.deleteTradeInterval()
    this.deleteOrderBookInterval()
  },
  watch: {
    price(newvalue,oldvalue){
      if(this.justify) return
      this.justify = true
      if(isNaN(parseFloat(newvalue))){
          this.price = 0
      }else{
          this.price = parseFloat(newvalue)
      }
      console.log('price watch:',this.price, this.amount ,this.total, this.num)
      if(this.tradeType === 'buy'){
        if(this.price === 0){
          this.total = this.num = 0
        }
        if(this.amount){
          this.setTotal()
          this.setNum()
          this.setAmount()
        }else{

        }
      console.log('price watch:',this.price, this.amount ,this.total, this.num)
      }
      if(this.tradeType ==='sell'){
        if(this.amount){
          this.setTotal()
        }
      }
      this.resetJustify()
    },
    num(newvalue,oldvalue){
      if(this.justify) return
      this.justify = true
      if(isNaN(parseFloat(newvalue))){
        this.num = 0
      }
      if(newvalue > 100){
        this.num = 100
        this.resetJustify()
        return
      }
      console.log("num watch:" + this.price, this.amount,this.total)
      if (this.tradeType==='buy'){
        this.total = Number(Number(this.tradeBalanceInt * this.num / 100).toFixed(7))
        console.log(this.num, this.total)
        this.setAmount()
      }
      if (this.tradeType === 'sell'){
        if(newvalue === Number ((this.amount / this.tradeBalance * 100).toFixed(0))){
          this.resetJustify()
          return
        }
        this.amount = Number(Number(this.tradeBalanceInt * this.num / 100).toFixed(7))
        this.setTotal()
      }
      console.log("num watch:" + this.price, this.amount,this.total)
      this.resetJustify()
    },
    amount(newvalue,oldvalue){
      if(this.justify) return
      this.justify = true
      if(isNaN(parseFloat(newvalue))){
        this.amount = 0
      }
      console.log("amount watch: "+ this.price, this.amount,this.total)
      if(this.tradeType === 'buy'){
        let t = Number(Number(this.total / this.price).toFixed(7))
        if( newvalue === t || isNaN(t)){
          this.resetJustify()
          return
        }
        this.setTotal()
        this.setNum()
        this.setAmount()
      }
      if(this.tradeType === 'sell'){
        if(newvalue > this.tradeBalance){
          this.$nextTick(function(){this.amount = this.tradeBalance})
          this.resetJustify()
          return
        }
        this.setTotal()
        this.setNum()
      }
      this.resetJustify()
      console.log("amount watch: "+ this.price, this.amount,this.total,this.num)
    },
    total(newvalue,oldvalue){
      if(this.justify) return
      this.justify = true
      if(isNaN(parseFloat(newvalue))){
        this.total = 0
      }
      console.log("total watch: " + this.price, this.amount,this.total)
      if(this.tradeType === 'buy'){
        //this.setTotal()
        this.setNum()
        this.setAmount()
      }
      if(this.tradeType === 'sell'){
        let t = Number((this.price * this.tradeBalance).toFixed(7))
        if( newvalue > t ){
          this.$nextTick(function(){this.total=t})
          console.log('----------------------------------------> balance')
          this.resetJustify()
          return
        } 
        this.setAmount()
        this.setNum() 
        // this.amount = Number(Number(this.total / this.price).toFixed(7))
        // this.num = Number((this.amount / this.tradeBalance * 100).toFixed(0))
        console.log("total watch: " + this.price, this.amount,this.total)
      }
      this.resetJustify()
      console.log("total watch: " + this.price, this.amount,this.total)
    },
    onpause(val){
      if(val){
        this.deleteTradeInterval()
        this.deleteOrderBookInterval()
      }else{
        this.setupTradeInterval()
      }
    },

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
      onpause: state => state.onpause,

    }),
    ...mapGetters([
      'balances',
      'native',
      'reserve',
      'base_reserve'
    ]),
    swiperTop() {
      return this.$refs.swiperTop.swiper
    },
    swiperContent(){
      return this.$refs.swiperContent.swiper
    },
    BaseAsset(){
      return this.selectedTrade.from
    },
    BaseBalance(){
      for (let b of this.balances){
        if(b.code === this.BaseAsset.code){
          if(this.BaseAsset.issuer === b.issuer){
            return JSON.parse(JSON.stringify(b))
          }
          if(!this.BaseAsset.issuer){
            let c = JSON.parse(JSON.stringify(b))
            let t = this.native.balance - this.reserve - this.base_reserve - 0.0001
            if(t < 0 ) t = 0 
            c.balance = Number(t.toFixed(7))
            t = null
            return c
          }
        }
      }
      return []
    },
    CounterAsset(){
      return this.selectedTrade.to
    },
    CounterBalance(){
      for (let b of this.balances){
        if(b.code === this.CounterAsset.code){
          if(this.CounterAsset.issuer === b.issuer){
            console.log()
            return JSON.parse(JSON.stringify(b))
          }
          if(!this.CounterAsset.issuer){
            let c = JSON.parse(JSON.stringify(b))
            let t = this.native.balance - this.reserve - this.base_reserve - 0.0001
            if(t < 0 ) t = 0 
            c.balance = Number(t.toFixed(7))
            t = null
            return c
          }
        }
      }
      return []
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
  mounted(){
    // this.setupTradeInterval() 
    this.swiperTop.params.control = this.swiperContent
    this.swiperContent.params.control = this.swiperTop
    this.swiperTop.on('SlideChangeEnd', this.swipeTradepair)
    this.swiperTop.slideTo(this.selectedTradeIndex,0,true) 
  },
  methods: {
    ...mapActions({
      getAssetsAccount:'assetsAccount',
      deleteTradePair: 'deleteTradePair',
      addTradePair: 'addTradePair',
      switchTradePair: 'switchTradePair',
      selectTradePair: 'selectTradePair',
      queryOrderBook: 'queryOrderBook',
      getAccountInfo: 'getAccountInfo',
      switchSelectedTradePair: 'switchSelectedTradePair',
      queryMyOffers: 'queryMyOffers',
      orderBookStreamHandler: 'orderBookStreamHandler'
    }),
    setNum(){
      if(this.tradeType === 'buy'){
        this.num = parseInt(this.total / this.tradeBalanceInt * 100)
        this.num = this.num - this.num % 10
      }
      if(this.tradeType === 'sell'){
        this.num = Number((this.amount / this.tradeBalanceInt * 100))
        this.num = this.num > 100 ? 100 : (this.num - this.num % 10)
      }
    }, 
    setAmount(){
      if(this.tradeType === 'buy'){
        this.$nextTick(function(){this.amount = Number(Number(this.total /this.price).toFixed(7))})
        // this.amount = Number(Number(this.total /this.price).toFixed(7))
        if(isNaN(this.amount)) this.amount = 0
        console.log(this.amount +'----this.amount')
      }
      if(this.tradeType ==='sell'){
        let amount = Number(Number(this.total / this.price).toFixed(7))
        if(isNaN(amount)) amount = 0
        this.amount = amount < this.tradeBalance? amount : this.tradeBalance
      }
    },
    setTotal(){
      if(this.tradeType === 'buy'){
        let total = Number(Number(this.amount * this.price ).toFixed(7))
        this.total = total < this.tradeBalance ? total : this.tradeBalance
        console.log('setTotal:   '+this.total)
      }
      if(this.tradeType === 'sell'){
        this.total = Number(Number(this.amount * this.price ).toFixed(7))
      }
    },
    resetJustify(){
      this.$nextTick(function(){
        console.log('before reset Justify->'+this.justify)
        this.justify = false
        console.log('after reset Justify->'+this.justify)
      })
    },
    choose({type,data}){
      if(this.justify) return
      this.justify = true
      console.log('-------choose---------')
      let origin = data.origin
      this.price = Number(origin.price)
      if(this.tradeType === 'buy'){
        console.log(this.tradeBalance)
        this.total = Number(data.depth) <= this.tradeBalance? Number(data.depth):this.tradeBalance
        this.setNum()
        this.setAmount()
      }else if(this.tradeType==='sell'){
        let total_max = Number((this.price * this.tradeBalance).toFixed(7))
        this.total = Number(data.depth) <= total_max ? Number(data.depth):total_max
        this.setAmount()
        this.setNum()
      }
      this.resetJustify()
    },
    switchToBuy(){
      if(this.CounterBalance.balance === 0 ){
        this.noticeText = this.$t('Error.LackOfBalance')
        this.notice = true
        return
      }
      if(!this.CounterBalance.balance){
        this.noticeText = this.$t('Error.CounterLackOfTrustline')
        this.notice = true
        return
      }
      if(isNaN(this.BaseBalance.balance)){
        this.noticeText = this.$t('Error.LackOfTrustline')
        this.notice = true
        return
      }

      this.tradeSwitch = !this.tradeSwitch
      this.tradeType = 'buy'
      this.activeTab = 'sell'
      console.log(this.tradeSwitch)
    },
    switchToSell(){
      if(this.BaseBalance.balance === 0 ){
        this.noticeText = this.$t('Error.LackOfBalance')
        this.notice = true
        return
      }
      if(!this.BaseBalance.balance){
        this.noticeText = this.$t('Error.LackOfTrustline')
        this.notice = true
        return
      }
       if(isNaN(this.CounterBalance.balance)){
        this.noticeText = this.$t('Error.CounterLackOfTrustline')
        this.notice = true
        return
      }
      console.log('Selllllllllllllllllllllllllll')
      this.tradeSwitch = !this.tradeSwitch
      this.tradeType = 'sell'
      this.activeTab = 'buy'
      console.log(this.tradeSwitch)
      console.log(this.tradeType)

    },
    toMax(){
      if(this.justify) return
      this.justify = true
      this.num = 100
      if(this.tradeType === 'buy'){
        this.total = this.tradeBalance
        this.setAmount()
      }
      if(this.tradeType === 'sell'){
        this.amount = this.tradeBalance
        this.setNum()
        this.setTotal()
      }
      this.resetJustify()
    },
    clearTradeCard(){
      this.justify = true
      this.total = this.price = this.amount = this.num = 0
      this.resetJustify()
    },
    doTrade(){
      let seed = this.accountData.seed
      if(!seed){
        this.$toasted.error(this.$t('Error.NoPassword'))
        return
      }

      if(this.working)return
      this.working = true
      this.submitting = true
      let option = {type:this.tradeType, // sell or buy
        currency:this.BaseAsset.code,    //base   buying:  base ++  counter --
        issuer: this.BaseAsset.issuer, 
        base: this.CounterAsset.code,     //counter  selling : base -- counter ++
        base_issuer: this.CounterAsset.issuer, 
        amount:  Number(this.amount), 
        price: Number(this.price)
      }
      console.log(this.tradeType + '--- option: $s',option)
      doOffer(this.accountData.seed, option)
        .then(data=>{
          this.sumbitting = false
          this.submitSuccess = true
          this.clean()
          this.hideLoading()
          this.$toasted.show(this.$t('Trade.OfferSuccess'))
          this.queryMyOffers()
        })
        .catch(err=>{
          console.log(err)
          this.submitting = false;
          this.submitFail = true;
          this.clean();
          this.hideLoading();
          this.$toasted.error(this.$t('Error.OfferFailed'));
          let errcode = getXdrResultCode(err);
          if(errcode){
            this.$toasted.error(this.$t(errcode));
          }
        })

    }, 
    clean(){
      if(this.justify) return
      this.justify = true
      this.num = this.amount = this.total = 0
      this.resetJustify()
    },
    hideLoading(){
      this.working = false
      setTimeout(()=>{
        this.submitting = false
        this.submitSuccess =false
        this.submitFail = false
      },500)
    },
    setupTradeInterval(){
      if (!this.tradeInterval){
        this.tradeInterval = setInterval(()=>{
          this.fetchLatestTrade()
          console.log(this.account.address)
          this.getAccountInfo(this.account.address)
        },DEFAULT_INTERVAL)
      }
      this.fetchLatestTrade()
    },
    intervalChanged(interval){
      console.log(this.orderBookInterval, interval)
      this.orderBookInterval = interval
      console.log(this.orderBookInterval, interval)
    },
    deleteTradeInterval(){
      if(this.tradeInterval!= null && typeof this.tradeInterval != 'undefined'){
        clearInterval(this.tradeInterval)
        this.latestTrade = null
      }
    },
    deleteOrderBookInterval(){
      if(this.orderBookInterval !== null && typeof this.orderBookInterval !== 'undefined'){
        clearInterval(this.orderBookInterval)
        this.orderBookInterval = null
      }
    },
    back(){
      this.$destroy()
      this.$router.back()
    },
    swipeTradepair() {
      this.changeTradePair(this.swiperTop.activeIndex,this.tradepairs[this.swiperTop.activeIndex])
      this.clearTradeCard()
    },
    switchPair(){
      let index = this.selectedTradeIndex
      let tradepair = {from: this.selectedTrade.to, to: this.selectedTrade.from}
      this.switchTradePair({index,tradepair})
        .then(data=>{
          this.changeTradePair(index,tradepair)
        })
        .then(data=>{
          console.log(`---reload ok ---`)
        })
        .catch(err=>{
          console.error(err)
        })
    },
    changeTradePair(index,tradepair){
      this.selectTradePair({index,tradepair})
      this.deleteTradeInterval()
      this.setupTradeInterval()
    },
    //查询最新一次成交记录
    fetchLatestTrade(){
      let from = this.selectedTrade.from
      let to = this.selectedTrade.to
      let Counter = getAsset(to.code,to.issuer)
      let Base = getAsset(from.code,from.issuer)
      getTrades(Base,Counter,"desc",20)
        .then(data=>{
          if(data.records && data.records.length > 0){
            this.latestTrade = data.records
          }
        })
        .catch(err=>{
          console.log(err)
        })
    },
    load(){
      return Promise.all([this.queryOrderBook(), this.queryMyOffers()])
    },
    toBuy(){
      if(this.CounterBalance.balance === 0 ){
        this.noticeText = this.$t('Error.LackOfBalance')
        this.notice = true
        return
      }
      if(!this.CounterBalance.balance){
        this.noticeText = this.$t('Error.LackOfTrustline')
        this.notice = true
        return
      }
      this.$router.push({name:"TradeBuy"})
    },
    toSell(){
      if(this.BaseBalance.balance === 0 ){
        this.noticeText = this.$t('Error.LackOfBalance')
        this.notice = true
        return
      }
      if(!this.BaseBalance.balance){
        this.noticeText = this.$t('Error.LackOfTrustline')
        this.notice = true
        return
      }
      this.$router.push({name:"TradeSell"})
    },
    
  },
  // filters: {
  //   formatNumber: {
  //     write: function(newValue,oldValue){
  //        value = parseFloat(newvalue)
  //        if(isNaN(value)) return 0
  //        if (value <=0) return 0
  //        return value
  //     }
  //   }
  // },
  components: {
    Toolbar,
    BottomNotice,
    Loading,
    Card,
    OrderBook
  }
}
</script>


<style lang="stylus" scoped>
@require '~@/stylus/trade.styl'

</style>
