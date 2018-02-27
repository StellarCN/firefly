/**
 * 买入
 */
<template>
  <div class="page">
   <!-- toolbar -->
    <trade-pair-tool-bar @choseTradePair="afterChoseTradePair"/>

    <loading :show="working" :loading="sending" :success="sendsuccess" :fail='sendfail' :color="isSell?'red':'green'"/>

    <!--买卖切换-->
    <div class="flex-row full-width tmenu">
      <div :class="'flex1 textcenter' + ( isBuy ? ' active':'' )" @click="switchBuy">{{$t('Trade.Buy')}}</div>
      <div :class="'flex1 textcenter' + ( isSell ? ' active':'' )" @click="switchSell">{{$t('Trade.Sell')}}</div>
    </div>

    <div class="content">
      <card class="mytrade" padding="10px 10px">
        <div class="card-content" slot="card-content">
          
          <!--单价-->
          <v-text-field
              name="amount"
              :label="$t('Trade.UnitPrice')"
              v-model="price"
              dark
              required
              type="text"
              :suffix="CounterAsset.code"
            ></v-text-field>
          <!--数量-->
          <v-text-field
              name="amount"
              :label="$t('Amount')"
              v-model="amount"
              dark
              :suffix="BaseAsset.code"
              required
              type="text"
            ></v-text-field>
            <v-slider v-model="num"  hide-details 
              class="buy-amount-slider"
              dark
              max=100 step=10 ticks
              append-icon='keyboard_tab'  v-bind:style="'width: 90% !important'"
              :append-icon-cb = 'toMax'
              :color="isBuy ? 'primary':'error'"
              ></v-slider>
          <!--总额，自动计算-->
          <v-text-field
              name="amount"
              :label="$t('Trade.Total')+CounterAsset.code"
              :value="total"
              dark
              disabled
              type="text"
            ></v-text-field>

          <!--按钮
          <v-btn class="primary btn-buy" :loading="working" @click.stop="doBuy">{{$t('Trade.Buy')}}{{BaseAsset.code}}</v-btn>
-->
          <!--可用-->
          <div class="flex-row full-width">
            <div class="flex1 available">
              {{$t('Available')}}:{{BaseBalance.balance||0}}&nbsp;{{BaseAsset.code}}
            </div>
              <div class="flex1 available">
              {{$t('Available')}}:{{CounterBalance.balance||0}}&nbsp;{{CounterAsset.code}}
            </div>
          </div>

          
        </div>
      </card>

      <!--盘面-->
      <order-book ref="orderbook"  @choose="choose"/>


       <!-- 买卖按钮 -->
      <div class="flex-row full-width footer-btns">
        <div class="flex1 btn-flex">
          <v-btn :class="'full-width btn-reset ' + ( isBuy ? 'btn-green' : 'btn-red' )"  @click="clean">{{$t('Reset')}}</v-btn>
        </div>
        <div class="flex2 btn-flex">
          <v-btn class="full-width btn-buy" color="primary" v-if="isBuy" @click="doTrade">{{$t('Trade.Buy')}}{{BaseAsset.code}}</v-btn>
          <v-btn class="full-width btn-sell" color="error" v-if="isSell" @click="doTrade">{{$t('Trade.Sell')}}{{BaseAsset.code}}</v-btn>
        </div>
      </div>

    </div>

  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import OrderBook from '@/components/OrderBook'
