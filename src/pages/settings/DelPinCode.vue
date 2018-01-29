/**
 * 确认pin码后删除pin码，并返回设置界面
 */
<template>
  <div class="page">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
      />
    
    <pin-code @finish="finish" reset></pin-code>

  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import PinCode from '@/components/PinCode'
import { mapState, mapActions} from 'vuex'
export default {
  data(){
    return {
      title: 'ResetPinCode',
      showbackicon: true,
      showmenuicon: false,
    }
  },
  computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      app: state => state.app
    }),
  
  },
  mounted(){
  },
  methods: {
    ...mapActions({
      disablePing: 'disablePing',
    }),
    back(){
      this.$router.back()
    },
    finish(password){
      if(password === this.app.pin){
        //删除pin
        this.disablePing()
          .then(()=>{
            this.$toasted.show(this.$t('RemovePinCodeSuccess'))
            this.$router.push({name:'Settings'})
          })
          .catch(err=>{
            this.$toasted.error(this.$t('Error.RemovePinCodeFailed'))
          })
      }else{
        this.$toasted.error(this.$t('Error.PinCodeIsWrong'))
      }
    }
   
  },
  components: {
    Toolbar,
    PinCode,
  }
}
</script>


<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.page
  background: $primarycolor.gray
  color: $primarycolor.font
  font-size: 16px

</style>

