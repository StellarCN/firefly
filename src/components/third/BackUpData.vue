// 备份联系人和地址簿
<template>
  <div class="trust-line-wrapper">
    <v-bottom-sheet persistent v-model="showPwdSheet" v-if="showPwdSheet" dark>
      <div class="sheet-content">
        <div class="sheet-title textcenter">
          <div class="title">{{$t('Backup')}}</div>
        </div>

        <div class="sheet-title flex-row" v-if="appname">
          <div class="label flex1">{{$t('Title.ThirdApp')}}</div>
          <div class="value flex2 textleft pl-1">{{appname}}</div>
        </div>

        <div class="sheet-input">
          <v-text-field
              name="password"
              :label="$t('Account.Password')"
              v-model="password"
              :append-icon="pwdvisible ? 'visibility' : 'visibility_off'"
              :append-icon-cb="() => (pwdvisible = !pwdvisible)"
              :type="pwdvisible ? 'text':'password'"
              required dark
            ></v-text-field>
        </div>
        <div  class="sheet-btns">
          <div class="sheet-btn" @click="exit">{{$t('Button.Cancel')}}</div>
          <div class="sheet-btn" @click="ok">{{$t('Button.OK')}}</div>
        </div>
      </div>
    </v-bottom-sheet>

  </div>  
</template>

<script>
import { mapState, mapActions, mapGetters} from 'vuex'
import { encrypt,decrypt,encryptToBase64,decryptByBase64 } from '@/api/crypt'

export default {
  data(){
    return {
      showPwdSheet: true,
      password:null,
      pwdvisible: false,

    }
  },
  props: {
    appname: {
      type: String
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
  methods: {
    exit(){
      this.password = null
      this.$emit('exit')
    },
    ok(){
      if(!this.islogin)return
      if(!this.password)return
      let params = {
        contacts: this.allcontacts,
        myaddresses: this.myaddresses
      }
      let data = encryptToBase64(this.password, JSON.stringify(params))
      this.$emit('success', data)
    },
  },
  components: {
  }
}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/trade.styl'

.sheet-content
  background: $secondarycolor.gray
  color: $primarycolor.font
  padding: 10px 10px
  word-wrap: break-word
  .sheet-title
    .title
      height: 40px
      line-height: 40px
      font-size: 32px
      text-align: center
      color: $primarycolor.green
      padding: 10px 10px
    .label
      color: $secondarycolor.font
    .value
      font-size: 16px
  .sheet-btns
    margin-top: 10px
    display: inline-block
    width: 100%
    .sheet-btn
      float: left
      width: 50%
      height: 40px
      line-height: 40px
      text-align: center
      font-size: 16px
      color: $primarycolor.green

</style>

