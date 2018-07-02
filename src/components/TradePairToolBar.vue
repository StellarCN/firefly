/*
 * 交易界面toolbar，可以选择交易对
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-02-08 15:40:36 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-07-02 18:06:02
 * @License MIT 
 */


<template>
  <div class="trade-tb">
    <!-- toolbar -->
    <v-toolbar color="primary" flat dense app :clipped-left='true'>
      <v-btn icon @click="back"><i class="icons material-icons font32">keyboard_arrow_left</i></v-btn>
      <div class="toolbar__title toolbar-title white--text textcenter tb-title flex-row" @click.stop="showChoseTradeDlg = true">
        <div class="flex1">&nbsp;</div>
        <div class="flex2 textcenter">
          <div class="tb-code">{{BaseAsset.code}}</div>
          <div class="tb-issuer" v-if="assethosts[BaseAsset.code]">{{assethosts[BaseAsset.code]}}</div>
          <div class="tb-issuer" v-else-if="assethosts[BaseAsset.issuer]">{{assethosts[BaseAsset.issuer]}}</div>
          <div class="tb-issuer" v-else>{{BaseAsset.issuer | miniaddress}}</div>
        </div>
        <div class="flex1 textcenter tb-icon"><i class="icons material-icons">&#xE8D4;</i></div>
        <div class="flex2 textcenter">
          <div class="tb-code">{{CounterAsset.code}}</div>
          <div class="tb-issuer" v-if="assethosts[CounterAsset.code]">{{assethosts[CounterAsset.code]}}</div>
          <div class="tb-issuer" v-else-if="assethosts[CounterAsset.issuer]">{{assethosts[CounterAsset.issuer]}}</div>
          <div class="tb-issuer" v-else>{{CounterAsset.issuer | miniaddress}}</div>
        </div>
        <div class="flex1 tb-icon"><i class="icons material-icons font28">keyboard_arrow_down</i></div>
        <div class="flex1">&nbsp;</div>
      </div>
      
      <v-btn icon @click="doSwitchTradePair">
        <i class="material-icons font28">swap_horiz</i>
      </v-btn>
    </v-toolbar>

    <!--  选择交易队内容 -->
    <div class="tb-dlg" v-if="showChoseTradeDlg" transition="dialog-bottom-transition" >
      <!-- <v-system-bar status :color="iosstatusbarcolor" v-if="isIos" app>
        <v-spacer></v-spacer>
      </v-system-bar> -->
      <status-bar/>
      <v-toolbar color="primary" flat dense :clipped-left='true'>
        <v-btn icon @click="showChoseTradeDlg = false"> <i class="material-icons font32">keyboard_arrow_left</i></v-btn>
        <div class="toolbar__title toolbar-title white--text textcenter tb-title">{{$t("Trade.SelfSelection")}}</div>
        <v-btn icon style="visibility:hidden;"><v-icon class="back-icon"></v-icon></v-btn>
      </v-toolbar>
      <div class="dlg-content">
        <div v-for="(item,index) in tradepairs" :key="index" :class="'flex-row row100 pt-2 pb-2 ' + (isChoosenTrade(item.from,item.to) ? 'active':'')" @click="choseTrade(index,item)">
          <div class="flex2">&nbsp;</div>
          <div class="flex3 textcenter">
            <div class="tb-code">{{item.from.code}}</div>
            <div class="tb-issuer" v-if="assethosts[item.from.code]">{{assethosts[item.from.code]}}</div>
            <div class="tb-issuer" v-else-if="assethosts[item.from.issuer]">{{assethosts[item.from.issuer]}}</div>
            <div class="tb-issuer" v-else>{{item.from.issuer | miniaddress}}</div>
          </div>
          <div class="flex2 textcenter tb-icon"><i class="icons material-icons">&#xE8D4;</i></div>
          <div class="flex3 textcenter">
            <div class="tb-code">{{item.to.code}}</div>
            <div class="tb-issuer" v-if="assethosts[item.to.code]">{{assethosts[item.to.code]}}</div>
            <div class="tb-issuer" v-else-if="assethosts[item.to.issuer]">{{assethosts[item.to.issuer]}}</div>
            <div class="tb-issuer" v-else>{{item.to.issuer | miniaddress}}</div>
          </div>
          <div class="flex2">&nbsp;</div>
        </div>
      </div>
    </div>


  </div>  
</template>

<script>
import { mapState, mapActions, mapGetters} from 'vuex'
import StatusBar from './StatusBar.vue';

export default {
  data(){
    return {
      showChoseTradeDlg: false,
      isios: false,

    }
  },
  computed:{
    ...mapState({
      alltradepairs: state => state.accounts.tradepairs,
      selectedTrade: state => state.accounts.selectedTradePair.tradepair,
      selectedTradeIndex: state => state.accounts.selectedTradePair.index,
      assethosts: state => state.asset.assethosts,
      iosstatusbarcolor: state => state.iosstatusbarcolor,
      isIos: state => state.app.isIos,

    }),
    ...mapGetters([
      'balances',
      'native',
      'reserve',
      'base_reserve'
    ]),
    tradepairs(){
      let result = []
      this.alltradepairs.sys.forEach((item,index)=>{
        result.push(Object.assign({},item,{custom: false, index}))
      })
      this.alltradepairs.custom.forEach((item,index)=>{
        result.push(Object.assign({},item,{custom: true, index}))
      })
      return result;
    },
     BaseAsset(){
      return this.selectedTrade.from
    },
    BaseBalance(){
      if(isNativeAsset(this.BaseAsset)){
        return this.nativeBalance
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
    
  },
  methods: {
    ...mapActions({
      switchTradePair: 'switchTradePair',
      selectTradePair: 'selectTradePair',
      switchSelectedTradePair: 'switchSelectedTradePair',
    }),
    back(){
      this.$router.back()
    },
    isChoosenTrade(from, to){
      let key = this.BaseAsset.code + this.BaseAsset.issuer + this.CounterAsset.code + this.CounterAsset.issuer
      let key2 = from.code + from.issuer + to.code + to.issuer
      return key === key2
    },
    choseTrade(index,tradepair){//选择交易对
      let data = {custom: tradepair.custom, index: tradepair.index, tradepair}
      this.selectTradePair(data)
      this.showChoseTradeDlg = false
      this.$emit('choseTradePair',data)
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
    doSwitchTradePair(){
      this.switchSelectedTradePair()
      this.$emit('switchTradePair')
    },


  },

  components:{
    StatusBar,
  }
  


}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.tb-title
  width: 100vw
  padding-top: 2px
.tb-code
  font-size: 16px
  line-height: 24px
.tb-issuer
  font-size: 14px
  line-height: 16px
  vertical-align: top
.tb-icon
  padding-top: 8px
  .material-icons
    font-size: 24px
.dlg-content
  background: $primarycolor.gray
  padding-top: 24px!important
  // padding-top: calc(24px + constant(safe-area-inset-top))!important
  // padding-top: calc(24px + env(safe-area-inset-top))!important
  padding-bottom: 48px!important
  padding-bottom: calc(48px + constant(safe-area-inset-bottom))!important
  padding-bottom: calc(48px + env(safe-area-inset-bottom))!important
  overflow-y: auto
  -webkit-overflow-scrolling: touch
  height: 100%!important
.row100
  width: 100vw
  &.active
    color: $primarycolor.green
.tb-dlg
  position: fixed
  top: 0
  left: 0
  bottom: 0
  right: 0
  z-index:99
  padding-top: 0
  padding-top: constant(safe-area-inset-bottom)!important
  padding-top: env(safe-area-inset-bottom)!important
</style>
