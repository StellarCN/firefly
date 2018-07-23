/**
 * ping界面
 * 设置完成后，执行回调
 */
<template>
  <div class="pin">
    <div class="password-content"       style="z-index:9999;">
      <div :class="'password-list ' + (shake ? 'animated shake':'' )" >
        <div v-for="item in pwdlength" :key="'pwd'+item" class="show-pwd">
          <div class="dot"></div>
        </div>
        <div v-for="item in blanklength" :key="'blank'+item" class="blank-pwd">
          <div class="dot"></div>
        </div>
      </div>
    </div>
    <number-keyboard
      style="z-index:9999;"
     :show="showkeyboard" :max="max" :reset="reset" v-on:onChange="onChange"></number-keyboard>
  </div>
</template>

<script>
import NumberKeyboard from './NumberKeyboard'

export default {
  data(){
    return {
      showkeyboard: true,
      max: 6,
      password:'',
      shake:false
    }
  },
  props:{
    top:{
      type:Number,
      default: 56
    },
    reset: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    pwdlength(){
      return this.password.length
    },
    blanklength(){
      return this.max - this.password.length
    },
  },
  mounted(){
   
  },
  components: {
    NumberKeyboard
  },
  methods: {
    onChange(password){
      this.password = password
      if(this.max === this.password.length){
        // 延迟执行
        setTimeout(()=>{
          this.$emit('finish',this.password)
           if(this.reset){
             this.shake = false
            setTimeout(()=>{
              this.shake = true
              setTimeout(()=>{
                this.password = ''
              })
            },200)
          }
        },200);
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@require '../stylus/color.styl'
$dot-size = 16px
.password-content
  background: $primarycolor.gray
  position: absolute
  top: 48px
  left: 0
  right: 0
  bottom:0
  z-index:0
  .password-list
    margin-top:35%
    height: 32px
    line-height: 32px;
    margin-left: 20%
    margin-right: 20%
    width: 60%
    .blank-pwd
      display: flex
      float: left
      width: 16.66%
      text-align: center
      justify-content: center
      .dot
        border: 2px solid $primarycolor.green
        height: $dot-size
        line-height: $dot-size
        width: $dot-size
        border-radius: $dot-size
        display: block
    .show-pwd
      display: flex
      float: left
      width: 16.66%
      text-align: center
      justify-content: center
      .dot
        border: 2px solid $primarycolor.green
        height: $dot-size
        line-height: $dot-size
        width: $dot-size
        border-radius: $dot-size
        display: block
        background: $primarycolor.green

</style>
