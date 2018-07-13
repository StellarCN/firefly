// 资产详情
<template>
  <div class="page">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
      :shadow=false  
      ref="toolbar"
      >
      <span slot="switch_password">{{$t('Account.Password')}}</span>
    </toolbar>

    <swiper :options="swiperOptionTop" class="gallery-top assets-wrapper" ref="swiperTop">
      <swiper-slide 
        v-for="(item,index) in this.balances"
        v-bind:item="item"
        v-bind:index="index"
        v-bind:key="item.code +'_'+item.issuer"
      >
        <div class="assets-code">{{item.code}}</div>
        <div class="assets-issuer" v-if="assethosts[item.issuer]">{{assethosts[item.issuer]}}</div>
        <div class="assets-issuer" v-else-if="assethosts[item.code]">{{assethosts[item.code]}}</div>
        <div class="assets-issuer" v-else>{{item.issuer|miniaddress}}</div>
      </swiper-slide>
    </swiper>

    <div class="content asset_content">
      <swiper :options="swiperOptionContent" class="gallery-content" ref="swiperContent">
        <swiper-slide 
          v-for="(item,index) in this.balances"
          v-bind:item="item"
          v-bind:index="index"
          v-bind:key="item.code +'_'+item.issuer"
          class="infocard asset_infocard"
        >
          <v-layout row wrap class="asset-amount asset_amount">
            <v-flex xs12 class="row asset_row" d-flex justify-center align-center>
                <v-flex xs2 class="label asset_label">{{$t('Total')}}</v-flex>
                <v-flex class="amount asset_amount">{{item.balance > 0 ? item.balance.toFixed(7):0}}</v-flex>
            </v-flex>
            <v-flex d-flex justify-center align-center xs12 class="row" v-if="isNative(item)"> 
                <v-flex xs2 class="label asset_label">{{$t('Available')}}</v-flex>
                <v-flex class="available asset_available">{{(item.balance - reserve).toFixed(5)}}</v-flex  >
                <v-spacer></v-spacer>
                <v-flex xs2 class="label-reserve asset_label_reserve" >{{$t('Reserve')}}</v-flex>
                <v-flex xs1 class="reserve asset_reserve">{{reserve}}</v-flex>
            </v-flex>
            <!-- <v-flex xs12 class="knowledge_of_assets" ><a href="https://fchain.io" target="_blank">了解{{item.code}}&nbsp;></a> -->
            <v-flex xs12 class="knowledge_of_assets" ><a @click="toAssetKnowledge(item)" target="_blank">{{$t("Understand")}}{{item.code}}&nbsp;></a>

            </v-flex>
          </v-layout>
          <!-- 
            <v-flex d-flex xs12 class="row btns">
                <v-spacer></v-spacer>
                <v-btn   class="primary btn" @click.stop="receive">{{$t('Receive')}}</v-btn>
                <v-spacer></v-spacer>
                <v-btn   class="error btn" @click.stop="send">{{$t('Send')}}</v-btn>
                <v-spacer></v-spacer>
              </v-flex> 
              -->
        </swiper-slide>
      </swiper>


      <h4 class="subtitle">{{$t('History')}}</h4>
       <card padding="10px 10px" class="infocard asset_infocard asset_card_f-card">
        <div class="history" slot="card-content">
          <v-layout class="history-li" row wrap v-for="item in history" :key="item.id" @click.stop="toTranscation(item)">
              <v-flex xs4 class="history-wrapper">
                <div class="history">
                  <div class="history-flag">{{$t(item.flag)}}</div>
                  <div class="history-time">{{item.date}}</div>
                </div>
              </v-flex>
              <v-flex xs8 class="history-wrapper">
                <div :class="'history-amount' + (item.isInbound ? ' add ':' minus ') ">
                    <span class="inbound" v-if="item.isInbound">+</span>
                    <span class="inbound" v-else>-</span>
                    <span class="amount">{{item.amount}}</span>
                    <span class="code">{{item.asset.code}}</span>
                </div>
              </v-flex>
            </v-layout>
        </div>
      </card>
    </div>
    <!-- 发送和接收按键放在最底部-->
    <v-layout class="fixed-bottom btns">
      <v-flex d-flex xs12 class="row">
          <v-spacer></v-spacer>
          <v-btn   class="primary btn receive_btn" @click.stop="receive">{{$t('Receive')}}</v-btn>
          <v-spacer></v-spacer>
          <v-btn   class="error btn send_btn" @click.stop="send">{{$t('Send')}}</v-btn>
          <v-spacer></v-spacer>
        </v-flex>
    </v-layout>
    
  </div>
