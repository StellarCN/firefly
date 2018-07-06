// 发送资产界面
<template>
  <div class="send-asset-wrapper">
    
    <!-- 显示支付界面 -->
    <div class="confirm-wrapper" v-show="step === 0">
      <div class="confirm-blank"></div>
      <div  class="confirm-dlg">
      <v-bottom-sheet v-model="showSendDlg" persistent dark>
        <div class="send-dlg-content sheet-content">
          <div class="menu-head">
            <div class="menu-row">
              <div class=" menu-row-1">
                <v-icon class="avatar iconfont icon-erweima" color="primary"></v-icon>
              </div>
            </div>
            <div class="menu-row menu-row-2">
              <div class="name">{{account.name}}</div>
              <div class="address">{{account.address | shortaddress}}</div>
            </div>
            <div style="clear:both"></div>
          </div>
          
          <div class="confirm-content">
            <div class="confirm-title">
              <span v-if="appname">{{$t('Third.SendTo',[appname])}}</span>
              <span v-else>{{$t('Third.SendTo',[target])}}</span>
            </div>
            <div class="confirm-amount">{{Number(Number(amount).toFixed(7))}}&nbsp;&nbsp;{{asset_code}}</div>
            <div class="confirm-title" v-if="memo">
              <span>{{$t('Memo')}}</span>
              <span v-if="memo_type">({{memo_type}})</span>
            </div>
            <div class="confirm-memo" v-if="memo">{{memo}}</div>
            <div class="confirm-title">{{$t('ChooseAsset')}}</div>
            <div class="confirm-assets">
              <swiper :options="swiperOpt"  ref="swiperRef">
                <swiper-slide v-for="(item,index) in payments" :key="index">
                  <div :class="'asset-card textcenter ' + (choosed.code === item.code && choosed.issuer === item.issuer ? ' active' : ' ')">
                    <div class="asset-icon">
                      <i :class="'iconfont ' + assetIcon(item.code,item.issuer)"></i>
                    </div>
                    <div class="asset-code">{{item.code}}</div>
                    <div class="asset-issuer" v-if="assethosts[item.issuer]">{{assethosts[item.issuer] }}</div>
                    <div class="asset-issuer" v-else>{{item.issuer | miniaddress}}</div>
                    <div class="asset-amount">{{item.amount}}</div>
                </div>
                </swiper-slide>
              </swiper>
              <div class="loading-wrapper" v-if="loading">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </div>
              <div class="loading-wrapper textcenter" v-if="nodata">
                {{$t('Error.NoData')}}
              </div>
              
            </div>
          </div>

          <div class="confirm-btns flex-row textcenter">
            <div class="confirm-btn flex1" @click="exit">{{$t('Button.Cancel')}}</div>
            <div :class="'confirm-btn flex1 ' + (choosedIndex >=0 ? '':'disable-btn')" @click="showPwdDlg">{{$t('Button.OK')}}</div>
          </div>
        </div>
      </v-bottom-sheet>
      </div>
    </div>

    <!--显示密码输入界面-->
    <v-bottom-sheet persistent v-model="showPwdSheet" v-if="showPwdSheet" dark>
      <div class="sheet-content send-dlg-content">
        <div class="sheet-title textcenter">
          <div class="title">{{$t('payment')}} {{choosed.amount}}  {{choosed.code}}</div>
        </div>
        <div class="sheet-title">
          <div class="label">{{$t('Account.AccountName')}}</div>
          <div class="value">{{account.name}}</div>
        </div>
        <div class="sheet-input">
          <v-text-field
                name="password"
                :label="$t('Account.Password')"
                v-model="password"
                :append-icon="pwdvisible ? 'visibility' : 'visibility_off'"
                :append-icon-cb="() => (pwdvisible = !pwdvisible)"
                :type="pwdvisible ? 'text':'password'"
                required dark
              ></v-text-field>
        </div>
        <div  class="sheet-btns">
          <div class="sheet-btn" @click="resetState">{{$t('Button.Cancel')}}</div>
          <div class="sheet-btn" @click="doPayment">{{$t('payment')}}</div>
        </div>
      </div>
    </v-bottom-sheet>

    <loading :show="working" :loading="sending" :success="sendsuccess" :fail='sendfail' 
      color="red" :title="loadingTitle" :msg="loadingError" :closeable="sendfail" @close="hiddenLoading"/>

  </div>  
</template>

