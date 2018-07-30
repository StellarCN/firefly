/**
 * 工单系统
 */
<template>
  <div class="page">
     <toolbar :title="$t('tickets')" 
        :showmenuicon="false" 
        :showbackicon="true"
        ref="toolbar"
        >
    </toolbar>
  </div>
</template>

<script>
import { mapState, mapActions} from 'vuex'
import { FFWScript, FFW_EVENT_TYPE_PAY,FFW_EVENT_TYPE_PATHPAYMENT,FFW_EVENT_TYPE_SIGN
   ,FFW_EVENT_TYPE_BACKUP,FFW_EVENT_TYPE_RECOVERY,FFW_EVENT_TYPE_TRUST,FFW_EVENT_TYPE_SIGNXDR } from '@/api/ffw'
import debounce from 'lodash/debounce'
import Toolbar from '@/components/Toolbar'
import { signToBase64, verifyByBase64 } from '@/api/keypair'
import isJson from '@/libs/is-json'

// export const FFW_EVENT_TYPE_PAY = 'pay'
// export const FFW_EVENT_TYPE_PATHPAYMENT = 'pathPayment'
// export const FFW_EVENT_TYPE_SIGN = 'sign'
// export const FFW_EVENT_TYPE_BACKUP = 'backup'
// export const FFW_EVENT_TYPE_RECOVERY = 'recovery'
// export const FFW_EVENT_TYPE_TRUST = 'trust'

export default {
  data(){
    return {
      site:'https://jn279.gitee.io/firefly_assets/tickets',
      title:this.$t('tickets'),
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
    let _title = this.$route.params.title;
    let _site = this.$route.params.site;
    this.title = _title||this.title
    this.site = _site||this.site
    this.site = this.site + '?'+Math.random()

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
      
      if(cordova.platformId === 'browser'){
        this.appInstance = cordova.InAppBrowser.open(this.site, '_blank', 'location=no,toolbar=yes,toolbarcolor=#21ce90');
      }else{
        this.appInstance = cordova.ThemeableBrowser.open(this.site, '_blank', {
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
                  staticText: this.title 
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

        let script = FFWScript(this.account.address, {contacts,myaddresses} ,isIos, cordova.platformId,this.locale.key)
        // alert(script)
        this.appInstance.executeScript({ code: script },params => {
          //console.log(params)
          //alert('after script insert')
          //alert(params)
        })

      })
      let that = this
      this.appInstance.addEventListener('message', debounce(function (e){
        // alert('message - ' + JSON.stringify(e))
       let type = e.data.type
       if(type === FFW_EVENT_TYPE_SIGN){
          that.doSign(e)
        }
      },3000))
    },
    hideDapp(e){
      this.appInstance.hide()
      console.log('-----app-event--hideapp--'+JSON.stringify(this.appEventData))
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
        this.doCallbackEvent(e.data.callback,this.callbackData('success', 'success', cdata))
      }else{
       // alert('sign-fail--')
        this.doCallbackEvent(e.data.callback,this.callbackData('fail','no data to sign'))
      }
    },
    doCallbackEvent(cb,data){
      console.log('-----------docallback event---' + JSON.stringify(this.appEventData))
      // alert('do callback event- ' + JSON.stringify(this.appEventData))
      try{
        let code = `FFW.callback("${cb}",{code: "${data.code}",message:"${data.message}",data:"${data.data}"})`
        console.log('===============callback------event---')
        console.log(code)
        this.appInstance.executeScript({
          code: code }, 
          params=>{})
      }catch(err){
        console.error(err)
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
</style>
