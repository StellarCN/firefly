/**
 * 顶部工具栏
 */
<template>
  <div class="cp-toolbar">

    <v-toolbar  dark :class="color" :flat="!shadow" dense :clipped-left='true' app>
      <v-btn icon v-if="showbackicon" @click="back" class="white--text">
            <v-icon class="back-icon">&#xE5CB;</v-icon>
      </v-btn>
      <slot name="left-tool">
        <v-btn icon style="visibility:hidden;" v-if="!showmenuicon && !showbackicon">
          <v-icon class="back-icon"></v-icon>
        </v-btn>
      </slot>
      <v-toolbar-title class="toolbar-title white--text" >{{title}}</v-toolbar-title>
      <slot name="right-tool">
        <v-btn icon style="visibility: hidden;">
            <v-icon class="back-icon"></v-icon>
        </v-btn>
      </slot>
    </v-toolbar>


    <v-bottom-sheet  v-model="showPwdSheet" v-if="showPwdSheet" dark>
      <div class="sheet-content">
        <div class="sheet-title">
          <h4 class="title">
            <slot name='switch_password'> 
          <!--if call for passowrd -->
              <span>{{$t('ChangeAccount')}}</span>
            </slot>
          </h4>
        </div>
        <div class="sheet-title">
          <div class="label">{{$t('Account.AccountName')}}</div>
          <div class="value">{{selectedAccount.name || account.name}}</div>
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
          <div class="sheet-btn" @click="canclePwdInput">{{$t('Button.Cancel')}}</div>
          <div class="sheet-btn" @click="okPwdInput">{{$t('Button.OK')}}</div>
        </div>
      </div>
    </v-bottom-sheet>

  </div>
</template>

<script>
import { mapState, mapActions} from 'vuex'
import { closeStreams, initStreams, cleanStreamData } from '@/streams'
export default {
  data(){
    return {
      showmenu: false,
      AccountSettings: [
         { title: 'Menu.MyAssets', path:{name:'MyAssets'}, icon: "account_balance_wallet" },
         { title: 'Menu.TradeCenter', path:{name:'TradeCenter'}, icon: "trending_up" },
         { title: 'Menu.Funding', path:{name:'Funding'}, icon: "import_export" },
         { title: 'Menu.History', path:{name:'History'}, icon: "history" },
      ],
      WalletSettings: [
         { title: 'Menu.MyAddress', path:{name:'MyAddress'}, icon: "bookmark" },
         { title: 'Menu.Contacts', path:{name:'ContactsList'}, icon: "supervisor_account"},
         { title: 'Menu.Settings', path:{name:'Settings'}, icon: "settings" },
         { title: 'Menu.Help', path:{name:'Help'}, icon: "help" },
      ],
      selected: {},
      password: null,
      showaccounts: false,
      selectedAccount: {},
      showPwdSheet: false,
      selectedIndex:null,
      password: null,
      pwdvisible: false,
      checkPwd: false,//是否正在校验密码

    }
  },
  computed:{
    ...mapState({
      accounts: state => state.accounts.data,
      account: state => state.accounts.selectedAccount,
      selectedAccountIndex: state => state.accounts.selected,
      accountData: state => state.accounts.accountData,
    }),
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    showbackicon: {
      type: Boolean,
      default: true
    },
    showmenuicon: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: 'primary'
    },
    shadow: {
      type: Boolean,
      default: false
    }
  },
  mounted(){
  },
  methods: {
    ...mapActions({
      cleanAccount:'cleanAccount',
      choseAccount: 'changeAccount',
      choseAccountNoPwd: 'changeAccountNoPassword'
    }),
    changetheme(color){
      if (color=== 'ui'){
        this.$vuetify.theme.primary = '#21ce90'
      }else{
        this.$vuetify.theme.primary = 'red'
      }
    },
    redirect(url){
      this.$router.push(url)
    },
    changeAccount(index,item){
      this.selectedAccount = item
      this.selectedIndex = index
      this.showPwdSheet = true
    },
    //取消输入密码，则直接无密码跳转账户
    canclePwdInput(){
      this.showPwdSheet=false
      //this.choseAccountNoPwd({index:this.selectedIndex, account: this.selectedAccount.address})
    },
    //校验密码是否正确，不正确则提示，正确则跳转账户
    okPwdInput(){
      if(this.checkPwd)return
      //无密码则报错
      if(!this.password){
        this.$toasted.error(this.$t('Error.PasswordWrong')) //请输入密码
        return
      }
      //检验密码
      this.checkPwd = true
      let data = {
        index: this.selectedIndex === null ? this.selectedAccountIndex : this.selectedIndex,
        address: this.selectedAccount.address || this.account.address,
        password: this.password
      }
      console.log(data)
      this.choseAccount(data).then(account=>{
        this.$toasted.show(this.$t('Info.ChangeAccountSuccess'));
        this.showPwdSheet = false;
        this.checkPwd = false;
        this.password = null;
        this.showaccounts = false;
        //重新处理stream
        closeStreams();
        cleanStreamData();
        initStreams(this.account.address);

      }).catch(err=>{
        console.error('change account error')
        console.error(err)
        this.$toasted.error(this.$t('Error.PasswordWrong'))
        this.checkPwd = false
      })
    },
    isPage(path){
      let url = this.$route.name
      if(url.indexOf(path.name)===0){
        return ' menuactive'
      }
      return ''
    },
    showMenu(){
      this.showmenu = !this.showmenu
    },
    switchShowAccounts(){
      this.showaccounts = !this.showaccounts
    },
    back(){
      //console.log('----on click -- go back')
      this.$router.back()
      //this.$emit('goback');
    },
    changeaccount(index,item){
      //console.log('------change account----')
      //if(item.address === this.account.address){
      //  return;
      //}
      // 弹出密码对话框，
      this.showmenu = !this.showmenu
      if(this.changeAccount){
        this.changeAccount(index,item)
      }
    },
    showPasswordLogin(){
      this.showPwdSheet = true
    },
    //取消输入密码，则直接无密码跳转账户
    canclePwdInput(){
      this.showPwdSheet=false
      //this.choseAccountNoPwd({index:this.selectedIndex, account: this.selectedAccount.address})
    },
    //校验密码是否正确，不正确则提示，正确则跳转账户
    okPwdInput(){
      if(this.checkPwd)return
      //无密码则报错
      if(!this.password){ 
        this.$toasted.error(this.$t('Error.PasswordWrong')) //请输入密码
        return
      }
      //检验密码
      this.checkPwd = true
      let data = {
        index: this.selectedIndex === null ? this.selectedAccountIndex : this.selectedIndex,
        address: this.selectedAccount.address || this.account.address,
        password: this.password
      }
      console.log(data)
      this.choseAccount(data).then(account=>{
        this.$toasted.show(this.$t('Info.ChangeAccountSuccess'))
        this.showPwdSheet = false
        this.checkPwd = false
        this.password = null
        this.showaccounts = false
        //重新处理stream        closeStreams()
        initStreams(this.account.address)
      }).catch(err=>{
        console.error('change account error')
        console.error(err)
        this.$toasted.error(this.$t('Error.PasswordWrong'))
        this.checkPwd = false
      })
    },
  }
}
</script>

<style lang="stylus" scoped>

@require '../stylus/color.styl'

.cp-toolbar
  z-index: 99
.menu-icon
  color: $primarycolor.font
.back-icon
  font-size: 36px
.toolbar-title
  text-align: center
  width: 100%
  flex:1

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
