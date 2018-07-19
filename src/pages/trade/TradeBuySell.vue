/**
 * 买入
 */
<template>
  <div class="page">
   <!-- toolbar -->
    <trade-pair-tool-bar @choseTradePair="afterChoseTradePair" @switchTradePair="afterChoseTradePair"/>

    <loading :show="working" :loading="sending" :success="sendsuccess" :fail='sendfail' 
      :color="isSell?'red':'green'" :title="loadingTitle" :msg="loadingError" :closeable="sendfail" @close="hiddenLoading"/>

      <!--盘面
      <order-book ref="orderbook"  @choose="choose"/>
      -->
      <div class="maintent orderbook-content">
        <order-book-lite ref="orderbook"  @choose="choose"/>
      </div>
      
    <div class="trade-content">

    <!--买卖切换-->
    <div class="flex-row full-width tmenu input-menu">
      <div :class="'flex1 textcenter' + ( isBuy ? ' active':'' )" @click="switchBuy">{{$t('Trade.Buy')}}</div>
      <div :class="'flex1 textcenter' + ( isSell ? ' active':'' )" @click="switchSell">{{$t('Trade.Sell')}}</div>
      <div :class="'flex1 textcenter' + ( showOffer ? ' active':'' )" @click="switchMyOffers">{{$t('Trade.MyOffer')}}</div>
    </div>

    <div class="content input-content" v-if="!showOffer">
      <card class="mytrade" padding="10px 10px">
        <div class="card-content" slot="card-content">
          
          <v-text-field  dark required  clearable hide-details v-bind:style="'width: 100% !important'"
            :prefix="$t('Trade.UnitPrice')" 
            v-model='price'
            type="number"
            @input="inputPrice"
            :suffix="CounterAsset.code"
            :tabindex = '0'
            :color="isBuy ? 'primary':'error'"
          ></v-text-field>
          <!--数量-->
          <v-text-field  dark required hide-details clearable  v-bind:style="'width: 100% !important'"
            :prefix="$t('Amount')"
            v-model="amount"  
            @input="inputAmount"
            type="number" name="amount" 
            :tabindex = '1'
            :suffix="BaseAsset.code"
            :color=" isBuy ? 'primary':'error'"
            ></v-text-field>
          <v-slider hide-details 
            class="buy-amount-slider"
            dark
            max=100 step=10 ticks
            v-model="num"
            @input="inputNum"
            append-icon='keyboard_tab'  v-bind:style="'width: 100% !important'"
            :append-icon-cb = 'toMaxNum'
            :color="isBuy ? 'primary':'error'"
            ></v-slider>
          <!--总额，自动计算-->
          <v-text-field   name="total" dark
            :prefix="$t('Trade.Total')"
            :suffix="CounterBalance.code"
            v-model="total"
            @input="inputTotal"
            type="number" hide-details  v-bind:style="'width: 100% !important'"
            :tabindex = '2'
            :color="isBuy ? 'primary':'error'"
            ></v-text-field>
           
          <!--按钮
          <v-btn class="primary btn-buy" :loading="working" @click.stop="doBuy">{{$t('Trade.Buy')}}{{BaseAsset.code}}</v-btn>
