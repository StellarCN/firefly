//自动激活引用界面
// 打开第三方应用
<template>
  <div>
     <toolbar :title="$t('fund_free')" 
        :showmenuicon="false" 
        :showbackicon="false"
        ref="toolbar"
        >
    </toolbar>

  </div>
</template>

<script>
import axios from 'axios'
import { mapState, mapActions} from 'vuex'
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import Loading from '@/components/Loading'
import  defaultsDeep  from 'lodash/defaultsDeep'
// import SignXDR from '@/components/dapp/SignXDR'
import { FFWScript, FFW_EVENT_TYPE_PAY,FFW_EVENT_TYPE_PATHPAYMENT,FFW_EVENT_TYPE_SIGN
   ,FFW_EVENT_TYPE_BACKUP,FFW_EVENT_TYPE_RECOVERY,FFW_EVENT_TYPE_TRUST,FFW_EVENT_TYPE_SIGNXDR } from '@/api/ffw'
// import { signToBase64, verifyByBase64 } from '@/api/keypair'
// import isJson from '@/libs/is-json'
import debounce from 'lodash/debounce'
import { getFundConfig,initFundConfig } from '@/api/gateways'
import { trustAll } from '@/api/operations'
import { getAccountInfo } from '@/api/account'
import { Decimal } from 'decimal.js'

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
      appInstance: null,

      appEventType: null,//接收到的appevent事件
      appEventData: null,//接收的appevent的data
      fund_config: null,
    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      islogin: state => (state.accounts.accountData.seed ? true : false),
    }),
  },
  watch:{
    islogin(){
      // alert('----is login--' + this.islogin)
      if(this.islogin && !this.appInstance){
        this.openApp()
      }
    }
  },
  created(){
    let config = getFundConfig()
    if(!config){
      initFundConfig((data)=>{
        this.fund_config = data
      })
    }
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
    if(!this.fund_config){
      // alert('---init fun config----1--')
      initFundConfig((data)=>{
        // alert('--------int config---2')
        this.fund_config = data
        // alert('---3--' + JSON.stringify(data))
        // alert(JSON.stringify(this.fund_config))
        if(this.islogin){
          this.openApp();
        }
      })
    }
  },
  methods: {
    back(){
      this.$router.back()
    },
    openApp(){
      let config = this.fund_config
      // alert('config=----' + JSON.stringify(config))
      if(config === null)return;
      // alert(JSON.stringify(config))
      if(cordova.platformId === 'browser'){
        this.appInstance = cordova.InAppBrowser.open(config.site, '_blank', 'location=no,toolbar=yes,toolbarcolor=#21ce90');
      }else{
        this.appInstance = cordova.ThemeableBrowser.open(config.site, '_blank', {
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
                  staticText: this.$t('auto_fund')
              },
              closeButton: {
                  image: 'close',
                  imagePressed: 'close_pressed',
                  align: 'left',
                  event: 'closePressed'
              },
              backButtonCanClose: true,
              // hidden: true
          })
          
      }
      this.appInstance.addEventListener('reloadPressed', e => {
        this.appInstance.reload()
      })
      this.appInstance.addEventListener('sharePressed', e => {
          // this.shareCB(e.url)
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
        // console.log(JSON.stringify(e))
       // alert(JSON.stringify(e))
        let type = e.data.type
        if(type === 'after_fund'){
          that.doTrust(config)
        }
      },3000))
    },
    hideDapp(e){
      this.appInstance.hide()
      console.log('-----app-event--hideapp--'+JSON.stringify(this.appEventData))
    },
    doTrust(config){
      alert('dotrust-' + JSON.stringify(config.assets));
      //强制授信相应的资产
      // let source = config.account
      // if(!source)return
      let assets = config.assets
      trustAll(this.accountData.seed, assets)
        .then(resp => {
          this.hideDapp()
          this.$toasted.show(this.$t('fund_success'))
          alert('成功！')
          setTimeout(()=>{
            this.$router.push({name: 'MyAssets'})  
          },1000)
        })
        .catch(err=>{
          console.error(err)
          console.error('授信失败')
          alert('失败'+err.message)
          this.$router.push({name: 'MyAssets'})
        })

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
    


  },
  components: {
    Toolbar,
  }

  
}
</script>


<style lang="stylus" scoped>
@require '~@/stylus/trade.styl'
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
