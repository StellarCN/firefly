// 打开第三方应用
<template>
  <div>
     <toolbar :title="choosed.title" 
        :showmenuicon="false" 
        :showbackicon="false"
        ref="toolbar"
        >
    </toolbar>

    <send-asset v-if="showSendAsset" 
      :destination="sendTarget.destination"
      :appname="choosed.title"
      :asset_code="sendTarget.code"
      :asset_issuer="sendTarget.issuer"
      :memo_type="sendTarget.memo_type"
      :memo="sendTarget.memo"
      :amount="sendTarget.amount"
      :pathPayment="pathPayment"
      @exit="exitSendAsset"
      @sendsuccess="sendAssetSuccess"
       ></send-asset>
    <back-up-data v-if="appEventType === 'backup' && appEventData" 
      :appname="choosed.title" 
      @exit="exitBackUpEvent" @success="successBackUpEvent" />

    <recovery-data v-if="appEventType === 'recovery' && appEventData" 
      :appname="choosed.title" :encryptData="appEventData.data"
      @exit="exitRecoveryEvent" @success="successRecoveryEvent" />

    <trust-line v-if="appEventType === 'trust' && appEventData" 
      :appname="choosed.title" 
      :asset_code="appEventData.code"
      :asset_issuer="appEventData.issuer"
      @exit="exitTrustEvent" @success="successTrustEvent" />

    <sign-x-d-r v-if="appEventType === 'signXDR' && appEventData" 
      :appname="choosed.title"
      :message="appEventData.message"
      :xdr="appEventData.data"
      @exit="exitSignXDREvent"
      @success="successSignXDREvent"
      />

  </div>
</template>

<script>
import axios from 'axios'
import { mapState, mapActions} from 'vuex'
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import Loading from '@/components/Loading'
import  defaultsDeep  from 'lodash/defaultsDeep'
import SendAsset from '@/components/dapp/SendAsset'
import RecoveryData from '@/components/dapp/RecoveryData'
import TrustLine from '@/components/dapp/TrustLine'
import BackUpData from '@/components/dapp/BackUpData'
import SignXDR from '@/components/dapp/SignXDR'
import { FFWScript, FFW_EVENT_TYPE_PAY,FFW_EVENT_TYPE_PATHPAYMENT,FFW_EVENT_TYPE_SIGN
   ,FFW_EVENT_TYPE_BACKUP,FFW_EVENT_TYPE_RECOVERY,FFW_EVENT_TYPE_TRUST,
   FFW_EVENT_TYPE_SIGNXDR,FFW_EVENT_TYPE_BALANCES } from '@/api/ffw'
import { signToBase64, verifyByBase64 } from '@/api/keypair'
import isJson from '@/libs/is-json'
import debounce from 'lodash/debounce'

// export const FFW_EVENT_TYPE_PAY = 'pay'
// export const FFW_EVENT_TYPE_PATHPAYMENT = 'pathPayment'
// export const FFW_EVENT_TYPE_SIGN = 'sign'
// export const FFW_EVENT_TYPE_BACKUP = 'backup'
// export const FFW_EVENT_TYPE_RECOVERY = 'recovery'
// export const FFW_EVENT_TYPE_TRUST = 'trust'

