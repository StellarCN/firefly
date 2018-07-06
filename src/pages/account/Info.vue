<template>
  <div class="page">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
      ref="toolbar"
      />

    <div class="content">
      
      <card :class="[{ Info_mycard: isB, Info_mycardB:isC }]" padding="20px 10px 20px 10px">

        <div class="card-content" slot="card-content">
          <div class="avatar-wrapper">{{$t("Account.AccountName")}}
            <!-- <span class="avatar">
              <i class="iconfont icon-erweima"></i>
            </span> -->
          </div>
          <div class="name">
              {{showaccount.name}}
          </div>

          
          <div class="label">{{$t('Account.AccountAddress')}}</div>
          <div class="value" @click="copy(showaccount.address)">{{showaccount.address}}</div> <!-- 账户地址-->

          <div class="label" v-if="showaccount.federationAddress">{{$t('FederationAddress')}}</div>
          <div class="value" v-if="showaccount.federationAddress" @click="copy(showaccount.federationAddress)">{{showaccount.federationAddress}}&nbsp;</div><!-- 联邦地址-->
         
          
          <div class="label" v-if="showaccount.inflationAddress">{{$t('InflationAddress')}}</div>
          <div class="value" v-if="showaccount.inflationAddress" @click="copy(showaccount.inflationAddress)">
            {{inflationPoolSite}}
          </div><!-- 通胀地址-->
          <!--
          <div class="label">{{$t('SecretKey')}}</div>
          <div class="value seed" >
            <div class="secret" @click="copySeed">{{showseedinfo}}</div>
            <div class="secreticon" @click="seedIconClick">
              <v-icon class="secreticons" v-if="showseed">visibility</v-icon>
              <v-icon class="secreticons" v-else>visibility_off</v-icon>
            </div>
          </div>
         
          <div class="label" v-if="showaccount.federationAddress">{{$t('FederationAddress')}}</div>
          <div class="value" v-if="showaccount.federationAddress" @click="copy(showaccount.federationAddress)">{{showaccount.federationAddress}}&nbsp;</div>
          <div class="label" v-if="showaccount.inflationAddress">{{$t('InflationAddress')}}</div>
          <div class="value" v-if="showaccount.inflationAddress" @click="copy(showaccount.inflationAddress)">
            {{inflationPoolSite}}
          </div>
         -->
          <!-- <div class="qrcode" v-if="showseed">
            <qrcode :text="qrtext" :callback="qrcodecallback" color="red"/>
          </div> -->
        </div>

      </card>
      
      
      <div :class="'footer' + (canModify ? ' active':' unactive') ">
        <v-tabs class="tabs-bg-dark" grow centered hide-slider color="primary">
          <v-tab class="tab2" @click.stop="modify">{{$t('Modify')}}</v-tab>
          <v-tab class="tab2" @click.stop="resetpwd">{{$t('ResetPassword')}}</v-tab>
          <v-tab class="tab2" @click.stop="toViewKey">{{$t('ViewKey')}}</v-tab>
          <v-tab class="tab2" @click.stop="toViewMnemonic">{{$t('viewMnemonic')}}</v-tab>
        </v-tabs>
      </div>


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
        <!--尝试添加的bottom-sheet的例子，可以弹出来的是密钥信息和密钥二维码 -->
      <!-- <div v-if="showViewkeySheet">
        <v-bottom-sheet class="showViewkeySheetPosition" v-model="showViewkeySheet">                   -->
              <!-- <v-text-field
                    name="password"
                    :label="$t('Account.Password')"
                    v-model="inpassword"
                    :append-icon="pwdvisible ? 'visibility' : 'visibility_off'"
                    :append-icon-cb="() => (pwdvisible = !pwdvisible)"
                    :type="pwdvisible ? 'text':'password'"
                    required dark
                  ></v-text-field> -->
              <!-- <v-text-field   required dark>账户密钥为重要信息，请做好备份并谨慎保存，切勿与他人分享</v-text-field> -->
        <!-- </v-bottom-sheet>
      </div> -->
      <div class="text-xs-center" v-if="showViewkeySheet">
          <v-bottom-sheet v-model="showViewkeySheet" dark>
            <v-list >
              <v-subheader class="info_warning_msg_style">{{$t("Warning_msg")}}</v-subheader>
              <v-subheader class="info_account_miyao_style">{{$t("Account_secretkey")}}</v-subheader>
              <v-subheader @click="copy(seed)"  class="info_showaccount_address_style">{{seed}}</v-subheader>
              <v-subheader class="info_showaccount_barcode_style">{{$t("Account_secretkeycode")}}</v-subheader>
              <qrcode class="info_qrcode_style" :text="qrtext" :callback="qrcodecallback" color="red"/>
              <v-subheader class="info_account_close_style" @click="change_value0f_vk">{{$t("Close")}}</v-subheader>
            </v-list>
          </v-bottom-sheet>
      </div>

      <!-- 查看助记词 -->
       <div class="text-xs-center" v-if="showMnemonicSheet">
          <v-bottom-sheet v-model="showMnemonicSheet" dark>
            <v-list v-if="mnemonic">
              <v-subheader class="info_warning_msg_style">{{$t("Warning_mnemonic_msg")}}</v-subheader>
              <v-subheader class="info_account_miyao_style">{{$t("mnemonic")}}</v-subheader>
              <v-subheader @click="copy(mnemonic)"  class="info_showaccount_address_style">{{mnemonic}}</v-subheader>
              <qrcode class="info_qrcode_style" :text="qrmnemonictext" :callback="qrcodecallback" color="red"/>
              <v-subheader class="info_account_close_style" @click="change_value0f_vk">{{$t("Close")}}</v-subheader>
            </v-list>
            <v-list v-else>
              <v-subheader class="info_warning_msg_style">{{$t("no_mnemonic_msg")}}</v-subheader>
              <v-subheader class="info_account_close_style" @click="change_value0f_vk">{{$t("Close")}}</v-subheader>
            </v-list>
          </v-bottom-sheet>
      </div>

      <v-dialog v-model="dlgshow" persistent max-width="260">
        <v-card>
          <v-card-text class="dlg-content">{{$t(dlgtitle)}}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" flat @click="dlgBtnCancel">{{$t('Button.Cancel')}}</v-btn>
            <v-btn color="green darken-1" flat @click="dlgBtnOK">{{$t('Button.OK')}}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- 修改密码 -->
       <div class="pwdSheetWrapper rePwdSheetWrapper" v-if="showResetPwdSheet">
        <v-bottom-sheet  v-model="showResetPwdSheet" dark>
          <div class="bts-dlg">
            <div class="sheet-title">
              <div class="stitle">
              {{$t('ResetPassword')}}
              </div>
            </div>
            <div class="sheet-content">
              <div class="sheet-input">
                <div class="sheet-input">
                  <v-text-field
                        name="password1"
                        :label="$t('Account.OriginPassword')"
                        v-model="inpassword1"
                        :append-icon="pwd1visible ? 'visibility' : 'visibility_off'"
                        :append-icon-cb="() => (pwd1visible = !pwd1visible)"
                        :type="pwd1visible ? 'text':'password'"
                        required dark
                      ></v-text-field>
                </div>
                <div class="sheet-input">
                  <v-text-field
                        name="password2"
                        :label="$t('Account.NewPassword')"
                        v-model="inpassword2"
                        :append-icon="pwd2visible ? 'visibility' : 'visibility_off'"
                        :append-icon-cb="() => (pwd2visible = !pwd2visible)"
                        :type="pwd2visible ? 'text':'password'"
                        required dark
                      ></v-text-field>
                </div>
                <v-text-field
                      name="password"
                      :label="$t('Account.RePassword')"
                      v-model="inpassword3"
                      :append-icon="pwd3visible ? 'visibility' : 'visibility_off'"
                      :append-icon-cb="() => (pwd3visible = !pwd3visible)"
                      :type="pwd3visible ? 'text':'password'"
                      required dark
                    ></v-text-field>
              </div>
              <div  class="sheet-btns">
                <div class="sheet-btn" @click="cancleResetPwdInput">{{$t('Button.Cancel')}}</div>
                <div class="sheet-btn" @click="okResetPwdInput">{{$t('Button.OK')}}</div>
              </div>
            </div>
          </div>
        </v-bottom-sheet>
      </div>

      <!--密码输入界面，在查看密钥之前
      <password-sheet 
        :accountname=""
        :address=""
        @cancel="cancelCheckPWD"
        @ok="checkPWDSuccess"
        v-if="checkPWD"
        />-->


    </div>
  </div>
