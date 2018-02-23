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
          <div class="logo-wrapper">
            <img src="../../assets/img/logox.png" alt="firefly" class="logo-img"/>
          </div>
          <div class="textcenter appname">
            FireFly
          </div>
          <div class="textcenter appversion">
            {{$t('Version')}}:{{appversion}}
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
            <div class="row"  @click="openDownloadURL" v-if="latestVersion">
                <div class="label">
                    {{$t('LatestVersion')}}
                </div>
                <div class="value">
                    {{latestVersion}}
                     <i class="material-icons vcenter f-right">keyboard_arrow_right</i>
                </div>
            </div>
        </div>
      </card>
    </div>
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import { APP_VERSION, APP_GITHUB, OFFICIAL_SITE, getPackageJson } from '@/api/gateways'
const semver = require('semver')

export default {
  data(){
    return {
      showmenuicon: false,
      showbackicon: true,
      appversion: APP_VERSION,
      fireflyGithub: APP_GITHUB,
      officialSite: OFFICIAL_SITE,
      latestVersion: null,
      updateURL: null
    }
  },
  mounted() {
    this.checkNewVersion()
  },
  methods: {
    back(){
      this.$router.back()
    },

    checkNewVersion() {
      getPackageJson().then(response => {
        let data = response.data
        this.latestVersion = data.version
        this.updateURL = data.homepage
      }).catch(err => console.log(err))
    },

    openDownloadURL() {
      window.open(this.updateURL, '_system')
    },
    openURL(url){
      window.open(url, '_system')
      
    },
    toTermOfServices(){
      this.$router.push({
        name: 'TermsOfService',
        query: {
          active: 'back'
        }
      })
    },
  },
  components: {
    Toolbar,
    Card,

  }


}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.logo-wrapper
  height: 120px
  width: 100%
  display: block
  text-align: center
  vertical-align: middle
  .logo-img
    width: 120px
    height:120px
.appname
  font-size: 24px
  color: $primarycolor.green
.appversion
  color: $secondarycolor.font
.row
  display: flex
  padding-top: 5px
  padding-bottom: 5px
  height: 46px
  line-height: 46px
  vertical-align: middle
  &:last-child
    border-bottom: 0px
  .label
    flex: 1
  .value
    flex: 3
    color: $secondarycolor.font
    font-size: 14px
    height: 46px
    line-height: 46px
    vertical-align: middle
.link
    color: $secondarycolor.font
.material-icons
  margin-top: 12px
</style>