-->
          <!--可用-->
          <div class="flex-row full-width">
            <div class="flex1 available">
              {{$t('Available')}}{{BaseAsset.code}}: {{BaseBalance.balance.toFixed(7)}}
            </div>
              <div class="flex1 available">
              {{$t('Available')}}{{CounterAsset.code}}: {{CounterBalance.balance.toFixed(7)}}
            </div>
          </div>
        </div>
      </card>

    

       <!-- 买卖按钮 -->
      <div class="flex-row full-width footer-btns" v-if="needTrust.length ===0 ">
        <div class="flex1 btn-flex">
          <v-btn :class="'full-width btn-reset ' + ( isBuy ? 'btn-green' : 'btn-red' )"  @click="clean">{{$t('Reset')}}</v-btn>
        </div>
        <div class="flex2 btn-flex">
          <v-btn class="full-width btn-buy" color="primary" 
            :disabled="!(CounterBalance.balance>0 && total> 0 && CounterBalance.balance >= total)" 
            v-if="isBuy" @click="showConfirmSheet = true">{{$t('Trade.Buy')}} {{BaseAsset.code}}</v-btn>
          <v-btn class="full-width btn-sell" color="error" 
            :disabled="!(BaseBalance.balance>0 && amount> 0 && BaseBalance.balance >= amount)" 
            v-if="isSell" @click="showConfirmSheet = true">{{$t('Trade.Sell')}} {{BaseAsset.code}}</v-btn>
        </div>
      </div>

      <!--授信操作，如果当前用户没有当前的资产-->
      <div class="flex-row full-width footer-btns" v-else>
        <div class="flex1 btn-flex">
          <v-btn color="error" class="full-width btn-reset"  @click.stop="doTrust">{{$t('ChangeTrust')}}{{needTrustCodes}}</v-btn>
        </div>
      </div>


    </div>
    <!--显示我的委单-->
    <div class="content input-content" v-else>
      <card class="offer-card" padding="10px 10px">
        <div class="myoffer-table offer-table" slot="card-content">
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

      </card>
    </div>


    </div>

  <!-- <bottom-notice :show.sync="accountNotFundDlg" @update:show="closeAccountNotFoundDlg">
    <div slot>
      <div @click="toHelp">{{$t('Error.AccountNotFund')}}<v-icon color="primary">help</v-icon></div>
      <div @click="toKYC"><span class="underline">{{$t('kyc_active')}}</span></div>
    </div>
  </bottom-notice>  -->

  <un-fund-notice v-if="accountNotFundDlg" @close="closeAccountNotFoundDlg">></un-fund-notice>
  

  <password-sheet
    v-if="needpwd" @cancel="cancelpwd" @ok="rightpwd"
    ></password-sheet>
  

    <!-- 确认内容 -->
    <div class="confirm-wrapper"  v-if="showConfirmSheet">
      <div class="confirm-blank"></div>
      <div  class="confirm-dlg">
      <v-bottom-sheet v-model="showConfirmSheet"  dark>
        <div class="confirm-title" v-if="flag === 'buy'">{{$t('Trade.Confirm')}}{{$t('Trade.Buy')}}</div>
        <div class="confirm-title" v-else>{{$t('Trade.Confirm')}}{{$t('Trade.Sell')}}</div>
        <div class="confirm-content">

          <div class="confirm-row flex-row" v-if="bids_max_price!=null">
            <span class="label flex2">{{$t('bids_max_price')}}</span>
            <span class="value flex2 textright pr-1"> {{bids_max_price}}</span>
            <span class="code flex1">{{CounterAsset.code}}</span>
          </div>
          <div class="confirm-row flex-row" v-if="bids_max_price!=null">
            <span class="label flex2">{{$t('asks_min_price')}}</span>
            <span class="value flex2 textright pr-1"> {{asks_min_price}}</span>
            <span class="code flex1">{{CounterAsset.code}}</span>
          </div>

          <div class="confirm-row flex-row">
            <span class="label flex2">{{$t('Trade.Price')}}</span>
            <span class="value flex2 textright pr-1"> {{Number(Number(price).toFixed(7))}}</span>
            <span class="code flex1">{{CounterAsset.code}}</span>
          </div>
          <div class="confirm-row flex-row">
            <span class="label flex2"  v-if="flag === 'buy'">{{$t('Trade.Buy')}}</span>
            <span class="label flex2"  v-else>{{$t('Trade.Sell')}}</span>
            <span class="value flex2 textright pr-1"> {{amount}}</span>
            <span class="code flex1">{{BaseAsset.code}}</span>
          </div>
          <div class="confirm-row flex-row">
            <span class="label flex2">{{$t('Trade.Total')}}</span>
            <span class="value flex2 textright pr-1"> {{total}}</span>
            <span class="code flex1"> {{CounterAsset.code}}</span>
          </div>
        </div>
        <div class="confirm-btns flex-row textcenter">
          <div class="confirm-btn flex1" @click="doTrade">{{$t('Button.OK')}}</div>
          <div class="confirm-btn flex1" @click="showConfirmSheet = false">{{$t('Button.Cancel')}}</div>
        </div>
      </v-bottom-sheet>
      </div>
    </div>
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import OrderBook from '@/components/OrderBook'
import OrderBookLite from '@/components/OrderBookLite'
import Loading from '@/components/Loading'
import TradePairToolBar from '@/components/TradePairToolBar'
import PasswordSheet from '@/components/PasswordSheet'
import { offer as doOffer } from '@/api/offer'
import { myofferConvert } from '@/api/offer'
import { cancel as cancelOffer }  from '@/api/offer'
import { mapState, mapActions, mapGetters} from 'vuex'
import { getAsset, isNativeAsset } from '@/api/assets'
import { trustAll } from '@/api/operations'
import { getXdrResultCode } from '@/api/xdr'
import { Decimal } from 'decimal.js'
import debounce from 'lodash/debounce'
import loadaccount from '@/mixins/loadaccount'
import BottomNotice from '@/components/BottomNotice'
var moment = require('moment')
import UnFundNotice from '@/components/UnFundNotice'

