/**
 * pin码设置界面（从设置中打开时）
 */
<template>
  <div class="page" dark>
    <Toolbar 
      :title="$t(title)"
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="goback"></Toolbar>

    <pin-code class="pin1" v-on:finish="finish" v-show="working==='set'"></pin-code>
    <pin-code class="pin2" v-on:finish="resetFinish" v-show="working==='reset'" reset></pin-code>
    
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import PinCode from '@/components/PinCode'
import { mapState, mapActions} from 'vuex'
const WORKING_SET = 'set'
const WORKING_RESET = 'reset'

export default {
  data(){
    return {
      title: 'SetPinCode',//'resetPin'
      showmenuicon: false,
      showbackicon: true,
      working: WORKING_SET,// set or reset
      password: '',
      repassword:'',
      showerr: false
    }
  },
  mounted(){
   
  },
  components: {
    PinCode,
    Toolbar
  },
  methods: {
    ...mapActions([
      'enablePing'
    ]),
    goback(){
      if(this.working === WORKING_SET){
        this.$router.back()
      }else{
        this.title = 'SetPinCode'
        this.working = WORKING_SET
      }
    },
    finish(password){
      this.password = password
      this.working = WORKING_RESET
      this.title = 'ResetPinCode'
    },
    resetFinish(resetpassword){
      if(this.password != resetpassword){
        //两次pin码不相同
        this.$toasted.error(this.$t('Error.PinCodeIsDifferent'))
        return;
      }
      this.enablePing(this.password)
        .then(()=>{
          this.$toasted.show(this.$t('SetPinCodeSuccess'))
          this.$router.back()
        })
        .catch(err=>{
          console.error(err)
          this.$toasted.error(this.$t('SaveFailed'))
        })

    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
