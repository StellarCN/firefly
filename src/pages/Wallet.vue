/**
 * 创建钱包账户界面
 */
<template>
  <div class="create-account-page">
    <v-btn icon v-show="showbackicon" @click="back" class="white--text">
        <i class="material-icons back-icon">&#xE5CB;</i>
      </v-btn>

    <div class="logo">
      <img src="../assets/img/logo-blank.png" alt="firefly" class="logo-img"/>
    </div>
    <div class="footer">
       <v-layout row wrap>
        <v-flex xs6 @click="importAccount">
          <span>{{$t('ImportAccount')}}</span>
        </v-flex>
        <v-flex xs6  @click="createAccount">
          <span>{{$t('CreateAccount')}}</span>
        </v-flex>
       </v-layout>  
    </div>  
  </div>  
</template>
<script>
import { mapState,mapActions} from 'vuex'
export default {
  computed:{
    ...mapState({
      accounts: state => state.accounts.data
    }),
    showbackicon(){
      if(this.accounts && this.accounts.length > 0 )return true
      return false
    }
  },
  methods: {
    ...mapActions({
      doImportAccount: 'importAccountChange',
      doCreateAccount: 'createAccountChange'
    }),
    importAccount(){
      this.doImportAccount()
      this.$router.push({name: 'TermsOfService'})
    },
    createAccount(){
      this.doCreateAccount()
      this.$router.push({name: 'TermsOfService'})
    },
    back(){
      // this.$router.back()
      this.$router.push({name: 'Guidepage'})
    }
  }
}
</script>
<style lang="stylus" scoped>
@require '../stylus/color.styl'
.back-icon
  font-size: 32px
.create-account-page
  //position: absolute
  //top: 0
  //right: 0
  //left: 0
  //bottom: 0
  display: block
  height: 100%
  background: $primarycolor.green
  color: $primarycolor.font
  .logo
    margin-top: 40%
    display: block
    text-align: center
    vertical-align: center
    .logo-img
      width: 120px
      height:156px
  .logo-title
    text-align: center
    height: 60px
    line-height: 60px
    font-size: 42px
    color: $primarycolor.font
  .footer
    position: fixed
    bottom: 0
    left: 0
    right: 0
    z-index: 99
    background: $secondarycolor.green
    height: 42px
    line-height: 42px
    font-size: 16px
    text-align: center

</style>
