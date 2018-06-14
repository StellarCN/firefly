/**
* 历史页面
* 交易记录
*/
<template>
  <div class="content">
    
  <div class="search-wrapper pl-3">
    <date-range-picker :start="start" :end="end" @doSearch="doSearch" />
  </div>

  <scroll :refresh="reload">
    <div v-for="(item, index) in deals" :key="index">
      <card class="offer-card" padding="10px 10px">
        <div class="myoffer-table offer-table" slot="card-content">
          <div class="flex-row">
            <div class="flex3 over-hide">
              <div class="pair-show">
                <div class="pair-from">
                  <div class="code">{{item.bought_asset_code}}</div>
                  <div class="issuer" v-if="assethosts[item.bought_asset_code]">{{assethosts[item.bought_asset_code] | miniaddress}}</div>
                  <div class="issuer" v-else-if="assethosts[item.bought_asset_issuer]">
                    {{assethosts[item.bought_asset_issuer] | miniaddress}}
                  </div>
                  <div class="issuer" v-else>{{item.sold_asset_issuer | miniaddress}}</div>
                </div>
                <div class="pair-icon">
                  <i class="icons material-icons">&#xE8D4;</i>
                </div>
                <div class="pair-to">
                  <div class="code">{{item.sold_asset_code}}</div>
                  <div class="issuer" v-if="assethosts[item.sold_asset_code]">{{assethosts[item.sold_asset_code] | miniaddress}}</div>
                  <div class="issuer" v-else-if="assethosts[item.sold_asset_issuer]">{{assethosts[item.sold_asset_issuer] | miniaddress}}
                  </div>
                  <div class="issuer" v-else>{{item.sold_asset_issuer| miniaddress}}</div>
                </div>
              </div>
            </div>
            <div class="flex5 textright">
              <div>
                <span class="value">{{Number(item.price)}}{{item.bought_asset_code}}</span>
                <span class="label">{{$t('UnitPriceAbbreviation')}}</span>
              </div>
              <div>
                <span class="value down">-{{Number(item.sold_amount)}}{{item.sold_asset_code}}</span>
                <span class="label">{{$t('AmountAbbreviation')}}</span>
              </div>
              <div>
                <span class="value up">+{{Number(item.bought_amount)}}{{item.bought_asset_code}}</span>
                <span class="label">{{$t('TotalAbbreviation')}}</span>
              </div>
            </div>
            <div class="flex1 textright pt-4">
             <i class="material-icons trade-icon" v-if="item.type === 'canceled'">not_interested</i>
             <i class="material-icons trade-icon" v-else>done</i>
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
import DateRangePicker from '@/components/DateRangePicker'
import Loading from './Loading'
import { Decimal } from 'decimal.js'
import { getXdrResultCode } from '@/api/xdr'
var moment = require('moment')
import  defaultsDeep  from 'lodash/defaultsDeep'
import { isNativeAsset } from '@/api/assets'

  export default {
    data() {
      return {
        working: false,
        start: null,
        end: null,
      
      
      }
    },
    computed: {
      ...mapState({
        account: state => state.accounts.selectedAccount,
        assethosts: state => state.asset.assethosts,
        accountData: state => state.accounts.accountData,
        alloffers: state => state.account.alloffers,
      }),
      deals(){
        return this.filterOffers()
      }
    },
    beforeMount () {
      this.start = Number(moment().subtract(30,"days").format('x'))
      this.end = Number(moment().format('x'))
      this.queryAllOffers()
    },
    beforeDestroy(){
      this.$store.commit('CLEAN_ALL_OFFERS')
    },
    methods: {
      ...mapActions({
        getAllOffers: 'getAllOffers',
      }),
      reload(){
         let _address = this.account.address
         return this.getAllOffers({
           account: _address,
           start_time: this.start,
           end_time: this.end
         })
        //return getAllEffectOffers(_address, this.start, this.end)
      },
      queryAllOffers(){
        //暂时只查询一周的委单数据
        //let start_time = Number(moment().subtract(7,"days").format('x'))
        //let end_time = Number(moment().format('x'))
        //let start_time = moment(this.start)
        //let end_time = moment(this.end)
        //start_time = new Date(start_time.year(), start_time.month()+1, start_time.date()).getTime()
        //end_time = new Date(end_time.year(), end_time.month()+1, end_time.date()).getTime()
       
        this.reload().then(response=>{}).catch(err=>{console.error(err)})
      },
      doSearch({start,end}){
        this.start =Number(moment(start + ' 00:00:00').format('x'))
        this.end = Number(moment(end + ' 23:59:59').format('x'))
        this.queryAllOffers()
      },
      
    filterOffers(){
      if(this.alloffers){
        //过滤掉不是当前要显示的数据
        return this.alloffers.map(item=>{
         if(item.bought_asset_code === null || typeof item.bought_asset_code ==='undefined'
             || item.bought_amount ===null || typeof item.bought_amount === 'undefined' ){
            let cancelObj = {
              bought_asset_code: item.base_asset,
              bought_asset_issuer: item.base_issuer,
              sold_asset_code: item.counter_asset,
              sold_asset_issuer: item.counter_issuer,
              sold_amount:item.amount,
              bought_amount:new Decimal(item.amount).times(item.price).toFixed(7)
            }
            return Object.assign({}, item, cancelObj)
          }else{
            return Object.assign({}, item)
          }
          
        })
      }
      return []
    },
    },
    components: {
      Card,
      Scroll,
      DateRangePicker,
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
    text-align: center
    font-size: 14px
    padding-top: 10px
    padding-bottom: 10px
    overflow:hidden
    .pair-from
      flex: 4
      overflow:hidden
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
      flex: 4
      overflow:hidden
      .code
        font-size: 16px
      .issuer
        color: $secondarycolor.font
        font-size: 14px
.myoffer-table
  font-size: 14px
.label
  color: $secondarycolor.font
.trade-icon
  color: $secondarycolor.font
  font-size: .6rem
.over-hide
  overflow: hidden
</style>