<script>
import { mapState, mapActions, mapGetters} from 'vuex'
import Card from '@/components/Card'
import Loading from '@/components/Loading'
import  defaultsDeep  from 'lodash/defaultsDeep'
import { shortAddress,canSend,sendByPathPayment, send } from '@/api/account'
import { COINS_ICON, FF_ICON, DEFAULT_ICON, WORD_ICON} from '@/api/gateways'
import { pathAssets } from '@/api/path'
import { isNativeAsset } from '@/api/assets'
import { readAccountData } from '@/api/storage'
import { swiper, swiperSlide } from 'vue-awesome-swiper'
import { xdrMsg,getXdrResultCode } from '@/api/xdr'

export default {
  data(){
    return {
      step: 0,//0是初始界面，1是输入密码界面，2是确认支付界面
      showSendDlg: true,//显示支付界面
      assets:[],//可以支付的资产，通过path payment计算出来
      nodata: false,
      showPwdSheet: false,
      password: null,
      pwdvisible: false,
      loading: false,//是否正在查询path
      choosed: {},
      choosedIndex: -1,
      swiperOpt: {
        //notNextTick: true,
        slidesPerView: 3,
        spaceBetween: 50,
        centeredSlides: true,
        //slidesPerView: 'auto',
        touchRatio: 0.2,
        slideToClickedSlide: true
        
      },

      working: false,
      sending: false,
      sendsuccess: false,
      sendfail: false,
      loadingTitle: null,
      loadingError: null,
      
    }
  },
  props: {
    appname: {
      type: String
    },
    destination: {
      type: String,
      required: true
    },
    asset_code: {
      type:String,
      required: true
    },
    asset_issuer: {
      type: String
    },
    amount: {
      type: Number,
      require: true
    },
    memo_type: {
      type: String,
      default: 'NONE'
    },
    memo: {
      type: String
    },
    pathPayment:{
      type: Boolean,
      default: true
    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      islogin: state => (state.accounts.accountData.seed ? true : false),
      assethosts: state => state.asset.assethosts,
      notfunding: state => state.account.account_not_funding
    }),
    ...mapGetters(["balances", "reserve", "native", "base_fee"]),
    target(){
      let result = undefined
      if(this.appname){
        result = this.appname + '(' + shortAddress(this.destination) + ')'
      }else{
        result = shortAddress(this.destination)
      }
      return result
    },
    swiperInstance() {
      return this.$refs.swiperRef.swiper
    },
    // 根据assets过滤，可以支付
    payments(){
      if(this.pathPayment)return this.assets
      return this.assets.filter(item=> item.path.length ===0).filter(item=>{
        if(isNativeAsset(this.asset_code, this.asset_issuer)){
          return isNativeAsset(item) ? true: false
        }else{
          if(this.asset_code === item.code && this.asset_issuer === item.issuer){
            return true
          }
          return false
        }
      })
    }
  },
  beforeMount () {
    this.fetchPaths()
  },
  mounted () {
    //this.swiperInstance.controller.control = this.swiperContent
    //this.swiperContent.controller.control = this.swiperTop
    this.swiperInstance.on('slideChange', this.slideChange)
    this.swiperInstance.slideTo(this.choosedIndex,0,true)
  },
  methods: {
    ...mapActions({
      sendAsset: 'sendAsset',
      sendPathPayment: 'sendPathPayment',
      getAccountInfo: 'getAccountInfo',
    }),
    slideChange(){
      this.choosedIndex = this.swiperInstance.activeIndex
      this.choosed = this.assets[this.choosedIndex]

    },
    assetIcon(code,issuer){
      return COINS_ICON[code] || WORD_ICON[code.substring(0,1)] || DEFAULT_ICON
    },
    showPwdDlg(){
      if(this.choosedIndex < 0)return
      if(this.islogin){
        this.doPayment()
        return
      }
      this.step = 1
      this.showSendDlg = false
      this.showPwdSheet = true
      this.password = null
      this.pwdvisible = false

    },
    resetState(){
      this.step = 0
      this.showSendDlg = true
      this.showPwdSheet = false
      this.password = null
      this.pwdvisible = false
    },
    doPayment(){
      if(this.islogin){
        if(this.working)return
        this.working = true
        this.sending = true
        this.send(this.accountData.seed)
        return
      }
      if(this.password === null || this.password.length === 0)return
      if(this.working)return
      this.working = true
      this.sending = true

      //校验密码是否正确
      readAccountData(this.account.address, this.password)
        .then(data=>{
          console.log(`-----------------check password----`)
          console.log(data)
          let seed = data.seed
          // 执行支付
          this.send(seed)

        })
        .catch(err => {
          console.log('----error-0---')
          console.error(err)
          this.sendfail = true
          this.loadingError = this.$t('Error.PasswordWrong')
        })


    },
    send(seed){
      this.sending = true
      this.loadingTitle = null
      this.loadingError = null

      if(this.choosed.id === this.choosed.destId){
        this.sendNoPath(seed)
      }else{
        this.sendByPath(seed)
      }

    },
    sendNoPath(seed){
      let params = {
        seed: this.accountData.seed || seed,
        address: this.account.address,
        target: this.destination,
        asset: {code: this.choosed.code, issuer: this.choosed.issuer},
        amount: this.amount,
        memo_type:  this.memo_type,
        memo_value: this.memo
      }

      this.sendAsset(params)
        .then(response=>{
          this.sendsuccess()
        })
        .catch(err=>{
          this.sendFail(err)
        })
    },
    sendByPath(may_seed){
      let seed = this.accountData.seed || may_seed
      let destination = this.destination
      let record = this.choosed.origin
      let memo_type =  this.memo_type
      let memo = this.memo
      this.sendPathPayment({seed,destination,record,memo_type,memo})
          .then(response=>{
            this.sendsuccess()
          })
          .catch(err=>{
            this.sendFail(err)
          })
    },
    sendSuccess(){
      this.sending = false
      this.sendsuccess = true
      this.loadingTitle = this.$t('SendAssetSuccess')
      //this.getAccountInfo(this.account.address)
      setTimeout(()=>{
        this.working =false
        this.sendsuccess = false //
        this.$emit('sendsuccess')
      },3000)
    },
    sendFail(err){
      console.log(err)
      this.sending = false
      this.sendfail = true
      let msg = getXdrResultCode(err)
      this.loadingTitle = this.$t('Error.SendAssetFail')
      if(msg){
        this.loadingError = this.$t(msg)
      }else{
        this.loadingError = this.$t(err.message)
      }
    },
    exit(){
      this.resetState()
      this.$emit('exit')
    },
    fetchPaths(){
      if(this.loading)return
      this.loading = true
      this.nodata = false
      //根据当前的数量，计算path payment
      pathAssets(this.account.address, this.destination, this.asset_code, this.asset_issuer, this.amount + '')
        .then(data => {
          // let values = {}
          // this.balances.map(item => 
          //   isNativeAsset(item) ? 
          //     Object.assign({},item,{id: item.code}) :  
          //     Object.assign({},item,{id: item.code + '-' + item.issuer }))
          //   .forEach(item => { values[item.id] = item })
          let paths = {}
          data.filter(record => Number(record.source_amount) > 0)
            .forEach(record => {
              const key = (record.source_asset_type === 'native') ?
                  'XLM' : record.source_asset_code + '-' + record.source_asset_issuer;

              if (key in paths) {
                if ((Number(paths[key].source_amount) - Number(record.source_amount)) > 0) {
                  paths[key] = record;
                }
              } else {
                paths[key] = record;
              }
            });
          this.assets = []
          this.balances.forEach(asset => {
            const key = isNativeAsset(asset)? asset.code : asset.code + '-' + asset.issuer
            if (key in paths) {
              let origin = paths[key]
              const amount = Number(origin.source_amount)
              //TODO 判断数量是否够，是否够支付费用的
              if(isNativeAsset(asset)){
                if(canSend(this.native.balance, this.reserve, amount, this.base_fee, 1)){
                  this.assets.push({
                    id: 'XLM',code: 'XLM', issuer: 'stellar.org', 
                    destId: origin.destination_asset_type === 'native' ? 
                      'XLM': origin.destination_asset_code + '-' + origin.destination_asset_issuer,
                    amount: Number(origin.source_amount), destination_amount: origin.destination_amount,
                    origin
                  })
                }
              }else{
                if( (asset.balance - amount >= 0) && 
                      canSend(this.native.balance, this.reserve, 0, this.base_fee, 1)){
                  this.assets.push({code: origin.source_asset_code, 
                    issuer: origin.source_asset_issuer, 
                    amount: Number(origin.source_amount), 
                    destination_amount: origin.destination_amount,
                    id: origin.source_asset_code + '-' + origin.source_asset_issuer,
                    destId: origin.destination_asset_type === 'native' ? 
                      'XLM': origin.destination_asset_code + '-' + origin.destination_asset_issuer,
                    origin
                  })
                }
              }

            }
          });

          if(this.assets.length > 0){
            this.choosed = this.assets[0]
            this.choosedIndex = 0
          }else{
            this.nodata = true
          }
          this.loading = false
        })
        .catch(err => {
          this.loading = false
          console.error(err)
          this.$toasted.error(ths.$t('FederationName.ConnectionFailed'))
        })
    },
    hiddenLoading(){
      this.sending = false
      this.sendfail = false
      this.working = false
    }
  },
  components: {
    Card,
    Loading,
    swiper,
    swiperSlide,
  }
}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/trade.styl'
.confirm-wrapper
  position: fixed
  bottom: 0
  // bottom: constant(safe-area-inset-bottom)
  // bottom: env(safe-area-inset-bottom)
  right: 0
  left: 0
  top: 0
  // top: constant(safe-area-inset-top)
  // top: env(safe-area-inset-top)
  z-index: 9
