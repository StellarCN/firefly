<template>
  <div class="page">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
      ref="toolbar"
      />

    <div class="content">
      
      <card class="mycard" padding="20px 10px 20px 10px">

        <div class="card-content" slot="card-content">
          <div class="avatar-wrapper">
            <span class="avatar">
              <i class="iconfont icon-erweima"></i>
            </span>
          </div>
          <div class="name">
              {{showaccount.name}}
          </div>

          
          <div class="label">{{$t('Account.AccountAddress')}}</div>
          <div class="value" @click="copy(showaccount.address)">{{showaccount.address}}</div>
          <div class="label">{{$t('SecretKey')}}</div>
          <div class="value seed" >
            <div class="secret" @click="copySeed">{{showseedinfo}}</div>
            <div class="secreticon" @click="seedIconClick">
              <v-icon class="secreticons" v-if="showseed">visibility</v-icon>
              <v-icon class="secreticons" v-else>visibility_off</v-icon>
            </div>
          </div>
          <div class="label">{{$t('FederationAddress')}}</div>
          <div class="value" @click="copy(showaccount.federationAddress)">{{showaccount.federationAddress}}&nbsp;</div>
          <div class="label">{{$t('InflationAddress')}}</div>
          <div class="value" @click="copy(showaccount.inflationAddress)">{{showaccount.inflationAddress}}&nbsp;</div>
        
          <div class="qrcode">
            <qrcode :text="qrtext" :callback="qrcodecallback"/>
          </div>
        </div>

      </card>
      
      <!-- <div class="btn-group">
         <v-btn class="primary btn-export" primary @click.stop="toAccount">{{$t('Export')}}</v-btn>
      </div> -->
      <div class="footer" v-if="canModify">
        <v-layout row wrap>
          <v-flex xs6 @click="del">
            <span>{{$t('Delete')}}</span>
          </v-flex>
          <v-flex xs6 @click="modify">
            <span>{{$t('Modify')}}</span>
          </v-flex>
        </v-layout>  
      </div>

      <div class="pwdSheetWrapper"v-if="showPwdSheet">
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
  </div>
</template>

<script>
import Toolbar from '../../components/Toolbar'
import { mapState, mapActions} from 'vuex'
import QRCode from '../../components/QRCode'
import Card from '../../components/Card'
import { exportNameCard,exportAccount } from '../../api/qr'
import {readAccountData} from '@/api/storage'

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
      inpassword:null,
      pwdvisible:false,
      seed:null,
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

  },
  beforeMount(){
      let address = this.$route.query.address || this.account.address
      for(var i=0,n=this.accounts.length;i<n;i++){
        if(this.accounts[i].address === address){
          this.showaccount = this.accounts[i]
          if(address === this.account.address && this.accountData.seed){
            this.islogin = true
          }
          break
        }
      }
  },
  mounted(){
  },
  methods: {
    ...mapActions({
      deleteAccount:'deleteAccount',
      cleanAccount: 'cleanAccount',
    }),
    back(){
      this.$router.back()
    },
    qrcodecallback(img){
      this.qrcodebase64 = img
    },
    toAccount(){
      this.$router.push(`/account`)
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
    del(){
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
              this.$router.push(`/wallet`)
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
      this.$router.push({path: '/account/modify', 
        query: {address: this.showaccount.address, seed: this.seed}});
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
              this.showPwdSheet = false
              this.showseed = true
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

  },
  components: {
    Toolbar,
    qrcode: QRCode,
    Card,
  }
}
</script>


<style lang="stylus" scoped>
@require '../../stylus/color.styl'
.page
  background: $primarycolor.gray
  .content
    padding: 10px 10px

.card-content
  .label
    font-size: 14px
    color: $secondarycolor.font
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
  height:36px
  line-height:36px
  font-size:16px
  margin-top: 10px
  text-align:center
  color:$primarycolor.green
.btn-available
  color:$primarycolor.green
.btn-unavailable
  color:$secondarycolor.green
.avatar-wrapper
  display: block
  text-align: center
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
  text-align: center
  font-size: 16px
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
  height: 140px
  position: fixed
  bottom: 0
  right: 0
  left: 0
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
  
</style>

