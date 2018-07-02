/**
 * 账户信息展示切换
 * @Author: mazhaoyong@gmail.com
 * @Date: 2018-01-30 16:58:05
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-07-02 12:39:14
 * @License: MIT
 */
<template>
  <div class="account-nav">
      <!--切换账户-->
    <v-navigation-drawer
      absolute
      temporary
      dark
      v-model="showview"
      class='aside'
     >
      <div class="menu-head">
        <div class="menu-row menu-row-1" @click.stop="redirect({name:'AccountNameCard'})">
          <v-icon class="avatar iconfont icon-erweima" color="primary"></v-icon>
        </div>
        <div class="menu-row menu-row-2" @click.stop="redirect({name:'My'})">
          <div class="name">{{account.name}}</div>
          <div class="address">{{account.address | shortaddress}}</div>
        </div>
        <div style="clear:both"></div>
      </div>
      <div class="showaccounts">
        <ul class="accounts-ul">
          <li class="accounts-li" v-for="(item,index) in accounts" :key="item.address" @click="changeaccount(index,item)">
            <span :class="'name '+(item.address === account.address?'active':'')">{{item.name}}</span>
            <span class="selecticon">
              <i class="iconfont icon-dot1" v-if="item.address === account.address"></i>
              <i class="iconfont icon-dot" v-else></i>
            </span>
          </li>
        </ul>
        <div class="manage">
          <div class="createaccount" @click="redirect({name:'Wallet'})">
            <span class="m-icons-wrapper">
              <i class="icons material-icons">&#xE145;</i>
            </span>
            <span class="managewrapper">
              {{$t('Add')}}
            </span>
          </div>
          <div class="manageaccount" @click="redirect({name:'ManageAccount'})">
            <span class="m-icons-wrapper">
              <i class="icons material-icons">&#xE869;</i>
            </span>
            <span class="managewrapper">
              {{$t('Manage')}}
            </span>
          </div>
        </div>
      </div>
    </v-navigation-drawer>
      <!-- end 切换账户 -->

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
export default {
  data(){
    return {
      showview: false,
      showPwdSheet: false,
      pwdvisible: false,
      password: null,
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
  props:{
    show: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    showview(value){
      if(!value){
        this.$emit('close',value)
      }
    },
    show(value){
      if(value){
        this.showview = value
      }
    }
  },
  methods: {
    ...mapActions({
      cleanAccount:'cleanAccount',
      choseAccount: 'changeAccount',
      choseAccountNoPwd: 'changeAccountNoPassword',
      getAccountInfo: 'getAccountInfo'
    }),
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
      this.choseAccount(data).then(account=>{
        this.$toasted.show(this.$t('Info.ChangeAccountSuccess'));
        this.showPwdSheet = false;
        this.checkPwd = false;
        this.password = null;
        this.getAccountInfo(this.account.address);

      }).catch(err=>{
        console.error('change account error')
        console.error(err)
        this.$toasted.error(this.$t('Error.PasswordWrong'))
        this.checkPwd = false
      })
    },
    switchShowAccounts(){
      this.showaccounts = !this.showaccounts
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
    hide(){
      this.showview = false
    }
  }
}
</script>
<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.aside
  background: $secondarycolor.gray !important
  .divid
    background-color rgb(33,33,34)
    border: none
    display: block
    height: 1px
    flex: 1
    width: 100%
  .menu-head
    display: block
    padding: 30px 10px
    width: 100%
    background: $primarycolor.gray
    .menu-row
      float: left
      color: $primarycolor.font
    .menu-row-1
      width: 50px
      height: 50px
      line-height: 50px
      border-radius: 50px
      text-align: center
      vertical-align: middle
      background: $secondarycolor.gray
      .avatar
        font-size: 24px
        color: primary
    .menu-row-2
      padding: 5px 15px
      width: 68%
      text-align:center
      .name
        font-size: 16px
        text-align: center
        overflow: hidden
        text-overflow:ellipsis
        white-space: nowrap
        .address
          font-size: 12px
          color: $secondarycolor.font
    .menu-row-3
      float: right
      display: block
      margin-top: 10px
      width: 30px
      height: 40px
      line-height: 30px
      padding: 5px 5px
      color: $primarycolor.green
      text-align: center
      vertical-align: middle
      border-radius: 40px
      .icons
        margin-top: 6px
    .menu-row-3.active
      background: $secondarycolor.gray
 .showaccounts
    background: $secondarycolor.gray
    background: #29292b
    margin-top: -5px
    padding: 20px 20px
    color: $primarycolor.font
    .accounts-ul
      padding-left: 0
      height: 42px
      line-height: 42px
      .accounts-li
        font-size:16px
        float: left
        width: 100%
        .name
          display:block
          float:left
          color: $secondarycolor.font
          overflow: hidden
          width: 80%
          text-overflow:ellipsis
          white-space: nowrap
        .name.active
          color: $primarycolor.font
        .selecticon
          float: right
          .iconfont
            font-size: 21px
          .iconfont.icon-dot1
            color: $primarycolor.green
    .manage
      color: $primarycolor.green
      display: inline-block
      width: 100%
      text-align: center
      vertical-align: middle
      margin-top: 10px
      .createaccount
        float: left
        font-size: 16px
        width: 50%
        height: 30px
        line-height: 30px
        .m-icons-wrapper
          display: inline-block
          vertical-align: middle
          width: 30px
          padding-top: 4px
          height: 30px
          line-height: 30px
          .icons
            font-size: 22px
        .managewrapper
          display: inline-block
      .manageaccount
        float: left
        font-size: 16px
        height: 30px
        line-height: 30px
        width: 50%
        .m-icons-wrapper
          display: inline-block
          vertical-align: middle
          width: 30px
          height: 30px
          line-height: 30px
          .icons
            font-size: 16px
        .managewrapper
          display: inline-block

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

