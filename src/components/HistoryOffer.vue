/**
* 历史页面
* 我的委单
*/
<template>
  <div class="content">
  <scroll :refresh="setup">
    <div v-for="(offer, index) in offers" :key="index">
      <card class="offer-card" padding="10px 10px">
        <div class="myoffer-table offer-table" slot="card-content">
          <div class="flex-row">
            <div class="flex3">
              <div class="pair-show">
                <div class="pair-to">
                  <div class="code">{{offer.to.code}}</div>
                  <div class="issuer" v-if="assethosts[offer.to.code]">{{assethosts[offer.to.code] | miniaddress}}</div>
                  <div class="issuer" v-else-if="assethosts[offer.to.issuer]">{{assethosts[offer.to.issuer] | miniaddress}}
                  </div>
                  <div class="issuer" v-else>{{offer.to.issuer | miniaddress}}</div>
                </div>
                <div class="pair-icon">
                  <i class="icons material-icons">&#xE8D4;</i>
                </div>
                <div class="pair-from">
                  <div class="code">{{offer.from.code}}</div>
                  <div class="issuer" v-if="assethosts[offer.from.code]">{{assethosts[offer.from.code] | miniaddress}}</div>
                  <div class="issuer" v-else-if="assethosts[offer.from.issuer]">
                    {{assethosts[offer.from.issuer] | miniaddress}}
                  </div>
                  <div class="issuer" v-else>{{offer.from.issuer | miniaddress}}</div>
                </div>

              </div>
            </div>
            <div class="flex4 pl-1 textright">
              <div>
                <span class="value">{{Number(offer.price)}}{{offer.from.code}}</span>
                <span class="label">{{$t('UnitPriceAbbreviation')}}</span>
              </div>
              <div>
                <span class="value down">+{{Number(offer.total)}}{{offer.to.code}}</span>
                <span class="label">{{$t('AmountAbbreviation')}}</span>
              </div>
              <div>
                <span class="value up">-{{Number(offer.amount)}}{{offer.from.code}}</span>
                <span class="label">{{$t('TotalAbbreviation')}}</span>
              </div>
            </div>
            <div class="flex1 textcenter pt-4">
              <a href="javascript:void(0)" @click.stop="cancelMyOffer(offer,index)">{{$t('Trade.Cancel')}}</a>
            </div>
          </div>
          
        </div>
      </card>
    </div>
  </scroll>

   <loading :show="working" :loading="sending" :success="dealok" :fail='dealfail' 
      color="red" :title="loadingTitle" :msg="loadingMsg" :closeable="dealfail" @close="hiddenLoadingView"/>


  </div>
</template>


<script>
import Card from './Card'
import {mapState, mapActions, mapGetters} from 'vuex'
import {cancel as cancelOffer} from '@/api/offer'
import {DEFAULT_INTERVAL} from '@/api/gateways'
import Scroll from '@/components/Scroll'
import {myofferConvert} from '@/api/offer'
import Loading from './Loading'
import { Decimal } from 'decimal.js'
import { getXdrResultCode } from '@/api/xdr'

  export default {
    data() {
      return {
        offers: [],
      
        working: false,
        sending: false,
        dealok: false,
        dealfail: false,
        loadingTitle: null,
        loadingMsg: null,
      
      }
    },
    computed: {
      ...mapState({
        my: state => state.accounts.selectedTradePair.my.records,
        assethosts: state => state.asset.assethosts,
        accountData: state => state.accounts.accountData,
      }),
    },
    watch:{
      my(){
        this.offers = this.my.map(item=>Object.assign({origin: item}, this.convertOffer(item)))
      }
    },
    mounted() {
       this.queryMyOffers()
    },
    methods: {
      ...mapActions({
        queryMyOffers: 'queryMyOffers',
        switchTradePair: 'switchTradePair'
      }),
      setup() {
        return this.queryMyOffers()
      },
      switchPair(offer) {
        let index = offer.pair_id
        let tradepair = {from: offer.pair.to, to: offer.pair.from}
        this.switchTradePair({index, tradepair})
          .then(data => {
            this.setup()
          })
      },
      cancelMyOffer(item,index) {
        if (this.working) return
        if (!this.accountData.seed) return
        this.onWorking()
        cancelOffer(this.accountData.seed, item.origin || this.my[i])
          .then(data => {
            this.onSuccess()
            this.setup()
          })
          .catch(err => {
            console.log(err)
            this.onFail()
            this.setup()
          })
      },

      convertOffer(offer){
        let data = {}
        if(offer.buying.asset_type === 'native'){
          data.to = { code: 'XLM', issuer: 'stellar.org'}  
        }else{
          data.to = {code: offer.buying.asset_code, issuer: offer.buying.asset_issuer }
        } 
        if(offer.selling.asset_type === 'native'){
          data.from = { code: 'XLM', issuer: 'stellar.org'}  
        }else{
          data.from =  {code: offer.selling.asset_code, issuer: offer.selling.asset_issuer }
        }

        data.amount = offer.amount
        data.id = offer.id
        data.price = Number(new Decimal(offer.price_r.d).div(offer.price_r.n).toFixed(7))//Number(offer.price)
        data.price_r = offer.price_r
        data.seller = offer.seller
        data.total = new Decimal(offer.amount).times(offer.price_r.n).div(offer.price_r.d).toFixed(7)
        return data
      },

      onWorking(){
        this.working = true
        this.sending = true
        this.dealok = false
        this.dealfail = false
        this.loadingTitle = null
        this.loadingMsg = null
      },
      onSuccess(){
        this.sending = false
        this.dealok = true
        this.loadingTitle = this.$t('Trade.CancelOfferSuccess')
        setTimeout(()=>{
          this.loadingTitle = null
          this.loadingMsg = null
          this.dealok = false
          this.working = false
        },1000)
      },
      onFail(err){
        this.sending = false
        this.dealfail = true
        this.loadingTitle = this.$t('Error.CancelOfferFailed')
        let msg = getXdrResultCode(err)
        if(msg){
          this.loadingMsg = this.$t(msg)
        }else if(err){
          this.loadingMsg = this.$t(err.message)
        }
      },
      hiddenLoadingView(){
        this.working = false
        this.loadingTitle = null
        this.loadingMsg = null
      }

    },
    components: {
      Card,
      Scroll,
      Loading
    }
  }
</script>

<style lang="stylus" scoped>
@require '../stylus/color.styl'
.offer-card
  background: $secondarycolor.gray

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
      & > a
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

  .up
    color: $primarycolor.green
  .down
    color: $primarycolor.red

  .pair-show
    display: flex
    width: 100%
    text-align: center
    font-size: 14px
    padding-top: 10px
    padding-bottom: 10px
    overflow: hidden
    .pair-from
      flex: 3
      overflow: hidden
      .code
        font-size: 16px
      .issuer
        color: $secondarycolor.font
        font-size: 14px
    .pair-icon
      flex: 1
      .material-icons
        //color: $primarycolor.green
        font-size: 20px
        padding-top: 8px
    .pair-to
      flex: 3
      overflow: hidden
      .code
        font-size: 16px
      .issuer
        color: $secondarycolor.font
        font-size: 14px
.myoffer-table
  font-size: 14px
.label
  color: $secondarycolor.font
</style>
