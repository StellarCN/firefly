// 添加资产
<template>
  <div class="page" >
    <loading color="red" :show="showloading" :loading="working" :success="trustsuccess" :fail='trustfail'
            :title="loadingTitle" :msg="loadingMsg" :closeable="trustfail" @close="hiddenLoadingView" />
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
      ref="toolbar"
      >
      <span slot="switch_password">{{$t('Account.Password')}}</span>
    </toolbar>
    <div class="content">
      <div class="flex-row textcenter menurow">
        <div class="flex1" @click="activeFedAddType">
          <span :class="'menu ' + ( addTypeFed ? 'active':'unactive' )" >{{$t('FederationUrl')}}</span></div>
        <div class="flex1" @click="activeManullyAddType">
          <span :class="'menu ' + ( addTypeManully ? 'active':'unactive' )" >{{$t('ManullayAddTrust')}}</span></div>
        <div class="flex2"></div>
      </div>
      <card class="icard" padding="2px 8px" v-if="addTypeFed">
        <div class="card-content" slot="card-content">
         <v-text-field
              dark
              name="url"
              v-model="url"
              append-icon="search"
              :append-icon-cb="search"
              type="text"
              placeholder='fchain.io or stellar.org'
              primary
            ></v-text-field>
        <div @click="addallasset(currencies)" class="addallasset">{{$t("AddAll")}}</div>
        <ul class="currency-ul">
          <li class="currency-li" v-for="currency in currencies" :key="currency.code">
            <div class="currency">
              <div class="currency-left">
                <div class="code-wrapper">
                  <span class="code">{{currency.code}}</span>
                  <span class="host">{{currency.host}}</span>
                </div>
                <div class="address">
                  {{currency.issuer | shortaddress}}
                </div>
              </div>
              <div class="currency-right">
                <v-btn icon disabled dark v-if="isTrusted(currency)">
                  <v-icon color='primary'>done</v-icon>
                </v-btn>
                <v-btn icon flat color="primary" v-else @click.stop="addTrust(currency)" :loading="working">
                  <v-icon>add</v-icon>
                </v-btn>
                <!-- <i class="material-icons done" v-if="isTrustd(currency)">&#xE876;</i> -->
                <!-- <i class="material-icons add" v-else @click.stop="addTrust(currency)">&#xE147;</i> -->
              </div>
            </div>
          </li>
        </ul>
        </div>
      </card>

       <card class="icard" padding="8px 8px" v-if="addTypeManully">
        <div class="card-content" slot="card-content">
           <v-text-field
              dark
              :label="$t('AssetCode')"
              name="asset_code"
              v-model="asset_code"
              type="text"
              primary
            ></v-text-field>
             <v-text-field
              dark
              :label="$t('AssetIssuer')"
              name="asset_issuer"
              v-model="asset_issuer"
              type="text"
              primary
            ></v-text-field>
            <div class="flex-row">
              <v-btn class='btn_trust'  block dark large @click="doManuallyTrust">{{$t('Button.OK')}}</v-btn>
            </div>
        </div>
       </card>


    </div>
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import { mapState, mapActions, mapGetters} from 'vuex'
import { federation } from '@/api/federation'
import Loading from '@/components/Loading'
import { xdrMsg,getXdrResultCode } from '@/api/xdr'

const ADD_TRUST_FED = 'fed'
const ADD_TRUST_MANUALLY = 'manually'