</template>

<script>
import { mapState, mapActions} from 'vuex'
import Toolbar from '@/components/Toolbar'
import QRCode from '@/components/QRCode'
import Card from '@/components/Card'
import PasswordSheet from '@/components/PasswordSheet'
import { exportNameCard,exportAccount, exportMnemonic } from '@/api/qr'
import {readAccountData} from '@/api/storage'
import { INFLATION_POOL } from '@/api/gateways'

const ACTION_DEL = 'delete';
const ACTION_MODIFY = 'modify'
const ACTION_VIEWSECRET = 'viewSecret'
const ACTION_RESET_PASSWORD = 'resetpassword';
const QUESTION_DELETE_ACCOUNT = 'Q.DeleteAccount';
const QUESTION_RESET_PASSWORD = 'Q.ResetPassword';
const ACTION_VIEW_MNEMONIC = 'mnemonic'

export default {
  data(){
    return {
      title: 'Title.Account',
      showbackicon: true,
      showmenuicon: false,
      showaccount: {},
      islogin:false,//是否输入密码登陆的
      showseed:false,
      qrcodebase64:null,

      showPwdSheet:false,//是否显示输入密码窗口
      showViewkeySheet:false,//是否显示密钥信息

      inpassword:null,
      pwdvisible:false,
      seed:null,
      mnemonic: null,

      action: null,
      dlgshow: false,
      dlgtitle:"",

      showResetPwdSheet: false,//显示重置密码窗口
      inpassword1: null,
      pwd1visible: false,
      inpassword2: null,
      pwd2visible: false,
      inpassword3: null,
      pwd3visible: false,

      isB:true,
      isC:false,

      showMnemonicSheet: false,

    }
  },
  computed:{
    ...mapState({
      accounts: state => state.accounts.data,
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      password: state => state.accounts.password
    }),
    qrtext(){
      let data = null
      if(this.showseed && this.seed){
        data = exportAccount(this.showaccount,{seed: this.seed})
      }else{
        data = exportNameCard(this.showaccount)
      }
//      var data = {stellar:{name:this.showaccount.name, address: this.showaccount.address}}
      return data;//JSON.stringify(data)
    },
    qrmnemonictext(){
      if(this.showMnemonicSheet){
        return exportMnemonic(this.mnemonic)
      }
      return null
    },
    canModify(){
      //let selected = this.showaccount.address === this.account.address
      // if(this.password && selected )return true
      //return false
      if(this.showseed && this.seed )return true
      return false
    },

    showseedinfo(){
      if(this.showseed && this.seed ){
        return this.seed
      }
      return '********'
    },

    inflationPoolSite(){
      let address = this.showaccount.inflationAddress
      if(!address)return '';
      for(var i=0,n=INFLATION_POOL.length; i<n; i++){
        let d = INFLATION_POOL[i];
        if(d.address === address)return d.host;
      }
      return '';
    }

  },
  beforeMount(){
      let address = this.$route.query.address || this.account.address
      // federationAddress&inflationAddress
      // let federationAddress = this.$route.query.federationAddress || this.account.federationAddress
      // let inflationAddress = this.$route.query.inflationAddress || this.account.inflationAddress
      for(var i=0,n=this.accounts.length;i<n;i++){
        if(this.accounts[i].address === address){
          this.showaccount = this.accounts[i]
          if(address === this.account.address && this.accountData.seed){
            this.islogin = true
          }
          break
        }
      }
      console.log(this.accounts)
    
      
  },
  mounted(){ 
  },
  methods: {
    ...mapActions({
      deleteAccount:'deleteAccount',
      cleanAccount: 'cleanAccount',
      resetAccountPwd: 'resetAccountPwd',
    }),
    back(){
      this.$router.back()
    },
    qrcodecallback(img){
      this.qrcodebase64 = img
    },
    copy(value){
      if(value && cordova.plugins.clipboard){
        cordova.plugins.clipboard.copy(value)
        this.$toasted.show(this.$t('CopySuccess'))
      }
    },
    copySeed(){
      if(this.showseed && this.seed && cordova.plugins.clipboard){
        cordova.plugins.clipboard.copy(this.seed)
        this.$toasted.show(this.$t('CopySuccess'))
      }
    },
    dlgBtnCancel(){
      this.action = null;
      this.dlgshow = false;

    },
    dlgBtnOK(){
      if(this.action === ACTION_DEL){
        this.dlgshow = false;
        this.doDel();
      }else if(ACTION_RESET_PASSWORD === this.action){
        this.dlgshow = false;
        this.showResetPwdSheet = true;
        this.inpassword1 = null;
        this.inpassword2 = null;
        this.inpassword3 = null;

        
      }
    },
    del(){
      if(!this.canModify){
        this.showPwdSheet = true;
        this.inpassword = null;
        return;
      }
      this.dlgshow = true;
      this.action = ACTION_DEL;
      this.dlgtitle = QUESTION_DELETE_ACCOUNT;

    },
    doDel(){

      let selected = this.showaccount.address === this.account.address
      let index = -1
      for(var i=0,n=this.accounts.length;i<n;i++){
        if(this.accounts[i].address === this.showaccount.address){
          index = i
          break
        }
      }

      this.deleteAccount({ index, account: this.showaccount})
        .then(()=>{
            if(selected){
               this.cleanAccount()
            }
            this.$toasted.show(this.$t('Account.DeleteSuccess'))
            if(this.accounts.length === 0){
              this.$router.push({name: 'Wallet'})
            }else{
              this.$router.back()
            }
        })
        .catch(err=>{
          console.error(err)
          this.$toasted.error(this.$t('Account.DeleteFailed'))
        })
    },
    modify(){
      if(!this.canModify){
        this.showPwdSheet = true;
        this.action = ACTION_MODIFY
        this.inpassword = null;
        return;
      }
      this.$router.push({name: 'ModifyAccount', query: {address: this.showaccount.address, seed: this.seed}});
    },
    toViewKey(){
      this.showPwdSheet=true
      this.inpassword = null
      this.action = ACTION_VIEWSECRET
    },
    viewkey(){
      this.showViewkeySheet = true;
      this.isB=false;
      this.isC=true;
    },
    toViewMnemonic(){
      this.showPwdSheet = true
      this.inpassword = null
      this.action = ACTION_VIEW_MNEMONIC
    },
    showMnemonicDlg(){
      this.showMnemonicSheet = true;
      this.isB=false;
      this.isC=true;
    },
    change_value0f_vk(){
      //if(this.showViewkeySheet == true)
      this.showViewkeySheet = false;
      this.showMnemonicSheet = false;
      this.isB=true;
      this.isC=false;
      // console.log(this.showaccount);
    },
    resetpwd(){
      this.dlgshow = true;
      this.action = ACTION_RESET_PASSWORD;
      this.dlgtitle = QUESTION_RESET_PASSWORD;
    },
    doResetPwd(){
      if(!this.inpassword1 || !this.inpassword2 || !this.inpassword3){
        this.$toasted.error(this.$t('Account.PasswordNotNull'))
        return;
      }
      if(this.inpassword2!=this.inpassword3){
        this.$toasted.error(this.$t("Account.PasswordNotSame"));
        return;
      }
      let index = -1
      for(var i=0,n=this.accounts.length;i<n;i++){
        if(this.accounts[i].address === this.showaccount.address){
          index = i
          break
        }
      }
      this.resetAccountPwd({index, account: this.showaccount, password: this.inpassword1, newpassword: this.inpassword2})
        .then(data=>{
          this.$toasted.show(this.$t('Account.PasswordResetSuccess'));
          this.showResetPwdSheet = false;
          this.inpassword1 = null;
          this.inpassword2 = null;
          this.inpassword3 = null;
        })
        .catch(error=>{
          console.log(error)
          this.$toasted.error(this.$t('Account.PasswordResetFail'));
        })
      
    },
    canclePwdInput(){
      this.showPwdSheet = false
      this.inpassword = null
    },
    okPwdInput(){
      if(this.inpassword!=null){
        readAccountData(this.showaccount.address,this.inpassword)
          .then(data=>{
            this.inpassword = false
            if(data.seed){
              this.seed = data.seed
              this.mnemonic = data.mnemonic
              this.showPwdSheet = false
              if(this.action === ACTION_MODIFY){
                this.$router.push({name: 'ModifyAccount', query: {address: this.showaccount.address, seed: this.seed, mnemonic: this.mnemonic}});
              }else if(this.action === ACTION_VIEWSECRET){
                this.showseed = true
                this.viewkey()
              }else if(this.action === ACTION_VIEW_MNEMONIC){
                this.showMnemonicDlg()
              }
              
            }else{
              this.$toasted.error(this.$t('Error.PasswordWrong'))
            }
          })
          .catch(err=>{
            this.$toasted.error(this.$t('Error.PasswordWrong'))
            // this.inpassword = false
          })
      }
    },
    // viewkey_okPwdInput(){
    //   if(this.inpassword!=null){
    //     readAccountData(this.showaccount.address,this.inpassword)
    //       .then(data=>{
    //         this.inpassword = false
    //         if(data.seed){
    //           this.seed = data.seed
    //           this.showPwdSheet = false
    //           this.showseed = false
    //           this.showViewkeySheet = true
              
    //         }else{
    //           this.$toasted.error(this.$t('Error.PasswordWrong'))
    //         }
    //       })
    //       .catch(err=>{
    //         this.$toasted.error(this.$t('Error.PasswordWrong'))
    //         // this.inpassword = false
    //       })
    //   }
    // },
    seedIconClick(){
      //showseed=!showseed
      if(this.showseed){
        this.showseed = false
        this.seed = null
        this.inpassword = null
      }else{
        this.showPwdSheet = true
      }
      
    },

    cancleResetPwdInput(){
      this.showResetPwdSheet = false
    },

    okResetPwdInput(){
      this.doResetPwd()
    },

  },
  components: {
    Toolbar,
    qrcode: QRCode,
    Card,
    PasswordSheet,
  }
}
</script>


