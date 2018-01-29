/**
 * 
 */
<template>
  <div class="page">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      ref="toolbar"
      >
      <!-- <div class="right" slot="right-tool" @click="add" v-if="islogin">
        <i class="material-icons">&#xE145;</i>
      </div> -->
       <v-btn icon slot='right-tool' @click="pickershow()" v-if="islogin">
        <i class="material-icons">&#xE145;</i>
      </v-btn>
      <span slot="switch_password">{{$t('Account.Password')}}</span>
    </toolbar>
    <div class="content">
      <picker @select="pairchosen" 
              :data="items" 
              :selected-index="[itemsInitOrder,itemsInitOrder]"
              ref="picker1"
              title="" 
              :cancelTxt="$t('Cancel')"
              :confirmTxt="$t('Confirm')"
      ></picker>
      
      <card class="trade-card" padding="10px 10px">
        <div class="card-content" slot="card-content">
      
          <ul class="tradepairs-ul">
            <li class="tradepair-li" v-for="(pair,index) in tradepairs" :key="index">
              <v-layout class="pair-wrapper" row wrap v-swiper=2  @click="trade(index,pair)">
                <v-flex xs4 class="from-wrapper">
                  <div class="code">{{pair.from.code}}</div>
                  <div class="issuer" v-if="assethosts[pair.from.code]">{{assethosts[pair.from.code]}}</div>
                  <div class="issuer" v-else-if="assethosts[pair.from.issuer]">{{assethosts[pair.from.issuer]}}</div>
                  <div class="issuer" v-else>{{pair.from.issuer | miniaddress}}</div>
                </v-flex>
                <v-flex xs1 class="exchange-wrapper">
                  <div class="exchange">
                    <i class="icons material-icons">&#xE8D4;</i>
                  </div>
                </v-flex>
                <v-flex xs4 class="to-wrapper">
                  <div class="code">{{pair.to.code}}</div>
                  <div class="issuer" v-if="assethosts[pair.to.code]">{{assethosts[pair.to.code]}}</div>
                  <div class="issuer" v-else-if="assethosts[pair.to.issuer]">{{assethosts[pair.to.issuer]}}</div>
                  <div class="issuer" v-else>{{pair.to.issuer | miniaddress}}</div>
                </v-flex>
                <v-flex xs3>
                  <k-line :base="pair.from" :counter="pair.to" :height="56"></k-line>
                </v-flex>

              </v-layout>
              <div class="operate-box">
                <div class="del" @click="del(index,pair)">
                  <div class="refreshimg" v-if="delworking"></div>
                  <div v-else>{{$t('Delete')}}</div>
                </div>
                <div class="trade" @click="trade(index,pair)">{{$t('Trade.Trade')}}</div>
              </div>
              
            </li>
          </ul>

        </div>
      </card>
    </div>

    <div class="mask" v-if="isadd">
     
     
      <!-- <picker class="picker" v-model="isadd" :data-items="items" @change="onPicker">
        <div class="bottom-content" slot="bottom-content">
          <div class="btn-group">
            <div class="btn-cancel" @click="addCancel">{{$t('Button.Cancel')}}</div>
            <div class="btn-ok" @click="addOK">{{$t('Button.OK')}}</div>
          </div>
        </div>
      </picker> -->
     <!--
     <trade-pair-picker :items="items"></trade-pair-picker>
     -->
    </div>
     <v-snackbar
      :timeout="5000"
      bottom
      vertical
      v-model="snackbar"
      :color = 'snackbarColor'
      >
      {{ snackbarText }}
        <v-btn outline dark small @click.native="snackbar = false">{{$t('Close')}}</v-btn>
      </v-snackbar>
  </div>
</template>

<script>
import Toolbar from '../../components/Toolbar'
import Card from '../../components/Card'
// import Picker from '../../libs/vue-picker'
import Picker from "@/components/picker"
import TradePairPicker from '../../components/TradePairPicker'


import { mapState, mapActions,mapGetters} from 'vuex'
import { miniAddress } from '@/api/account'
import KLine from '@/components/KLine'
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
      snackbarColor: 'primary'

    }
  },
  computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      tradepairs: state => state.accounts.accountData.tradepairs,
      islogin: state => state.accounts.accountData.seed ? true:false,
      assethosts: state => state.asset.assethosts,
      notfunding: state => state.account.account_not_funding
    }),
    ...mapGetters([
      'balances',
    ]),
    items(){
      if(!this.balances)return []
      let values = []
      let hosts = []
      this.balances.forEach((element) => {
          values.push(element.code)
          if(this.assethosts[element.code]){
            hosts.push(this.assethosts[element.code])
          }else if(this.assethosts[element.issuer]){
            hosts.push(this.assethosts[element.issuer])
          }else{
            hosts.push(miniAddress(element.issuer))
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
  mounted(){
    if(!this.islogin){
      this.$refs.toolbar.showPasswordLogin()
      return
    }
  },
  methods: {
    ...mapActions({
      deleteTradePair: 'deleteTradePair',
      createNewTradePair: 'addTradePair',
      switchTradePair: 'switchTradePair',
      selectTradePair: 'selectTradePair',
      getAssetsAccount: 'assetsAccount'

    }),
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
      for (let tp of this.tradepairs){
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
      this.deleteTradePair({index: index, tradepair: pair})
          .then(data=>{
            this.$toasted.show(this.$t('Trade.DeleteTradePairSuccess'))
            this.working = false
            this.delworking = false
            try{
              let doms = window.document.querySelectorAll('.myassets-li')
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
            this.delworking = false
            this.$toasted.error(this.$t('Error.DeleteTradePairFailed'))
          })
    },
    switchPair(index,pair){
      if(this.working)return
      this.working = true
      let tradepair = { from: pair.to, to: pair.from }
      this.switchTradePair({index, tradepair})
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
      this.selectTradePair({index,tradepair})
      this.$router.push({name: 'Trade'})
    }
   
  },
  components: {
    Toolbar,
    Card,
    Picker,
    TradePairPicker,
    KLine
  }
}
</script>


<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.page
  background: $primarycolor.gray
  .content
    padding: 10px 10px

.tradepairs-ul
  padding: 0px 0px
.tradepair-li
  overflow: hidden
  position: relative
  .pair-wrapper
    position: relative
    z-index: 2
    padding: 2px 2px 
    background: $secondarycolor.gray
    width: 100%
    .from-wrapper
      .code
        font-size: 16px
        color: $primarycolor.font
        text-align: center
        padding-top:2px
      .issuer
        color: $secondarycolor.font
        text-align: center
    .to-wrapper
      .code
        font-size: 16px
        color: $primarycolor.font
        text-align: center
        padding-top:2px
      .issuer
        color: $secondarycolor.font
        text-align: center
    .exchange-wrapper
      .exchange
        text-align: center
        .icons.material-icons
          font-size: 32px
          color: $secondarycolor.font
          padding-top: 10px


.tradepair-li
  border-bottom: 1px solid $secondarycolor.font
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
    background-color: $secondarycolor.green
    color: $primarycolor.font
    padding: 0 12px
  .del
    background-color: $secondarycolor.red
    border-right: 1px solid $secondarycolor.gray
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

</style>

