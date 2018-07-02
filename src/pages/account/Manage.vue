/**
 * 账户管理
 */
<template>
  <div class="page">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
      >
       <!-- <div class="right" slot="right-tool" @click="toAccount">
        <i class="material-icons">&#xE145;</i>
      </div> -->
      <v-btn icon slot='right-tool' @click="toAccount">
        <i class="material-icons font28">&#xE145;</i>
      </v-btn>

    </toolbar>
    <div class="content">
      <card class="mycard">
        <div class="card-content" slot="card-content">
          <div class="account-row"  v-for="(item,index) in accounts" :key="index" 
            @click.stop="info(item)" 
                v-touch="{
                  left: () => selectedItem = index,
                  right: () => selectedItem = null
                }"
            >
            
            <div class="flex-row account-wrapper"  v-swiper=2>
              <div class="flex1">
                <div class="avatar">
                  <i class="iconfont icon-erweima"></i>
                </div>
              </div>
              <div class="name flex2">
                {{item.name}}
              </div>
              <div class="address flex2">
                <span class="label">{{item.address | miniaddress}}</span>
              </div>
              <div class="icons flex1">
                <i class="material-icons"  v-if="item.address === account.address">&#xE876;</i>
              </div>
            </div>

            <div class="operate-box">
              <div class="del" @click.stop="del(item,index)">{{$t('Delete')}}</div>
              <div class="modify" @click.stop="modify(item.address)">{{$t('Modify')}}</div>
              <div class="change" @click.stop="changeaccount(index,item)">{{$t('Change')}}</div>
            </div>
            
          </div>
        </div>
      </card>
    </div>
    <loading :show="showLoading"  :loading="working" :success="delok" :fail='delerror' 
      :title="loadingTitle" :msg="loadingMsg" :closeable="delerror" @close="hideLoadingView"/>

     <div class="pwdSheetWrapper" v-if="showPwdSheet">
        <v-bottom-sheet  v-model="showPwdSheet"  dark>
          <div class="sheet-content">
            <div class="sheet-input">
              <v-text-field
                    name="password"
                    :label="$t('Account.Password')"
                    v-model="inpassword"
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

  </div>
</template>

