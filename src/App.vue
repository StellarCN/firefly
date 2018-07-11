<template>
<div>

  <v-app :class="'app ' + (showFuzzyView?'fuzzy-app':'')  + (isios ? ' ios-app ':' ' )" dark>
      <v-system-bar status :color="iosstatusbarcolor" v-if="isios && !isFull" app>
        <v-spacer></v-spacer>
      </v-system-bar>
      <v-content class="contentx">
        <router-view />
      </v-content>
      <tab-bar v-if="tabBarShow"/>

    <v-dialog v-model="updateConfirmDlg" max-width="95%" persistent>
      <div>
        <div class="a-card-content">
          <div class="avatar-div textcenter">
            <v-avatar>
              <img src="./assets/img/logo-red.png" />
            </v-avatar>
          </div>
          <div class="a-t1 a-red textcenter" v-if="updating">{{$t('UpdateHint')}}</div>
          <div class="a-t1 a-red textcenter" v-if="!updating">{{$t('FindNewVersion',[latestVersion])}}</div>
          <div class="a-btns flex-row" v-if="!updating">
            <div class="flex1 a-red textcenter" @click="doUpdate">{{$t('Update')}}</div>
            <div class="flex1 a-red textcenter" @click="updateConfirmDlg = false">{{$t('Button.Cancel')}}</div>
          </div>
        </div>
      </div>
    </v-dialog>
   


  </v-app>

  <div class="fuzzy-view" v-if="showFuzzyView">

  </div>


</div>
</template>

<script>
import Vue from "vue";
import { mapActions, mapState } from "vuex";
import PinCode from "@/components/PinCode";
import { defaultTradePairsAPI,initFundConfig } from "@/api/gateways";
import { closeStreams, initStreams } from "@/streams";
import { initStorage, checkPlatform } from "@/api/storage";
import { getDeviceLanguage, ZH_CN } from "@/locales";
import  TabBar from '@/components/TabBar'
import { getFchainRss } from '@/api/fchain'
import initCordovaPlugin from '@/libs/pkgs/initCordovaPlugin'
import updateMixin from '@/mixins/update'
import { PLATFORM_IS_IOS } from '@/store/modules/AppSettingStore'
import { FCHAIN_HORIZON } from '@/api/horizon'

