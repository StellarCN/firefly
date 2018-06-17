//加载界面
<template>
  <v-dialog v-model="show" fullscreen persistent class="load-dlg">
    <div class="load-content">
      <div class="load-blank flex4">&nbsp;</div>
      <div class="load flex2" v-if="color==='green'">
        <img v-if="working" src="../assets/img/green_working.gif" class="img"/>
        <img v-else-if="init" src="../assets/img/green_init.gif" class="img"/>
        <img v-else-if="success" src="../assets/img/green_success.gif" class="img"/>
        <img v-else-if="fail" src="../assets/img/green_fail.gif" class="img"/>
        <!-- <img v-else  src="../assets/img/logo.png" class="img"/> -->
      </div>
      <div class="load flex2" v-else>
        <img v-if="working" src="../assets/img/red_working.gif" class="img"/>
        <img v-else-if="init" src="../assets/img/red_init.gif" class="img"/>
        <img v-else-if="success" src="../assets/img/red_success.gif" class="img"/>
        <img v-else-if="fail" src="../assets/img/red_fail.gif" class="img"/>
        <!-- <img v-else  src="../assets/img/logo.png" class="img"/> -->
      </div>
      <div :class="'load-title flex2 ' + color  + '-color'">{{title}}</div>
      <div class="load-msg flex1">{{msg}}</div>
      <div :class="'load-close-btn flex1 ' + color  + '-color'" v-if="closeable" @click="back">
        {{$t('Return')}}
      </div>
    </div>
    
  </v-dialog>

</template>

<script>
export default {
  data(){
    return {
      init: false,
      working: false,
      close: false,
    }
  },
  props: {
    show: {
      type: Boolean,
      default:false
    },
    color: {
      type: String,
      default:'red'
    },
    loading:{
      type: Boolean,
      default: true
    },
    success:{
      type: Boolean,
      default: false
    },
    fail:{
      type: Boolean,
      default: false
    },
    title:{
      type: String,
    },
    msg: {
      type: String,
    },
    // show back text when it's true
    closeable:{
      type: Boolean,
      default: false
    }
  },
  watch: {
    loading(){
      if(this.loading){
        this.init=true
        setTimeout(()=>{this.working=true;this.init=false},500)
      }else{
        setTimeout(()=>{this.working=false;this.init=false},500)
      }
    },
  },
  methods: {
    back(){
      this.$emit('close')
    }
  }
}
</script>

<style lang="stylus" scoped>
@require '../stylus/color.styl'
.load-content
  height: 100vh
  background: $secondarycolor.gray
  display: flex
  flex-direction: column
  text-align: center
  .load-blank
    height: 30vh
.load
  justify-content center
  opacity: 1
  overflow: hidden
  height: 30vh
  .img
    width: 200px
    height: 200px
.load-title
  font-size: 20px
  text-align: center 
  &.green-color
    color: $primarycolor.green
  &.red-color
    color: $primarycolor.red
.load-msg
  padding-top: 10vh
  color: $secondarycolor.font
  font-size: 16px
  word-wrap: break-word
.load-close-btn
  padding-top: 15vh
  font-size: 16px
  &.green-color
    color: $primarycolor.green
  &.red-color
    color: $primarycolor.red

</style>