const FLAG_BUY = 'buy'
const FLAG_SELL = 'sell'
const FLAG_MYOFFER = 'myOffer'
Decimal.rounding = Decimal.ROUND_DOWN

export default {
  mixins:[loadaccount],
  data(){
    return {
      title: 'Menu.TradeCenter',
      showmenuicon: false,
      showbackicon: true,
      working: false,
      sending: false,
      sendsuccess: false,
      sendfail: false,
      txResult: null,

      price: null,//单价
      amount: null,//数量
      num: 0,
      flag: FLAG_BUY,
      justify: false,
      total: 0,
      showConfirmSheet: false,
      loadingTitle: null,
      loadingError: null,
      needpwd: false,
      delindex: -1,

    }
  },
  computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      assetAccounts: state => state.asset.assets,
      selectedTrade: state => state.accounts.selectedTradePair.tradepair,
      selectedTradeIndex: state => state.accounts.selectedTradePair.index,
      assethosts: state => state.asset.assethosts,
      islogin: state => state.accounts.accountData.seed ? true:false,
      bids: state => state.accounts.selectedTradePair.bids,//买单
      asks: state => state.accounts.selectedTradePair.asks,//卖单
      my: state => state.accounts.selectedTradePair.my.records,
      locale: state => state.app.locale,
    }),
    ...mapGetters([
      'balances',
      'native',
      'reserve',
      'base_reserve'
    ]),
    needTrust(){//返回当前需要授信的资产
      let result = []
      let basset = this.BaseAsset
      let casset = this.CounterAsset
      let hasBaseAsset = isNativeAsset(basset) || false
      let hasCounterAsset = isNativeAsset(casset)  || false
      this.balances.forEach(item=>{
        if(item.code === basset.code && item.issuer === basset.issuer){
          hasBaseAsset = true
        }else if(item.code === casset.code && item.issuer === casset.issuer){
          hasCounterAsset = true
        }
      })
      if(!hasBaseAsset){
        result.push(basset)
      }
      if(!hasCounterAsset){
        result.push(casset)
      }
      return result
    },
    needTrustCodes(){
      if(this.needTrust.length > 0){
        let result = '(';
        this.needTrust.forEach(item=> {
          result+=item.code+','
        })
        return result.substring(0, result.length-1)+')'
      }
    },
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
    // choseTradePair({index,tradepair}){//选择交易对
    //   this.$nextTick(()=>{
    //     this.$refs.orderbook.reload()
    //   })
    // },
    isBuy(){
      return this.flag === FLAG_BUY
    },
    isSell(){
      return this.flag === FLAG_SELL
    },
    showOffer(){
      return this.flag === FLAG_MYOFFER
    },

    maxamount(){
      if(this.price!=null&&this.price>0){
        return Number(new Decimal(this.CounterBalance.balance).div(new Decimal(this.price)).toFixed(7))
      }
      return 0
    },

    tradeBalance(){
      if(this.isBuy){
        return this.CounterBalance.balance || 0
      }else if(this.isSell){
        console.log(this.BaseAsset,this.BaseBalance.balance)
        return this.BaseBalance.balance  
      }else{
        return null
      }
    },
    tradeBalanceInt(){
      return new Decimal(this.tradeBalance).floor().toNumber()
//      return this.tradeBalance - this.tradeBalance % (10 ** (String(parseInt(this.tradeBalance * 10**7)).length -1 )  /10**7)
    },
    bids_max_price(){
      if(this.bids && this.bids.length > 0){
        return this.bids[0].price
      }
      return null
    },
    asks_min_price(){
      if(this.asks && this.asks.length > 0){
        return this.asks[0].price
      }
      return null
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

    
  },

  watch: {
  },
  beforeMount () {
    this.flag = this.$route.params.flag
    if(!this.islogin){
      this.needpwd = true
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
      getAccountInfo:'getAccountInfo',
      getAllOffers: 'getAllOffers',

    }),
    back(){
      this.$router.back()
    },
    nativeBalance(){
      let d = _.defaultsDeep({}, this.balances.filter(item=>isNativeAsset(item))[0])
      let t = this.native.balance - this.reserve - this.base_reserve - 0.0001
      if(t < 0 ) t = 0 
      d.balance = Number(t.toFixed(7))
      return d;
    },
    assetBalance(asset){
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

    setNum(){
      if(this.isBuy){
        //this.num = parseInt(this.total / this.tradeBalanceInt * 100)
        let n = new Decimal(this.total||0).times(100).div(this.tradeBalanceInt).round()//.toNumber()
        //this.num = this.num - this.num % 10
        this.num = n.minus(n.modulo(10)).toNumber()
      }else if(this.isSell){
        //this.num = Number((this.amount / this.tradeBalanceInt * 100))
        let n = new Decimal(this.amount||0).times(100).div(this.tradeBalanceInt).round()
        //this.num = this.num > 100 ? 100 : (this.num - this.num % 10)
        this.num = n.comparedTo(100) > 0 ? 100 : n.minus(n.modulo(10)).toNumber()
      }
    }, 
    setAmount(){
      if(this.total === null || this.price === null)return
      
      if(this.isBuy){
        // this.$nextTick(()=>{
          this.amount = Number(new Decimal(this.total||0).div(this.price).toFixed(7))
//          this.amount = Number(Number(this.total /this.price).toFixed(7))
          if(isNaN(this.amount)) this.amount = 0
          console.log(this.amount +'----this.amount')
        // })
        
      }else if(this.isSell){
        let amount = Number(new Decimal(this.total||0).div(this.price).toFixed(7))
        if(isNaN(amount)) amount = 0
        this.amount = amount < this.tradeBalance? amount : this.tradeBalance
      }
    },
    setTotal(){
      if(this.isBuy){
        //let total = Number(Number(this.amount * this.price ).toFixed(7))
        let total = Number(new Decimal(this.amount||0).times(this.price).toFixed(7))
        this.total = total < this.tradeBalance ? total : this.tradeBalance
        console.log('setTotal:   '+this.total)
      }else if(this.isSell){
        console.log(`-------------amount:${this.amount} ---- price: ${this.price}`)
        this.total = Number(new Decimal(this.amount||0).times(this.price).toFixed(7))
      }
    },
    resetJustify:debounce(function(){
      this.$nextTick(()=>{
        console.log('before reset Justify->'+this.justify)
        this.justify = false
        console.log('after reset Justify->'+this.justify)
      })
    },100),
    toMax(){
      if(this.justify) return
      this.justify = true
      if( this.price != null && typeof this.price != 'undefined' && this.price > 0){
        this.num = 100
        console.log(`-----`)
        if(this.isBuy){
          this.total = this.tradeBalance
          this.setAmount()
        }else {
          this.amount = this.tradeBalance
          this.setNum()
          this.setTotal()
        }
      }
      this.resetJustify()
    },
    doTrade(){
      let seed = this.accountData.seed
      if(!seed){
        this.$toasted.error(this.$t('Error.NoPassword'))
        this.needpwd = true;
        return
      }
      if(this.working)return
      this.showConfirmSheet = false
      this.loadingTitle = null
      this.loadingError = null
      this.sendsuccess = false
      this.sendfail = false
      this.working = true
      this.sending = true
      this.txResult = null
      let option = {type:this.flag, // sell or buy
        currency:this.BaseAsset.code,//base   buying:  base ++  counter --
        issuer: this.BaseAsset.issuer, 
        base: this.CounterAsset.code,//counter  selling : base -- counter ++
        base_issuer: this.CounterAsset.issuer, 
        amount:  Number(this.amount), 
        price: Number(this.price)
      }
      doOffer(this.accountData.seed, option)
        .then(data=>{
          this.sending = false
          this.sendsuccess = true
          this.sendfail = false
          
          //this.$toasted.show(this.$t('Trade.OfferSuccess'))
          this.loadingTitle = this.$t('Trade.OfferSuccess')
          
          try{
            this.txResult = data
            this.loadingError = 'tx:'+data.hash
            this.queryMyOffers().then(()=>{}).catch(err=>{console.error(err)});
            //查询账户数据
            this.getAccountInfo(this.account.address).then(()=>{}).catch(err=>{console.error(err)})
            this.$refs.orderbook.reload()
            //隔10秒再查询一次
            setTimeout(()=>{
              this.getAccountInfo(this.account.address).then(()=>{}).catch(err=>{console.error(err)})
            },10000)
          }catch(err){
            console.error(err)
          }
          this.clean()
          this.hideLoading()
        })
        .catch(err=>{
          console.log(err)
          //this.sending = false;
         
          //this.clean();
          //this.hideLoading();
          //this.$toasted.error(this.$t('Error.OfferFailed'));
          this.loadingTitle = this.$t('Error.OfferFailed')
          try{
            let errcode = getXdrResultCode(err);
            if(errcode){
              //this.$toasted.error(this.$t(errcode));
              this.loadingError = this.$t(errorcode)
            }
            if(err.data.details){
              this.loadingError +=  ' ' + this.$t('Detail') + ':'+err.data.details
            }
            if(err.data.extras){
              this.loadingError +=  '(xdr:' + err.data.extras.result_xdr+')'
            }
          }catch(err){
            console.error(err)
          }
          this.sendfail = true;
          this.sendsuccess = false;

        })

    }, 
    
    hideLoading(){
      setTimeout(()=>{
          this.sending = false
          this.working = false
          this.txResult = null
        },5000)
    },
    
    clean(){
      this.num = 0
      this.amount = null
      this.price = null
      this.total = null
    },
    switchBuy(){
      this.flag = FLAG_BUY
      this.clean()
    },
    switchSell(){
      this.flag = FLAG_SELL
      this.clean()
    },
    switchMyOffers(){
      this.flag  = FLAG_MYOFFER
    },
    choose({type,data}){
      console.log(type)
      console.log(data)
      console.log('------choose--')
      if(this.justify) return
      this.justify = true
      let origin = data.origin
      this.price = Number(origin.price)
      if(this.isBuy){
        if(type === 'buy'){
          let tempTotal = Number(data.originDepth || origin.amount)
          this.total = tempTotal <= this.tradeBalance? tempTotal:this.tradeBalance
          this.setNum()
          this.setAmount()
        }else{
          let tempAmount = new Decimal(data.originDepth || origin.amount)
          let tempTotal = tempAmount.times(origin.price_r.n).div(origin.price_r.d)
          if(tempTotal.toNumber() <= this.tradeBalance){
            this.amount = Number(tempAmount.toFixed(7))
            this.setTotal()
            this.setNum()
          }else{
            this.total = this.tradeBalance
            this.setNum()
            this.setAmount()
          }
        }
        // console.log(this.tradeBalance)
        // this.total = Number(data.depth) <= this.tradeBalance? Number(data.depth):this.tradeBalance
        // this.setNum()
        // this.setAmount()
      }else if(this.isSell){
        if(type === 'buy'){
          let tempAmount = new Decimal(data.originDepth || origin.amount)//.times(origin.price_r.d).div(origin.price_r.n)
          if(tempAmount.toNumber() <= this.tradeBalance){
            this.amount = Number(tempAmount.toFixed(7))
            this.setTotal()
            this.setNum()
          }else{
            this.amount = this.tradeBalance
            this.setTotal()
            this.setNum()
          }
        }else{
          let tempAmount = Number(data.originDepth || origin.amount)
          if(tempAmount <= this.tradeBalance){
            this.amount = tempAmount
            this.setTotal()
            this.setNum()
          }else{
            this.amount = this.tradeBalance
            this.setTotal()
            this.setNum()
          }

        }
        // let total_max = Number((this.price * this.tradeBalance).toFixed(7))
        // this.total = Number(data.depth) <= total_max ? Number(data.depth):total_max
        // this.setAmount()
        // this.setNum()
      }
      this.resetJustify()
    },
    afterChoseTradePair(){
      this.price = null
      this.num = 0
      this.amount = 0
      this.total = 0
      this.$nextTick(()=>{
        this.$refs.orderbook.reload()
      })
    },
    hiddenLoading(){
      this.sending = false
      this.sendfail = false
      this.working = false
    },


    // ==== 新的计算功能
    inputPrice(val){ // 价格变化，自动计算新的total
      if(this.justify)return;
      this.justify = true
      let decvalue = new Decimal(val||0)
      if(decvalue.isNaN() || !decvalue.isFinite()){
          this.$nextTick(()=>{
            this.price = 0
            this.total = 0
            this.$nextTick(()=>{
              this.justify = false
            })
          })
      }else{
        this.$nextTick(()=>{
          let str = decvalue.toFixed(7)
          if(!str.endsWith("0")){
            this.price = Number(str)
          }
          // this.price = Number()
          if(this.isBuy){
            let t = decvalue.times(this.amount || 0)
            if(t.lessThan(this.tradeBalance)){
              this.total = Number(t.toFixed(7))
            }else{
              this.total = this.tradeBalance
              this.amount = Number(new Decimal(this.tradeBalance).div(this.price||0).toFixed(7))
            }
          }else{
            this.setTotal()
          }  
          this.$nextTick(()=>{
            this.justify = false
          })
        })
         
      }
      // this.total = Number(new Decimal(this.price).times(this.amount || 0).toFixed(7))
     
    },
    inputAmount(val){//数量变化，则num和total变化
      if(this.justify)return
      this.justify = true
       let decvalue = new Decimal(val||0)
       //非数字等类型，则还原数字
      if(decvalue.isNaN() || !decvalue.isFinite()){
        this.$nextTick(()=>{
          this.amount = this.amount
          this.$nextTick(()=>{
            this.justify = false
          });
        })
        return 
      }
      if(this.isBuy){
        // if(this.price ===null || this.price === 0)return
        let t = decvalue.times(this.price||0)
        if(t.lessThan(this.tradeBalance)){
          this.$nextTick(()=>{
            let str = decvalue.toFixed(7)
            if(str.endsWith("0")){
              //TODO 不处理
            }else{
              if(str>=0.000001){
                this.amount = Number(str)
              }else{
                this.amount = str
              }
            }
            this.setNum()
            this.setTotal()
            this.$nextTick(()=>{
              this.justify = false
            })
          })
        }else{//计算出的总值大于最大值 
          this.$nextTick(()=>{
            this.total = this.tradeBalance
            if(this.price === null || this.price === 0){
              this.amount = this.amount
              return
            }
            let str = new Decimal(this.tradeBalance).div(this.price).toFixed(7)
            if(str>=0.000001){
              this.amount = Number(str)
            }else{
              this.amount = str
            }
            this.setNum()
            this.$nextTick(()=>{
              this.justify = false
            })
          })
        }
      }else{// 卖的操作
        this.$nextTick(()=>{
          if(decvalue.lessThan(this.tradeBalance)){
            // this.amount = Number(decvalue.toFixed(7))
            //TODO 不处理
          }else{
            this.amount = this.tradeBalance
          }
          this.setNum()
          this.setTotal()
          this.$nextTick(()=>{
            this.justify = false
          })
        })
      }
      console.log(this.amount)
    },
    inputNum(val){//修改amount和total
      if(this.justify)return;
      this.justify = true
      if(this.tradeBalance <= 0){
        this.$nextTick(()=>{
          this.num = 0
          this.$nextTick(()=>{
            this.justify = false
          })
        })
        return;
      }
      this.num = Number(val)
      //卖则表示把所有的资产都=amount,买则表示把total=最大值
      if(this.isBuy){
        this.$nextTick(()=>{
          let str = new Decimal(this.num).times(this.tradeBalance).div(100).toFixed(7)
          if(str>=0.000001){
            this.total = Number(str)
          }else{
            this.total = str
          }
          //计算amount
          if(this.price === null || this.price <= 0){
            this.amount = null
          }else{
            let str2 = new Decimal(this.total).div(this.price||0).toFixed(7)
            if(str2 > 0.000001){
              this.amount = Number(str2)
            }else{
              this.amount = str2
            }
          }
          this.$nextTick(()=>{
            this.justify = false
          })
        })
      }else{
        this.$nextTick(()=>{
          let str = new Decimal(this.num).times(this.tradeBalance).div(100).toFixed(7)
          if(str >= 0.000001){
            this.amount = Number(str)
          }else{
            this.amount = str
          }
          //计算total
          this.setTotal()
          this.$nextTick(() => {
            this.justify = false
          })
        });
      }
    },
    toMaxNum(){
      this.inputNum(100)
    },
    inputTotal(val){
      if(this.justify)return;
      this.justify = true
      console.log('input total ---val: ' + val)
      if(this.tradeBalance<=0){
        this.$nextTick(()=>{
          this.total = 0;
          this.$nextTick(()=>{
            this.justify = false
          })
        })
        return;
      }
      let decvalue = new Decimal(val || 0)
      if(decvalue.isNaN() || !decvalue.isFinite()){
        this.$nextTick(()=>{
          this.justify = false
        })
        return 
      }
      if(this.isBuy){
        this.$nextTick(()=>{
          if(decvalue.toNumber() > this.tradeBalance){
            this.total = this.tradeBalance
          }
          if(this.price === null || this.price === 0){
            this.$nextTick(()=>{this.justify = false})
            return
          }
          let str = new Decimal(this.total).div(this.price||1).toFixed(7)
          if(str >= 0.000001){
            this.amount = Number(str)
          }else{
            this.amount = str
          }
          this.$nextTick(()=>{this.justify = false})
        })
      }else{// 卖操作
        if(this.price === null || this.price === 0){
          this.$nextTick(()=>{this.justify = false})
          return;
        }
        this.$nextTick(()=>{
          let am = decvalue.div(this.price)
          if(am.lessThan(this.tradeBalance)){
            this.amount = Number(am.toFixed(7))
            //this.total = Number(decvalue.toFixed(7))
          }else{
            this.amount = this.tradeBalance
            this.setTotal()
          }
          this.$nextTick(()=>{this.justify = false})
        });
      }
    },
    
    doTrust(){
      if(!this.islogin){
        this.needpwd = true;
        return;
      }
      //   <loading :show="working" :loading="sending" :success="sendsuccess" :fail='sendfail' 
      // :color="isSell?'red':'green'" :title="loadingTitle" :msg="loadingError" :closeable="sendfail" @close="hiddenLoading"/>
      if(this.working)return
      // this.isSell = true
      this.working = true
      this.sending = true
      try{
        trustAll(this.accountData.seed, this.needTrust)
          .then(response=>{
            this.sending = false
            this.sendsuccess = true
            this.loadingTitle = this.$t('AddAssetSuccess')
            try{
              this.getAccountInfo(this.account.address).then(response=>{}).catch(err=>{})
            }catch(err){
              console.error(err)
            }
            setTimout(()=>{
              this.working = false
              this.sendsuccess = false
              this.loadingTitle = null
            },3000)
          })
          .catch(err=>{
            this.sending = false
            this.sendfail = true
            let msg = getXdrResultCode(err)
            this.loadingTitle = this.$t('AddAssetFail')
            if(msg){
            this.loadingError = this.$t(msg)
            }     
          })//end of trustAll
      }catch(error){
        this.sending = false
        this.sendfail = true
        let msg = getXdrResultCode(err)
        this.loadingTitle = this.$t('AddAssetFail')
        if(msg){
        this.loadingError = this.$t(msg)
        }     
      }
    },
    
    toHelp(){
      // let t = new Date().getTime()
      let site = 'https://wallet.fchain.io/manual/#1'
      let title = this.$t('Menu.Help')
      this.$router.push({name: 'Help', params: { title, site }})
    },
    toKYC(){
      // let site = 'https://fchain.io/kyc/accounts/login/?next=/portal/'+'?'+Math.random()
      // let title = this.$t('kyc')
      this.$router.push({name: 'KYC'})
    },
    cancelpwd(){
      this.needpwd = false
    },
    rightpwd(){
      this.needpwd = false
    },
    //撤消委单
    cancelMyOffer(item,index){
      if(!this.islogin){
        this.needpwd = true;
        return;
      }
      if(this.working ) return
      if(!this.accountData.seed)return
      this.loadingTitle = null
      this.working = true
      this.sending = true
      this.delindex = index
      cancelOffer(this.accountData.seed,item)
        .then(data=>{
          //this.$toasted.show(this.$t('Trade.CancelOfferSuccess'))
          this.loadingTitle = this.$t('Trade.CancelOfferSuccess')
          this.sendsuccess = true
          setTimeout(()=>{
            this.sendsuccess = false
            this.working = false
            this.loadingTitle = null
            this.loadingError = null
          },1000)
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
          // this.$toasted.show(this.$t('Error.CancelOfferFailed'))
          this.loadingTitle = this.$t('Error.CancelOfferFailed')
          let errcode = getXdrResultCode(err);
          if(errcode){
            //this.$toasted.error(this.$t(errcode));
            // this.$toasted.show( this.$t(errorcode))
            this.loadingError = this.$t(errorcode)
          }
          this.sendfail = true
          setTimeout(()=>{
            this.sendfail = false
            this.loadingTitle = null
            this.loadingError = null
            this.working = false
          },3000)

          this.delindex = -1
        })
    },
    load(){
      let queryOffersFn = new Promise((resolve,reject)=>{
        this.queryAllOffers()
        resolve()
      })
      return Promise.all([this.queryOrderBook(), this.queryMyOffers(), queryOffersFn])
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
    },


  },
  components: {
    Toolbar,
    Card,
    OrderBook,
    Loading,
    TradePairToolBar,
    OrderBookLite,
    PasswordSheet,
    BottomNotice,
    UnFundNotice
  }
}
</script>


