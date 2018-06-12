<template>
  <div class="page">
    
    <div class="content">

        <swiper :options="swiperOption" ref="mySwiper" class="">
            
            <swiper-slide class="guidepage_swiper_slide infocard">
                        <div class="guidepage_swiper_title">{{$t("TransactionPassword")}}</div>
                        <div class="guidepage_swiper_content">{{$t("TransactionPassword_MsgOne")}}</div>
                        <div class="guidepage_swiper_content">{{$t("TransactionPassword_MsgTwo")}}</div>
                        <div class="guidepage_swiper_content">{{$t("TransactionPassword_MsgThree")}}</div>
                        <img :src='require("../assets/img/step1.svg")' class="guidepage_swiper_img">
            </swiper-slide>
            <swiper-slide class="guidepage_swiper_slide infocard">
                <div class="guidepage_swiper_title">{{$t("Account_secretkey")}}</div>
                <div class="guidepage_swiper_content">{{$t("Account_secretkey_MsgOne")}}</div>
                <div class="guidepage_swiper_content">{{$t("Account_secretkey_MsgTwo")}}</div>
                <div class="guidepage_swiper_content">{{$t("Account_secretkey_MsgThree")}}</div>
                <img :src='require("../assets/img/step2.svg")' class="guidepage_swiper_img">
            </swiper-slide>
            <swiper-slide class="guidepage_swiper_slide infocard">
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
    
        <div class="bottom-nav flex-row">
           <div class="flex1 bg-p" @click="slideprv">{{$t("LastStep")}}</div>
           <!-- <v-flex xs6 class="guidepage_bottombutton" v-if="get_progresscount!=1" @click="slidenext" >{{$t("NextStep")}}</v-flex>
           <v-flex xs6 class="guidepage_bottombutton"  v-if="get_progresscount==1" @click="toWallet" >{{$t("AllRight")}}</v-flex> -->
           <div class="flex1  bg-p" v-if="progress_count < 1" @click="slidenext" >{{$t("NextStep")}}</div>
           <div class="flex1 bg-p"  v-else @click="toWallet" >{{$t("AllRight")}}</div>
       </div>
    
    </div>
       
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'

import Vue from 'vue'
import { swiper, swiperSlide } from 'vue-awesome-swiper'
// require styles
import 'swiper/dist/css/swiper.css'
 

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
                pagination : {
                    el: '.swiper-pagination',
                },
                paginationClickable :true,
                prevButton:'.swiper-button-prev',
                nextButton:'.swiper-button-next',
                // scrollbar:'.swiper-scrollbar',
                mousewheelControl : true,
                observeParents:true,
                onTransitionEnd:(value)=>{
                    // console.log(this.progress_count+'----'+value)
                    // console.log(value.progress)
                    this.progress_count = value.progress
                }
                // if you need use plugins in the swiper, you can config in here like this
                // 如果自行设计了插件，那么插件的一些配置相关参数，也应该出现在这个对象中，如下debugger
                // debugger: true,
                // swiper callbacks
                // swiper的各种回调函数也可以出现在这个对象中，和swiper官方一样
               
                
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
            if(this.progress_count === 0){
                this.back()
                return
            }
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
        retprogress_count(){
            this.progress_count = this.swiper.progress
        },
         onTransitionStart(swiper){
            console.log(swiper.progress)
            if(swiper.progress==1){
            //   console.log(this.progress_count)
            //   console.log("++++++"+this.progress_count)
            this.progress_count=1
            console.log("----"+this.progress_count)
            }
        },
        last_progress(){
            return this.$refs.mySwiper.swiper.progress === 1
        }
        // progress_count() {
        //     console.log(this.swiper.progress)
        //     // return this.$refs.mySwiper.swiper.progress
        //     return false
        // },
      
    },
    computed : {
        swiper() {
            console.log('--------s--')
        return this.$refs.mySwiper.swiper
      }
    } ,   
    watch : {
        input_value : function(newValue,oldValue){
            if(newValue==10){
            this.progress_count=1;
            }
            },

        progress : function(newValue,oldValue){
            this.retprogress_count()
        }
        
    },
    mounted() {
      // current swiper instance
      // 然后你就可以使用当前上下文内的swiper对象去做你想做的事了
    //   console.log('this is current swiper instance object', this.swiper)
      this.swiper.slideTo(0, 1000, false)
      this.$watch(()=>this.$refs.mySwiper.swiper.progress, (value)=>{
          console.log('---------------value--'+value)
      })
      this.swiper.on('click', (value)=>{
          console.log('-0----------------'+value)
      })
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
  height: 100vh
  padding-top: 0
  padding-top: calc(4px + constant(safe-area-inset-top))
  padding-top: calc(4px + env(safe-area-inset-top))
  
.content
    height: 100%
.guidepage_swiper
    border-radius:5px
    margin:10px 10px
    padding:5px 5px
    padding-top: 1rem
    background:$secondarycolor.gray
    height: 80%

.guidepage_swiper_slide
    background:$secondarycolor.gray

.guidepage_swiper_img
    padding-top:20% 
    padding-left:20px
    padding-right:20px    
    width:300px
    height: 220px
    

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
.bottom-nav
    text-align:center
    color:$primarycolor.green
    position: fixed
    bottom: 0px
    bottom: constant(safe-area-inset-bottom)
    bottom: env(safe-area-inset-bottom)
    top: calc(100vh - 100px)
    top: calc(100vh - 100px - constant(safe-area-inset-bottom))
    top: calc(100vh - 100px - env(safe-area-inset-bottom))
    left: 0px
    right: 0px
    background: $primarycolor.gray!important
    z-index: 9999
    padding-bottom: 8px
    padding-top: 8px

.bg-p
    background: $primarycolor.gray!important

.infocard
   min-height 10rem
   max-width: 100%
   background-color: $secondarycolor.gray
   height: 80vh
   padding-top: 1rem
   border-radius: 5px
.swiper-bullet
    color: $primarycolor.green
</style>
