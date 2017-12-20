/**
 * PIN码锁定界面
 */
<template>
  <div class="page">
    <Toolbar 
      :title="$t(title)"
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      >
        <v-btn icon slot='right-tool' @click="exitapp" v-if="!isios">
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
  methods: {
    ...mapActions([ ]),
    
    validPin(code){
      //判断当前用户输入的pin是否正确
      if(code === this.alldata.app.pin){
        //跳转到main界面上
        this.$router.push('/main')
      }else{
        this.$toasted.error(this.$t('Error.PinCodeIsWrong'))
      }
    },
    exitapp(){
      console.log(navigator)
      console.log(navigator.app)
      navigator.app.exitApp();  
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
