//未激活的提示界面
<template>
  <div class="unfund">
    <div class="unfund-wrapper"></div>
    <div class="unfund-dlg pa-2 pb-4">
      <div class="flex-row pt-2">
        <div class="flex1 textright ud-title" @click="toAutoFundHelp">
          <i class="material-icons close-icon">help_outline</i> 
        </div>
        <div class="flex6 textcenter">{{$t('unfund')}}</div>
        <div class="flex1 textright ud-title" @click="close">
          <i class="material-icons close-icon">close</i></div>
      </div>
      <div class="ud-hint pa-3 textcenter">{{$t('fund_hint')}}</div>
      <div class="flex-row ud-btns">
        <div class="flex1 textcenter" @click="askForFund">{{$t('fund_askfor')}}</div>
        <!-- <div class="flex1 textcenter" @click="freeFund">{{$t('fund_free')}}</div> -->
        <div class="flex1 textcenter" @click="freeFund" v-if="fund_config && fund_config.active">
          <v-progress-circular indeterminate :width="3" :size="16" color="primary" v-if="working"></v-progress-circular>
          <span v-else>{{$t('fund_free')}}</span>
        </div>
        <div class="flex1 textcenter" @click="toKYC" v-else>{{$t('kyc_active')}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { getFundConfig,initFundConfig } from '@/api/gateways'
import { getAccountInfo, isValidateAddress } from '@/api/account'
import { Decimal } from 'decimal.js'
import { mapState, mapActions } from 'vuex'
// import axios from 'axios'

export default {
  data(){
    return {  
      working: false,
    }
  },

  props:{  },
  computed:{
    ...mapState({
      fund_config: state => state.autoFundConfig
    })
  },
  created(){
    ////alert('------created--' + (this.fund_config) +',' + (!this.fund_config))
    if(!this.fund_config){
     // alert('------load config---')
      this.loadFundConfig().then(data=>{
       // alert('--------load fun config--' + JSON.stringify(data))
      }).catch(err=>{
        console.error(err);
       // alert('----error--' + err.message)  
      })
    }
  },
  methods:{
    ...mapActions(['loadFundConfig']),
    close(){
      // this.$emit('close')
      this.$emit('close')
    },
    askForFund(){
      if(this.working)return
      this.$router.push({name: 'AskForFund'})
    },
    freeFund(){
      if(!this.fund_config){
        this.$toasted.error(this.$t('FederationName.NetworkError'))
        return
      }
      //校验是否有可用余额
      // alert('--1----free fund')
      let config = this.fund_config
      // alert('--2----config:' + JSON.stringify(config))
      let source = config.account
      if(!source || !isValidateAddress(source)){
        this.$toasted.error(this.$t('fund_used_up'))
        return;
      }
      this.working = true
      getAccountInfo(source)
        .then(ac=>{
          this.working = false
          console.log(config)
          console.log(ac)
          let balances = ac.balances.filter(item=> item.asset_type === 'native')
          console.log(balances)
          if(balances.length === 0){
            this.$toasted.error(this.$t('fund_used_up'))
            return
          }
          let b = new Decimal(balances[0].balance).minus(config.minbalance).toNumber()
          // alert('---checkbalance-' + b)
          if(b<=0){
            this.$toasted.error(this.$t('fund_used_up'))
            return
          }
          this.$router.push({name: 'AutoFund'})
        })
        .catch(err=>{
          this.working = false
          console.log(err)
          let message = ''
          if(err.message){
            message = typeof err.message === 'object' ? JSON.stringify(err.message) : err.message
          }
          this.$toasted.error(this.$t('FederationName.NetworkError')+':'+ message)
        })
     
    },
    toKYC(){
      this.$router.push({name: 'KYC'})
    },
    toAutoFundHelp(){
      this.$router.push({name: 'AutoFundHelp'})
    },
    // debug(){
    //   axios.get('https://update.fchain.io/fund/fund_test.json?r='+new Date().getTime())
    //     .then(response=>{
    //       alert(JSON.stringify(response.data))
    //     })
    //     .catch(err=>{
    //       alert(err.message)
    //     })
    // }
  }
}
</script>

<style lang="stylus" scoped>
@require '../stylus/color.styl'
.unfund-wrapper
  position: fixed
  top: 0
  bottom: 0
  left: 0
  right: 0
  background #333
  opacity: 0.5
  z-index: 9
  padding-bottom: 1rem
  padding-bottom: calc(1rem + constant(safe-area-inset-bottom))
  padding-bottom: calc(1rem + env(safe-area-inset-bottom))
.unfund-dlg
  position: fixed
  bottom: 0
  left: 0
  right: 0
  // height: 5rem
  background: $secondarycolor.gray
  z-index:10

.close-icon
  color: $primarycolor.green
  font-size: 24px
  padding-right: .2rem
.ud-title
  color: $primarycolor.font
  font-size: 24px
.ud-hint
  font-size: 12px
  color: $secondarycolor.font
.ud-btns
  font-size: 14px
  color: $primarycolor.green


</style>
