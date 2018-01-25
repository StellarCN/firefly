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
    <div class="logo-wrapper">
            <img src="../../assets/img/logo-blank.png" alt="firefly" class="logo-img"/>
    </div>
    <div class="content">
      <card class="icard" padding="8px 8px">
        <div class="card-content" slot="card-content">
            <div class="row">
                <div class="label">
                    {{$t('Version')}}
                </div>
                <div class="value">
                    {{appversion}}
                </div>
            </div>
            <div class="row">
                <div class="label">
                    github
                </div>
                <div class="value" @click="openFireflyGithub">
                    {{fireflyGithub}}
                </div>
            </div>
        </div>
      </card>
      <div style="flex: 1;"></div>
      <v-footer>
        <v-layout row wrap>
          <v-flex xs12>
            <v-btn class='primary' block dark large @click="openDownloadURL" v-if="latestVersion > appversion">{{$t('About.UpdateTo')}} {{latestVersion}}</v-btn>
          </v-flex>
        </v-layout>
      </v-footer>
    </div>
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import { APP_VERSION, APP_GITHUB, checkUpdate } from '@/api/gateways'

export default {
  data(){
    return {
      showmenuicon: false,
      showbackicon: true,
      appversion: APP_VERSION,
      fireflyGithub: APP_GITHUB,
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

    openFireflyGithub(){
      window.open(this.fireflyGithub, '_system')
    },

    checkNewVersion() {
      checkUpdate().then(data => {
        this.latestVersion = data.version
        this.updateURL = data.url
      }).catch(err => console.log(err))
    },

    openDownloadURL() {
      window.open(this.updateURL, '_system')
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
.page
  background: $primarycolor.gray
  .content
    padding: 8px 8px
    color: $primarycolor.font
  .logo-wrapper
    height: 240px
    width: 100%
    background: $primarycolor.green
    display: block
    text-align: center
    vertical-align: middle
    padding-top: 42px
    .logo-img
      width: 120px
      height:156px
.row
  display: flex
  border-bottom: 1px solid $secondarycolor.font
  padding-top: 5px
  padding-bottom: 5px
  &:last-child
    border-bottom: 0px
  .label
    flex: 1
  .value
    flex: 3
    color: $secondarycolor.font
.link
    color: $secondarycolor.font
</style>
