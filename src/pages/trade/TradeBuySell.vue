/**
 * 买入
 */
<template>
  <div class="page">
   <!-- toolbar -->
    <trade-pair-tool-bar @choseTradePair="afterChoseTradePair" @switchTradePair="afterChoseTradePair"/>

    <loading :show="working" :loading="sending" :success="sendsuccess" :fail='sendfail' 
      :color="isSell?'red':'green'" :title="loadingTitle" :msg="loadingError" :closeable="sendfail" @close="hiddenLoading"/>

    <!--买卖切换-->
    <div class="flex-row full-width tmenu">
      <div :class="'flex1 textcenter' + ( isBuy ? ' active':'' )" @click="switchBuy">{{$t('Trade.Buy')}}</div>
      <div :class="'flex1 textcenter' + ( isSell ? ' active':'' )" @click="switchSell">{{$t('Trade.Sell')}}</div>
    </div>

    <div class="content">
      <card class="mytrade" padding="10px 10px">
        <div class="card-content" slot="card-content">
          
          <v-text-field  dark required  clearable hide-details v-bind:style="'width: 100% !important'"
            :prefix="$t('Trade.UnitPrice')" 
            v-model='price'
            type="number"
            :suffix="CounterAsset.code"
            :tabindex = '0'
            :color="isBuy ? 'primary':'error'"
          ></v-text-field>
          <!--数量-->
          <v-text-field  dark required hide-details clearable  v-bind:style="'width: 100% !important'"
            :prefix="$t('Amount')"
            v-model="amount"  
            type="number" name="amount" 
            :tabindex = '1'
            :suffix="BaseAsset.code"
            :color=" isBuy ? 'primary':'error'"
            ></v-text-field>
          <v-slider v-model="num"  hide-details 
            class="buy-amount-slider"
            dark
            max=100 step=10 ticks
            append-icon='keyboard_tab'  v-bind:style="'width: 100% !important'"
            :append-icon-cb = 'toMax'
            :color="isBuy ? 'primary':'error'"
            ></v-slider>
          <!--总额，自动计算-->
          <v-text-field v-model="total"   name="total" dark
            :prefix="$t('Trade.Total')"
            :suffix="CounterBalance.code"
            :value="total"
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
              {{$t('Available')}}{{BaseAsset.code}}: {{BaseBalance.balance||0}}
            </div>
              <div class="flex1 available">
              {{$t('Available')}}{{CounterAsset.code}}: {{CounterBalance.balance||0}}
            </div>
          </div>
        </div>
      </card>

      <!--盘面
      <order-book ref="orderbook"  @choose="choose"/>
      -->
      <order-book-lite ref="orderbook"  @choose="choose"/>


       <!-- 买卖按钮 -->
      <div class="flex-row full-width footer-btns">
        <div class="flex1 btn-flex">
          <v-btn :class="'full-width btn-reset ' + ( isBuy ? 'btn-green' : 'btn-red' )"  @click="clean">{{$t('Reset')}}</v-btn>
        </div>
        <div class="flex2 btn-flex">
          <v-btn class="full-width btn-buy" color="primary" 
            :disabled="!(CounterBalance.balance>0 && total> 0 && CounterBalance.balance >= total)" 
            v-if="isBuy" @click="showConfirmSheet = true">{{$t('Trade.Buy')}} {{BaseAsset.code}}</v-btn>
          <v-btn class="full-width btn-sell" color="error" 
            :disabled="!(BaseBalance.balance>0 && total> 0 && BaseBalance.balance >= total)" 
            v-if="isSell" @click="showConfirmSheet = true">{{$t('Trade.Sell')}} {{BaseAsset.code}}</v-btn>
        </div>
      </div>

    </div>

    <!-- 确认内容 -->
    <div class="confirm-wrapper"  v-if="showConfirmSheet">
      <div class="confirm-blank"></div>
      <div  class="confirm-dlg">
      <v-bottom-sheet v-model="showConfirmSheet"  dark>
        <div class="confirm-title" v-if="flag === 'buy'">{{$t('Trade.Confirm')}}{{$t('Trade.Buy')}}</div>
        <div class="confirm-title" v-else>{{$t('Trade.Confirm')}}{{$t('Trade.Sell')}}</div>
        <div class="confirm-content">
          <div class="confirm-row">
            <span class="label">{{$t('Trade.Price')}}</span>
            <span class="value"> {{price}}</span>
            <span class="code">{{CounterAsset.code}}</span>
          </div>
          <div class="confirm-row">
            <span class="label"  v-if="flag === 'buy'">{{$t('Trade.Buy')}}</span>
            <span class="label"  v-else>{{$t('Trade.Sell')}}</span>
            <span class="value"> {{amount}}</span>
            <span class="code">{{BaseAsset.code}}</span>
          </div>
          <div class="confirm-row">
            <span class="label">{{$t('Trade.Total')}}</span>
            <span class="value"> {{total}}</span>
            <span class="code"> {{CounterAsset.code}}</span>
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
import { offer as doOffer } from '@/api/offer'
import { mapState, mapActions, mapGetters} from 'vuex'
import { getAsset, isNativeAsset } from '@/api/assets'
import { Decimal } from 'decimal.js'
import debounce from 'lodash/debounce'

