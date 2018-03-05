/**
* 历史页面
* 交易记录
*/
<template>
  <div class="content">
  <scroll :refresh="queryAllOffers">
    <div v-for="(item, index) in records" :key="index">
      <card class="offer-card" padding="10px 10px">
        <div class="myoffer-table offer-table" slot="card-content">
          <div class="flex-row">
            <div class="flex4">
              <div class="pair-show">
                <div class="pair-from">
                  <div class="code">{{item.base_asset}}</div>
                  <div class="issuer" v-if="assethosts[item.base_asset]">{{assethosts[item.base_asset] | miniaddress}}</div>
                  <div class="issuer" v-else-if="assethosts[item.base_issuer]">
                    {{assethosts[item.base_issuer] | miniaddress}}
                  </div>
                  <div class="issuer" v-else>{{item.base_issuer | miniaddress}}</div>
                </div>
                <div class="pair-icon">
                  <i class="icons material-icons">&#xE8D4;</i>
                </div>
                <div class="pair-to">
                  <div class="code">{{item.counter_asset}}</div>
                  <div class="issuer" v-if="assethosts[item.counter_asset]">{{assethosts[item.counter_asset] | miniaddress}}</div>
                  <div class="issuer" v-else-if="assethosts[item.counter_issuer]">{{assethosts[item.counter_issuer] | miniaddress}}
                  </div>
                  <div class="issuer" v-else>{{item.counter_issuer| miniaddress}}</div>
                </div>
              </div>
            </div>
            <div class="flex4 pl-1 textright">
              <div>
                <span class="value">{{item.price}}{{item.counter_asset}}</span>
                <span class="label">{{$t('Trade.UnitPrice')}}</span>
              </div>
              <div>
                <span class="value up">+{{item.amount}}{{item.base_asset}}</span>
                <span class="label">{{$t('Amount')}}</span>
              </div>
              <div>
                <span class="value down">-{{item.total}}{{item.base_asset}}</span>
                <span class="label">{{$t('Trade.Total')}}</span>
              </div>
            </div>
            <div class="flex1 textcenter pt-4">
             {{$t(item.type)}}
            </div>
          </div>
          
        </div>
      </card>
    </div>
  </scroll>



  </div>
</template>


<script>
import Card from './Card'
import {mapState, mapActions, mapGetters} from 'vuex'
import {DEFAULT_INTERVAL} from '@/api/gateways'
import Scroll from '@/components/Scroll'
import Loading from './Loading'
import { Decimal } from 'decimal.js'
import { getXdrResultCode } from '@/api/xdr'
import { getAllEffectOffers } from '@/api/fchain'
var moment = require('moment')
import _ from 'lodash'

  export default {
    data() {
      return {
        records: [],
        working: false,
      
      
      }
    },
    computed: {
      ...mapState({
        account: state => state.accounts.selectedAccount,
        tradepairs: state => state.accounts.accountData.tradepairs,
        assethosts: state => state.asset.assethosts,
        accountData: state => state.accounts.accountData,
      }),
      
    },
    beforeMount () {
      this.queryAllOffers()
    },
    methods: {
      queryAllOffers(){
        //暂时只查询一周的委单数据
        let start_time = Number(moment().subtract(7,"days").format('x'))
        let end_time = Number(moment().format('x'))
        getAllEffectOffers(this.account.address, start_time, end_time)
          .then(response=>{
            this.records = response.data.map(item=>{
              return _.defaultsDeep({}, item, { total: new Decimal(item.amount).times(item.price).toFixed(7)})
            })
          })
          .catch(err=>{
            console.error(err)
            if(err.message){
              this.$toasted.error(err.message)
            }
          })
      }
    },
    components: {
      Card,
      Scroll,
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
    .pair-from
      flex: 3
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