<style lang="stylus" scoped>
@require '~@/stylus/trade.styl'
.tmenu
  padding-left: 10px
  padding-right: 10px
  padding-top: 20px
  .active
    border-bottom: 1px solid $primarycolor.green
    color: $primarycolor.green

//购买按钮
.btn-buy
.btn-sell
.btn-reset
  margin: 0px 0px
  padding: 0px 0px
  height: 36px
  line-height: 36px
  width: 100%
  font-size: 16px
.btn-reset
  &.btn-red
    color: $primarycolor.red
  &.btn-green
    color: $primarycolor.green
//可用余额
.available
  padding-left: 2px
  margin-top: 5px
  color: $secondarycolor.font
  font-size: 14px
.buy-amount-slider
  padding-top: 0px
  padding-bottom: 0px
.confirm-wrapper
  position: fixed
  bottom: 0
  padding-bottom: 0
  padding-bottom: constant(safe-area-inset-bottom)
  padding-bottom: env(safe-area-inset-bottom)
  right: 0
  left: 0
  top: 0
  // top: constant(safe-area-inset-top)
  // top: env(safe-area-inset-bottom)
  z-index: 9
.confirm-blank
  background: $primarycolor.gray
  opacity: .8
  position: fixed
  bottom: 300px
  bottom: calc(300px + constant(safe-area-inset-bottom))
  bottom: calc(300px + env(safe-area-inset-bottom))
  right: 0
  left: 0
  top: 0
  // top: constant(safe-area-inset-top)
  // top: env(safe-area-inset-top)
  z-index: 9
