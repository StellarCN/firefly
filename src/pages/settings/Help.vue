/**
 * 帮助界面
 */
<template>
  <div class="page">
  
  </div>
</template>

<script>
import { mapState, mapActions} from 'vuex'
import { FFWScript, FFW_EVENT_TYPE_PAY,FFW_EVENT_TYPE_PATHPAYMENT,FFW_EVENT_TYPE_SIGN
   ,FFW_EVENT_TYPE_BACKUP,FFW_EVENT_TYPE_RECOVERY,FFW_EVENT_TYPE_TRUST,FFW_EVENT_TYPE_SIGNXDR } from '@/api/ffw'
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
      site:'https://wallet.fchain.io/manual',
      title:this.$t('Menu.Help'),
    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      islogin: state => (state.accounts.accountData.seed ? true : false),
      allcontacts: state => state.app.contacts||[],
      myaddresses: state => state.app.myaddresses||[],
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
      },3000))
    },
    hideDapp(e){
      this.appInstance.hide()
      console.log('-----app-event--hideapp--'+JSON.stringify(this.appEventData))
    },
  },
  components: {
  }
}
</script>


<style lang="stylus" scoped>
</style>
