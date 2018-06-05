<template>
  <div class="page" dark>
    <toolbar :title="$t(title)" :showbackicon="true" style="z-index:999;" @goback="back"/>
    <swiper :options="swiperOptionTop" id="swiper1" class="swiper-container" ref="swiperTop">
            <swiper-slide  class="swiper-slide">
              <div @click="switchComponent('offer')">{{$t('History.Offer')}}</div>
            </swiper-slide>
            <swiper-slide class="swiper-slide">
              <div @click="switchComponent('transaction')">{{$t('History.Transaction')}}</div>
            </swiper-slide>
            <swiper-slide class="swiper-slide">
              <div @click="switchComponent('trade')">{{$t('History.Trade')}}</div>
            </swiper-slide>
            <swiper-slide class="swiper-slide">
              <div @click="switchComponent('depositAndWithdraw')">{{$t('History.DepositAndWithdraw')}}</div>
            </swiper-slide>
            <swiper-slide class="swiper-slide">
              <div @click="switchComponent('effects')">{{$t('History.Effects')}}</div>
            </swiper-slide>
            <swiper-slide class="swiper-slide">
              <div @click="switchComponent('transactions')">{{$t('History.Transactions')}}</div>
            </swiper-slide>
        </swiper>
    <component v-bind:is="show.component"></component>
     
  </div>
</template>

<script>
  import {mapState, mapActions, mapGetters} from 'vuex'
  import Toolbar from '@/components/Toolbar'
  import HistoryOffer from '@/components/HistoryOffer'
  import HistoryTransaction from '@/components/HistoryTransaction'
  import HistoryTrade from '@/components/HistoryTrade'
  import HistoryDepositAndWithdraw from '@/components/HistoryDepositAndWithdraw'
  import Card from '@/components/Card'
  import { swiper, swiperSlide } from 'vue-awesome-swiper'
  import HistoryEffects from '@/components/HistoryEffects'
  import HistoryTransactions from '@/components/HistoryTransactions'
  export default {
    data() {
      return {
        title: 'History.Title',
        loading: false,
        components: {
          offer: HistoryOffer,
          transaction: HistoryTransaction,
          trade: HistoryTrade,
          depositAndWithdraw: HistoryDepositAndWithdraw,
          effects: HistoryEffects,
          transactions: HistoryTransactions
        },
        show: {
          name: null,
          component: null
        },
        swiperOptionTop: {
          notNextTick: true,
          spaceBetween: 10,
          centeredSlides: true,
          slidesPerView: 'auto',
          touchRatio: 0.2,
          slideToClickedSlide: true,
          watchSlidesProgress:true,
          }
      }
    },
    created() {
      this.switchComponent(this.currentHistoryComponent)
    },
    computed: {
     ...mapState({
       currentHistoryComponent: state => state.accounts.currentHistoryComponent,
     }),
    swiperTop() {
        return this.$refs.swiperTop.swiper
      },
    getParams(){
        let routerParams = this.$route.params.active
        return routerParams==="offer"?0:1
      },
    },
    mounted () {  
      console.log("2222-------------")
	    this.swiperTop.on('slideChange', this.showinfo)
	    this.swiperTop.slideTo(this.getParams,0,true)
    } ,
    methods: {
      ...mapActions([
        'changeCurrentHistoryComponent'
      ]),
      back(){
        this.$router.back()
      },
      switchComponent(name) {
        if (name == this.show.name) return
        this.show.name = name
        this.show.component = this.components[name]
      },
      showinfo(){
        console.log("this.showinfo():"+this.swiperTop.activeIndex)
        let typeNumber = this.swiperTop.activeIndex
        if(typeNumber==0){
          this.switchComponent('offer')
          console.log("11111")
        }
        if(typeNumber==1){
          this.switchComponent('transaction')
        }
        if(typeNumber==2){
          this.switchComponent('trade')
        }
        if(typeNumber==3){
          this.switchComponent('depositAndWithdraw')
        }
        if(typeNumber==4){
          this.switchComponent('effects')
        }
        if(typeNumber==5){
          this.switchComponent('transactions')
        }
      }, 
    },
    beforeDestroy() {
      this.changeCurrentHistoryComponent(this.show.name)
    },
    components: {
      Toolbar,
      Card
    }
  }
</script>
<style lang="stylus" scoped>
  @require '~@/stylus/color.styl'
    .menu-wrapper
      margin-top: 10px
      .menu-ul
        width: 100%
        display: flex;
        justify-content: center;
        .menu-li
          float: left
          color: $secondarycolor.font
          padding-left: 10px
          padding-right: 10px
          height: 32x
          line-height: 32px
          text-align: center
          font-size: 16px
        .menu-li.active
          border-bottom: 2px solid $primarycolor.green
          color: $primarycolor.green
.swiper-container
  background: $primarycolor.green
  height: 46px
  margin: 0 !important
  min-height:42px !important
.swiper-slide
  width:100px
  height: 100%;
  opacity: 0.6;
  margin-top:6px
.swiper-slide-active 
  opacity: 1;
  font-weight 600 
</style>