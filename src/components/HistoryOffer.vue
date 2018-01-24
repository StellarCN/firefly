/**
* 历史页面
* 我的委单
*/
<template>
  <scroll :refresh="setup">
    <div v-for="(offer, offer_index) in offersData" :key="offer_index">
      <card class="offer-card" padding="10px 10px" margin="2px 0px">
        <div class="myoffer-table offer-table" slot="card-content">
          <div class="pair-show">
            <div class="pair-from">
              <div class="code">{{offer.pair.from.code}}</div>
              <div class="issuer" v-if="assethosts[offer.pair.from.code]">{{assethosts[offer.pair.from.code]}}</div>
              <div class="issuer" v-else-if="assethosts[offer.pair.from.issuer]">
                {{assethosts[offer.pair.from.issuer]}}
              </div>
              <div class="issuer" v-else>{{offer.pair.from.issuer | miniaddress}}</div>
            </div>
            <div class="pair-icon" @click.stop="switchPair(offer)">
              <i class="icons material-icons">&#xE8D4;</i>
            </div>
            <div class="pair-to">
              <div class="code">{{offer.pair.to.code}}</div>
              <div class="issuer" v-if="assethosts[offer.pair.to.code]">{{assethosts[offer.pair.to.code]}}</div>
              <div class="issuer" v-else-if="assethosts[offer.pair.to.issuer]">{{assethosts[offer.pair.to.issuer]}}
              </div>
              <div class="issuer" v-else>{{offer.pair.to.issuer | miniaddress}}</div>
            </div>
          </div>
          <div class="table-head body-2">
            <div class="headcol">{{$t('Trade.Price')}}</div>
            <div class="headcol">{{offer.pair.from.code}}</div>
            <div class="headcol">{{offer.pair.to.code}}</div>
            <div class="headcol">&nbsp;</div>
          </div>

          <div class="table-row body-2"
               v-for="(item, item_index) in offer.records" :key="item_index" :class='item.type'>
            <div class="b-row price">{{Number(item.price.toFixed(4))}}</div>
            <div class="b-row" v-if="item.type==='buy'">+{{Number(item.base.toFixed(4)) | KNumber}}</div>
            <div class="b-row" v-else>-{{Number(item.amount.toFixed(4)) | KNumber}}</div>
            <div class="b-row" v-if="item.type==='buy'">-{{Number(item.amount.toFixed(4)) | KNumber}}</div>
            <div class="b-row" v-else>+{{Number(item.base.toFixed(4)) | KNumber}}</div>
            <div class="b-row depth">
              <span class="working" v-if="working && delindex===item_index && offer_delindex === offer_index"></span>
              <a v-else href="javascript:void(0)" @click.stop="cancelMyOffer(item, item_index, offer_index)">{{$t('Trade.Cancel')}}</a>
            </div>
          </div>
        </div>
      </card>
    </div>
  </scroll>
</template>


<script>
  import Card from './Card'
  import {mapState, mapActions, mapGetters} from 'vuex'
  import {cancel as cancelOffer} from '@/api/offer'
  import {DEFAULT_INTERVAL} from '@/api/gateways'
  import Scroll from '@/components/Scroll'
  import {myofferConvert} from '@/api/offer'

  export default {
    data() {
      return {
        offers: [],
        working: false,
        timeInterval: null,
      }
    },
    computed: {
      ...mapState({
        my: state => state.accounts.selectedTradePair.my.records,
        tradepairs: state => state.accounts.accountData.tradepairs,
        assethosts: state => state.asset.assethosts,
        accountData: state => state.accounts.accountData,
      }),
      ...mapGetters([]),
      offersData() {
        let data = []
        if (!this.my) return
        for (let i = 0; i < this.tradepairs.length; i++) {
          let aPairData = myofferConvert(this.tradepairs[i].from, this.tradepairs[i].to, this.my)
          // console.log(aPairData);
          if (aPairData.length != 0) {
            data.push({
              records: aPairData,
              pair: this.tradepairs[i],
              pair_id: i
            })
          }
        }
        return data
      },
    },
    beforeDestroy: function () {
      if (this.timeInterval != null) {
        clearInterval(this.timeInterval)
      }
    },
    mounted() {
      this.setup()
    },
    methods: {
      ...mapActions({
        queryMyOffers: 'queryMyOffers',
        switchTradePair: 'switchTradePair'
      }),
      setup() {
        if (!this.timeInterval) {
          this.timeInterval = setInterval(() => {
            // console.log("fresh");
            return this.queryMyOffers()
          }, DEFAULT_INTERVAL)
        }
        return this.queryMyOffers()
      },
      switchPair(offer) {
        clearInterval(this.timeInterval)
        let index = offer.pair_id
        let tradepair = {from: offer.pair.to, to: offer.pair.from}
        this.switchTradePair({index, tradepair})
          .then(data => {
            this.setup()
          })
      },
      cancelMyOffer(item, item_index, offer_index) {
        if (this.working) return
        if (!this.accountData.seed) return
        clearInterval(this.timeInterval)
        this.working = true
        this.offer_index = offer_index
        this.delindex = item_index
        this.offer_delindex = offer_index
        cancelOffer(this.accountData.seed, item)
          .then(data => {
            this.$toasted.show(this.$t('Trade.CancelOfferSuccess'))
            this.working = false
            this.delindex = -1
            this.offer_delindex = -1
            this.setup()
          })
          .catch(err => {
            console.log('-----cancel----- error-----')
            console.log(err)
            this.$toasted.show(this.$t('Error.CancelOfferFailed'))
            this.working = false
            this.delindex = -1
            this.offer_delindex = -1
            this.setup()
          })
      },
    },
    components: {
      Card,
      Scroll
    }
  }
</script>

<style lang="stylus" scoped>
  @require '../stylus/color.styl'
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

  .buy
    padding: 5px;
    color: $primarycolor.green

  .sell
    padding: 5px;
    color: $primarycolor.red

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
        color: $primarycolor.green
        font-size: 32px
        padding-top: 8px
    .pair-to
      flex: 2
      .code
        font-size: 16px
      .issuer
        color: $secondarycolor.font
</style>
