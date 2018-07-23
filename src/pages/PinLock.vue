/**
 * PIN码锁定界面
 */
<template>
  <div class="page pinlock-page">
    <Toolbar 
      :title="$t(title)"
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      style="z-index:9999;"
      >
        <v-btn icon slot='right-tool' @click="exitApp" v-if="!isios">
          <i class="material-icons">exit_to_app</i>
        </v-btn>
      </Toolbar>

    <pin-code ref="pin" @finish="validPin" reset></pin-code>
    
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import PinCode from '@/components/PinCode'
import { mapState, mapActions} from 'vuex'
import Vue from 'vue'

export default {
  data(){
    return {
      title: 'PinCode',//'resetPin'
      showmenuicon: false,
      showbackicon: false,
      isios: false,//is ios platform
    }
  },
  computed:{
    ...mapState({
        alldata: state => state,
      })
  },
  components: {
    PinCode,
    Toolbar,
  },
  beforeMount(){
    if('ios'===Vue.cordova.platformId){
      this.isios = true
    }
  },
  mounted() {
    document.removeEventListener("backbutton", this.onBackKeyDown, false); 
    document.addEventListener("backbutton", this.onBackKeyDown, false); 
  },
  beforeDestroy() {
    window.clearInterval(this.intervalID);
    document.removeEventListener("backbutton", this.onBackKeyDown, false); 
    document.removeEventListener("backbutton", this.exitApp, false);
  },
  methods: {
    ...mapActions([ ]),
    
    validPin(code){
      //判断当前用户输入的pin是否正确
      if(code === this.alldata.app.pin){
        //跳转到main界面上
        this.$router.push({name:'MyAssets'})
      }else{
        this.$toasted.error(this.$t('Error.PinCodeIsWrong'))
      }
    },
    onBackKeyDown() {
        this.$toasted.show(this.$t('App.ClickOneMoreTimeExit'));  
        document.removeEventListener("backbutton", this.onBackKeyDown, false);
        document.addEventListener("backbutton", this.exitApp, false);
        this.intervalID = window.setInterval(() => {  
            document.removeEventListener("backbutton", this.exitApp, false);
            document.addEventListener("backbutton", this.onBackKeyDown, false);
            window.clearInterval(this.intervalID);  
        }, 3000);  
    } ,
    exitApp(){
      console.log(navigator)
      console.log(navigator.app)
      navigator.app.exitApp();  
    }
  }
}
</script>

<style lang="stylus" scoped>
.pinlock-page
  z-index: 9999
</style>