<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.page
  background: $primarycolor.gray
  .content
    height: 100%
    overflow-y:auto

.card-content
  .label
    font-size: 16px
    color: $primarycolor.green
    padding-top: 2px
    padding-bottom: 2px
  .value
    display: block
    font-size: 14px
    color: $primarycolor.font
    width: 100%
    white-space:normal
    word-wrap: break-word
    word-break: break-all
    padding-bottom: 5px
    &.seed
      display: flex
      .secret
        flex: 5
      .secreticon
        flex: 1
        text-align: right
        padding-right: 5px
        .secreticons
          color: $primarycolor.green
  .qrcode
    text-align: center
.footer
  background: $primarycolor.gray
  height:40px
  line-height:40px
  font-size:14px
  margin-top: 3px
  text-align:center
  position: fixed
  bottom: 8px
  bottom: calc(8px + constant(safe-area-inset-bottom))
  bottom: calc(8px + env(safe-area-inset-bottom))
  left: 0
  right: 0
  
  &.active
    color:$primarycolor.green
  &.unactive
    color: $secondarycolor.font
.btn-available
  color:$primarycolor.green
.btn-unavailable
  color:$secondarycolor.green
.avatar-wrapper
  display: block
  text-align: left
  color:$primarycolor.green
  .avatar
    width: 56px
    height: 56px
    background: $primarycolor.gray
    border-radius: 56px
    .iconfont
      color: $primarycolor.green
      font-size: 32px