.confirm-blank
  background: $primarycolor.gray
  opacity: .8
  position: fixed
  bottom: 13rem
  bottom: calc(13rem + constant(safe-area-inset-bottom))
  bottom: calc(13rem + env(safe-area-inset-bottom))
  right: 0
  left: 0
  top: 0
  // top: constant(safe-area-inset-top)
  // top: env(safe-area-inset-top)
  z-index: 9
.confirm-dlg
  background: $secondarycolor.gray
  height: 13rem
  height: calc(13rem+constant(safe-area-inset-bottom))
  height: calc(13rem+env(safe-area-inset-bottom))
  position: fixed
  bottom: 0
  padding-bottom:0
  padding-bottom: constant(safe-area-inset-bottom)
  padding-bottom: env(safe-area-inset-bottom)
  right: 0
  left: 0
  opacity: 1
.confirm-title
  height: .8rem
  line-height: .8rem
  font-size: .4rem
  padding-left: .4rem
  color: $primarycolor.font
.confirm-amount
  color: $primarycolor.green
  text-align: center
  font-size: .5rem
.confirm-memo
  padding-left: .5rem
  color: $secondarycolor.font
.confirm-content
  font-size: 16px
  .confirm-row
    padding: 8px 8px
    .label
      color: $secondarycolor.font
    .value
      padding-left: 12px
      color: $primarycolor.green
