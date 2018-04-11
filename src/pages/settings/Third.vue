// 第三方应用列表界面
<template>
  <div class="page" dark>
    <toolbar :title="$t('Title.ThirdApp')" :showbackicon="true"  @goback="back" :shadow="false"/>
    <v-container fluid v-bind="{ [`grid-list-md`]: true }">
      <card padding="8px 8px" margin="8px 8px" v-if="working">
        <div class="mt-5 textcenter">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
      </card>
      <card  padding="8px 8px" margin="8px 8px" v-else>
        <p v-if="err">
          {{$t(err)}}
        </p>
      </card>
      <v-layout row wrap  v-if="!working">
        <v-flex
          xs4
          v-for="(app,index) in apps"
          :key="index"
          @click="choose(app)"
        >
          <v-card flat tile class="pa-2 textcenter app-card" >
             <v-avatar  :size="`80px`">
               <img :src="app.image">
             </v-avatar>
             <v-card-title primary-title class="app-title">
               {{app.title}}
             </v-card-title>
          </v-card>
        </v-flex>
      </v-layout>


    <v-dialog v-model="showConfirmDlg" max-width="95%" persistent>
      <div>
        <div class="card-content dlg-content">
          <div class="avatar-div textcenter">
            <v-avatar>
              <img src="../../assets/img/logo-red.png" />
            </v-avatar>
          </div>
          <div class="t2 skip-white pt-2 pb-4">{{$t('Third.OpenAppHint',[choosed.title])}}</div>
          <div class="btns flex-row">
            <div class="flex1 skip-red textcenter" @click="openApp">{{$t('Button.OK')}}</div>
            <div class="flex1 skip-red textcenter" @click="showConfirmDlg = false">{{$t('Button.Cancel')}}</div>
          </div>
        </div>
      </div>
    </v-dialog>
    </v-container>

    <send-asset v-if="showSendAsset" 
      :destination="sendTarget.destination"
      :appname="choosed.title"
      :asset_code="sendTarget.code"
      :asset_issuer="sendTarget.issuer"
      :memo_type="sendTarget.memo_type"
      :memo="sendTarget.memo"
      :amount="sendTarget.amount"
      @exit="exitSendAsset"
      @sendsuccess="sendAssetSuccess"
       ></send-asset>

  </div>
</template>

<script>
const thridAppConfig = `https://raw.githubusercontent.com/StellarCN/firefly/docs/third.json`
import axios from 'axios'
import { mapState, mapActions} from 'vuex'
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import Loading from '@/components/Loading'
import  defaultsDeep  from 'lodash/defaultsDeep'
import SendAsset from '@/components/SendAsset'

export default {
  data(){
    return {
      apps: [{
        title: 'test',
        image: 'https://cn.vuejs.org/images/logo.png',
        site: 'http://192.168.2.253:8080'
      },{
        title: 'test',
        image: 'https://cn.vuejs.org/images/logo.png',
        site: 'http://192.168.2.253:8080'
      },{
        title: 'test',
        image: 'https://cn.vuejs.org/images/logo.png',
        site: 'http://192.168.2.253:8080'
      },{
        title: 'test',
        image: 'https://cn.vuejs.org/images/logo.png',
        site: 'http://192.168.2.253:8080'
      },{
        title: 'test',
        image: 'https://cn.vuejs.org/images/logo.png',
        site: 'http://192.168.2.253:8080'
      },{
        title: 'test',
        image: 'https://cn.vuejs.org/images/logo.png',
        site: 'http://192.168.2.253:8080'
      },{
        title: 'test',
        image: 'https://cn.vuejs.org/images/logo.png',
        site: 'http://192.168.2.253:8080'
      },{
        title: 'test',
        image: 'https://cn.vuejs.org/images/logo.png',
        site: 'http://192.168.2.253:8080'
      },{
        title: 'xiaoyugan',
        image: 'https://cn.vuejs.org/images/logo.png',
        site: 'http://yugan.fun/'
      }],
      working: false,
      err: null,
      showConfirmDlg: false,
      choosed: {}, //当前选中的app
      showSendAsset: false,
      sendTarget:{},
      appInstance: null,
    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
    }),
  },
  beforeMount () {
    // this.working = true
    // this.err = null
    // axios.get(thridAppConfig)
    //   .then(response=>{
    //     this.working = false
    //     //console.log(response)
    //     this.apps = response.data.apps
    //   })
    //   .catch(err=>{
    //     this.working = false
    //     console.error(err)
    //     this.err = 'Error.AjaxTimeout'
    //   })
  },
  methods: {
    back(){
      this.$router.back()
    },
    choose(app){
      this.choosed = app
      let val = localStorage.getItem(app.site)
      if(val){
        this.openApp()
        return
      }
      this.showConfirmDlg = true
    },
    openApp(){
      localStorage.setItem(this.choosed.site, "confirm")
      this.showConfirmDlg = false
      if(cordova.platformId === 'browser'){
        this.appInstance = cordova.InAppBrowser.open(this.choosed.site, '_blank', 'location=yes,toolbar=yes,toolbarcolor=#21ce90');
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
              backButton: {
                  image: 'back',
                  imagePressed: 'back_pressed',
                  align: 'left',
                  event: 'backPressed'
              },
              forwardButton: {
                  image: 'forward',
                  imagePressed: 'forward_pressed',
                  align: 'left',
                  event: 'forwardPressed'
              },
              closeButton: {
                  image: 'close',
                  imagePressed: 'close_pressed',
                  align: 'left',
                  event: 'closePressed'
              },
              reloadButton: {
                  image: 'reload',
                  imagePressed: 'reload_pressed',
                  align: 'right',
                  event: 'reloadPressed'
              },
              customButtons: [
                  {
                      image: 'share',
                      imagePressed: 'share_pressed',
                      align: 'right',
                      event: 'sharePressed'
                  }
              ],
              backButtonCanClose: true
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
      })
      this.appInstance.addEventListener('loadstop',() => {
        let script = `if(!window.FFW){window.FFW = {};FFW.address = "${this.account.address}";FFW.pay = function(destination,code,issuer,amount,memo_type,memo){ var params = { type:'pay',destination: destination, code: code, issuer: issuer, amount: amount, memo_type: memo_type, memo: memo };cordova_iab.postMessage(JSON.stringify(params));};};`
        //let scriptEle = `if(!window.FFW){var script = document.createElement('script');script.setAttribute('type', 'text/javascript');script.text = "${script}";document.body.appendChild(script);}`
        //alert(scriptEle)

        this.appInstance.executeScript({ code: script },params => {
          //console.log(params)
          //alert('after script insert')
          //alert(params)
        })

      })
    
      this.appInstance.addEventListener('message', e => {
        let type = e.data.type
        if(type === 'pay'){
          try{
            this.showSendAsset = true
            this.sendTarget = e.data
            this.appInstance.hide()
          }catch(err){
            console.error(err)
            //alert('error:'+err.message)
          }
        }
      })
    },
    exitSendAsset(){
      this.showSendAsset = false
      this.appInstance.show()
    },
    sendAssetSuccess(){
      this.showSendAsset = false
      this.appInstance.show()
      //TODO 怎么通知应用
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
    }
  },
  components: {
    Toolbar,
    Loading,
    Card,
    SendAsset,
  }
}
</script>


<style lang="stylus" scoped>
@require '../../stylus/color.styl'
.app-card
  background: $primarycolor.gray
.app-title
  padding: .1rem .1rem
  overflow: hidden
  white-space: nowrap
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
</style>
