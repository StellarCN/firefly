<template>
  <!-- <vue-qr
        :value="text" 
        :callback="qrcallback"
        :options="{ size }"></vue-qr> -->
    <div :style="{textAlign:'center',background:'#FFFFFF',
      width:size+20+'px', height: size+20+'px', margin: '0 auto', padding:'10px 10px'}">
       <vue-qr
        :text="text" 
        :autoColor='true'  
        dotScale='1' 
        :size="size" 
        :logoSrc="logo" 
        :callback="qrcallback"
        margin="0"></vue-qr>
    </div>
  
</template>

<script>
import VueQR from '@/libs/vue-qr/main'
// import VueQR from '@/libs/qrcode'
let GREEN = 'green', RED = 'red'
export default {
  data(){
    return {
      greenlogo: require("../assets/img/ff-green.png"),
      redlogo: require("../assets/img/ff-red.png"),
      frontcolor: '#21ce90'
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
    },
    color: {
      type: String,
      default: GREEN
    }
  },
  beforeMount () {
    if(this.color === RED){
        this.frontcolor = '#f35833'
      }else{
        this.frontcolor = '#21ce90'
      }
  },
  computed: {
    logo(){
      if( this.color === RED){
        return this.redlogo
      }
      return this.greenlogo
    },
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
