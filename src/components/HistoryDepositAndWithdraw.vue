/**
* 历史页面
* 充提记录
*/
<template>
  <div class="content">
     
     <div class="select-wrapper">
       <v-select
          v-bind:items="assets"
          v-model="selectedasset"
          :label="$t('Asset')"
          class="selectasset"
          item-value="id"
          item-text="code"
          dark
          :return-object="assetChoseReturnObject"
          @change="changeAsset"
        >
        <template slot="selection" slot-scope="data">
          <span class="asset-select-code show">{{data.item.code}}</span>
          <span class="asset-select-issuer show" v-if="assethosts[data.item.issuer]">{{assethosts[data.item.issuer]}}</span>
          <span class="asset-select-issuer show" v-else-if="assethosts[data.item.code]">{{assethosts[data.item.code]}}</span>
          <span class="asset-select-issuer show" v-else>{{data.item.issuer|miniaddress}}</span>

        </template>
        <template slot="item" slot-scope="data">
          <span class="asset-select-code">{{data.item.code}}</span>
          <span class="asset-select-issuer show" v-if="assethosts[data.item.issuer]">{{assethosts[data.item.issuer]}}</span>
          <span class="asset-select-issuer show" v-else-if="assethosts[data.item.code]">{{assethosts[data.item.code]}}</span>
          <span class="asset-select-issuer show" v-else>{{data.item.issuer|miniaddress}}</span>
        </template>
      </v-select>
     </div>
    
  <scroll :refresh="reload">
    <!-- 菜单： 充值/提现  -->
    <div class="menu-wrapper" v-if="selectedasset.code">
      <ul class="menu-ul">
        <li :class="'menu-li ' + (active==='deposit'?'active':'')" @click="switchMenu('deposit')">{{$t('DW.Deposit')}}</li>
        <li :class="'menu-li ' + (active==='withdraw'? 'active':'')" @click="switchMenu('withdraw')">{{$t('DW.Withdraw')}}</li>
      </ul>
    </div>

    <!-- 内容： 充值/提现 -->
    <card class="dw-card" padding="10px 10px" margin="10px 0px" v-if="selectedasset.code">
      <div class="dw-card-content" slot="card-content">
        
        <v-progress-circular indeterminate color="primary" v-if="working"></v-progress-circular>

        <div class="dw-error" v-if="!working && error">
          {{$t('DW.Error.NoDepositServiceDesc')}}
        </div>

        <div class="dw" v-if="!working && selectedasset.code && active==='deposit'">
          <div class="dw-table" v-if="deposits.length > 0 ">
            <div class="flex-row textcenter">
              <div class="flex1">TX</div>
              <div class="flex1">{{$t('DateTime')}}</div>
              <div class="flex1">{{$t('Amount')}}</div>
            </div>
            <div class="flex-row textcenter" v-for="item in deposits" :key="item.tx">
              <div class="flex1" @click="toTX(item)">{{item.tx | miniaddress}}</div>
              <div class="flex1">{{item.datetime}}</div>
              <div class="flex1">{{Number(item.amount)}}</div>
            </div>
          </div>
          <div class="dw-table" v-else>
            {{$t('Error.ValueIsNull')}}
          </div>
        </div>

        <div class="dw-table" v-if="!working && selectedasset.code &&  active==='withdraw'">
          <div class="dw-table" v-if="withdraws.length > 0 ">
            <div class="flex-row textcenter">
              <div class="flex1">TX</div>
              <div class="flex1">{{$t('DateTime')}}</div>
              <div class="flex1">{{$t('Amount')}}</div>
            </div>
            <div class="flex-row textcenter" v-for="item in withdraws" :key="item.tx">
              <div class="flex1"  @click="toTX(item)">{{item.tx | miniaddress}}</div>
              <div class="flex1">{{item.datetime}}</div>
              <div class="flex1">{{Number(item.amount)}}</div>
            </div>
          </div>
          <div class="dw-table" v-else>
            {{$t('Error.ValueIsNull')}}
          </div>
        </div>

      </div>
    </card>    
   
  </scroll>

  </div>
</template>