export default {
  data() {
    return {
      pauseStart: null, //暂时的起始时间
      pauseMaxSecond: 60, //最大
      isios: false,
      devicelang: null,
      showFuzzyView: false,
      tabBarShow: false,
      tabBarItems: ['MyAssets', 'TradeCenter', 'Apps', 'My'],

      messagesInterval: null,
      updateConfirmDlg: false,
      latestVersion: null,
      updating: false,
      // items:Store.fetch(),
    };
  },
  watch: {
    '$route'(to,from){
      if(this.tabBarItems.indexOf(to.name) >= 0){
        this.tabBarShow = true
        this.$store.commit('SHOW_TABBAR')
      }else{
        this.tabBarShow = false
        this.$store.commit('HIDE_TABBAR')
      }
    },
    showTabbar(value){
      // console.log('-------------2:'+value)
      this.tabBarShow = value
    }    
  },
  computed: {
    ...mapState({
      showloading: state => state.showloading,
      locale: state => state.app.locale,
      alldata: state => state,
      address: state => state.accounts.selectedAccount.address,
      iosstatusbarcolor: state => state.iosstatusbarcolor,
      accounts: state => state.accounts.data,
      showTabbar: state => state.showTabbar,
      isFull: state => state.isFull,
    }),
  },
  mixins: [updateMixin],
  beforeMount() {
    console.log('-----------------------------1:'+this.$route.name)
    if(this.tabBarItems.indexOf(this.$route.name) >=0 ){
      this.tabBarShow = true
      this.$store.commit('SHOW_TABBAR')
    }else{
      this.$store.commit('HIDE_TABBAR')
    }
    Vue.cordova.on("deviceready", () => {
      initCordovaPlugin()
      this.getMessages()
      checkPlatform();
      try {
        //获取默认交易对
        // defaultTradePairsAPI();
        // initFundConfig();
        this.loadDApps().then(data=>{}).catch(err=>{});
        this.loadFundConfig().then(data=>{}).catch(err=>{})
      } catch (err) {
        console.error(err);
      }

      //添加cordova事件
      document.addEventListener("pause",() => {
          this.onAppPause();
          this.onPause();
        }, false);
      document.addEventListener("resume",() => {
          this.onAppResume();
          this.onResume();
        },false);

      if ("ios" === cordova.platformId) {
        this.isios = true;
        this.$store.commit(PLATFORM_IS_IOS, true);
      }
      navigator.splashscreen.hide();
      if (StatusBar && !StatusBar.isVisible) {
        StatusBar.show();
        StatusBar.backgroundColorByHexString("#21ce90");
        this.$store.commit("CHANGE_IOSSTATUSBAR_COLOR", "primary");
      }
      //加载系统配置
      getDeviceLanguage()
        .then(locale => {
          this.devicelang = locale;
          this.$i18n.locale = this.devicelang.key
          //下次更新后直接使用默认的fchain，horizon
          // if(!localStorage.getItem('horizon')){
          //   localStorage.setItem('horizon',1)
          //   return this.loadAppSetting({horizon: FCHAIN_HORIZON})
          // }
          return this.loadAppSetting();
        })
        .then(data => {
          //如果data不为空，则跳转到主界面，否则跳转到创建账户界面
          if (this.locale) {
            this.$i18n.locale = this.locale.key;
          }
          // navigator.splashscreen.hide();
          return this.loadAccounts();
        })
        .then(data => {
          navigator.splashscreen.hide();

          //尝试加载当前账户信息
          try {
            if (this.address) {
              //this.getAccountInfo(this.address)
              //closeStreams();
              
              // initStreams(this.address);
              this.getAllAssetHosts();
            }
            this.saveDefaultTradePairsStat().then(()=>{}).catch(err=>{console.error(err)});
          } catch (err) {
            console.log(err);
          }
          if (this.alldata.app.enablePin) {
            this.$router.push({ name: "PinLock" });
          } else {
            if (this.accounts.length === 0) {
              //  this.$router.push({name: 'Wallet'})
              if (window.localStorage.getItem("login_flag") == 1) {
                this.$router.push({ name: "Wallet" });
              } else {
                this.$router.push({ name: "Picklanguage" });
              }
            } else {
              this.$router.push({ name: "MyAssets" });
            }
          }
        })
        .catch(err => {
          console.log("load app setting error ");
          console.log(err);
          // 跳转到错误界面
          //this.$toasted.error(err._message)
          navigator.splashscreen.hide();

          initStorage()
            .then(() => {
              console.log("---init storage ok---");
              this.saveAppSetting({ locale: this.devicelang||ZH_CN });
            })
            .catch(err => {
              console.error("---init storage error---");
              console.error(err);
              this.saveAppSetting({ locale: this.devicelang||ZH_CN });
            });
          //保存默认的设置数据
          // this.$router.push({name: 'Wallet'})
          if (window.localStorage.getItem("login_flag") == 1) {
            this.$router.push({ name: "Wallet" });
          } else {
            this.$router.push({ name: "Picklanguage" });
          }
        });

      //检查更新
      this.getReleaseVersion()
        .then(data=>{
          if(data.needUpdate){
            this.updateConfirmDlg = true
            this.latestVersion = data.latestVersion
          }
        })
        .catch(err=>{
          console.error(err)
          this.updateConfirmDlg = false
        })

    });
  },
  mounted() {
    //每小时执行一次
    this.messagesInterval = setInterval(()=>{
      this.getMessages()
    }, 3600000)    
  },
  destroyed() {
      clearInterval(this.messagesInterval)
  },
  methods: {
    ...mapActions([
      "deviceLang",
      "loadAppSetting",
      "getLedger",
      "loadAccounts",
      "saveAppSetting",
      "afterPauseAppSetting",
      "getAccountInfo",
      "getAllAssetHosts",
      "onPause",
      "onResume",
      "getMessages",
      "saveDefaultTradePairsStat",
      'loadDApps',
      'loadFundConfig',
    ]),
    onAppPause() {
      this.showFuzzyView = true
      this.pauseStart = new Date().getTime();
      navigator.splashscreen.show();
    },
    onAppResume() {
      navigator.splashscreen.hide();
      this.showFuzzyView = false
      //暂停恢复,判断是否要输入pin码
      if (this.alldata.app.enablePin) {
        let pauseEnd = new Date().getTime();
        let total = (pauseEnd - this.pauseStart) / 1000;
        if (total >= this.pauseMaxSecond) {
          this.$router.push({ name: "PinLock" });
        }
      }
    },
    doUpdate(){
      this.updating = true
      this.checkForUpdates()
    },
    showTabbarView(){
      this.tabBarShow = true
    },
    hideTabbarView(){
      this.tabBarShow = false
    }
    // toPicklanguage(){
    //   this.$router.push({name:'Picklanguage'})
    // },
  },
  // beforeCreate(){
  //     var  toPicklanguage =function(){
  //     this.$router.push({name: 'Picklanguage'})
  //   }
  // },
  components: {
    PinCode,
    TabBar,
  }
};
</script>
<style lang="stylus">
@require './stylus/app.styl';