const FLAG_BUY = 'buy'
const FLAG_SELL = 'sell'
Decimal.rounding = Decimal.ROUND_DOWN

export default {
  data(){
    return {
      title: 'Menu.TradeCenter',
      showmenuicon: false,
      showbackicon: true,
      working: false,
      sending: false,
      sendsuccess: false,
      sendfail: false,
      price: null,//单价
      amount: null,//数量
      num: 0,
      flag: FLAG_BUY,
      justify: false,
      total: 0,
      showConfirmSheet: false,
      loadingTitle: null,
      loadingError: null,

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

    
  },

  watch: {
    price(newvalue,oldvalue){
      if(this.justify) return
      this.justify = true
      //if(isNaN(parseFloat(newvalue))){
      let decvalue = new Decimal(newvalue||0)
      if(decvalue.isNaN() || !decvalue.isFinite()){
          this.price = 0
      }else{
          this.price = decvalue.toNumber()
      }
      console.log('price watch:',this.price, this.amount ,this.total, this.num)
      if(this.isBuy){
        if(this.price === 0){
          this.total = this.num = 0
        }
        if(this.amount){
          this.setTotal()
          this.setNum()
          this.setAmount()
        }else if(this.num > 0){
          //this.setTotal()
          this.setAmount()
        }
      console.log('price watch:',this.price, this.amount ,this.total, this.num)
      }
      if(this.isSell){
        if(this.amount){
          this.setTotal()
        }
      }
      this.resetJustify()
    },
    num(newvalue,oldvalue){
      if(this.justify) return
      this.justify = true
      let decvalue = new Decimal(newvalue||0)
      if(decvalue.isNaN() || !decvalue.isFinite()){
        this.num = 0
      }else if(decvalue.comparedTo(100) > 0){
        this.num = 100
        this.resetJustify()
        return
      }
      console.log("num watch:" + this.price, this.amount,this.total)
      if (this.isBuy){
        //this.total = Number(Number(this.tradeBalanceInt * this.num / 100).toFixed(7))
        this.total = Number(new Decimal(this.tradeBalanceInt).times(this.num).div(100).toFixed(7))
        console.log(this.num, this.total)
        this.setAmount()
      }else if (this.isSell){
        //if(newvalue === Number ((this.amount / this.tradeBalance * 100).toFixed(0))){
        let numInt = Number(new Decimal(this.amount||0).times(100).div(this.tradeBalance).toFixed(0))
        if(newvalue === numInt){
          this.resetJustify()
          return
        }
        //this.amount = Number(Number(this.tradeBalanceInt * this.num / 100).toFixed(7))
        this.amount = Number(new Decimal(this.tradeBalanceInt).times(this.num).div(100).toFixed(7))
        this.setTotal()
      }
      console.log("num watch:" + this.price, this.amount,this.total)
      this.resetJustify()
    },
    amount(newvalue,oldvalue){
      if(this.justify) return
      this.justify = true
      if(new Decimal(newvalue||0).isNaN()){
        this.amount = 0
      }
      console.log("amount watch: "+ this.price, this.amount,this.total)
      if(this.isBuy){
        let t = Number(new Decimal(this.total||0).div(this.price||0).toFixed(7))
        if( newvalue === t || isNaN(t)){
          this.resetJustify()
          return
        }
        this.setTotal()
        this.setNum()
       // this.setAmount()
      }else if(this.isSell){
        if(newvalue > this.tradeBalance){
          this.$nextTick(()=>{
            this.amount = this.tradeBalance
          })
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
      if(newvalue === null || typeof newvalue === 'undefined' || new Decimal(newvalue||0).isNaN()){
        this.total = 0
      }
      console.log("total watch: " + this.price, this.amount,this.total)
      if(this.isBuy){
        this.setNum()
        this.setAmount()
      }
      if(this.isSell){
        let t = Number(new Decimal(this.price||0).times(this.tradeBalance).toFixed(7))
        if( newvalue > t ){
          this.$nextTick(()=>{
            this.total=t
          })
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
  },
  beforeMount () {
    this.flag = this.$route.params.flag
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
        this.$nextTick(()=>{
          this.amount = Number(new Decimal(this.total||0).div(this.price).toFixed(7))
//          this.amount = Number(Number(this.total /this.price).toFixed(7))
          if(isNaN(this.amount)) this.amount = 0
          console.log(this.amount +'----this.amount')
        })
        
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
        this.total = Number(new Decimal(this.amount||0).times(this.price).toFixed(7))
      }
    },
    resetJustify:debounce(function(){
      this.$nextTick(()=>{
        console.log('before reset Justify->'+this.justify)
        this.justify = false
        console.log('after reset Justify->'+this.justify)
      })
    },1000),
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
      let option = {type:this.flag, // sell or buy
        currency:this.BaseAsset.code,    //base   buying:  base ++  counter --
        issuer: this.BaseAsset.issuer, 
        base: this.CounterAsset.code,     //counter  selling : base -- counter ++
        base_issuer: this.CounterAsset.issuer, 
        amount:  Number(this.amount), 
        price: Number(this.price)
      }
      doOffer(this.accountData.seed, option)
        .then(data=>{
          this.sending = false
          this.sendsuccess = true
          this.sendfail = false
          this.clean()
          this.hideLoading()
          //this.$toasted.show(this.$t('Trade.OfferSuccess'))
          this.loadingTitle = this.$t('Trade.OfferSuccess')
          this.queryMyOffers()
        })
        .catch(err=>{
          console.log(err)
          //this.sending = false;
          this.sendfail = true;
          this.sendsuccess = false
          //this.clean();
          //this.hideLoading();
          //this.$toasted.error(this.$t('Error.OfferFailed'));
          this.loadingTitle = this.$t('Error.OfferFailed')
          let errcode = getXdrResultCode(err);
          if(errcode){
            //this.$toasted.error(this.$t(errcode));
            this.loadingError = this.$t(errorcode)
          }
        })

    }, 
    
    hideLoading(){
      setTimeout(()=>{
          this.sending = false
          this.working = false
         
        },3000)
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
    choose({type,data}){
      if(this.justify) return
      this.justify = true
      let origin = data.origin
      this.price = Number(origin.price)
      if(this.isBuy){
        console.log(this.tradeBalance)
        this.total = Number(data.depth) <= this.tradeBalance? Number(data.depth):this.tradeBalance
        this.setNum()
        this.setAmount()
      }else if(this.isSell){
        let total_max = Number((this.price * this.tradeBalance).toFixed(7))
        this.total = Number(data.depth) <= total_max ? Number(data.depth):total_max
        this.setAmount()
        this.setNum()
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
    }
   
  },
  components: {
    Toolbar,
    Card,
    OrderBook,
    Loading,
    TradePairToolBar,
    OrderBookLite,
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
  right: 0
  left: 0
  top: 0
  z-index: 9
.confirm-blank
  background: $primarycolor.gray
  opacity: .8
  position: fixed
  bottom: 260px
  right: 0
  left: 0
  top: 0
  z-index: 9
.confirm-dlg
  background: $secondarycolor.gray
  height: 260px
  position: fixed
  bottom: 0
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
  padding-top: 24px
  padding-bottom: 24px
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


</style>