.name
  display: block
  text-align: left
  font-size: 14px
  color: $primarycolor.font
  padding-top: 10px
  padding-bottom: 10px
.btn-group
  width: 100%
  margin-top: 10px
  .btn-export
    width: 100%
    margin: 0px 0px
    padding: 0px 0px
    height: 36px
.pwdSheetWrapper
  background: $secondarycolor.gray
  height: 160px
  position: fixed
  bottom: 0
  bottom: constant(safe-area-inset-bottom)
  bottom: env(safe-area-inset-bottom)
  right: 0
  left: 0
  z-index: 100
  &.rePwdSheetWrapper
    height: 360px
.sheet-content
  padding: 10px 10px
  padding-bottom: calc(10px + constant(safe-area-inset-bottom))
  padding-bottom: calc(10px + env(safe-area-inset-bottom))
  background: $secondarycolor.gray
.sheet-btns
  display: flex
  color: $primarycolor.green
  height: 50px
  line-height: 50px
  .sheet-btn
    flex: 1
    text-align: center
    font-size: 16px
.dlg-content
  font-size: 14px
.stitle
  text-align: center
  font-size: 16px
  height: 32px
  line-height: 32px
  padding-top: 10px


.Info_mycard
  background-color:$secondarycolor.gray  
  height:550px
.Info_mycardB
  background-color:$secondarycolor.black
  opacity:0.3
.Info_menu_color
  color:$primarycolor.green
  font-size:18px
.showViewkeySheetPosition
  height:5000px
  width:3750px
  background-color:green
.viewkeySheetWrapper
  height:100px
  width:100px
  font-size:20px
  color:red

.info_warning_msg_style
  padding-top:10px
  color:$primarycolor.red
  font-size:16px
  text-align :center
.info_account_miyao_style
  color:$primarycolor.red
  font-size:15px
.info_showaccount_address_style
  color:$primarycolor.font
  font-size:17px
  text-align:center
  word-break:break-all
.info_showaccount_barcode_style
  color:$primarycolor.red
  font-size:16px
  // text-align:center
  padding-left:150px
.info_qrcode_style
  text-align:center
.info_account_close_style
  color:$primarycolor.red
  font-size:16px
  // text-align:center
  padding-left:175px

.bts-dlg
  background: $secondarycolor.gray!important
  padding-bottom: 0px
  padding-bottom: constant(safe-area-inset-bottom)
  padding-bottom: env(safe-area-inset-bottom)
</style>