export default {
  data(){
    return {
      working: false,
      err: null,
      choosed: {}, //当前选中的app
      showSendAsset: false,
      sendTarget:{},
      pathPayment: true,//发送功能是否支持pathPayment
      appInstance: null,

      appEventType: null,//接收到的appevent事件
      appEventData: null,//接收的appevent的data

    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      islogin: state => (state.accounts.accountData.seed ? true : false),
      allcontacts: state => state.app.contacts||[],
      myaddresses: state => state.app.myaddresses||[],
      myapps: state => state.app.myapps,
      balances: state=> state.account.data.balances,
    }),
  },
  watch:{
    islogin(){
      if(this.islogin && !this.appInstance){
        this.openApp()
      }
    }
  },
  beforeMount () {
    //接收要打开的应用
    this.choosed.title = this.$route.params.title;
    this.choosed.site = this.$route.params.site;

  },
  beforeDestroy(){
    if(this.appInstance){
      this.appInstance.close()
      this.appInstance = undefined
    }
  },
  mounted () {
    if(!this.islogin){
      this.$refs.toolbar.showPasswordLogin()
    }
    this.openApp();

  },
  methods: {
    ...mapActions(['addMyApp','getAccountInfo']),
    back(){
      this.$router.back()
    },
    openApp(){
      localStorage.setItem(this.choosed.site, "confirm")
      this.showConfirmDlg = false
      if(cordova.platformId === 'browser'){
        this.appInstance = cordova.InAppBrowser.open(this.choosed.site, '_blank', 'location=no,toolbar=yes,toolbarcolor=#21ce90');
      }else{
        this.appInstance = cordova.ThemeableBrowser.open(this.choosed.site, '_blank', {
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
                  staticText: this.choosed.title 
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
      this.appInstance.addEventListener('reloadPressed', e => {
        this.appInstance.reload()
      })
      this.appInstance.addEventListener('sharePressed', e => {
          this.shareCB(e.url)
      })
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
        let script = FFWScript(this.account.address, {contacts,myaddresses} ,isIos, cordova.platformId)
        // alert(script)
        this.appInstance.executeScript({ code: script },params => {
          //console.log(params)
          //alert('after script insert')
          //alert(params)
        })

      })
      let that = this
      this.appInstance.addEventListener('message', debounce(function (e){
        console.log('-----------get message ---- ')
        console.log(JSON.stringify(e))
       // alert(JSON.stringify(e))
        let type = e.data.type
        that.appEventType = e.data.type
        that.appEventData = e.data
        if(type === FFW_EVENT_TYPE_PAY){
          this.doPayEvent(e)
        }else if(type === FFW_EVENT_TYPE_PATHPAYMENT){
          that.doPathPaymentEvent(e)
        }else if(type === FFW_EVENT_TYPE_SIGN){
          that.doSign(e)
        }else if(type === FFW_EVENT_TYPE_BALANCES){
          //查询账户余额
          that.getBalances()
        }else{
          //that.hideDapp(),未知事件
          that.doCallbackEvent(that.callbackData('fail','unknown event type'))
        }
      },300))
    },
    hideDapp(e){
      this.appInstance.hide()
      console.log('-----app-event--hideapp--'+JSON.stringify(this.appEventData))
    },
    doPayEvent(e){
      try{
        this.showSendAsset = true
        this.sendTarget = e.data
        this.pathPayment = false
        this.appInstance.hide()
      }catch(err){
        console.error(err)
        //alert('error:'+err.message)
      }
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
    doPathPaymentEvent(e){
      try{
        this.showSendAsset = true
        this.sendTarget = e.data
        this.pathPayment = true
        this.appInstance.hide()
      }catch(err){
        console.error(err)
        //alert('error:'+err.message)
      }
    },
    getBalances(e){
      this.getAccountInfo(this.account.address)
        .then(data=>{
          this.doCallbackEvent(this.callbackData('success', 'success', this.balances))
        })
        .catch(err=>{
          this.doCallbackEvent(this.callbackData('fail',err.message))
        })
    },
    doCallbackEvent(data){
      console.log('-----------docallback event---' + JSON.stringify(this.appEventData))
      if(this.appEventData && this.appEventData.callback){
        try{
          let cb = this.appEventData.callback
          let code = `FFW.callback("${cb}",{code: "${data.code}",message:"${data.message}",data:"${data.data}"})`
          console.log('===============callback------event---')
          console.log(code)
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
    exitSendAsset(){
      this.showSendAsset = false
      this.appInstance.show()
      this.doCallbackEvent(this.callbackData('fail','cancel payment'))
    },
    sendAssetSuccess(){
      this.showSendAsset = false
      this.appInstance.show()
      //TODO 怎么通知应用
      this.doCallbackEvent(this.callbackData('success','success'))
    },
    shareCB(url){
      let options = {
        subject: this.choosed.title,
        url: url,
        chooserTitle: this.$t('Share')
      }
      window.plugins.socialsharing.shareWithOptions(options, result=>{
        console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
        console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
      }, msg=>{
        console.log("Sharing failed with message: " + msg);
      });
    },
    exitEvent(msg){
      this.appInstance.show()
      this.doCallbackEvent(this.callbackData('fail',msg))
      this.$nextTick(()=>{
        this.appEventType = null
        this.appEventData = null
      })
    },
    successEvent(msg='success',data){
      //alert('----success--event---'+ JSON.stringify(data))
      this.appInstance.show()
      this.doCallbackEvent(this.callbackData('success',msg, data))
      this.$nextTick(()=>{
        this.appEventType = null
        this.appEventData = null
      })
    },
    exitBackUpEvent(){
      this.exitEvent('cancel back up')
    },
    successBackUpEvent(data){
      this.successEvent('success',data)
    },
    exitRecoveryEvent(){
      this.exitEvent('cancel recovery')
    },
    successRecoveryEvent(){
      this.successEvent()
    },
    exitTrustEvent(){
      this.exitEvent('cancel trust')
    },
    successTrustEvent(){
      this.successEvent()
    },
    exitSignXDREvent(){
      //alert('----exit---signxdr---')
      this.exitEvent('cancel signxdr')
    },
    successSignXDREvent(data){
      //alert('-----signxdr-success---')
      this.successEvent('success',data)
    },
    toSetting(){
      this.$router.push({name: 'DAppSetting'})
    },
    addDapp(){
      this.showAddDlg = true
      this.apptitle = null
      this.appsite = null
    },
    cancelAddApp(){
      this.showAddDlg = false
      this.apptitle = null
      this.appsite = null
    },
    doAddApp(){
      if(this.addingApp)return
      if(!this.apptitle)return
      if(!this.appsite)return
      this.addingApp = true
      this.addMyApp({title: this.apptitle, site: this.appsite})
        .then(response=>{
            this.cancelAddApp()
            this.addingApp = false
          })
          .catch(err=>{
            this.$toasted.error(this.$t('SaveFailed') +":" + (err.message ? err.message:''))
          })


    }
    


  },
  components: {
    Toolbar,
    Loading,
    Card,
    SendAsset,
    TrustLine,
    RecoveryData,
    BackUpData,
    SignXDR,
  }
}
</script>


<style lang="stylus" scoped>
@require '../../stylus/color.styl'
.app-card
  background: $secondarycolor.gray
.app-title
  padding: .1rem .1rem
  overflow: hidden
  white-space: nowrap
  font-size: 14px
.card-content
  padding: 20px 10px
.t2
  font-size: 16px
.btns
  font-size: 16px
.dlg-green
  color: $primarycolor.green
.dlg-content
  background: $secondarycolor.gray
  color: $primarycolor.red

.server-apps-layout
  background: $secondarycolor.gray
  margin: 8px 8px!important
  border-radius: 5px

.apps-layout
  background: $secondarycolor.gray
  margin: 8px 8px!important
  border-radius: 5px
.app-card
  background: $secondarycolor.gray!important
.app-card-wrapper
  border: 1px solid $primarycolor.gray!important
.app-avatar
  border-radius: 50%!important
.dapp-subtitle
  color: $secondarycolor.font
.add-app-avatar
  background: $secondarycolor.gray!important
</style>