.confirm-btns
  color: $primarycolor.green
  text-align: center
  font-size: 16px
  height: 42px
  line-height: 42px
  .disable-btn
    color: $secondarycolor.font
.menu-head
  display: block
  padding: .6rem .3rem .3rem .3rem
  width: 100%
  .memo-row
    text-align: center
    width: 100%
  .menu-row-1
    display: block
    margin: auto auto
    width: 50px
    height: 50px
    line-height: 50px
    border-radius: 50px
    text-align: center
    vertical-align: middle
    background: $secondarycolor.gray
    .avatar
      font-size: 24px
      color: primary
  .menu-row-2
    padding: 5px 15px
    text-align:center
    .name
      font-size: 24px
      text-align: center
      overflow: hidden
      text-overflow:ellipsis
      white-space: nowrap
      color: $primarycolor.green
    .address
      font-size: 12px
      color: $secondarycolor.font
  


.sheet-content
  background: $secondarycolor.gray
  color: $primarycolor.font
  padding: 8px 8px
  padding-bottom: calc(8px +  constant(safe-area-inset-bottom))
  padding-bottom: calc(8px +  env(safe-area-inset-bottom))
  word-wrap: break-word
  .sheet-title
    .title
      height: 40px
      line-height: 40px
      font-size: 32px
      text-align: center
      color: $primarycolor.green
      padding: 10px 10px
    .label
      color: $secondarycolor.font
    .value
      font-size: 16px
  .sheet-btns
    margin-top: 10px
    display: inline-block
    width: 100%
    .sheet-btn
      float: left
      width: 50%
      height: 40px
      line-height: 40px
      text-align: center
      font-size: 16px
      color: $primarycolor.green
.confirm-assets
  padding: .2rem .2rem
  .asset-card
    width: 3rem
    height: 3.2rem
    background: $secondarycolor.gray
    margin: .2rem .2rem
    padding: .2rem .2rem
    border-radius: .2rem
    .asset-icon
      .iconfont
        font-size: 1rem
        color: $primarycolor.green
    .asset-code
      color: $primarycolor.green
    .asset-issuer
      font-size: .2rem
      color: $secondarycolor.font
      overflow: hidden
      white-space: nowrap
      word-break: normal
    &.active
      border: 1px solid $primarycolor.green
.loading-wrapper
  text-align: center
  margin: 1.5rem auto
</style>

