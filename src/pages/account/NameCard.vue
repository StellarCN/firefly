/**
 * 显示当前账户信息
 */
<template>
  <div class="page">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="goback"
      />
    <div class="content">
      <div class="label">{{$t('Account.AccountName')}}</div>
      <div class="value" @click="copy(account.name)">{{account.name}}</div>
      <div class="label">{{$t('Account.AccountAddress')}}</div>
      <div class="value" @click="copy(account.address)">{{account.address}}</div>
      <div class="label">{{$t('FederationAddress')}}</div>
      <div class="value" @click="copy(account.federationAddress)">{{account.federationAddress}}&nbsp;</div>
      <div class="label test_namecard_barcode">{{$t('StellarAddressBarCode')}}</div>
      <!-- <div class="value" @click="copy(account.memo)">{{account.memo}}&nbsp;</div> -->
      
      <div class="qrcode">
        <qrcode :text="qrtext" :callback="qrcodecallback"/>
      </div>
      
    </div>
    <!-- <div class="footer">
      <v-layout row wrap>
        <v-flex xs12 @click="goback">
          <span>{{$t('Return')}}</span>
        </v-flex>
        <v-flex xs6 @click="save">
          <span>{{$t('Save')}}</span>
        </v-flex>
       </v-layout>  
    </div> -->
  </div>
</template>

<script>
import Toolbar from '../../components/Toolbar'
import { mapState, mapActions} from 'vuex'
import QRCode from '../../components/QRCode'
import { exportNameCard } from '../../api/qr'
export default {
  data(){
    return {
      title: 'Account.NameCard',
      showbackicon: true,
      showmenuicon: false,
      showseed : false,
      qrcodebase64:null,
    }
  },
  computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
    }),
    qrtext(){
      //类似于stargazer的格式
      return exportNameCard(this.account)
      //return JSON.stringify(exportNameCard(this.account))
    },
    hasseed(){
      if(this.accountData.seed)return true
      return false
    },
    seed(){
      if(this.showseed){
        return this.accountData.seed
      }
      return "************"
    }
  },
  mounted(){
  },
  methods: {
    ...mapActions({
    }),
    qrcodecallback(img){
      this.qrcodebase64 = img
    },
   goback(){
      this.$router.back()
    },
    save(){
      //TODO 调用shx-cordova-saveb64-image保存二维码
      let params = {
          data: this.qrcodebase64, 
          prefix: this.account.name + "-namecard" , 
          format: 'png', 
          quality: 100, 
          mediaScanner: true
      };
      if(window.imageSaver){
        window.imageSaver.saveBase64Image(params,
          (filePath) => {
            console.log('File saved on ' + filePath);
          },
          (msg) => {
            console.error(msg);
          }
        );
      }else{
        console.error(`no image save -----------`)
      }
    
    },
    copy(value){
      if(cordova.plugins.clipboard){
        cordova.plugins.clipboard.copy(value)
        this.$toasted.show(this.$t('CopySuccess'))
      }
    },
    copySeed(){
      if(this.showseed && cordova.plugins.clipboard){
        cordova.plugins.clipboard.copy(this.accountData.seed)
        this.$toasted.show(this.$t('CopySuccess'))
      }

    }
  },
  components: {
    Toolbar,
    qrcode: QRCode,
  }
}
</script>


<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.content
  position: fixed
  overflow-y: auto
  padding-top: 20px
  padding-top: calc(20px + constant(safe-area-inset-top))
  padding-top: calc(20px + env(safe-area-inset-top))
  padding-left: 20px
  padding-right: 20px
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
  bottom: constant(safe-area-inset-bottom)
  bottom: env(safe-area-inset-bottom)
  left:0
  right:0
  z-index:99
  background:$secondarycolor.gray
  height:56px
  line-height:56px
  font-size:20px
  text-align:center
  color:$primarycolor.green
.test_namecard_barcode
  text-align:center


</style>

