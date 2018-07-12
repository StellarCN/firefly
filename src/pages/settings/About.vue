/**
 * 关于我们界面，显示系统版本等内容
 */
<template>
  <div class="page" >
    <toolbar :title="$t('About.Title')"
      :showmenuicon="showmenuicon"
      :showbackicon="showbackicon"
      @goback="back"
      ref="toolbar"
      >
    </toolbar>
    <div class="content">
      <card class="icard" padding="20px 10px">
        <div slot="card-content" class="">
          <div class="logo-wrapper" @click="toDebug">
            <img src="../../assets/img/logox.png" alt="firefly" class="logo-img"/>
          </div>
          <div class="textcenter appname">
            FireFly
          </div>
          <div class="textcenter appversion">
            {{$t('Version')}}:{{appversion}}<span v-if="isDebug">&nbsp;DEBUG</span>
          </div>
        </div>
      </card>
      <card class="detail-card" padding="10px 10px" margin="10px 0 10px 0">
        <div class="card-content" slot="card-content">
            <div class="row" @click="toTermOfServices">
                <div class="label">
                    {{$t('TermsOfServiceTitle')}}
                </div>
                <div class="value">
                    <i class="material-icons vcenter f-right">keyboard_arrow_right</i>
                </div>
            </div>
            <div class="row" @click="openURL(officialSite)">
                <div class="label">
                    {{$t('OfficialSite')}}
                </div>
                <div class="value"> 
                    {{officialSite}}
                    <i class="material-icons vcenter f-right">keyboard_arrow_right</i>
                </div>
            </div>
            <div class="row"  @click="openURL(fireflyGithub)">
                <div class="label">
                    github
                </div>
                <div class="value">
                    {{fireflyGithub}}
                     <i class="material-icons vcenter f-right">keyboard_arrow_right</i>
                </div>
            </div>
            <div class="row" v-if="latestVersion">
              <div class="label">
                {{$t('LatestVersion')}}
              </div>
              <div class="value">
                {{latestVersion}}
                <i class="material-icons vcenter f-right">keyboard_arrow_right</i>
              </div>
            </div>

            <div class="field_btn">
              <v-btn :loading="working" class="error btn_ok" @click.stop="checkForUpdates">{{$t('CheckForUpdates')}}</v-btn>
            </div>
        </div>
      </card>
    </div>
  </div>
</template>

<script>
import Toolbar from "@/components/Toolbar";
import Card from "@/components/Card";
import {
  APP_VERSION,
  APP_GITHUB,
  OFFICIAL_SITE,
  getPackageJson,
  getVersionInfo,
  DEBUG
} from "@/api/gateways";
const semver = require("semver");
import  debounce  from 'lodash/debounce'

export default {
  data() {
    return {
      showmenuicon: false,
      showbackicon: true,
      appversion: APP_VERSION,
      fireflyGithub: APP_GITHUB,
      officialSite: OFFICIAL_SITE,
      latestVersion: null,
      updateURL: null,
      needUpdate: false,
      working: false,
      counter: 0,
      isDebug: DEBUG,
    };
  },
  beforeDestroy () {
    
  },
  mounted() {
   this.getReleaseVersion()
   document.addEventListener('chcp_nothingToUpdate',()=>{
     this.$toasted.show(this.$t('NothingToInstall'))
   }, false)
   document.addEventListener('chcp_nothingToInstall',()=>{
     this.$toasted.show(this.$t('NothingToInstall'))
   }, false)
  },
  methods: {
    back() {
      this.$router.back();
    },
    getReleaseVersion(){
      getPackageJson()
        .then(response=>{
          let data = response.data
          this.latestVersion = data.version
          this.needUpdate = semver.gt(data.version, APP_VERSION)
        })
        .catch(err=>{
          console.error(err)
        })
    },
    checkForUpdates(){
      if(!chcp)return
      if(this.working)return
      this.working = true
      chcp.fetchUpdate((err,data)=>{
        if(err){
          this.working = false
          console.error(err.description)
          this.$toasted.error(this.$t('FetchUpdateError'))
          return
        }
        this.$toasted.show(this.$t('UpdateHint'))
        chcp.installUpdate(error=>{
          if(error){
            console.error(error)
            this.$toasted.error(this.$t('FetchUpdateError'))
            return
          }
          this.$toasted.show(this.$t('AfterUpdate'))
        })//end of installUpdate
        this.working = false
      })


    },

    openDownloadURL() {
      window.open(this.updateURL, "_system");
    },
    openURL(url) {
      window.open(url, "_system");
    },
    toTermOfServices() {
      this.$router.push({
        name: "TermsOfService",
        query: {
          active: "back"
        }
      });
    },
    toDebug(){
      //window.location.href = 'http://192.168.2.253:3000'
      window.open('http://192.168.2.253:3000', "_self");
    }
  },
  components: {
    Toolbar,
    Card
  }
};
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl';
.field_btn
  margin-top: 1rem
  .btn_ok
    padding: 0px 0px
    margin: 0px 0px
    width: 100%
.logo-wrapper {
  height: 120px;
  width: 100%;
  display: block;
  text-align: center;
  vertical-align: middle;

  .logo-img {
    width: 120px;
    height: 120px;
  }
}

.appname {
  font-size: 24px;
  color: $primarycolor.green;
}

.appversion {
  color: $secondarycolor.font;
}

.row {
  display: flex;
  padding-top: 5px;
  padding-bottom: 5px;
  height: 46px;
  line-height: 46px;
  vertical-align: middle;

  &:last-child {
    border-bottom: 0px;
  }

  .label {
    flex: 1;
    white-space: nowrap!important;
  }

  .value {
    flex: 3;
    color: $secondarycolor.font;
    font-size: 14px;
    height: 46px;
    line-height: 46px;
    vertical-align: middle;
    padding-left: .5rem;
    overflow: hidden;
  }
}

.link {
  color: $secondarycolor.font;
}

.material-icons {
  margin-top: 12px;
}
</style>
