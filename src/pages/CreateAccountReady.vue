/**
 * 准备创建钱包
 */
<template>
<div class="page">

    <toolbar :title="$t(title)" :showbackicon="showbackicon"  v-if="!seedInputDlgShow">
      <v-btn icon style="visibility: hidden;" slot="left-tool">
        <v-icon class="back-icon"/>
      </v-btn>
    </toolbar>
    
    <div class="content">
      <div class="label">{{$t('Account.AccountName')}}</div>
      <div class="value" >{{name}}</div>
      <div class="label">{{$t('Account.Password')}}</div>
      <div class="value">{{password}}</div>
      <div class="label">{{$t('Account.AccountAddress')}}</div>
      <div class="value" @click="copy(address)">{{address}}</div>
      <!-- <div class="label">{{$t('SecretKey')}}</div>
      <div class="value" @click="copy(seed)">{{seed}}</div> -->
      <div class="label" v-if="mnemonic">{{$t('mnemonic')}}</div>
      <div class="value" v-if="mnemonic" @click="copy(mnemonic)">{{mnemonic}}</div>
      
      <div class="qrcode">
        <qrcode :text="qrtext" :size="200" color="red"/>
      </div>
      <div class="hint">{{$t('Account.CreateAccountReadyHint')}}</div>
    </div>
    <div class="footer" v-if="!seedInputDlgShow">
      <v-layout row wrap>
        <v-flex xs6 @click="goback">
          <span>{{$t('Return')}}</span>
        </v-flex>
        <v-flex xs6 @click="save">
          <span>{{$t('BackedUp')}}</span>
        </v-flex>
       </v-layout>
    </div>

    <v-dialog v-model="coveringDlg" persistent max-width="95%">
      <v-card>
        <v-card-title class="headline">{{$t('Account.WhetherCoverAccount')}}</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green" flat @click.native="coveringDlg = false">{{$t('Button.Cancel')}}</v-btn>
          <v-btn color="red" flat @click.native="doCoverAccount">{{$t('Button.OK')}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 密钥输入窗口 不再使用dialog  -->
    <div class="si-dlg" v-if="seedInputDlgShow">
      <toolbar :title="$t(title)" :showbackicon="showbackicon">
        <div class="si-text" slot="right-tool"  @click="showSkipDlg = true">
          {{$t('Account.Skip')}}
        </div>
      </toolbar>
      
      <div class="si-bg">
        <div class="si-card mnemonic-validat-card">
          <div class="headline textcenter">{{$t('validateMnemonic')}}</div>
          <v-layout wrap>
            <v-flex xs12 sm6 md4>
               <v-text-field 
                required
                :label="$t('mnemonicIndex',[randoms[0]+1])"
                v-model="w0"
                @focus="focusInput($event)"
                ></v-text-field>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-text-field 
                required
                :label="$t('mnemonicIndex',[randoms[1]+1])"
                v-model="w1"
                @focus="focusInput($event)"
                ></v-text-field>
            </v-flex>
            <v-flex xs12 sm6 md4>
               <v-text-field 
                required
                :label="$t('mnemonicIndex',[randoms[2]+1])"
                v-model="w2"
                @focus="focusInput($event)"
                ></v-text-field>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-text-field 
                required
                :label="$t('mnemonicIndex',[randoms[3]+1])"
                v-model="w3"
                @focus="focusInput($event)"
                ></v-text-field>
            </v-flex>
          </v-layout>
        </div>

        <div class="btn-group flex-row textcenter">
          <div class="flex1 btn-cancel" @click="seedInputDlgShow = false">{{$t('Return')}}</div>
          <div class="flex1 btn-ok" @click="btnOKSeedInput">{{$t('Validate')}}</div>
        </div>
      </div>

    </div>
  

    <!-- 是否跳过验证窗口 -->
    <v-dialog v-model="showSkipDlg" max-width="95%" persistent>
      <div>
        <div class="card-content dlg-content">
          <div class="avatar-div textcenter">
            <v-avatar>
              <img src="../assets/img/logo-red.png" />
            </v-avatar>
          </div>
          <div class="t1 skip-red textcenter">{{$t('Account.ConfirmSkip')}}</div>
          <div class="t2 skip-white pt-2 pb-4">{{$t('Account.SkipValidHint')}}</div>
          <div class="btns flex-row">
            <div class="flex1 skip-red textcenter" @click="doSave">{{$t('Button.OK')}}</div>
            <div class="flex1 skip-red textcenter" @click="showSkipDlg = false">{{$t('Account.Later')}}</div>
          </div>
        </div>
      </div>
    </v-dialog>

    <!-- 验证通过窗口 -->
    <v-dialog v-model="showSeedValidDlg" max-width="95%" persistent>
      <div>
        <div class="card-content dlg-content">
          <div class="avatar-div textcenter">
            <v-avatar>
              <img src="../assets/img/logo-green.png" />
            </v-avatar>
          </div>
          <div class="t1 dlg-green textcenter">{{$t('Congratulations')}}!</div>
          <div class="t2 skip-white pt-2 pb-4">{{$t('Account.SecretKeyValidHint')}}</div>
          <div class="btns dlg-green textcenter" @click="toNextPage">
            {{$t('Account.Start')}}
          </div>
        </div>
      </div>
    </v-dialog>

    <!-- 验证失败窗口 -->
    <v-dialog v-model="showSeedInValidDlg" max-width="95%" persistent>
      <div>
        <div class="card-content dlg-content">
          <div class="avatar-div textcenter">
            <v-avatar>
              <img src="../assets/img/logo-red.png" />
            </v-avatar>
          </div>
          <div class="t1 skip-red textcenter">{{$t('Error.SeedWrong')}}!</div>
          <div class="t2 skip-white pt-2 pb-4">{{$t('Account.SecretKeyUnValidHint')}}</div>
          <div class="btns textcenter skip-red" @click="showSeedInValidDlg = false">
            {{$t('Account.ReVerify')}}
          </div>
        </div>
      </div>
    </v-dialog>

  <loading :show="showLoading" :loading="working" :success="dealok" :fail='dealfail' 
      :title="loadingTitle" :msg="loadingMsg" :closeable="dealfail" @close="hiddenLoadingView"/>

</div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import { mapState, mapActions} from 'vuex'
import {address as genAddress} from '@/api/account'
import QRCode from '@/components/QRCode'
import Card from '@/components/Card'
import { exportAccount, exportMnemonic } from '@/api/qr'
import Loading from '@/components/Loading'
import SecretKeyInput from '@/components/SecretKeyInput'
//import StellarHDWallet from 'stellar-hd-wallet'
import  defaultsDeep  from 'lodash/defaultsDeep'
export default {
  data(){
    return {
      title: 'CreateAccount',
      showbackicon: false,
      qrsize:200,
      logo: require("../assets/img/logo.png"),
      dialog: false,
      guide:0,
      primary: 'primary',
      secondary: 'blue',

      coveringDlg: false,
      working: false,
      dealok: false,
      dealfail: false,
      showLoading: false,
      loadingTitle: null,
      loadingMsg: null,
      
      //新增账户的情况下，要求用户输入密钥
      seedInputDlgShow: false,
      seedInput: null,

      showSkipDlg: false,
      showSeedValidDlg: false,
      showSeedInValidDlg: false,

      //校验助记词
      randoms:[],//需要检查哪几个单词
      w0: null,
      w1: null,
      w2: null,
      w3: null,

    
    }
  },
  computed:{
    ...mapState({
      seed: state => state.seed,
      mnemonic: state => state.mnemonic,
      mIndex: state => state.mIndex,
      name: state => state.accountname,
      password: state => state.accountpassword,
      extdata: state => state.seedExtData,
      accounts: state => state.accounts.data || [],
      isImportAccount: state => state.isImportAccount,
      isCreateAccount: state => state.isCreateAccount,
    }),
    mnemonicItems(){
        return this.mnemonic.split(' ');
      },
    address(){
      if(this.seed){
        return genAddress(this.seed)
      }
      return ''
    },
    qrtext(){
      if(!this.seed)return ''
      return exportMnemonic(this.name,this.mnemonic)
      // return JSON.stringify(exportAccount(account,accountData))
    }
  
  },
  beforeMount () {
    window.localStorage.setItem('login_flag','1')
    console.log(window.localStorage.getItem('login_flag'))

    //生成6个助记词校验位
    this.genRadomInt();
    this.genRadomInt();
    this.genRadomInt();
    this.genRadomInt();
    //对助记词进知排序
    this.randoms = this.randoms.sort((a,b)=> a-b)

  },
  mounted(){
    this.dialog = true;
    
  },
  methods: {
    ...mapActions(['createAccount','createAccountByMnemonic','cleanGlobalState','coverAccount']),
    genRadomInt(){
      let n = parseInt(12 * Math.random())
      if(this.randoms.indexOf(n) >= 0){
        this.genRadomInt()
      }else{
        this.randoms.push(n)
      }
    },
    goback(){
      this.$router.back()
      //this.$router.push({name:'CreateAccount'})
    },
    copy(value){
      if(cordova.plugins.clipboard){
        cordova.plugins.clipboard.copy(value)
        this.$toasted.show(this.$t('CopySuccess'))
      }
    },
    swipe(direction){
      if(direction==='Left'  && this.guide <3){
          this.guide ++
      }
      if(direction==='Right' && this.guide >1){
          this.guide --
      }
    },
    btnOKSeedInput(){
      if(this.w0 && this.w0 === this.mnemonicItems[this.randoms[0]] &&
           this.w1 && this.w1 === this.mnemonicItems[this.randoms[1]] &&
           this.w2 && this.w2 === this.mnemonicItems[this.randoms[2]] &&
           this.w3 && this.w3 === this.mnemonicItems[this.randoms[3]]
          ){
        this.seedInputDlgShow = false
        this.doSave();            
      }else{

        this.showSeedInValidDlg = true
        return;
      }

    },
    save(){
      //要求用户输入密钥，只有密钥输入正确才能继续进行
      if(this.isCreateAccount){
        this.seedInputDlgShow = true;
      }else{
        this.doSave();
      }
    },
    doSave(){
      //保存，并跳转到main界面
      //校验地址是否冲突
      var index = this.accounts.map(ele=>ele.address).indexOf(this.address)
      if(index>=0){
        this.$toasted.error(this.$t('MyAddress.DuplicateAddress'))
        this.coveringDlg = true
        return 
      }
      let account = {
        name: this.name,
        address: this.address,
        seed: this.seed,
        password: this.password,
        mnemonic: this.mnemonic,
        mIndex: this.mIndex,
      }
      this.working = true
      this.dealok = false
      this.dealfail = false
      this.showLoading = true
      this.loadingTitle = null
      this.loadingMsg = null
      this.createAccountByMnemonic(account)
        .then(data=>{
         this.ok()
         //this.$toasted.show(this.$t('Account.CreateAccountSuccess'));
         this.loadingTitle = this.$t('Account.CreateAccountSuccess')
          this.cleanGlobalState()
          this.showSeedValidDlg = true
        }).catch(err=>{
          //this.$toasted.error(this.$t('Account.CreateAccountError'))
          this.loadingTitle = this.$t('Account.CreateAccountError')
          this.fail()
          setTimeout(()=>{
            this.showLoading = false
            this.showSeedInValidDlg = true
          },1000)
          

        })
      },

    doCoverAccount(){
      if(this.working)return
      this.working = true
      this.showLoading = true
      this.dealok = false
      this.dealfail = false
      this.loadingTitle = null
      this.loadingMsg = null
      this.coverAccount({name: this.name,address: this.address,seed: this.seed,password: this.password})
        .then(data=>{
            this.ok()
            //this.$toasted.show(this.$t('Account.CreateAccountSuccess'));
            this.loadingTitle = this.$t('Account.CreateAccountSuccess')
            this.cleanGlobalState()
            setTimeout(()=>{
              this.$router.push({name: 'MyAssets'})
            },1500)
        })
        .catch(err=>{
          //this.$toasted.error(this.$t('Account.CreateAccountError'))
          this.loadingTitle = this.$t('Account.CreateAccountError')
          this.fail()
        })
    },
    ok(){
      this.dealok = true
      this.dealfail = false
      this.working = false
      setTimeout(()=>{
        this.showLoading = false
      },1000)
    },
    fail(){
      this.dealok = false
      this.dealfail = true
      this.working = false
     
    },
    
    hiddenLoadingView(){
      this.loadingTitle = null
      this.loadingMsg = null
      this.dealfail = false
      this.showLoading = false
    },
    toNextPage(){
      this.showSeedValidDlg = false
      this.$router.push({name:'MyAssets'})
    },
    skipValidSecretKey(){
      this.showSkipDlg  = false
      this.doSave()
    },
    focusInput(event){
      let dom = event.target
      setTimeout(()=>{
        dom.scrollIntoView()
      },200)
    }

  },
  
  components: {
    Toolbar,
    qrcode: QRCode,
    Loading,
    SecretKeyInput,
    Card,
  }
}
</script>


<style lang="stylus" scoped>
@require '../stylus/color.styl'
.content
  position: fixed
  overflow-y: auto
  top: 48px
  top: calc(48px+ constant(safe-area-inset-top))
  top: calc(48px + env(safe-area-inset-top))
  left: 0
  right: 0
  bottom: 0
  bottom:  constant(safe-area-inset-bottom)
  bottom: env(safe-area-inset-bottom)
  padding: 20px 20px
  background: $secondarycolor.gray
  border-radius:10px
  margin:7px 7px 50px 7px
  .label
    font-size: 14px
    color: $primarycolor.green
    padding-top: 2px
    padding-bottom: 2px
  .value
    display: block
    font-size: 16px
    color: $primarycolor.font
    width: 100%
    white-space:normal
    word-wrap: break-word
    word-break: break-all
  .qrcode
    text-align: center

.footer
  position:fixed
  bottom:0
  bottom: constant(safe-area-inset-bottom)
  bottom: env(safe-area-inset-bottom)
  left:0
  right:0
  z-index:99
  background:$primarycolor.gray
  height:42px
  line-height:42px
  font-size:16px
  text-align:center
  color:$primarycolor.green
.btn-available
  color:$primarycolor.green
.btn-unavailable
  color:$secondarycolor.green
.hint
  color:$primarycolor.red
  font-size: 15px
.headline
  color: $primarycolor.green
  font-size: 16px !important 
  padding-bottom: 10px
.notice
  font-size:14px
  color: $primarycolor.font
  min-height: 6em
/*.stepper__header
  box-shadow 0*/
.stepper-content
  display flex
  flex-direction column
.guide-img-wrapper
  height: 150px
  width: 100%
.guide-img
  height:150px
  max-width:320px  
  min-height: 150px
.guide-header
  box-shadow 0 0 0 0
.si-text
  font-size: 14px
.si-bg
  position: absolute
  top: 48px
  top: calc(48px+ constant(safe-area-inset-top))
  top: calc(48px+ env(safe-area-inset-top))
  left: 0
  right: 0
  bottom: 0
  bottom:  constant(safe-area-inset-bottom)
  bottom:  env(safe-area-inset-bottom)
  background: $primarycolor.gray
  padding: 10px 10px
  padding-bottom: 0px
  overflow-y: auto
.si-card
  background: $secondarycolor.gray
  border-radius: 5px
  padding: 1rem 5px
  overflow-y: auto

  // height: 30%
.btn-group
  position: fixed
  left: 0
  right: 0
  bottom: 10px
  bottom: calc(10px + constant(safe-area-inset-bottom))
  bottom: calc(10px + env(safe-area-inset-bottom))
  .btn-cancel
  .btn-ok
    font-size: 16px
    color: $primarycolor.green
.card-content
  padding: 20px 10px
.t1
  font-size: 20px
  padding-top: 5px
  padding-bottom: 5px
.t2
  font-size: 16px
.skip-red
  color: $primarycolor.red
.btns
  font-size: 16px
.dlg-green
  color: $primarycolor.green
.dlg-content
  background: $secondarycolor.gray

.si-dlg
  position: fixed
  top: 0px
  top:  constant(safe-area-inset-top)
  top: env(safe-area-inset-top)
  bottom: 0px
  bottom: constant(safe-area-inset-bottom)
  bottom: env(safe-area-inset-bottom)
  left: 0px
  right: 0px
  background: $primarycolor.gray
  .btn-group
    z-index: 999
    background: $primarycolor.gray
</style>

