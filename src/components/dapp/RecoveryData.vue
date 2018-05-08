// 恢复联系人和地址簿
<template>
  <div class="trust-line-wrapper">
    <v-bottom-sheet persistent v-model="showPwdSheet" v-if="showPwdSheet" dark>
      <div class="sheet-content">
        <div class="sheet-title textcenter">
          <div class="title">{{$t('Recovery')}}</div>
        </div>
        <div class="sheet-title flex-row" v-if="appname">
          <div class="label flex1">{{$t('Title.ThirdApp')}}</div>
          <div class="value flex2 textleft pl-1">{{appname}}</div>
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
          <div class="sheet-btn" @click="exit">{{$t('Button.Cancel')}}</div>
          <div class="sheet-btn" @click="ok">{{$t('Button.OK')}}</div>
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
import { encrypt,decrypt,encryptToBase64,decryptByBase64 } from '@/api/crypt'

export default {
  data(){
    return {
     
      working: false,
      sending: false,
      sendsuccess: false,
      sendfail: false,
      loadingTitle: null,
      loadingError: null,

      password:null,
      pwdvisible: false,

      showPwdSheet: true,
      
    }
  },
  props: {
    appname: {
      type: String
    },
    encryptData: {
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
      recoveryContactsAndAddresses: 'recoveryContactsAndAddresses',
    }),
    exit(){
      this.password = null
      this.$emit('exit')
    },
    ok(){
      // alert('---ok---')
      // alert('islogin:'+this.islogin)
      // alert('working:'+this.working)
      // alert('pasword:'+this.password)
      if(!this.islogin)return
      if(this.working)return
      if(!this.password)return
      //1. 校验密码是否正确
      //2. 保存数据
      // alert('----encryptdata---' + this.encryptData)
      let value = decryptByBase64(this.password, this.encryptData)
      // alert('-----recovery--'+value)
      if(value === null || typeof value === 'undefined' || value === ''){
        this.$toasted.error(this.$t('Error.PasswordWrong'))
        return
      }
      value = JSON.parse(value)
      let contacts = value.contacts || []
      let addresses = value.myaddresses || []
      this.working = true
      this.sending = true
      this.recoveryContactsAndAddresses({contacts, myaddresses: addresses})
        .then(response=>{
          this.success()
        })
        .catch(err=>{
          this.fail(err)
        })
    },
    success(){
      this.sending = false
      this.sendsuccess = true
      this.loadingTitle = this.$t('SaveSuccess')
      //this.getAccountInfo(this.account.address)
      setTimeout(()=>{
        this.working =false
        this.sendsuccess = false //
        this.$emit('success')
      },3000)
    },
    fail(err){
      console.log(err)
      this.sending = false
      this.sendfail = true
      let msg = getXdrResultCode(err)
      this.loadingTitle = this.$t('SaveFailed')
      if(msg){
        this.loadingError = this.$t(msg)
      }else{
        this.loadingError = this.$t(err.message)
      }
    },
    hiddenLoading(){
      this.working = false
      this.sendfail = false
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

.sheet-content
  background: $secondarycolor.gray
  color: $primarycolor.font
  padding: 10px 10px
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

</style>