<script>
import Card from './Card'
import {mapState, mapActions, mapGetters} from 'vuex'
import {cancel as cancelOffer} from '@/api/offer'
import {DEFAULT_INTERVAL} from '@/api/gateways'
import Scroll from '@/components/Scroll'
import {myofferConvert} from '@/api/offer'
import { isNativeAsset } from '@/api/assets'
import Loading from './Loading'
import { Decimal } from 'decimal.js'
import { getXdrResultCode } from '@/api/xdr'
import { getDepositAndWithdrawRecords } from '@/api/fchain'
import  defaultsDeep  from 'lodash/defaultsDeep'
var moment = require('moment')

const TYPE_DEPOSIT = 'deposit'
const TYPE_WITHDRAW = 'withdraw'

  export default {
    data() {
      return {
        selectedasset:{},
        assetChoseReturnObject: true,
        working: false,
        records:{},
        active: TYPE_DEPOSIT,
        error: null,

      
      }
    },
    computed: {
      ...mapState({
        account: state => state.accounts.selectedAccount,
        assethosts: state => state.asset.assethosts,
        accountData: state => state.accounts.accountData,
      }),
      ...mapGetters([
        'balances',
      ]),
      assets(){
        if(!this.balances)return []
        let data = []
        this.balances.forEach((element) => {
          if( !isNativeAsset(element)){
            data.push(defaultsDeep({id: element.code+"-"+element.issuer}, element))
          }
        })
        return data
      },
      deposits(){
        if(!this.records.deposit)return []
        return this.records.deposit.map(item=>{ 
          return defaultsDeep({}, item, {datetime: moment(item.time*1000).format('L')})
          //return _.defaultsDeep({}, item, {datetime: new Date(item.time*1000).toLocaleString()})
        })
      },
      withdraws(){
        if(!this.records.withdraw)return []
        return this.records.withdraw.map(item=>{
          return defaultsDeep({}, item, {datetime: moment(item.time*1000).format('L')})
          //return _.defaultsDeep({}, item, {datetime: new Date(item.time*1000).toLocaleString()})
        })
      },
     
    },
    methods: {
      reload(){
        return new Promise((resolve,reject)=>{
          this.queryDW()
          resolve()
        })
      },
      queryDW(){
        console.log(this.selectedasset.code)
        console.log(!this.selectedasset.code)
        console.log(this.working)
        if(!this.selectedasset.code)return;
        if(this.working)return
        this.working = true
        this.error = null
          getDepositAndWithdrawRecords(this.account.address, this.selectedasset.code, this.selectedasset.issuer)
          .then(response=>{
            this.records = response.data
            this.working = false
          }).catch(err=>{
            this.working = false
            this.records = {}
            this.error = err.message
          })
      },
      switchMenu(type){
        this.active = type
      },
      changeAsset(){
        this.$nextTick(()=>{
          this.queryDW()
        })
      },
      copy(value){
        if(cordova.plugins.clipboard){
          cordova.plugins.clipboard.copy(value)
          this.$toasted.show(this.$t('CopySuccess')+":"+value)
        }
      },
      toTX(item){
        this.$router.push({
          name: 'Transaction',
          params: {
            tx: item.tx,
            flag: this.active === TYPE_DEPOSIT ? 'DW.Deposit' : 'DW.Withdraw',
            isInbound: this.active === TYPE_DEPOSIT ? true : false,
            asset: this.selectedasset,
            amount: Number(item.amount)
          }
        })
      },

    },
    components: {
      Card,
      Scroll,
      Loading
    }
  }
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.content
  padding: 0px 10px
.menu-wrapper
  height: 32px
  line-height: 32px
  .menu-ul
    display: flex;
    justify-content: center;
    .menu-li
      float: left
      color: $primarycolor.font
      padding-left: 10px
      padding-right: 10px
      height: 32px
      line-height: 32px
      width: 42%
      text-align: center
      font-size: 16px
    .menu-li.active
      color: $primarycolor.green
      border-bottom: 1px solid $primarycolor.green
.selectasset
  color: $primarycolor.green
.asset-select-code
  font-size: 16px
.asset-select-issuer
  font-size: 12px
  padding-left: 10px
  padding-top: 1px
.select-wrapper
  padding-left: 10px
  padding-right: 10px
.dw-card
  background: $secondarycolor.gray
</style>
