// 打开KYC界面
<template>
  <div class="kycpage">
      <toolbar :title="$t('kyc')" 
        :showmenuicon="false" 
        :showbackicon="true"
        ref="toolbar"
        >
    </toolbar>
  </div>
</template>

<script>
import { mapState, mapActions} from 'vuex'
import  defaultsDeep  from 'lodash/defaultsDeep'
import Toolbar from '@/components/Toolbar'
import { KYC_SITE } from '@/api/gateways'
import { signToBase64, verifyByBase64 } from '@/api/keypair'

import SendAsset from '@/components/dapp/SendAsset'
import RecoveryData from '@/components/dapp/RecoveryData'
import TrustLine from '@/components/dapp/TrustLine'
import BackUpData from '@/components/dapp/BackUpData'
import SignXDR from '@/components/dapp/SignXDR'
import QRScan from '@/components/QRScan'
import { FFWScript, FFW_EVENT_TYPE_PAY,FFW_EVENT_TYPE_PATHPAYMENT,FFW_EVENT_TYPE_SIGN
   ,FFW_EVENT_TYPE_BACKUP,FFW_EVENT_TYPE_RECOVERY,FFW_EVENT_TYPE_TRUST,
   FFW_EVENT_TYPE_SIGNXDR, FFW_EVENT_TYPE_SHARE,
   FFW_EVENT_TYPE_SCAN } from '@/api/ffw'
import isJson from '@/libs/is-json'
import debounce from 'lodash/debounce'
import { trustAll } from '@/api/operations'
// export const FFW_EVENT_TYPE_PAY = 'pay'
// export const FFW_EVENT_TYPE_PATHPAYMENT = 'pathPayment'
// export const FFW_EVENT_TYPE_SIGN = 'sign'
// export const FFW_EVENT_TYPE_BACKUP = 'backup'
// export const FFW_EVENT_TYPE_RECOVERY = 'recovery'
// export const FFW_EVENT_TYPE_TRUST = 'trust'

export default {
  data(){
    return {
      appEventType: null,
      appEventData: null
    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      islogin: state => (state.accounts.accountData.seed ? true : false),
      allcontacts: state => state.app.contacts||[],
      myaddresses: state => state.app.myaddresses||[],
      locale: state => state.app.locale,
    }),
  },
  beforeMount () {
    //接收要打开的应用
    // this.choosed.title = this.$route.params.title;
    // this.choosed.site = this.$route.params.site;

  },
  beforeDestroy(){
    if(this.appInstance){
      this.appInstance.close()
      this.appInstance = undefined
    }
  },
  mounted () {
    this.openApp()
  },
  methods: {
    back(){
      this.$router.back()
    },
    openApp(){
      let site = KYC_SITE+'?r='+Math.random()
      // let site = 'https://fchain.io/kyc/accounts/login/?next=/portal/'+'?'+Math.random()
      let title = this.$t('kyc')
      if(cordova.platformId === 'browser'){
        this.appInstance = cordova.InAppBrowser.open(site, '_blank', 'location=no,toolbar=yes,toolbarcolor=#21ce90');
      }else{
        this.appInstance = cordova.ThemeableBrowser.open(site, '_blank', {
              statusbar: {
                  color: '#21ce90'
              },
              toolbar: {
                  height: 44,
                  color: '#21ce90'
              },
              browserProgress: {
                showProgress: true,
                progressBgColor: "#007e9c",
                progressColor: "#FF5E00"
              },
              title: {
                  color: '#FFFFFF',
                  showPageTitle: true,
                  staticText: title 
              },
              
              closeButton: {
                  image: 'close',
                  imagePressed: 'close_pressed',
                  align: 'left',
                  event: 'closePressed'
              },
              backButtonCanClose: false,
              // hidden: true
          })
          
      }
      // this.appInstance.removeEventListener('closePressed')
      this.appInstance.addEventListener('closePressed',()=>{
        this.appInstance.close()
        this.appInstance = undefined
        this.$router.back();
      })
      this.appInstance.addEventListener('backPressed', ()=>{
        this.appInstance.close()
        this.appInstance = undefined
        this.$router.back();
      });

      this.appInstance.addEventListener('loadstop',() => {
        //let script = `if(!window.FFW){window.FFW = {};FFW.address = "${this.account.address}";FFW.pay = function(destination,code,issuer,amount,memo_type,memo){ var params = { type:'pay',destination: destination, code: code, issuer: issuer, amount: amount, memo_type: memo_type, memo: memo };cordova_iab.postMessage(JSON.stringify(params));};};`
        //let scriptEle = `if(!window.FFW){var script = document.createElement('script');script.setAttribute('type', 'text/javascript');script.text = "${script}";document.body.appendChild(script);}`
        //alert(scriptEle)
        let contacts = this.allcontacts
        let myaddresses = this.myaddresses
        let isIos = "ios" === cordova.platformId
        let script = FFWScript(this.account.address, {contacts,myaddresses} ,isIos, cordova.platformId, this.locale.key)
        // alert(script)
        this.appInstance.executeScript({ code: script },params => {
          //console.log(params)
          //alert('after script insert')
          //alert(params)
        })

      })

      let that = this
      this.appInstance.addEventListener('message', debounce(function (e){
       let type = e.data.type
        if(type === FFW_EVENT_TYPE_SIGN){
          that.appEventType = e.data.type
          that.appEventData = e.data
          that.doSign(e)
        }
      },300))
    },
    hideDapp(e){
      this.appInstance.hide()
    },
     doCallbackEvent(data){
      // alert('do callback event- ' + JSON.stringify(this.appEventData))
      if(this.appEventData && this.appEventData.callback){
        try{
          let cb = this.appEventData.callback
          let code = `FFW.callback("${cb}",{code: "${data.code}",message:"${data.message}",data:"${data.data}"})`
          this.appInstance.executeScript({
            code: code }, 
            params=>{})
        }catch(err){
          console.error(err)
        }
      }
    },
    callbackData(code,message,data){
      // return JSON.stringify({code,message,data})
      return {code,message,data}
    },
    doSign(e){
      //签名
      let data = e.data.data
      if(!isJson(data)){
        return this.doCallbackEvent(this.callbackData('fail','data is invalid'))
      }
      if(data){
        let cdata = signToBase64(this.accountData.seed, data)
        console.log('---------------encrypt data---' + cdata)
       // alert('sign---'+cdata)
        this.doCallbackEvent(this.callbackData('success', 'success', cdata))
      }else{
       // alert('sign-fail--')
        this.doCallbackEvent(this.callbackData('fail','no data to sign'))
      }
    },

  },
  components: {
    Toolbar,
  }
}
</script>


<style lang="stylus" scoped>
</style>