</template>

<script>
import Card from '@/components/Card'
import Toolbar from '@/components/Toolbar'
import { mapState, mapActions, mapGetters} from 'vuex'

import { swiper, swiperSlide } from 'vue-awesome-swiper'
import Loading from '@/components/Loading'
import { isNativeAsset } from '@/api/assets'
import paymentsMixin from '@/mixins/payments'

export default {
  data(){
    return {
      title: 'Title.MyAssets',
      showmenuicon: false,
      showbackicon: true,

      swiperOptionContent: {
          notNextTick: true,
          spaceBetween: 10
      },
      swiperOptionTop: {
          notNextTick: true,
          spaceBetween: 10,
          centeredSlides: true,
          slidesPerView: 'auto',
          touchRatio: 0.2,
          slideToClickedSlide: true
      }
    }
  },
  mixins: [paymentsMixin],
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
    balanceMap(){
      let m = []
      this.balances.forEach(item=>{
        if(isNativeAsset(item)){
          m.push(item.code)
        }else{
          m.push(item.code+'_'+item.issuer)
        }
      })
      return m
    },
    swiperTop() {
      return this.$refs.swiperTop.swiper
    },
    swiperContent(){
      return this.$refs.swiperContent.swiper
    },
    swiperIndex(){
      let key = isNativeAsset(this.selectedAsset) ? this.selectedAsset.code : (this.selectedAsset.code + '_' + this.selectedAsset.issuer)
      let index = this.balanceMap.indexOf(key)
      return index < 0 ? 0 : index
    },
    history(){
      console.log('--------payments records')
      console.log(this.paymentsRecords)
      let data = []
      if(!this.paymentsRecords){
        return data;
      }
      return this.paymentsRecords.filter(item=>{
        return item.asset && ((isNativeAsset(this.selectedAsset) && isNativeAsset(item.asset)
          || (item.asset.code === this.selectedAsset.code &&  item.asset.issuer === this.selectedAsset.issuer)))
      }).map(item=>{
        let ele = Object.assign({}, item)
        if(ele.type==='payment' || ele.type==='path_payment'){
            ele.flag = ele.isInbound ? 'Receive' : 'Send'
          }else{
            ele.flag = ele.type
          }
        return ele
      })
    },
  
  },
  updated(){
    this.$nextTick(()=>{
      if(this.paymentsRecords === null || this.paymentsRecords.length ===0 ){
        this.getPayments(this.account.address)
          .then(data=>{        })
          .catch(err=>{
            //this.$toasted.error(this.$t(''))
          })
      }
    })
  },
  mounted(){
    console.log('----222')
    this.swiperTop.controller.control = this.swiperContent
    this.swiperContent.controller.control = this.swiperTop
    this.swiperTop.on('slideChange', this.swipeAsset)
    this.swiperTop.slideTo(this.swiperIndex,0,true)
    //如果历史记录为空,则查询历史记录
    
  },
  methods: {
    ...mapActions({
      selectAsset:'selectAsset',
      delTrust:'delTrust',
      selectPayment: 'selectPayment',
      getPayments: 'getPayments',
    }),
    swipeAsset () {
      console.log('-------------')
      console.log(this.swiperTop)
      this.selectAsset(this.balances[this.swiperTop.activeIndex])
    },
    back(){
      this.$router.push({name:"MyAssets"})
    },
    switchAsset(item){
      this.selectAsset(item)
    },
    // 发送资产
    send(){
      if(!this.accountData.seed){
        this.$toasted.error(this.$t('Error.NoPassword'))
        this.$refs.toolbar.showPasswordLogin()
        return
      }
      this.$router.push({name: 'SendAsset'})
    },
    // 接收资产
    receive(){
      this.$router.push({ name: 'ReceiveAsset' })
    },
    toTranscation(item){
      this.selectPayment(item)
      this.$router.push({name: 'Transaction'})
    },
    isNative(asset){
      return isNativeAsset(asset)
    },
    //跳转到资产简介
    toAssetKnowledge(item){
        
        this.$router.push({
          name:'AssetKnowledge',
          params:{
            // 参数名:参数值,
              asset_code:item.code,
              asset_issuer:item.issuer,
            }
            })
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

</style>
