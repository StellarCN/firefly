<template>
  <vue-qr
        :text="text" 
        :autoColor='true'  
        dotScale='1' 
        :size="size" 
        :logoSrc="logo" 
        colorDark="#000000" 
        :callback="qrcallback"
        margin="10"></vue-qr>
</template>

<script>
import VueQR from '../libs/vue-qr/main'
export default {
  data(){
    return {
      logo: require("../assets/img/logo.png"),
    }
  },
  props:{
    text:{
      type: String,
      required: true
    },
    size:{
      type:Number,
      default: 200
    },
    callback: {
      type: Function
    }
  },
  methods: {
    qrcallback(img){
      // img base64 code
      if(this.callback){
        this.callback(img);
      }
    }
  },
  components:{
    'vue-qr':VueQR
  }
}
</script>

<style lang="stylus" scoped>

</style>