import Loading from '@/components/Loading'
import TradePairToolBar from '@/components/TradePairToolBar'
import { offer as doOffer } from '@/api/offer'
import { mapState, mapActions, mapGetters} from 'vuex'
import { getAsset, isNativeAsset } from '@/api/assets'
const FLAG_BUY = 'buy'
const FLAG_SELL = 'sell'
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
    choseTradePair({index,tradepair}){//选择交易对
      this.$nextTick(()=>{
        //TODO
      })
    },
    isBuy(){
      return this.flag === FLAG_BUY
    },
    isSell(){
      return this.flag === FLAG_SELL
    },

    maxamount(){
      if(this.price!=null&&this.price>0){
        return Number((this.CounterBalance.balance / this.price).toFixed(7))
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
      return this.tradeBalance - this.tradeBalance % (10 ** (String(parseInt(this.tradeBalance * 10**7)).length -1 )  /10**7)
    },

    
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
      if(this.isBuy){
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
      if(isNaN(parseFloat(newvalue))){
        this.num = 0
      }
      if(newvalue > 100){
        this.num = 100
        this.resetJustify()
        return
      }
      console.log("num watch:" + this.price, this.amount,this.total)
      if (this.isBuy){
        this.total = Number(Number(this.tradeBalanceInt * this.num / 100).toFixed(7))
        console.log(this.num, this.total)
        this.setAmount()
      }else if (this.isSell){
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
      if(this.isBuy){
        let t = Number(Number(this.total / this.price).toFixed(7))
        if( newvalue === t || isNaN(t)){
          this.resetJustify()
          return
        }
        this.setTotal()
        this.setNum()
        this.setAmount()
      }else if(this.isSell){
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
      if(this.isBuy){
        //this.setTotal()
        this.setNum()
        this.setAmount()
      }
      if(this.isSell){
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
      return _.defaultsDeep({}, this.balances.filter(item=> item.code === asset.code && item.issuer === asset.issuer)[0])
    },

    setNum(){
      if(this.isBuy){
        this.num = parseInt(this.total / this.tradeBalanceInt * 100)
        this.num = this.num - this.num % 10
      }else if(this.isSell){
        this.num = Number((this.amount / this.tradeBalanceInt * 100))
        this.num = this.num > 100 ? 100 : (this.num - this.num % 10)
      }
    }, 
    setAmount(){
      if(this.isBuy){
        this.$nextTick(()=>{
          this.amount = Number(Number(this.total /this.price).toFixed(7))
        })
        // this.amount = Number(Number(this.total /this.price).toFixed(7))
        if(isNaN(this.amount)) this.amount = 0
        console.log(this.amount +'----this.amount')
      }
      if(this.isSell){
        let amount = Number(Number(this.total / this.price).toFixed(7))
        if(isNaN(amount)) amount = 0
        this.amount = amount < this.tradeBalance? amount : this.tradeBalance
      }
    },
    setTotal(){
      if(this.isBuy){
        let total = Number(Number(this.amount * this.price ).toFixed(7))
        this.total = total < this.tradeBalance ? total : this.tradeBalance
        console.log('setTotal:   '+this.total)
      }else if(this.isSell){
        this.total = Number(Number(this.amount * this.price ).toFixed(7))
      }
    },
    resetJustify(){
      this.$nextTick(()=>{
        console.log('before reset Justify->'+this.justify)
        this.justify = false
        console.log('after reset Justify->'+this.justify)
      })
    },
    toMax(){
      if(this.justify) return
      this.justify = true
      this.num = 100
      if(this.isBuy){
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
    doTrade(){
      let seed = this.accountData.seed
      if(!seed){
        this.$toasted.error(this.$t('Error.NoPassword'))
        return
      }

      if(this.working)return
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
      console.log(this.tradeType + '--- option: $s',option)
      doOffer(this.accountData.seed, option)
        .then(data=>{
          this.sending = false
          this.sendsuccess = true
          this.sendfail = false
          this.clean()
          this.hideLoading()
          this.$toasted.show(this.$t('Trade.OfferSuccess'))
          this.queryMyOffers()
        })
        .catch(err=>{
          console.log(err)
          this.sending = false;
          this.sendfail = true;
          this.sendsuccess = false
          this.clean();
          this.hideLoading();
          this.$toasted.error(this.$t('Error.OfferFailed'));
          let errcode = getXdrResultCode(err);
          if(errcode){
            this.$toasted.error(this.$t(errcode));
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
    },
    switchBuy(){
      this.flag = FLAG_BUY
    },
    switchSell(){
      this.flag = FLAG_SELL
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
    doSwitchTradePair(){
      this.switchSelectedTradePair()
    },
    afterChoseTradePair(){

    }
   
  },
  components: {
    Toolbar,
    Card,
    OrderBook,
    Loading,
    TradePairToolBar,
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

</style>

