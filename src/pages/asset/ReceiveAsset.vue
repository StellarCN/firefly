// 接收资产
<template>
  <div class="page">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
      />
    <div class="content">
      <card>
        <div class="card-content" slot="card-content">
          <div class="label">{{$t('Account.AccountAddress')}}</div>
          <div class="value" @click="copy(account.address)">{{account.address}}</div>
          <v-select
              v-bind:items="balances"
              v-model="selectedasset"
              :label="$t('Asset')"
              class="selectasset"
              item-value="code"
              item-text="code"
              :return-object="assetChoseReturnObject"
              dark
            >
            <template slot="selection" slot-scope="data">
              <span class="asset-select-code">{{data.item.code}}</span>
              <span class="asset-select-issuer" v-if="assethosts[data.item.code]">{{assethosts[data.item.code]}}</span>
              <span class="asset-select-issuer" v-else-if="assethosts[data.item.issuer]">{{assethosts[data.item.issuer]}}</span>
              <span class="asset-select-issuer" v-else>{{data.item.issuer|miniaddress}}</span>

            </template>
            <template slot="item" slot-scope="data">
              <span class="asset-select-code">{{data.item.code}}</span>
              <span class="asset-select-issuer" v-if="assethosts[data.item.code]">{{assethosts[data.item.code]}}</span>
              <span class="asset-select-issuer" v-else-if="assethosts[data.item.issuer]">{{assethosts[data.item.issuer]}}</span>
              <span class="asset-select-issuer" v-else>{{data.item.issuer|miniaddress}}</span>

            </template>
          </v-select>
          <v-text-field
              name="amount"
              :label="$t('Amount')"
              :value="amount"
              @input="updateAmount"
              dark
              :suffix="selectedasset.code"
              type="Number"
            ></v-text-field>
            <div class="qrcode">
              <qrcode :text="qrtext" :callback="qrcodecallback"/>
            </div>
        </div>
      </card>
    </div>

    <!-- <div class="footer">
      <v-layout row wrap>
        <v-flex xs6 @click="save">
          <span>{{$t('Save')}}</span>
        </v-flex>
        <v-flex xs6 @click="share">
          <span>{{$t('Share')}}</span>
        </v-flex>
       </v-layout>  
    </div> -->


  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import QRCode from '@/components/QRCode'
import { mapState, mapActions, mapGetters} from 'vuex'

export default {
  data(){
    return {
      title: 'Receive',
      showmenuicon: false,
      showbackicon: true,
      selectedasset:{},
      num:null,
      qrcodebase64:null,
      assetChoseReturnObject: true,

    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      asset: state => state.asset.selected,
      assethosts: state => state.asset.assethosts,
    }),
    ...mapGetters([
      'balances',
      'paymentsRecords',
      'reserve',
    ]),
    amount:{
      get(){
        return this.num
      },
      set(val){
        this.num = val
      }
    },
    qrtext(){
      // use stargaze pattern
      //{"stellar":{"payment":{"destination":"GAD2....5UZ6","amount":1,"asset":{"code":"BTC","issuer":"GATEMH....MTCH"}}}}
      let data = {stellar:{payment:{destination:this.account.address,amount: this.num}}}
      if(this.selectedasset.code != 'XLM'){
        data.stellar.payment.asset = {code:this.selectedasset, issuer: this.selectedasset.issuer}
      }
      return JSON.stringify(data)
    }
  
  },
  mounted(){
    this.selectedasset = this.asset
  },
  methods: {
    ...mapActions({
      selectAsset:'selectAsset',
      delTrust:'delTrust',
    }),
    qrcodecallback(img){
      this.qrcodebase64 = img
    },
    updateAmount(val){
      this.num = val      
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
    // 发送资产
    send(item){
      this.$router.push(`/sendasset`)
    },
    // 接收资产
    receive(item){
      this.$router.push(`/receiveasset`)
    },
    save(){
      let params = {
          data: this.qrcodebase64, 
          prefix: this.account.name+"_receive", 
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
    share(){
      if(window.plugins && window.plugins.socialsharing){
        var options = {
          subject: this.account.name+"_receive", // fi. for email
          files: ['data:image/png;base64,'+this.qrcodebase64]//, // an array of filenames either locally or remotely
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
.page
  background: $primarycolor.gray
  .content
    padding: 8px 8px
    margin-bottom: 10px
.card-content
  padding: 8px 8px
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
</style>

