<template>
  <div class="page">
      <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
      />
      <div  class="guidepage_swiper">
       
        <swiper :options="swiperOption" ref="mySwiper">
            
            <swiper-slide class="guidepage_swiper_slide">
                <div class="guidepage_swiper_title">{{$t("TransactionPassword")}}</div>
                <div class="guidepage_swiper_content">{{$t("TransactionPassword_MsgOne")}}</div>
                <div class="guidepage_swiper_content">{{$t("TransactionPassword_MsgTwo")}}</div>
                <div class="guidepage_swiper_content">{{$t("TransactionPassword_MsgThree")}}</div>
                <img :src='require("../assets/img/step1.svg")' class="guidepage_swiper_img">
            </swiper-slide>
            <swiper-slide class="guidepage_swiper_slide">
                <div class="guidepage_swiper_title">{{$t("Account_secretkey")}}</div>
                <div class="guidepage_swiper_content">{{$t("Account_secretkey_MsgOne")}}</div>
                <div class="guidepage_swiper_content">{{$t("Account_secretkey_MsgTwo")}}</div>
                <div class="guidepage_swiper_content">{{$t("Account_secretkey_MsgThree")}}</div>
                <img :src='require("../assets/img/step2.svg")' class="guidepage_swiper_img">
            </swiper-slide>
            <swiper-slide class="guidepage_swiper_slide">
                <div class="guidepage_swiper_title">{{$t("TDO")}}</div>
                <div class="guidepage_swiper_content">{{$t("TDO_MsgOne")}}</div>
                <div class="guidepage_swiper_content">{{$t("TDO_MsgTwo")}}</div>
                <div class="guidepage_swiper_content">{{$t("TDO_MsgThree")}}</div>
                <img :src='require("../assets/img/step3.svg")' class="guidepage_swiper_img">
            </swiper-slide>
            <div class="swiper-pagination"  slot="pagination"></div>
            <!-- <div class="swiper-button-prev" slot="button-prev"></div> -->
            <!-- <div class="swiper-button-next" slot="button-next"></div> -->
           </swiper>
       </div> 
        <!-- <div class="swiper-container" >
            <div class="swiper-wrapper">
                <div class="swiper-slide">slider1</div>
                <div class="swiper-slide">slider2</div>
                <div class="swiper-slide">slider3</div>
            </div>
        </div> -->
       <div>
           <v-layout>
           <v-flex xs6 class="guidepage_bottombutton" @click="slideprv">{{$t("LastStep")}}</v-flex>
           <v-flex xs6 class="guidepage_bottombutton" v-if="this.progress_count!=1" @click="slidenext" >{{$t("NextStep")}}</v-flex>
           <v-flex xs6 class="guidepage_bottombutton"  v-if="this.progress_count==1" @click="toWallet" >{{$t("AllRight")}}</v-flex>
           </v-layout>
       </div>
 
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'

import Vue from 'vue'
import VueAwesomeSwiper from 'vue-awesome-swiper'
import { swiper, swiperSlide } from 'vue-awesome-swiper'
// require styles
import 'swiper/dist/css/swiper.css'
 
Vue.use(VueAwesomeSwiper, /* { default global options } */)

export default {

    data () {
        return {
            title:'Language',
            showbackicon: true,
            showmenuicon: false,
            progress_count:0,

            swiperOption: {
                // NotNextTick is a component's own property, and if notNextTick is set to true, the component will not instantiate the swiper through NextTick, which means you can get the swiper object the first time (if you need to use the get swiper object to do what Things, then this property must be true)
                // notNextTick是一个组件自有属性，如果notNextTick设置为true，组件则不会通过NextTick来实例化swiper，也就意味着你可以在第一时间获取到swiper对象，假如你需要刚加载遍使用获取swiper对象来做什么事，那么这个属性一定要是true
                notNextTick: true,
                watchSlidesProgress:true,
                // swiper configs 所有的配置同swiper官方api配置
                // autoplay: 3000,
                autoplay: false,
                // direction : 'vertical',
                effect:"coverflow",
                grabCursor : true,
                setWrapperSize :true,
                // autoHeight: true,
                // paginationType:"bullets",
                pagination : '.swiper-pagination',
                paginationClickable :true,
                prevButton:'.swiper-button-prev',
                nextButton:'.swiper-button-next',
                // scrollbar:'.swiper-scrollbar',
                mousewheelControl : true,
                observeParents:true,
                // if you need use plugins in the swiper, you can config in here like this
                // 如果自行设计了插件，那么插件的一些配置相关参数，也应该出现在这个对象中，如下debugger
                // debugger: true,
                // swiper callbacks
                // swiper的各种回调函数也可以出现在这个对象中，和swiper官方一样
                // onTransitionStart(swiper){
                //   console.log(swiper)
                // },
                // more Swiper configs and callbacks...
                // ...
                }
        }
    },
    methods : {
        back(){
                // this.$router.back()
                this.$router.push({name: 'Picklanguage'})
            },
        toWallet(){
     
                this.$router.push({name:'Wallet'})
        },
        slideprv(){
          
             this.swiper.slidePrev();
             this.progress_count=this.swiper.progress
            //  console.log(this.swiper.progress)
        },
        slidenext(){
            this.swiper.slideNext();
            this.progress_count=this.swiper.progress
            // console.log(this.swiper.progress)
            // if(this.swiper.progress==1){
            //     this.progress_count=1
            // }
            // console.log("this.progress_count  "+this.progress_count)
        },
        // progress_count() {
        //     console.log(this.swiper.progress)
        //     // return this.$refs.mySwiper.swiper.progress
        //     return false
        // },
      

    },
    computed : {
        swiper() {
        return this.$refs.mySwiper.swiper
      },
   
        
      
      
    },
    watch : {
        
    },
    mounted() {
      // current swiper instance
      // 然后你就可以使用当前上下文内的swiper对象去做你想做的事了
      console.log('this is current swiper instance object', this.swiper)
      this.swiper.slideTo(0, 1000, false)
    },
    components: {
        Toolbar,
        Card,
        swiper,
        swiperSlide
  }
}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.page
  background: $primarycolor.gray
  color: $primarycolor.font
  font-size: 16px   

.guidepage_swiper
    border-radius:5px
    height:550px
    margin:10px 10px
    padding:5px 5px
    background:$secondarycolor.gray

.guidepage_swiper_slide
    height:530px
    background:$secondarycolor.gray

.guidepage_swiper_img
    padding-top:100px 
    padding-left:20px
    padding-right:20px    
    width:300px

.swiper-pagination
    

.guidepage_swiper_title
    color:$primarycolor.green
    font-size:20px
    text-align:center
.guidepage_swiper_content
    color:$primarycolor.font
    font-size:18px
    font-family:"Helvetica Neue"
    padding-left:20px
    padding-top:10px
.guidepage_bottombutton
    color:$primarycolor.green
    padding-left:20px
    padding-top:5px
    text-align:center

</style>
