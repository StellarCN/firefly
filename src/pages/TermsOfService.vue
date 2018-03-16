/**
 * 服务条款界面
 */
<template>
  <div class="terms-service-page">
    <v-toolbar dark class="tbar primary" dense app>
      <v-btn icon v-show="showbackicon" @click="goback" class="white--text">
            <v-icon class="back-icon">&#xE5CB;</v-icon>
      </v-btn>
      <v-toolbar-title class="white--text title">{{$t('TermsOfServiceTitle')}}</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <div :class="'page-content ' + (showbackicon ? 'page-content-showback': '')" v-html="$t('TermsOfService')">
    </div>
    <div class="footer" v-if="!showbackicon">
       <v-layout row wrap>
        <v-flex xs6 @click="goback">
          <span>{{$t('Return')}}</span>
        </v-flex>
        <v-flex xs6 @click="wallet">
          <span>{{$t('Agree')}}</span>
        </v-flex>
       </v-layout>  
    </div>  
  </div>
</template>

<script>
import { mapState,mapActions} from 'vuex'
export default {
  data(){
    return {
      showbackicon: false
    }
  },
  computed: {
    ...mapState({
      isImportAccount: state => state.isImportAccount,
      isCreateAccount: state => state.isCreateAccount
    })
  },
  beforeMount () {
    let active = this.$route.query.active
    if(active === 'back'){
      this.showbackicon = true
    }


  },
  methods: {
    ...mapActions({
      backToAccount: 'backToAccount'
    }),
    goback(){
      this.backToAccount()
      this.$router.back()
    },
    wallet(){
     if(this.isImportAccount){
        this.$router.push({name: 'ImportAccount'})
        return
      }
      this.$router.push({name: 'CreateAccount'})
    }
  }
}
</script>

<style  lang="stylus" scoped>
@require '~@/stylus/color.styl'
.terms-service-page
  background: $primarycolor.gray
.tbar
  z-index: 99
.page-content
  position: fixed
  top: 52px
  left: 0
  right: 0
  bottom: 56px
  color: $secondarycolor.font
  overflow-y:auto
  font-size: 14px
  padding: 20px 20px
.page-content-showback
  bottom: 10px
.title
  width: 100%
  text-align: center
  height: 24px
  line-height: 24px
.footer
  position: fixed
  bottom: 0
  left: 0
  right: 0
  z-index: 99
  background: $secondarycolor.gray
  height: 42px
  line-height: 42px
  font-size: 16px
  text-align: center
  color: $primarycolor.green
</style>
