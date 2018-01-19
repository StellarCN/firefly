/**
 * 准备创建钱包
 */
<template>
<div class="page">

    <toolbar :title="$t(title)" :showbackicon="showbackicon">
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
      <div class="label">{{$t('SecretKey')}}</div>
      <div class="value" @click="copy(seed)">{{seed}}</div>
      <div class="qrcode">
        <qrcode :text="qrtext" size=200 />
      </div>
      <div class="hint">{{$t('Account.CreateAccountReadyHint')}}</div>
    </div>
    <div class="footer">
      <v-layout row wrap>
        <v-flex xs6 @click="goback">
          <span>{{$t('Return')}}</span>
        </v-flex>
        <v-flex xs6 @click="save">
          <span>{{$t('Finish')}}</span>
        </v-flex>
       </v-layout>  
    </div>

    <v-dialog v-model="dialog" max-width="95%" >
        <v-stepper v-model="guide" dark>
          <v-stepper-header class="guide-header">
            <v-stepper-step step="1" :complete="guide >1"></v-stepper-step>
            <hr class='divider' :class="guide>1 ? primary : null"></hr>
            <v-stepper-step step="2" :complete="guide >2"></v-stepper-step>
            <hr class='divider' :class="guide>2 ? primary : null"></hr>
            <v-stepper-step step="3"></v-stepper-step>
          </v-stepper-header>
          <v-stepper-items>
            <v-stepper-content step="1">
              <v-flex  class="stepper-content" v-touch="{left: () => swipe('Left'),right: () => swipe('Right')}">
                <v-flex xs12 d-flex justify-center class="guide-img-wrapper"> 
                  <img :src='require("../assets/img/step1.svg")' class="guide-img"/>
                </v-flex>
                <v-flex xs12 ><h4 class="headline">{{$t("Attention")}}</h4></v-flex>
                <v-flex xs12 class="notice">{{$t("PasswordNotice")}}</v-flex>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" flat @click.stop="guide=2">{{$t('Next')}}</v-btn>
                </v-card-actions>
              </v-flex>
            </v-stepper-content>
            <v-stepper-content step="2">
              <v-flex v-touch="{left: () => swipe('Left'),right: () => swipe('Right')}">
                <v-flex xs12 d-flex justify-center class="guide-img-wrapper"> 
                  <img :src='require("../assets/img/step2.svg")' class="guide-img"/>
                </v-flex>
                <v-flex xs12 ><h4 class="headline">{{$t("Attention")}}</h4></v-flex>                
                <v-flex xs12  class="notice" >{{$t("SeedNotice")}}</v-flex>
                <v-card-actions>
                  <v-btn color="primary" flat @click.stop="guide=1">{{$t("Back")}}</v-btn>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" flat @click.stop="guide=3">{{$t('Next')}}</v-btn>
                </v-card-actions>
              </v-flex>
            </v-stepper-content>
            <v-stepper-content step="3" > 
              <v-flex v-touch="{left: () => swipe('Left'),right: () => swipe('Right')}">
                 <v-flex xs12 d-flex justify-center class="guide-img-wrapper"> 
                  <img :src='require("../assets/img/step3.svg")' class='guide-img'>
                </v-flex>
                <v-flex xs12 ><h4 class="headline">{{$t("Congrats")}}</h4></v-flex>
                <v-flex xs12 class="notice" >{{$t("CongratsMessage")}}</v-flex>
                <v-card-actions>
                  <v-btn color="primary" flat @click.stop="guide=2">{{$t("Back")}}</v-btn>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" flat @click.stop="dialog=false">{{$t('Finish')}}</v-btn>
                </v-card-actions>
            </v-flex>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
    </v-dialog>

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

    <!-- 密钥输入窗口 -->
    <v-dialog v-model="seedInputDlgShow" persistent max-width="95%"  fullscreen transition="dialog-bottom-transition" :overlay=false>
      <v-card>
        <v-card-title class="headline">{{$t('Account.InputSecretKey')}}</v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-alert color="error" icon="warning" value="true" v-if="seedInputErr">
              {{$t(seedInputErr)}}
            </v-alert>
            <v-layout wrap>
              <v-flex xs12 sm6 md4>
                <v-text-field dark
                :label="$t('SecretKey')"
                v-model="seedInput"
                required
                multi-line
                onpaste="return false"
                rows=2></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green" flat @click.native="seedInputDlgShow = false">{{$t('Button.Cancel')}}</v-btn>
          <v-btn color="red" flat @click.native="btnOKSeedInput">{{$t('Button.OK')}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  <loading :show="working" :loading="working" :success="dealok" :fail='dealfail' />

</div>
</template>

<script>
import Toolbar from '../components/Toolbar'
import { mapState, mapActions} from 'vuex'
import {address as genAddress} from '../api/account'
import QRCode from '../components/QRCode'
import { exportAccount } from '../api/qr'
import Loading from '@/components/Loading'
import StellarHDWallet from 'stellar-hd-wallet'
import { closeStreams, initStreams,cleanStreamData } from '@/streams'
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

      //新增账户的情况下，要求用户输入密钥
      seedInputDlgShow: false,
      seedInput: null,
      seedInputErr: null,
    
    }
  },
  computed:{
    ...mapState({
      seed: state => state.seed,
      name: state => state.accountname,
      password: state => state.accountpassword,
      extdata: state => state.seedExtData,
      accounts: state => state.accounts.data || [],
      isImportAccount: state => state.isImportAccount,
      isCreateAccount: state => state.isCreateAccount,
    }),
    address(){
      if(this.seed){
        return genAddress(this.seed)
      }
      return ''
    },
    qrtext(){
      if(!this.seed)return ''
      //类似于stargaza的格式
      var data = {stellar:{name:this.name,key:this.seed}}
      let account = Object.assign({
        name: this.name,
        address: genAddress(this.seed)
      },this.extdata || {})
      let accountData = {
        seed: this.seed
      }
      return exportAccount(account,accountData)
      // return JSON.stringify(exportAccount(account,accountData))
    }
  
  },
  beforeMount () {
    // const mnemonic = StellarHDWallet.generateMnemonic({
    //   language: 'chinese_simplified',
    // })
    // console.log(mnemonic)
    // console.log(typeof mnemonic)
    // const wallet = StellarHDWallet.fromMnemonic(mnemonic)

    // console.log(wallet.getPublicKey(0)) // => GDKYMXOAJ5MK4EVIHHNWRGAAOUZMNZYAETMHFCD6JCVBPZ77TUAZFPKT
    //  console.log(wallet.getSecret(0)) // => SCVVKNLBHOWBNJYHD3CNROOA2P3K35I5GNTYUHLLMUHMHWQYNEI7LVED
    //  console.log(wallet.getKeypair(0) )// => StellarBase.Keypair for account 0

  },
  mounted(){
    this.dialog = true;
    
  },
  methods: {
    ...mapActions(['createAccount','cleanGlobalState','coverAccount']),
    goback(){
      this.$router.back()
      this.$router.push(`/createaccount`)
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
      console.log('check--btn input--')
      console.log(this.seed)
      console.log(this.seedInput)
      if(this.seed != this.seedInput){
        this.seedInputErr = 'Error.SeedWrong'
        return;
      }
      this.seedInputDlgShow = false
      this.doSave();
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
      let account = {name: this.name,address: this.address,seed: this.seed,password: this.password}
      this.working = true
      this.createAccount(account)
        .then(data=>{
         this.ok()
          this.$toasted.show(this.$t('Account.CreateAccountSuccess'));
          this.cleanGlobalState()
          cleanStreamData()
          closeStreams()
          initStreams(this.address)
          this.$router.push(`/main`)
        }).catch(err=>{
          this.$toasted.error(this.$t('Account.CreateAccountError'))
          this.fail()
        })
    },

  doCoverAccount(){
    if(this.working)return
    this.working = true
    this.coverAccount({name: this.name,address: this.address,seed: this.seed,password: this.password})
      .then(data=>{
          this.ok()
          this.$toasted.show(this.$t('Account.CreateAccountSuccess'));
          this.cleanGlobalState()
          setTimeout(()=>{
            this.$router.push(`/main`)
          },1500)
      })
      .catch(err=>{
         this.$toasted.error(this.$t('Account.CreateAccountError'))
         this.fail()
      })
  },
  ok(){
    this.dealok = true
    this.dealfail = false
    setTimeout(()=>{
      this.working = false
    },1000)
  },
  fail(){
    this.dealok = false
    this.dealfail = true
    setTimeout(()=>{
      this.working = false
    },1000)
  },

  },
  
  components: {
    Toolbar,
    qrcode: QRCode,
    Loading,
  }
}
</script>


<style lang="stylus" scoped>
@require '../stylus/color.styl'
.content
  position: fixed
  overflow-y: auto
  top: 48px
  left: 0
  right: 0
  bottom: 0
  padding: 20px 20px
  background: $primarycolor.gray
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
  left:0
  right:0
  z-index:99
  background:$secondarycolor.gray
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
  color:$secondarycolor.green
  font-size: 12px
.headline
  color: $primarycolor.green
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
</style>