<script>
import Toolbar from '../../components/Toolbar'
import Card from '../../components/Card'
import Loading from '@/components/Loading'
import { mapState, mapActions} from 'vuex'
import {readAccountData} from '@/api/storage'
import { ACCOUNT_IS_FUNDING,ACCOUNT_NOT_FUNDING } from '@/store/modules/AccountStore'
export default {
  data(){
    return {
      title: 'ManageAccount',
      showbackicon: true,
      showmenuicon: false,

      working: false,
      delok: false,
      delerror: false,

      showPwdSheet: false,
      inpassword: null,
      pwdvisible: false,
      worktype: null,//取值，del
      workindex:null,
      workaccount: null,

      showLoading: false,
      loadingTitle: null,
      loadingMsg: null,

      selectedItem: null,


    }
  },
  computed:{
    ...mapState({
      accounts: state => state.accounts.data,
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      app: state => state.app,
      selectedAccountIndex: state => state.accounts.selected,
    }),
   
  },
  mounted(){
    
  },
  methods: {
    ...mapActions({
      deleteAccount:'deleteAccount',
      cleanAccount: 'cleanAccount',
      changeAccountNoPassword: 'changeAccountNoPassword',
      getAccountInfo: 'getAccountInfo',
      getPayments: 'getPayments',

      choseAccount: 'changeAccount',
      choseAccountNoPwd: 'changeAccountNoPassword',

    }),
    changeaccount(index,item){
      //console.log('------change account----')
      //if(item.address === this.account.address){
      //  return;
      //}
      // 弹出密码对话框，
      this.worktype = 'change'
      this.showmenu = !this.showmenu
      if(this.changeAccount){
        this.changeAccount(index,item)
      }
    },
     changeAccount(index,item){
      this.selectedAccount = item
      this.selectedIndex = index
      this.showPwdSheet = true
    },
    modify(address){
      this.$router.push({name: 'AccountInfo', query: {address: address}});
    },
    back(){
      this.$router.back()
    },
    toAccount(){
      this.$router.push({name: 'Wallet'})
    },
    info(account){
      this.$router.push({name: 'AccountInfo', query: {address: account.address}});
    },
    del(account,index){
      this.workindex = index
      this.workaccount = account
      this.worktype = 'del'
      //要求输入密码才可以操作
      if(this.inpassword === null){
        this.showPwdSheet = true
        return
      }
      if(this.working)return
    },
    canclePwdInput(){
      this.showPwdSheet = false
      this.inpassword = null
    },
    okPwdInput(){
      if(this.inpassword ===  null)return
      this.showLoading = true
      this.working = true
      this.loadingTitle = null
      this.loadingMsg = null
      if('del' === this.worktype){
      let selected = this.workaccount.address === this.account.address
        readAccountData(this.workaccount.address,this.inpassword)
          .then(data=>{
            return this.deleteAccount({ index: this.workindex, account: this.workaccount})
          })
          .then(()=>{
            this.selectedItem = null
            if(selected){
              this.cleanAccount()
            }
            this.loadingTitle = this.$t('Account.DeleteSuccess')
            this.delok = true
            this.delerror = false
            this.inpassword = null
            this.showPwdSheet = false
            this.working = false
            setTimeout(()=>{
              this.showLoading = false
              if(this.accounts.length === 0){
                this.$router.push({name: 'Wallet'})
              }else{
                //重新读取数据
                let address = this.account.address
                Promise.all([this.getAccountInfo(this.account.address)])//,this.getPayments(this.account.address)
                  .then(data=>{
                    try{
                      this.$store.commit(ACCOUNT_IS_FUNDING)
                    }catch(err){
                      console.error(`stream error`)
                      console.error(err)
                    }
                  }).catch(err=>{
                    this.cleanAccount()
                    let msg = err.message
                    if(msg && 'Network Error' === msg){
                      this.$toasted.error(this.$t('Account.NetworkError'))
                      return
                    }
                    if (err.data && err.data.status === 404) {
                      this.noticeText = this.$t('Error.AccountNotFund')
                      this.$store.commit(ACCOUNT_NOT_FUNDING)
                      this.notice = true
                    }
                  })
              }
            },1000)
          })
          .catch(err=>{
            this.showPwdSheet = false
            console.error(err)
             this.loadingTitle = this.$t('Account.DeleteFailed')
            if(err === 'Error.PasswordWrong'){
              this.loadingMsg = this.$t('Error.PasswordWrong')
            }
            this.inpassword = null
            this.working = false
            this.delok = false
            this.delerror = true
          })

      } 
      // if('change' === this.worktype){
      else{
      // if(this.checkPwd)return
     // 无密码则报错
      // if(!this.inpassword){
      //   this.$toasted.error(this.$t('Error.PasswordWrong')) //请输入密码
      //   return
      // }
      //检验密码
      this.checkPwd = true
      let data = {
        index: this.selectedIndex === null ? this.selectedAccountIndex : this.selectedIndex,
        address: this.selectedAccount.address || this.account.address,
        password: this.inpassword
      }
      this.choseAccount(data).then(account=>{
        this.$toasted.show(this.$t('Info.ChangeAccountSuccess'));
        this.showPwdSheet = false;
        this.checkPwd = false;
        this.inpassword = null;
        setTimeout(()=>{
              this.showLoading = false
              if(this.accounts.length === 0){
                this.$router.push({name: 'Wallet'})
              }else{
                //重新读取数据
                let address = this.account.address
                Promise.all([this.getAccountInfo(this.account.address)])//,this.getPayments(this.account.address)
                  .then(data=>{
                    try{
                      this.$store.commit(ACCOUNT_IS_FUNDING)
                    }catch(err){
                      console.error(`stream error`)
                      console.error(err)
                    }
                  }).catch(err=>{
                    this.cleanAccount()
                    let msg = err.message
                    if(msg && 'Network Error' === msg){
                      this.$toasted.error(this.$t('Account.NetworkError'))
                      return
                    }
                    if (err.data && err.data.status === 404) {
                      this.noticeText = this.$t('Error.AccountNotFund')
                      this.$store.commit(ACCOUNT_NOT_FUNDING)
                      this.notice = true
                    }
                  })
              }
            },1000)
      })
      .catch(err=>{
        console.error('change account error')
        console.error(err)
        this.$toasted.error(this.$t('Error.PasswordWrong'))
        this.checkPwd = false
        this.showPwdSheet = false;
        this.inpassword=null;
        setTimeout(()=>{
              this.showLoading = false
              if(this.accounts.length === 0){
                this.$router.push({name: 'Wallet'})
              }      
            },1000)
        
      })
    }
    },
    hideLoadingView(){
      this.delerror = false
      this.working = false
      this.showLoading = false
    },
      
  },
  components: {
    Toolbar,
    Card,
    Loading,
  }
}
</script>


