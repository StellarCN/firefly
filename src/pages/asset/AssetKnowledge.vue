// 资产详情
<template>
  <div class="page">
    <toolbar :title="this.asset_code" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
      :shadow=false  
      ref="toolbar"
      >
    </toolbar>   
    <div class="content_all">
          <div class="content_asset_image" v-if="this.asset_info.image!=undefined&this.asset_info.image!=null&this.asset_info.image!=''">
            <span><img :src="this.asset_info.image"/></span>
            </div>
          <div class="content_asset_code_info" v-if="this.asset_info.code!=undefined&this.asset_info.code!=null&this.asset_info.code!=''">
            <span >{{$t("AssetCode")}}</span><br/>
            <span class="content_contentcolor">{{this.asset_info.code}}</span>
            </div>
          <div class="content_asset_issuer_info" v-if="this.asset_info.issuer!=undefined&this.asset_info.issuer!=null&this.asset_info.issuer!=''">
            <span>{{$t("AssetIssuer")}}</span><br/>
            <span class="content_contentcolor">{{this.asset_info.issuer}}</span>
            </div>
          <div class="content_asset_domain" v-if="this.asset_info.domain!=undefined&this.asset_info.domain!=null&this.asset_info.domain!=''">
            <span>{{$t("AssetDomain")}}</span><br/>
            <span class="content_contentcolor" @click="openURL(asset_info.domain)">{{this.asset_info.domain}}</span>
            </div>
          
          <div class="content_asset_info_info" v-if="this.$i18n.locale==='zh_cn'&this.asset_info.info_zh_cn!=''&this.asset_info.info_zh_cn!=undefined&this.asset_info.info_zh_cn!=null">
            <span>{{$t("AssetSummary")}}</span><br/>
            <span class="content_contentcolor">{{this.asset_info.info_zh_cn}}</span>
            </div>
          <div class="content_asset_info_info" v-else-if="this.$i18n.locale==='en'&this.asset_info.info_en!=''&this.asset_info.info_en!=undefined&this.asset_info.info_en!=null">
            <span>{{$t("AssetSummary")}}</span><br/>
            <span class="content_contentcolor">{{this.asset_info.info_en}}</span>
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
        msg:'',
        asset_code:'',
        asset_issuer:'',
        asset_info:'',
     
        showmenuicon: false,
        showbackicon: true,
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
  
  },
 
  beforeMount(){
         this.asset_code= this.$route.params.asset_code
          this.asset_issuer = this.$route.params.asset_issuer
          var test = getAssetInfo( this.asset_code,this.asset_issuer)
          .then(response=>{

            this.asset_info = response.data
       
          }).catch(err=>{
            console.log(err)
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
    getParams(){
        // 取到路由带过来的参数 
        let routerParams = this.$route.params.AssetData
        // 将数据放在当前组件的数据内
        this.msg = routerParams
    },
    openURL(url) {
      window.open(url, "_system");
    }, 
  },
    watch: {
    // 监测路由变化,只要变化了就调用获取路由参数方法将数据存储本组件即可
      '$route': 'getParams'
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
@require '~@/stylus/color.styl'
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
</style>
