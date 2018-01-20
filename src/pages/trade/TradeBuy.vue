/**
 * 买入
 */
<template>
  <div class="page">

     <toolbar :title="$t(title)"
      :showmenuicon="showmenuicon"
      :showbackicon="showbackicon"
      @goback="back"
      >
    </toolbar>

    <loading v-if="working" :loading="sending" :success="sendsuccess" />


    <div class="content">
      <card class="mytrade" padding="10px 10px">
        <div class="card-content" slot="card-content">

          <!--交易对-->
          <div class="pair-show">
            <div class="pair-from">
              <div class="code">{{selectedTrade.from.code}}</div>
              <div class="issuer">{{selectedTrade.from.issuer ? selectedTrade.from.issuer:'Stellar.org' | miniaddress}}</div>
            </div>
            <div class="pair-icon">
              <i class="icons material-icons">&#xE8D4;</i>
            </div>
            <div class="pair-to">
              <div class="code">{{selectedTrade.to.code}}</div>
              <div class="issuer">{{selectedTrade.to.issuer ? selectedTrade.to.issuer:'Stellar.org' | miniaddress}}</div>
            </div>
          </div>

          <!--单价-->
          <v-text-field
              name="amount"
              :label="$t('Trade.UnitPrice')"
              v-model="price"
              dark
              required
              type="text"
            ></v-text-field>
          <!--数量-->
          <v-text-field
              name="amount"
              :label="$t('Amount')"
              v-model="amount"
              dark
              :suffix="asset.code"
              required
              type="text"
            ></v-text-field>
            <!-- <v-slider v-model="num"
                class="buy-amount-slider"
                dark
                color="primary"
                :max="maxamount"
              ></v-slider> -->
          <!--总额，自动计算-->
          <v-text-field
              name="amount"
              :label="$t('Trade.Total')+buyassetbalance.code"
              :value="total"
              dark
              disabled
              type="text"
            ></v-text-field>

          <!--按钮-->
          <v-btn class="primary btn-buy" :loading="working" @click.stop="doBuy">{{$t('Trade.Buy')}}{{asset.code}}</v-btn>

          <!--可用-->
          <div class="available">{{$t('Available')}}:{{buyassetbalance.balance||0}}&nbsp;{{buyassetbalance.code}}</div>


        </div>
      </card>

      <!--盘面-->
      <order-book
        activetab="myoffer"
        @choose="choose"
        />


    </div>

  </div>
</template>

<script>
import Toolbar from '../../components/Toolbar'
import Card from '../../components/Card'
import OrderBook from '../../components/OrderBook'
import Loading from '../../components/Loading'
import { offer as doOffer } from '../../api/offer'
import { mapState, mapActions, mapGetters} from 'vuex'
export default {
  data(){
    return {
      title: 'Menu.TradeCenter',
      showmenuicon: false,
      showbackicon: true,
      working: false,
      sending: false,
      sendsuccess: false,
      price: null,//单价
      amount: null,//数量
      num: 0,


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

    }),
    ...mapGetters([
      'balances',
    ]),
    asset(){
      let asset = this.selectedTrade.from
      return asset ? asset : {}
    },
    balance(){
      let data = {}
      for(var i=0,n=this.balances.length; i<n;i++){
        let b = this.balances[i]
        if(b.code === this.asset.code){
          if(this.asset.issuer){
            if(this.asset.issuer === b.issuer){
              data = b
            }
          }else{
            data = b
          }
        }
      }
      return data
    },
    buyasset(){
      let asset = this.selectedTrade.to
      return asset ? asset:{}
    },
    buyassetbalance(){
      let data = {}
      for(var i=0,n=this.balances.length; i<n;i++){
        let b = this.balances[i]
        if(b.code === this.buyasset.code){
          if(this.buyasset.issuer){
            if(this.buyasset.issuer === b.issuer){
              data = b
            }
          }else{
            data = b
          }
        }
      }
      return data
      //return {balance: 100}
    },
    maxamount(){
      if(this.price!=null&&this.price>0){
        return Number((this.buyassetbalance.balance / this.price).toFixed(7))
      }
      return 0
    },

    total(){
      if(this.price!=null&&this.price>0 && this.amount!=null && this.amount > 0){
        return Number((this.price * Number(this.amount)).toFixed(7))
      }
      return ''
    },


  },
  watch: {
    num(newvalue,oldvalue){
      this.amount =  newvalue
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
      // queryMyOffers: 'queryMyOffers',
      orderBookStreamHandler: 'orderBookStreamHandler'

    }),
    back(){
      this.$router.back()
    },
    choose({type,data}){
      if('sell'!=type)return
      console.log('-------choose---------')
      console.log(data)
      let origin = data.origin
      this.price = Number(origin.price)
      //this.amount = Number(origin.amount)
      this.num =  data.amount

    },
    doBuy(){
      let seed = this.accountData.seed
      if(!seed){
        this.$toasted.error(this.$t('Error.NoPassword'))
        return
      }
      if(this.working)return
      this.working = true
      this.sending = true
      let option = {type:'buy',
        currency:this.asset.code,
        issuer: this.asset.issuer,
        base: this.buyasset.code,
        base_issuer: this.buyasset.issuer,
        amount:  Number(this.amount),
        price: Number(this.price)
      }
      console.log('--buy option: $s',option)
      doOffer(this.accountData.seed, option)
        .then(data=>{
          this.sending = false
          this.sendsuccess = true
          this.clean()
          this.hideLoading()
          this.$toasted.show(this.$t('Trade.OfferSuccess'))
          // this.queryMyOffers()
        })
        .catch(err=>{
          console.log(err)
          this.sending = false
          this.sendsuccess = false
          this.hideLoading()
          this.$toasted.error(this.$t('Error.OfferFailed'))
        })

    },

    hideLoading(){
      setTimeout(()=>{
          this.sendsuccess =false
          this.sending = false
          this.working = false
        },3000)
    },

    clean(){
      this.num = 0
      this.amount = null
      this.price = null
    }

  },
  components: {
    Toolbar,
    Card,
    OrderBook,
    Loading,
  }
}
</script>


<style lang="stylus" scoped>
@require '../../stylus/color.styl'

.page
  background: $primarycolor.gray
  color: $primarycolor.font
  .content
    padding: 10px 10px
// 交易对
.pair-show
  display: flex
  width: 100%
  text-align: center
  font-size: 14px
  padding-top: 10px
  padding-bottom: 10px
  .pair-from
    flex: 2
    .code
      font-size: 16px
    .issuer
      color: $secondarycolor.font
  .pair-icon
    flex: 1
    .material-icons
      font-size: 32px
      padding-top: 8px
  .pair-to
    flex: 2
    .code
      font-size:  16px
    .issuer
      color: $secondarycolor.font
//购买按钮
.btn-buy
  margin: 0px 0px
  padding: 0px 0px
  height: 36px
  line-height: 36px
  width: 100%
  font-size: 16px
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
