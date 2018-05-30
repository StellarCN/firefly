/**
 * 
 */
<template>
  <div class="page">
    <toolbar :title="$t(title)" :showbackicon="false" ref="toolbar">
      <v-btn icon @click.native="showAccounts" slot="left-tool">
          <i class="material-icons">repeat</i>
      </v-btn>
    
       <v-btn icon slot='right-tool' @click="pickershow()" v-if="islogin">
        <i class="material-icons">&#xE145;</i>
      </v-btn>
      <span slot="switch_password">{{$t('Account.Password')}}</span>
    </toolbar>
    <accounts-nav :show="showaccountsview" @close="closeView"/>

    <div class="content">
      <picker @select="pairchosen" 
              :data="items" 
              :selected-index="[itemsInitOrder,itemsInitOrder]"
              ref="picker1"
              title="" 
              :cancelTxt="$t('Cancel')"
              :confirmTxt="$t('Confirm')"
      ></picker>
      
      <v-tabs class="tabs-bg-dark" hide-slider grow color="transparent">
        <v-tab class="tab1" @click="doFilter('XCN')">XCN</v-tab>
        <v-tab class="tab1" @click="doFilter('XFF')">XFF</v-tab>
        <v-tab class="tab1" @click="doFilter('XLM')">XLM</v-tab>
        <v-tab class="tab1" @click="doFilter('BTC')">BTC</v-tab>
        <v-tab class="tab1" @click="doFilter('ETH')">ETH</v-tab>
        <v-tab class="tab1" @click="doFilter('_CUSTOM')">{{$t('custom')}}</v-tab>
      </v-tabs>

      <card class="trade-card" padding="0px 0px">
        <div class="card-content trade-card-content" slot="card-content">
          <scroll :refresh="refresh" :readLabelTxt="readLabelTxt">
          <ul class="tradepairs-ul">
            <transition-group>
            <li class="tradepair-li" v-for="(pair,index) in pairs" :key="index"
              v-touch="{
                    left: () => selectedItem = index,
                    right: () => selectedItem = null
                  }"
              >

              <v-layout class="pair-wrapper" row :swiper="pair.custom ? 1.5:0" @click="trade(index,pair)">
                <v-flex xs4>
                  <div class="flex-row">
                    <div class="flex3 from-wrapper">
                      <div class="code">{{pair.from.code}}</div>
                      <div class="issuer" v-if="assethosts[pair.from.code]">{{assethosts[pair.from.code]}}</div>
                      <div class="issuer" v-else-if="assethosts[pair.from.issuer]">{{assethosts[pair.from.issuer]}}</div>
                      <div class="issuer" v-else>{{pair.from.issuer | miniaddress}}</div>
                    </div>
                    <div class="flex1 exchange-wrapper">
                      <div class="exchange">
                        <i class="icons material-icons">&#xE8D4;</i>
                      </div>
                    </div>
                    <div class="flex3 to-wrapper">
                      <div class="code">{{pair.to.code}}</div>
                      <div class="issuer" v-if="assethosts[pair.to.code]">{{assethosts[pair.to.code]}}</div>
                      <div class="issuer" v-else-if="assethosts[pair.to.issuer]">{{assethosts[pair.to.issuer]}}</div>
                      <div class="issuer" v-else>{{pair.to.issuer | miniaddress}}</div>
                    </div>
                  </div>
                </v-flex>
                <v-flex xs8>
                  <k-line 
                    :base="pair.from" :counter="pair.to" 
                    :height="56" :timeout="10*index"
                    :tradepairIndex="pair.tradepairIndex"
                    :ref="'kline'+pair.tradepairIndex"
                    ></k-line>
                </v-flex>
              </v-layout>
              <div class="operate-box" v-if="pair.custom">
                <div class="del" @click="del(index,pair)">
                  <div class="refreshimg" v-if="delworking"></div>
                  <div v-else>{{$t('Delete')}}</div>
                </div>
                <div class="trade" @click="trade(index,pair)">{{$t('Trade.Trade')}}</div>
              </div>
              </li>
            </transition-group>
          </ul>
          </scroll>
        </div>
      </card>
    </div>

     <v-snackbar
      :timeout="5000"
      bottom
      vertical
      v-model="snackbar"
      :color = 'snackbarColor'
      >
      {{ snackbarText }}
        <v-btn flat  dark small @click.native="snackbar = false">{{$t('Close')}}</v-btn>
      </v-snackbar>
      <!-- <tab-bar/> -->
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import Picker from "@/components/picker"
import TradePairPicker from '@/components/TradePairPicker'
import AccountsNav from '@/components/AccountsNav'
import { mapState, mapActions,mapGetters} from 'vuex'
import { miniAddress } from '@/api/account'
import { isNativeAsset } from '@/api/assets'
import KLine from '@/components/KLine'
import TabBar from '@/components/TabBar'
import { getTradeAggregation,getTradeAggregation1day,RESOLUTION_1HOUR } from '@/api/tradeAggregation'
import { getAsset } from '@/api/assets'
import { getTrades } from '@/api/trade'
var moment = require('moment')
import {Decimal} from 'decimal.js'
import Scroll from '@/components/Scroll'
import { REMOVE_TRADEPAIR_KLINE_DATA } from '@/store/modules/AccountsStore' 
import { getDefaultTradePairs } from '@/api/gateways'