<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.page
  background: $primarycolor.gray
  color: $primarycolor.font
  font-size: 16px
.right
  .material-icons
    font-size: 36px
.card-content
  overflow: hidden
  background: $primarycolor.gray
  
.account-row
  overflow: hidden
  position: relative
  border-bottom: 1px solid $secondarycolor.font
  border-radius:5px
  
  
.account-row:last-child
  border-bottom: 0px
.account-wrapper
  position: relative
  z-index: 2
  height: 50px
  width: 100%
  padding-top: 5px
  padding-bottom: 5px
  background: $secondarycolor.gray
  padding-left:5px
  .avatar
    width: 40px
    height: 40px
    background: $primarycolor.gray
    .iconfont
      color: $primarycolor.green
      font-size: 20px
  .name
    font-size: 16px
    height: 40px
    line-height: 40px
    padding-left: 10px
    text-overflow: clip
    word-break: break-all
  .address
    text-overflow: clip
    word-break: break-all
    .label
      height: 40px
      line-height: 40px
      width: 100%
      color: $secondarycolor.font
      text-align: right
      font-size: 16px
      padding-left: 5px
  .icons
    text-align: right
    color: $primarycolor.green
    font-size: 24px
    padding-top: 5px
    padding-right: 5px
.operate-box 
  position: absolute
  z-index: 1
  height: 100%
  right: 0
  top: 0
  display: flex
  .change
  .modify
  .del
    display: flex
    justify-content: center
    align-items: center
    background-color: $primarycolor.gray
    // background-color: $secondarycolor.green
    color: $primarycolor.green
    padding: 0 12px
  .modify
    // border-left: 1px solid $secondarycolor.gray
    color:$primarycolor.green
  .del
    background-color: $primarycolor.gray
    color:$primarycolor.red
  // .del
  //   display: flex
  //   justify-content: center
  //   align-items: center
  //   color: $primarycolor.font
  //   padding: 0 12px
  //   background-color: $secondarycolor.red
  //   border-right: 1px solid $secondarycolor.gray
.pwdSheetWrapper
  background: $secondarycolor.gray
  height: 140px
  position: fixed
  bottom: 0
  bottom: constant(safe-area-inset-bottom)
  bottom: env(safe-area-inset-bottom)
  right: 0
  left: 0
  z-index: 100
.sheet-content
  padding: 10px 10px
.sheet-btns
  display: flex
  color: $primarycolor.green
  height: 50px
  line-height: 50px
  .sheet-btn
    flex: 1
    text-align: center
.mycard
  padding:0px 0px
.selected
  -webkit-transform: translate(-50%, 0)
  -webkit-transition: 0.3s
  transform: translate(-50%, 0)
  transition: 0.3s

</style>

