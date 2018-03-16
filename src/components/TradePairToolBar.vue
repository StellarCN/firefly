/*
 * 交易界面toolbar，可以选择交易对
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-02-08 15:40:36 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-03-16 17:16:10
 * @License MIT 
 */


<template>
  <div class="trade-tb">
    <!-- toolbar -->
    <v-toolbar color="primary" dark dense :clipped-left='true' app>
      <v-btn icon @click="back"><v-icon>keyboard_arrow_left</v-icon></v-btn>
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
        <div class="flex1 tb-icon"><i class="icons material-icons">keyboard_arrow_down</i></div>
        <div class="flex1">&nbsp;</div>
      </div>
      
      <v-btn icon @click="doSwitchTradePair">
        <i class="material-icons">swap_horiz</i>
      </v-btn>
    </v-toolbar>

    <!--  选择交易队内容 -->
    <v-dialog class="tb-dlg" v-model="showChoseTradeDlg" fullscreen transition="dialog-bottom-transition" :overlay=false>
      <v-toolbar color="primary" dark app dense :clipped-left='true'>
        <v-btn icon @click="showChoseTradeDlg = false"><v-icon>keyboard_arrow_left</v-icon></v-btn>
        <div class="toolbar__title toolbar-title white--text textcenter tb-title">{{$t("Trade.SelfSelection")}}</div>
        <v-btn icon style="visibility:hidden;"><v-icon class="back-icon"></v-icon></v-btn>
      </v-toolbar>
      <v-card class="dlg-content mt-5">
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
      </v-card>
    </v-dialog>


  </div>  
</template>

<script>
import { mapState, mapActions, mapGetters} from 'vuex'

export default {
  data(){
    return {
      showChoseTradeDlg: false,
    }
  },
  computed:{
    ...mapState({
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
      this.selectTradePair({index, tradepair})
      this.showChoseTradeDlg = false
      this.$emit('choseTradePair',{index,tradepair})
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
    },


  },
  


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
  padding-top: 70px!important
.row100
  width: 100vw
  &.active
    color: $primarycolor.green
.tb-dlg
  z-index:99
</style>