const TAG_ALL = 'All', TAG_XCN = 'XCN', TAG_XLM = 'XLM', TAG_BTC = 'BTC', TAG_ETH = 'ETH', TAG_CUSTOM = '_CUSTOM'


export default {
  data(){
    return {
      title: 'Menu.TradeCenter',
      showbackicon: false,
      showmenuicon: true,
      working: false,
      delworking: false,//正在删除
      isadd: false,//打开新增窗口
      addpair:null,
      snackbarText: '',
      snackbar: false,
      snackbarColor: 'primary',
      filterTag: TAG_XCN,

      showaccountsview: false,

      selectedItem: null,

    }
  },
  computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      tradepairs: state => state.accounts.tradepairs,
      islogin: state => state.accounts.accountData.seed ? true:false,
      assethosts: state => state.asset.assethosts,
      notfunding: state => state.account.account_not_funding,
      tradePairKLineData: state => state.accounts.tradePairKLineData
    }),
    ...mapGetters([
      'balances',
    ]),
    readLabelTxt(){
      try{
        if(this.tradePairKLineData){
          let result = this.$t('lastUpdate')+':'
          for(let key in this.tradePairKLineData){
            result += new moment(this.tradePairKLineData[key].date).format('YYYY-MM-DD HH:mm:ss')
            break
          }
          return result
        }
      }catch(err){
        console.error(err)
      }
      return 'ReleaseToRefresh'
    },
    pairs(){
      let result = []
      if(this.filterTag === TAG_CUSTOM){
        this.tradepairs.custom.forEach((item,index)=>{
          result.push(Object.assign({}, item,{tradepairIndex: 'custom_'+index, custom: true}))
        })
        return result
      }
      this.tradepairs.sys.forEach((item,index)=>{        
        if(this.filterTag === TAG_ALL || item.to.code === this.filterTag){
          result.push(Object.assign({},item,{tradepairIndex: 'sys_'+index, custom: false}))
        }
      })
      return result
    },
    items(){
      if(!this.balances)return []
      let values = []
      let hosts = []
      this.balances.forEach((element) => {
        values.push(element.code)
        if(isNativeAsset(element)){
          hosts.push(this.assethosts[element.code])
        }else{
          if(this.assethosts[element.issuer]){
            hosts.push(this.assethosts[element.issuer])
          }else{
            hosts.push(miniAddress(element.issuer))
          }
        }
      })
      var x = []
      this.balances.forEach((element,i)=>{
        let y = {'value':i,text:{'code':element.code,host:hosts[i]}}
        x.push(y)
      })     
      return x
      // return [{values,hosts},{values,hosts}]
    },
    itemsInitOrder(){
      if(!this.items.length) return
      return parseInt((this.items.length-1)/2)
    },

  },
  beforeMount(){
    //保存默认的交易对
    this.saveDefaultTradePairs()
  },
  mounted(){
    // if(!this.islogin){
    //   this.$refs.toolbar.showPasswordLogin()
    //   return
    // }

  },
  methods: {
    ...mapActions({
      deleteTradePair: 'deleteTradePair',
      createNewTradePair: 'addTradePair',
      switchTradePair: 'switchTradePair',
      selectTradePair: 'selectTradePair',
      getAssetsAccount: 'assetsAccount',
      saveDefaultTradePairs: 'saveDefaultTradePairs',

    }),

    showAccounts(){
        this.showaccountsview = true
    },
    closeView(){
        this.showaccountsview = false
    },
    pickershow(){
      if(this.notfunding){
        this.snackbarText = this.$t('Error.AccountNotFund')
        this.snackbarColor = 'primary'
        this.snackbar = true
        return
      }
      this.$refs.picker1.show()
    },
    pairchosen(pickerSelectedIndex){
      console.log("selectedIndex" + pickerSelectedIndex)
      if(pickerSelectedIndex[0] === pickerSelectedIndex[1]){
        this.snackbarText = this.$t('Error.AddTradePair.SameAsset')
        this.snackbarColor = 'error'
        this.snackbar = true
        return
      }
      this.checkTradePair(pickerSelectedIndex)
    },
    checkTradePair(indexPair){
      let from_code  = this.balances[indexPair[0]].code
      let from_issuer = this.balances[indexPair[0]].issuer
      let to_code = this.balances[indexPair[1]].code
      let to_issuer = this.balances[indexPair[1]].issuer
      let pair =  { from: {code:from_code,issuer:from_issuer}, 
              to: { code: to_code, issuer: to_issuer}  }
      let key = from_code + (from_issuer||'stellar.org') + to_code + (to_issuer||'stellar.org')
      for (let tp of this.tradepairs.custom){
        let key1 = tp.from.code + (tp.from.issuer||'stellar.org')+tp.to.code + (tp.to.issuer||'stellar.org')
        let key2 = tp.to.code + (tp.to.issuer||'stellar.org')+tp.from.code + (tp.from.issuer||'stellar.org')
        if(key === key1 || key === key2){
          this.$toasted.error(this.$t('Error.AddTradePair.ExistPair'))
          return 
        }
      }
      return this.addOK(pair)
    },
    onPicker(v1,v2){
      let issuer1 = null
      let issuer2 = null
      this.balances.forEach(ele=>{
        if(ele.code === v1){
          issuer1 = ele.issuer
        }else if(ele.code === v2){
          issuer2 = ele.issuer
        }
      })
      this.addpair = { from: {code: v1, issuer: issuer1}, to: { code: v2, issuer: issuer2}  }
    },
    add(){
      this.isadd = true
    },
    addCancel(){
      this.addpair = null
      this.isadd = false
    },
    addOK(pair){
      console.log('pair adding')
      if(this.working)return
      this.working = true
      //判断是否可行，保存
      if(pair){
        this.isadd =  false
      }else{
        console.log('------------------------')
      }
      this.createNewTradePair(pair)
        .then(data=>{
          this.working = false
          this.$toasted.show(this.$t('Trade.AddTradePairSuccess'))
        })
        .catch(err=>{
          this.$toasted.error(this.$t('Error.AddTradePairFailed'))
          this.working = false
        })

    },
    del(index,pair){
      if(this.working)return
      if(this.delworking)return
      this.working = true
      this.delworking = true
      this.deleteTradePair({custom: pair.custom, index: pair.index, tradepair: pair})
          .then(data=>{
            this.$toasted.show(this.$t('Trade.DeleteTradePairSuccess'))
            this.working = false
            this.delworking = false
            this.selectedItem = null
            this.$store.commit('REMOVE_TRADEPAIR_KLINE_DATA', index)
          })
          .catch(err=>{
            this.working = false
            this.delworking = false
            this.$toasted.error(this.$t('Error.DeleteTradePairFailed'))
          })
    },
    switchPair(index,pair){
      if(this.working)return
      this.working = true
      let tradepair = { from: pair.to, to: pair.from }
      this.switchTradePair({custom: pair.custom, index: pair.index, tradepair})
        .then(data=>{
            this.$toasted.show(this.$t('Trade.SwitchTradePairSuccess'))
            this.working = false
            try{
              let doms = window.document.querySelectorAll('.pair-wrapper')
              for(var i=0,n=doms.length;i<n;i++){
                let element = doms[i]
                element.style.transition = "0.3s"
                element.style.marginLeft = 0 + "px"
              }
            }catch(error){
              console.error(error)
            }
        })
        .catch(err=>{
          this.working = false
          this.$toasted.error(this.$t('Error.SwitchTradePairFailed'))
        })
    },
    trade(index,tradepair){
      this.selectTradePair({custom: tradepair.custom, index: tradepair.tradepairIndex, tradepair})
      console.log('-------111-----22---')
      this.$router.push({name: 'Trade'})
    },
    doFilter(tag){
      this.filterTag = tag
    },
    refresh(){
      let funcs = []
      this.pairs.forEach(item=>{
        let key = 'kline'+item.tradepairIndex
        funcs.push(this.$refs[key][0].reload())
      })
      console.log('-----')
      console.log(funcs)
      return Promise.all(funcs)
    }
   
  },
  components: {
    Toolbar,
    Card,
    Picker,
    TradePairPicker,
    KLine,
    TabBar,
    //draggable,
    AccountsNav,
    Scroll
  }
}
</script>


