// 授信添加资产
<template>
  <div class="trust-line-wrapper">
    
    <!-- 显示授信界面 -->
    <div class="confirm-wrapper">
      <div class="confirm-blank"></div>
      <div  class="confirm-dlg">
      <v-bottom-sheet v-model="showDlg" persistent dark>
        <div class="sheet-content">
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
            <div class="dlg-title text-center">
              <span>{{$t('ManullayAddTrust')}}</span>
            </div>
            <div class="confirm-title">{{$t('AssetCode')}}</div>
            <div class="confirm-memo">{{asset_code}}</div>
            <div class="confirm-title">{{$t('AssetIssuer')}}</div>
            <div class="confirm-memo">{{asset_issuer | shortaddress}}</div>
            
          </div>

          <div class="confirm-btns flex-row textcenter">
            <div class="confirm-btn flex1" @click="exit">{{$t('Button.Cancel')}}</div>
            <div class="confirm-btn flex1" @click="showPwdDlg">{{$t('Button.OK')}}</div>
          </div>
        </div>
      </v-bottom-sheet>
      </div>
    </div>

    <!--显示密码输入界面-->
    <v-bottom-sheet persistent v-model="showPwdSheet" v-if="showPwdSheet" dark>
      <div class="sheet-content">
        <div class="sheet-title textcenter">
          <div class="title">{{$t('ManullayAddTrust')}}&nbsp;{{asset_code}}</div>
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
          <div class="sheet-btn" @click="doTrust">{{$t('Button.OK')}}</div>
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
import { isNativeAsset } from '@/api/assets'
import { readAccountData } from '@/api/storage'
import { xdrMsg,getXdrResultCode } from '@/api/xdr'

export default {
  data(){
    return {
      step: 0,//0是初始界面，1是输入密码界面，2是确认支付界面
      showDlg: true,//显示界面
      assets:[],//可以支付的资产，通过path payment计算出来
      nodata: false,
      showPwdSheet: false,
      password: null,
      pwdvisible: false,
      loading: false,//是否正在查询path

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
    asset_code: {
      type:String,
      required: true
    },
    asset_issuer: {
      type: String,
      required: true
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
    ...mapGetters(["balances", "reserve", "native", "base_fee",'base_reserve']),
    
  },
  beforeMount () {
    
  },
  mounted () {
    
  },
  methods: {
    ...mapActions({
      trust: 'trust',
      sendAsset: 'sendAsset',
      sendPathPayment: 'sendPathPayment',
      getAccountInfo: 'getAccountInfo',
    }),
    showPwdDlg(){
      this.showDlg = false
      this.showPwdSheet = true
      this.password = null
      this.pwdvisible = false
    },
    resetState(){
      this.showDlg = true
      this.showPwdSheet = false
      this.password = null
      this.pwdvisible = false
    },
    doTrust(){
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
      this.loadingTitle = null
      this.loadingError = null
      if(this.native.balance - this.reserve > this.base_reserve){
        console.log('enough native asset to continue')
      }else{
        this.$toasted.error('no enough lumens to continue')
        this.working = false
        this.sending = false
        return 
      }
      this.loadingTitle = null
      this.loadingMsg = null
      let params = {
          seed: seed,
          address: this.account.address,
          code: this.asset_code,
          issuer: this.asset_issuer}
      this.trust(params)
        .then(response=>{
          this.sendSuccess()
        })
        .catch(err=>{
          this.sendFail(err) 
        })

    },
    sendSuccess(){
      this.sending = false
      this.sendsuccess = true
      this.loadingTitle = this.$t('AddAssetSuccess')
      //this.getAccountInfo(this.account.address)
      setTimeout(()=>{
        this.working =false
        this.sendsuccess = false //
        this.$emit('success')
      },3000)
    },
    sendFail(err){
      console.log(err)
      this.sending = false
      this.sendfail = true
      let msg = getXdrResultCode(err)
      this.loadingTitle = this.$t('AddAssetFail')
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
    hiddenLoading(){
      this.sending = false
      this.sendfail = false
      this.working = false
    }
  },
  components: {
    Card,
    Loading,
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
  bottom: 8.5rem
  bottom: calc(8.5rem + constant(safe-area-inset-bottom))
  bottom: calc(8.5rem + env(safe-area-inset-bottom))
  right: 0
  left: 0
  top: 0
  top: constant(safe-area-inset-top)
  top: env(safe-area-inset-top)
  z-index: 9
.confirm-dlg
  background: $secondarycolor.gray
  height: 8.5rem
  height: calc(8.5rem + constant(safe-area-inset-bottom))
  height: calc(8.5rem + env(safe-area-inset-bottom))
  position: fixed
  bottom: 0
  padding-bottom: 0
  padding-bottom: constant(safe-area-inset-bottom)
  padding-bottom: env(safe-area-inset-bottom)
  right: 0
  left: 0
  opacity: 1
.dlg-title
  color: $primarycolor.green
  text-align: center
  font-size: 16px
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
</style>