.app {
  background-color: $primarycolor.gray;
}

.bg-hide {
  background: none;
  background-color: transparent;
}

.loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $primarycolor.green;
  opacity: 0.8;
  z-index: 99;
  display: block;
  text-align: center;
  vertical-align: center;

  img {
    margin-top: 60%;
    width: 100px;
    height: 100px;
  }
}

.app-pin {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  // height: 100%
  background: $primarycolor.gray;
  z-index: 9999;

  .pin-bar {
    height: 56px;
    line-height: 56px;
    font-size: 20px;
    display: flex;
    color: $primarycolor.font;
    -webkit-align-items: center;
    align-items: center;
    -webkit-justify-content: center;
    justify-content: center;
    background: $primarycolor.green;

    .pin-bar-icon {
      flex: 1;
      text-align: center;
      justify-content: center;
      -webkit-align-items: center;
      align-items: center;
      -webkit-justify-content: center;
      justify-content: center;
      height: 56px;
      line-height: 56px;

      .material-icons {
        font-size: 32px;
        height: 56px;
        line-height: 56px;
      }
    }

    .pin-bar-title {
      flex: 6;
      text-align: center;
    }
  }
}
.fuzzy-view
  position: fixed
  top: 0
  bottom: 0
  left: 0
  right: 0
  z-index: 9999
.fuzzy-app
  -webkit-filter: blur(5px)
  filter: blur(5px)
  -webkit-backdrop-filter: blur(5px)
  backdrop-filter: blur(5px)
  -webkit-filter: blur(5px)
  margin: -2px
  background-size: cover
  /*平铺*/
  background-attachment: fixed
// .ios-app
//   .page
//     padding-top: .2rem!important
.contentx
  padding-top: 0px
  padding-top: constant(safe-area-inset-top)
  padding-top: env(safe-area-inset-top)


.a-card-content
  padding: 20px 10px
  background: $secondarycolor.gray
.a-t1
  font-size: 20px
  padding-top: 5px
  padding-bottom: 5px
.a-red
  color: $primarycolor.red
.a-btns
  font-size: 16px
  

@css {
  html{
    background: none;
    background-color: transparent;
  }
  .white-input:not(.input-group--focused)> .input-group__input{
    border-bottom: 1px solid #FFF;
  }
  .application--light .input-group:not(.input-group--error) label{
    color:#FFF;
  }
  .application--light .input-group:not(.input-group--error) label:after{
    color:#f35530;
  }
  .app.application.theme--dark{
    background: #212122;
  }
  .app.application.theme--dark.bg-hide{
    background: none;
    background-color:transparent;
  }
  .application{
    font-family:  "Helvetica Neue", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
  }
  .application--light .input-group:not(.input-group--error):not(.input-group--focused):not(.input-group--disabled) .input-group__input .input-group__append-icon{
    color:#FFF;
  }
  .application--light .input-group input{
    color:#FFF;
  }
  .amount-slider.input-group.input-group--slider .input-group__input .slider .slider__track__container .slider__track-fill,
.amount-slider.input-group.input-group--slider .input-group__input .slider .slider__thumb-container .slider__thumb{
    background: #f35833;
  }
  @supports (bottom: constant(safe-area-inset-bottom)) {
    .footer {
      margin-bottom: constant(safe-area-inset-bottom);
    }
  }
}
</style>
