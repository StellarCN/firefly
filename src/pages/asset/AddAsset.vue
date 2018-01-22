// 添加资产
<template>
  <div class="page" >
    <loading color="green" :show="showloading" :loading="working" :success="trustsuccess" :fail='trustfail' />
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
      ref="toolbar"
      >
      <span slot="switch_password">{{$t('Account.Password')}}</span>
    </toolbar>
    <div class="content">
      <card class="icard" padding="8px 8px">
        <div class="card-content" slot="card-content">
         <v-text-field
              dark
              name="url"
              :label="$t('FederationUrl')"
              v-model="url"
              append-icon="search"
              :append-icon-cb="search"
              type="text"
              placeholder='fchain.io or stellar.org'
              primary
            ></v-text-field>
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

      url:null,
      currencies:[]

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
  
  },
  mounted(){
    this.url = 'fchain.io'
    this.search()
    this.url = ''
  },
  methods: {
    ...mapActions({
      trust: 'trust',
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
          this.$toasted.success(this.$t('AddAssetSuccess'))//-------------------------
          setTimeout(()=>{
            this.showloading = false
          },3000)
        })
        .catch(err=>{
          console.error(err)
          this.trustsuccess = false
          this.trustfail = true
          this.working = false
          setTimeout(()=>{
            this.showloading = false
          },3000)
          //有可能返回超时，这时候也需要处理一下
          let msg = getXdrResultCode(err)
          if(msg){
            this.$toasted.error(this.$t(msg))
          }else{
            this.$toasted.error(this.$t('AddAsset')+this.$t('SaveFailed'))
          }     
        })
        .finally(
          //this.working = false
        )
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
    padding: 8px 8px
    color: $primarycolor.font
.currency-ul
  padding-left:0
  .currency-li
    border-bottom: 1px solid $secondarycolor.font
    padding-top: 5px
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
</style>