.confirm-dlg
  background: $secondarycolor.gray
  height: 300px
  height: calc(300px + constant(safe-area-inset-bottom))
  height: calc(300px + env(safe-area-inset-bottom))
  position: fixed
  bottom: 0
  padding-bottom: 0
  padding-bottom: constant(safe-area-inset-bottom)
  padding-bottom: env(safe-area-inset-bottom)
  right: 0
  left: 0
  opacity: 1
.confirm-title
  height: 46px
  line-height: 46px
  font-size: 18px
  color: $primarycolor.green
  text-align: center
.confirm-content
  padding-top: 8px
  padding-bottom: 8px
  font-size: 16px
  .confirm-row
    padding: 8px 8px
    .label
      color: $secondarycolor.font
    .value
      padding-left: 12px
      color: $primarycolor.green
.confirm-btns
  color: $primarycolor.green
  text-align: center
  font-size: 16px
  height: 42px
  line-height: 42px

// .input-content
//   position: absolute!important
//   bottom: 0
//   left:0
//   right:0
//   background: $primarycolor.gray
//   padding-bottom: 40px

// .input-menu
//   position: absolute!important
//   bottom: 298px
//   left:0
//   right:0
//   background: $primarycolor.gray

.trade-content
  position: absolute
  bottom: 0
  bottom: constant(safe-area-inset-bottom)
  bottom: env(safe-area-inset-bottom)
  left: 0
  right: 0
  background: $primarycolor.gray
  .input-content
    padding-top: 0px

.orderbook-content
  overflow-y: auto
  height: calc(100vh - 340px)
.table-head
  display: flex
  font-size: 14px
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
  font-size: 13px
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
    
.offer-card
  height: 100%
  width: 100%
  overflow-y: auto
</style>

