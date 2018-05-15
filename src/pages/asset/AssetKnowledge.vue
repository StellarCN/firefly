// 资产详情
<template>
  <div class="page">
    <toolbar :title="asset_code" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
      :shadow=false  
      ref="toolbar"
      >
    </toolbar>   
    <div class="content_all">
          <div class="content_asset_image" v-if="asset_info.image!=undefined&&asset_info.image!=null&&asset_info.image!=''">
            <span><img width="200px" height="200px" :src="asset_info.image"/></span>
            </div>
          <div class="content_asset_code_info" v-if="asset_info.code!=undefined&&asset_info.code!=null&&asset_info.code!=''">
            <span >{{$t("AssetCode")}}</span><br/>
            <span class="content_contentcolor">{{asset_info.code}}</span>
            </div>
          <div class="content_asset_issuer_info" v-if="asset_info.issuer!=undefined&&asset_info.issuer!=null&&asset_info.issuer!=''">
            <span>{{$t("AssetIssuer")}}</span><br/>
            <span class="content_contentcolor">{{asset_info.issuer}}</span>
            </div>
          <div class="content_asset_domain" v-if="asset_info.domain!=undefined&&asset_info.domain!=null&&asset_info.domain!=''">
            <span>{{$t("AssetDomain")}}</span><br/>
            <span class="content_contentcolor" @click="openURL(asset_info.domain)">{{asset_info.domain}}</span>
            </div>
          
          <div class="content_asset_info_info" v-if="info">
            <div>{{$t("AssetSummary")}}</div>
            <div class="content_contentcolor" v-image-wrapper v-html="info"></div>
            </div>
          
          <div class="is_networkerror" v-if="isNetWorkError">
               <v-alert  type="error" :value="true">
                  {{$t("NetWorkErrorMessage")}}
                </v-alert>
          </div>

          <div v-if="isNotFound">
            <div>
               <span >{{$t("AssetCode")}}</span><br/>
               <span class="content_contentcolor">{{this.asset_code}}</span>
               </div>
            <div>
              <span>{{$t("AssetIssuer")}}</span><br/>
              <span class="content_contentcolor">{{this.asset_issuer}}</span>
              </div>
            <div>
              <span>{{$t("AssetNotExistMessage")}}</span>
            </div>
          </div>
      
      </div>   
  </div>
</template>

<script>
import Card from '@/components/Card'
import Toolbar from '@/components/Toolbar'
import { mapState, mapActions, mapGetters} from 'vuex'

import { swiper, swiperSlide } from 'vue-awesome-swiper'
import Loading from '@/components/Loading'
import { isNativeAsset } from '@/api/assets'

import {getAssetInfo} from '@/api/gateways'



export default {
  data(){
    return {
        asset_code:'',
        asset_issuer:'',
        asset_info:{},
     
        showmenuicon: false,
        showbackicon: true,
        isNetWorkError:false,
        isNotFound:false
    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      selectedAsset: state => state.asset.selected,
      assethosts: state => state.asset.assethosts,
    }),
    ...mapGetters([
      'balances',
      'paymentsRecords',
      'reserve',
    ]),
    info(){
      let locale = this.$i18n.locale
      let key = 'info_'+locale
      let d = this.asset_info[key]
      if(d)return d
      key = 'info_zh_cn'
      return this.asset_info[key]
    }
  
  },
 
  beforeMount(){
         this.asset_code= this.$route.params.asset_code
          this.asset_issuer = this.$route.params.asset_issuer
          var test = getAssetInfo( this.asset_code,this.asset_issuer)
          .then(response=>{
            this.asset_info = response.data       
          }).catch((err,response)=>{
            if(err.response && err.response.data &&err.response.status === 404 ){
              this.isNotFound =true
            }else{
              this.isNetWorkError = true              
            }
          })
  },
  mounted(){
    
  },
  methods: {
    ...mapActions({
      selectAsset:'selectAsset',
      delTrust:'delTrust',
      selectPayment: 'selectPayment',
      getPayments: 'getPayments',
    }),
    back(){
      this.$router.push({name:"MyAssets"})
    },
    openURL(url) {
      window.open(url, "_system");
    }, 
    
  },
  components: {
    Card,
    Toolbar,
    swiper,
    swiperSlide,
    Loading
    
  }


}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/asset.styl'
.content_all
  background:$secondarycolor.gray
  padding:10px 10px
  word-break:break-all
  margin:10px 10px
  height:100%
  border-radius:5px
  color:$primarycolor.green
.content_asset_image
  margin-top:5px
  margin-bottom:5px
  text-align:center
.content_asset_code_info
  margin-top:5px
  margin-bottom:5px
  
.content_asset_issuer_info
  margin-top:5px
  margin-bottom:5px
.content_asset_domain
  margin-top:5px
  margin-bottom:5px
.content_asset_info_info
  margin-top:5px
  margin-bottom:5px
.content_contentcolor
  color:$secondarycolor.font

.is_networkerror
  padding-top:80%
  padding-bottom:70%
</style>
