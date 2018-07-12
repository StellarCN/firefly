// 接收激活
<template>
  <div class="page">
    <toolbar :title="$t('fund_askfor')" 
      :showmenuicon="false" 
      :showbackicon="true"
      @goback="back"
      />
    <div class="content">
      <card>
        <div class="card-content" slot="card-content">
          <div class="label">{{$t('Account.AccountAddress')}}</div>
          <div class="value" @click="copy(account.address)">{{account.address}}</div>

          <div class="label">{{$t('Asset')}}</div>
          <div class="value">
            <span class="scode">XLM</span>
            <span class="sissuer">stellar.org</span>
          </div>
         
          <v-text-field
              name="amount"
              :label="$t('Amount')"
              v-model="amount"
              dark
              suffix="XLM"
              type="Number"
              ></v-text-field>
            <div class="receive_asset_msg">
              <span>{{$t("ReceiveAssetMsg")}}</span><br/>
              <span v-if="amount>0">{{amount}}&nbsp;</span>
              <span v-if="amount>0">XLM</span>
            </div>
            <div class="qrcode">
              <qrcode :text="qrtext" :callback="qrcodecallback"/>
            </div>
            <div class="shart_btn mt-2 mb-2" v-if="shareEnable">
              <v-btn class="primary btn_ok" @click="share">{{$t('Share')}}</v-btn>
            </div>
            <div class="pa-2"></div>
        </div>
      </card>
    </div>

  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import QRCode from '@/components/QRCode'
import { mapState, mapActions, mapGetters} from 'vuex'
import { isNativeAsset } from '@/api/assets'

export default {
  
  data(){
    return {
      showmenuicon: false,
      showbackicon: true,
      qrcodebase64:null,
      amount: 1,

    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      asset: state => state.asset.selected,
      assethosts: state => state.asset.assethosts,
    }),
    
    qrtext(){
      // use stargaze pattern
      //{"stellar":{"payment":{"destination":"GAD2....5UZ6","amount":1,"asset":{"code":"BTC","issuer":"GATEMH....MTCH"}}}}
      let data = {stellar:{payment:{
        destination:this.account.address,amount: this.amount,
        asset: { code: 'XLM'} }}}
      return JSON.stringify(data)
    },

    shareEnable(){
       if(window.plugins && window.plugins.socialsharing){
         return true
       }
       return false
    }
  
  },
  mounted(){
  },
  methods: {
    qrcodecallback(img){
      this.qrcodebase64 = img
    },
    back(){
      this.$router.back()
    },
    copy(value){
      if(cordova.plugins.clipboard){
        cordova.plugins.clipboard.copy(value)
        this.$toasted.show(this.$t('CopySuccess'))
      }
    },
    share(){
      if(window.plugins && window.plugins.socialsharing){
        let img = 'data:image';
        if(this.qrcodebase64 && this.qrcodebase64.indexOf(img) < 0){
          img += this.qrcodebase64
        }else{
          img = this.qrcodebase64
        }
        var options = {
          subject: this.$t('fund_askfor'), // fi. for email
          files: [img]//, // an array of filenames either locally or remotely
//          chooserTitle: 'Pick an app' // Android only, you can override the default share sheet title
        }
        window.plugins.socialsharing.shareWithOptions(options, (result)=>{
          console.log('share ok')
          console.log(result)
        }, err=>{
          console.error(err)
        })
      }else{
        this.$toasted.error('not support share')
      }
    },
   
  },
  components: {
    Toolbar,
    Card,
    qrcode: QRCode,
    
  }


}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.card-content
  padding: 8px 8px 0px 8px
  background-color:$secondarycolor.gray
  .label
    font-size: 14px
    color: $secondarycolor.font
    padding-top: 5px
    padding-bottom: 5px
  .asset.label
    color: $primarycolor.green
  .value
    display: block
    font-size: 14px
    color: $primarycolor.font
    width: 100%
    white-space:normal
    word-wrap: break-word
    word-break: break-all
.selectasset
  color: $primarycolor.font
.asset-select-code
  font-size: 14px
.asset-select-issuer
  font-size: 14px
  padding-left: 10px
// .footer
//   position:fixed
//   bottom:0
//   left:0
//   right:0
//   z-index:99
//   background:$secondarycolor.gray
//   height:56px
//   line-height:56px
//   font-size:16px
//   text-align:center
//   color:$primarycolor.green
.qrcode
  text-align: center
  padding-top:20px
  padding-bottom:20px

.receive_asset_msg
  text-align:center
  color:$primarycolor.green
  padding-top:8px

.receive_asset_msg_one
  color:$secondarycolor.font
.scode
  color: $primarycolor.font
.sissuer
  font-size: 12px
  color: $secondarycolor.font
.btn_ok
  width: 95%
</style>

