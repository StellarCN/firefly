//加载界面
<template>
  <v-dialog v-model="show" width="200px" persistent >
    <div class="load" v-if="color==='green'">
      <img v-if="working" src="../assets/img/green_working.gif" class="img"/>
      <img v-else-if="init" src="../assets/img/green_init.gif" class="img"/>
      <img v-else-if="success" src="../assets/img/green_success.gif" class="img"/>
      <img v-else-if="fail" src="../assets/img/green_fail.gif" class="img"/>
      <img v-else  src="../assets/img/logo.png" class="img"/>
    </div>
    <div class="load" v-else>
      <img v-if="working" src="../assets/img/red_working.gif" class="img"/>
      <img v-else-if="init" src="../assets/img/red_init.gif" class="img"/>
      <img v-else-if="success" src="../assets/img/red_success.gif" class="img"/>
      <img v-else-if="fail" src="../assets/img/red_fail.gif" class="img"/>
      <img v-else  src="../assets/img/logo.png" class="img"/>
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
    }
  },
  watch: {
    loading(){
      if(this.loading){
        this.init=true
        setTimeout(()=>{this.working=true;this.init=false},1000)
      }else{
        this.init = false
        this.working = false
      }
    },success(){
      console.log("result passed in "+this.success)
    },fail(newValue,oldValue){
      console.log("Tx failed passed in")
      console.log(newValue,oldValue)
      if(newValue === oldValue){
        console.log(newValue)
        return
      }
    }
  },
}
</script>

<style lang="stylus" scoped>
@require '../stylus/color.styl'
.load
  display: flex
  justify-content center
  opacity: 1
  overflow: hidden
  .img
    width: 200px
    height: 200px
</style>