<style lang="stylus" scoped>
@require '~@/stylus/color.styl'

.trade-card-content
  // border: 1px solid $secondarycolor.gray
  padding: 5px 5px
  background: $primarycolor.gray
  border-radius: 5px
.tradepairs-ul
  padding: 0px 0px
.tradepair-li
  overflow: hidden
  position: relative
  .pair-wrapper
    position: relative
    z-index: 2
    padding: 2px 2px 
    padding-bottom: 0px
    background: $secondarycolor.gray
    width: 100%
    overflow:hidden
    .from-wrapper
      width: 100%
      overflow: hidden
      .code
        font-size: 16px
        color: $primarycolor.font
        text-align: center
        padding-top:2px
      .issuer
        color: $secondarycolor.font
        text-align: center
        font-size: 14px
        overflow: hidden
    .to-wrapper
      width: 100%
      overflow: hidden
      .code
        font-size: 16px
        color: $primarycolor.font
        text-align: center
        padding-top:2px
      .issuer
        color: $secondarycolor.font
        text-align: center
        font-size: 14px
        overflow: hidden
    .exchange-wrapper
      .exchange
        text-align: center
        .icons.material-icons
          font-size: 20px
          color: $secondarycolor.font
          padding-top: 10px


.tradepair-li
  border-bottom: 1px solid $secondarycolor.font
  background: $primarycolor.gray