export default {
  data(){
    return {
      title: 'AddAsset',
      showmenuicon: false,
      showbackicon: true,

      showloading: false,
      working: false,
      trustsuccess: false,
      trustfail: false,
      loadingTitle: null,
      loadingMsg: null,


      url:null,
      currencies:[],
      // notTrustedcurrencies:[],

      addtype:ADD_TRUST_FED,
      asset_code: null,
      asset_issuer: null,

    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      asset: state => state.asset.selected
    }),
    ...mapGetters([
      'balances',
      'reserve',
      'base_reserve',
      'native'
    ]),

    addTypeFed(){
      return this.addtype === ADD_TRUST_FED
    },
    addTypeManully(){
      return this.addtype === ADD_TRUST_MANUALLY
    },/*
    notTrustedcurrencies: function (currencies) {
      var notTrustedcurrenciesarray = null
      for(var i=0 ;i< currencies.length;i++){
        // console.log("iamhere")
        let is_flag= this.isTrusted(currencies[i]);
        // console.log("here i am")
        // console.log("is_flag"+is_flag)
        if(is_flag){
            // console.log("had trusted ,do nothing===============")
        }else{
          // this.addTrustAll(currencies[i])
          // console.log("this is  no trusted currencies preams------------------")
          // console.log("this is "+currencies[i]+"-------------------------")
        //新数组，所有没有授信过的资产数组
          notTrustedcurrenciesarray.push(currencies[i])
        }
      }
      return notTrustedcurrenciesarray
    
    }*/
  
  },
  mounted(){
    this.url = 'fchain.io'
    this.search()
    this.url = ''
  },
  methods: {
    ...mapActions({
      trust: 'trust',
      trustAll: 'trustAll',
      // delTrust: 'delTrust',
    }),
    isTrusted(item){
      let trusted = false
      for(var i=0,n=this.balances.length;i<n;i++){
        let ele = this.balances[i]
        if(item.code === ele.code && item.issuer === ele.issuer){
          trusted = true
          break
        }
      }
      return trusted
    },
    back(){
      this.$router.back()
    },
    search(){
      if(!this.url){
        return
      }
      this.currencies = []
      federation(this.url)
        .then(data=>{
          this.currencies = data.CURRENCIES
        })
        .catch(err=>{
          // this.$toasted.error(this.$t('Error.NoPassword'))
          this.$toasted.error(this.$t('AddAssetNotFound'))
          console.error(err)
        })
    },
    // //删除授信
    // delTrust(currency){
    //   if(!this.accountData.seed){
    //     this.$toasted.error(this.$t('Error.NoPassword'))
    //     return;
    //   }
    //   if(this.working)return
    //   this.working = true
    //   let params = {
    //       seed: this.accountData.seed,
    //       address: this.account.address,
    //       code: currency.code,
    //       issuer: currency.issuer}
    //   this.delTrust(params)
    //     .then(response=>{
    //       console.log(response)
    //       this.working = false
    //     })
    //     .catch(err=>{
    //       console.error(err)
    //       this.working = false
    //     })

    // },
    //添加授信
    addTrust(currency){
      if(!this.accountData.seed){
      //   this.$toasted.error(this.$t('Error.NoPassword'))
      //   return;
      // }
      // if(!this.islogin){
        this.$toasted.error(this.$t('Error.NoPassword'))
        this.$refs.toolbar.showPasswordLogin()
        return
      }
      if(this.native.balance - this.reserve > this.base_reserve){
        console.log('enough native asset to continue')
      }else{
        this.$toasted.error('no enough lumens to continue')
        return 
      }
      if(this.working) return
      this.trustsuccess = false
      this.trustfail = false
      this.showloading = true
      this.working = true 
      this.loadingTitle = null
      this.loadingMsg = null
      let params = {
          seed: this.accountData.seed,
          address: this.account.address,
          code: currency.code,
          issuer: currency.issuer}
      this.trust(params)
        .then(response=>{
          console.log(response)
          this.trustsuccess = true
          this.trustfail = false
          this.working = false
          this.loadingTitle = this.$t('AddAssetSuccess')
          this.asset_code = null
          this.asset_issuer = null

          setTimeout(()=>{
            this.showloading = false
          },3000)
        })
        .catch(err=>{
          console.error(err)
          this.trustsuccess = false
          this.trustfail = true
          this.working = false
          //有可能返回超时，这时候也需要处理一下
          let msg = getXdrResultCode(err)
          this.loadingTitle = this.$t('AddAssetFail')
          if(msg){
           this.loadingMsg = this.$t(msg)
          }     
        })
        .finally(
          //this.working = false
        )
    },
    //wdp 添加的代码
    /*
     addAllTrust(currency){
      this.trustsuccess = false
      this.trustfail = false
      // this.showloading = true
      this.working = true 
      this.loadingTitle = null
      this.loadingMsg = null
      let params = {
          seed: this.accountData.seed,
          address: this.account.address,
          code: currency.code,
          issuer: currency.issuer}
      this.trust(params)
        .then(response=>{
          console.log(response)
          this.trustsuccess = true
          this.trustfail = false
          this.working = false
          // this.loadingTitle = this.$t('AddAssetSuccess')
          this.asset_code = null
          this.asset_issuer = null

          // setTimeout(()=>{
          //   this.showloading = false
          // },3000)
        })
        .catch(err=>{
          console.error(err)
          this.trustsuccess = false
          this.trustfail = true
          this.working = false
          //有可能返回超时，这时候也需要处理一下
          let msg = getXdrResultCode(err)
          this.loadingTitle = this.$t('AddAsset')+this.$t('SaveFailed')
          if(msg){
           this.loadingMsg = this.$t(msg)
          }     
        })
        .finally(
          //this.working = false
        )
    },
*/
    
    activeFedAddType(){
      this.addtype = ADD_TRUST_FED
    },
    activeManullyAddType(){
      this.addtype = ADD_TRUST_MANUALLY
    },

    doManuallyTrust(){
      if(!this.asset_code){
        this.$toasted.error(this.$t('Error.AssetCodeNull'))
        return
      }
      if(!this.asset_issuer){
        this.$toasted.error(this.$t('Error.AssetIssuerNull'))
        return
      }
      this.addTrust({code: this.asset_code, issuer: this.asset_issuer})
    },

    hiddenLoadingView(){
      this.showloading = false
      this.trustfail = false
      this.loadingTitle = null
      this.loadingMsg = null
    },
    //wdp添加的代码
    addallasset(currencies){
      // console.log("hello")
      // console.log(currencies)
      //弹出密码确认
      // console.log("------------------")
      // this.$toasted.error(this.$t('Error.NoPassword'))
      // this.$refs.toolbar.showPasswordLogin()

       if(!this.accountData.seed){
        this.$toasted.error(this.$t('Error.NoPassword'))
        this.$refs.toolbar.showPasswordLogin()
        return
      }
      if(this.native.balance - this.reserve > this.base_reserve){
        console.log('enough native asset to continue')
      }else{
        this.$toasted.error('no enough lumens to continue')
        return 
      }
      if(this.working) return
      this.showloading = true
      let assets = currencies.filter(item=>!this.isTrusted(item))
      this.trustAll({seed: this.accountData.seed, address: this.account.address,assets}).then(data=>{
        console.log('trust all success')
          this.trustsuccess = true
          this.trustfail = false
          this.working = false
          this.loadingTitle = this.$t('AddAssetSuccess')
          this.asset_code = null
          this.asset_issuer = null
          setTimeout(()=>{
            this.showloading = false
          },5000)

      }).catch(err=>{
        console.error(err)
        console.error('trust all error')
          this.trustsuccess = false
          this.trustfail = true
          this.working = false
          //有可能返回超时，这时候也需要处理一下
          let msg = getXdrResultCode(err)
          this.loadingTitle = this.$t('AddAsset')+this.$t('SaveFailed')
          if(msg){
           this.loadingMsg = this.$t(msg)
          }  
      })

/*
// console.log(currencies.length)
      for(var i=0 ;i< currencies.length;i++){
        // console.log("iamhere")
        let is_flag= this.isTrusted(currencies[i]);
        // console.log("here i am")
        // console.log("is_flag"+is_flag)
        if(is_flag){
            // console.log("had trusted ,do nothing===============")
        }else{
          // this.addTrustAll(currencies[i])
          // console.log("this is  no trusted currencies preams------------------")
          // console.log("this is "+currencies[i]+"-------------------------")
          console.log("Times==========="+currencies[i])
          // Promise.all(this.addTrust(currencies[i]))
          // var a = new Promise(function  (resolve,reject) {
          //    this.addTrust(currencies[i])
          // }); 
          this.addAllTrust(currencies[i])
          console.log("code work-----------------")
        
      }
      }
    */
    }
   
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
  .content
    color: $primarycolor.font
.currency-ul
  padding-left:0
  .currency-li
    border-bottom: 1px solid $secondarycolor.font
    padding-top: 5px
    &:last-child
      border-bottom: 0px
.currency
  display: -webkit-flex
  display: inline-flex
  width: 100%
  .currency-left
    text-align: left
    width: 80%
    .code-wrapper
      .code
        font-size: 16px
      .host
        font-size: 14px
        padding-left: 10px
    .address
      font-size: 14px
      color: $secondarycolor.font
        
  .currency-right
    text-align: right
    width: 20%
    padding-top: 5px
    padding-right: 10px
    .material-icons
      font-size: 24px
    .add
      color: $primarycolor.green
    .done
      color: $primarycolor.green

.application 
  .theme--dark.btn.btn--disabled 
    .icon
      color: $primarycolor.green !important
.menurow
  margin-bottom: 5px
.menu
  padding-left: 5px
  padding-right: 5px
  &.active
    border-bottom: 2px solid $primarycolor.green
.btn_trust
  background-color: $primarycolor.green  !important

.addallasset
  color:$primarycolor.green
  float:right
  padding-right:5px
</style>