.tradepair-li:last-child
  border-bottom: 0px
.operate-box 
  position: absolute
  z-index: 1
  height: 100%
  right: 0
  top: 0
  display: flex
  padding: 1px 1px
  .trade
  .del
    display: flex
    justify-content: center
    align-items: center
    background-color: $primarycolor.gray
    color: $primarycolor.green
    padding: 0 12px
  .del
    //background-color: $secondarycolor.red
    //border-right: 1px solid $secondarycolor.gray
    color: $primarycolor.red
    text-align:center
    vertical-align: middle
    .refreshimg
      display: block
      width: 20px
      height: 20px
      background: url(../../assets/img/refresh-icon.png) no-repeat center center
      background-size: 16px 16px
      animation: rotate 2s infinite
      animation-timing-function: linear
      margin: auto auto
.mask
  position: fixed
  top: 0
  bottom: 0
  background:$secondarycolor.gray
  opacity: 0.8
  z-index: 9
  left:0
  right:0
.picker
  z-index: 10
  position: fixed
  bottom: 0
.btn-group
  background:$secondarycolor.gray
  display: flex
  .btn-cancel
  .btn-ok
    flex: 1
    text-align: center
    height: 48px
    line-height: 48px
    font-size: 16px
    color: $primarycolor.green
.selected
  -webkit-transform: translate(-50%, 0)
  -webkit-transition: 0.3s
  transform: translate(-50%, 0)
  transition: 0.3s
.filter-tag.active
  color: $primarycolor.green
</style>

