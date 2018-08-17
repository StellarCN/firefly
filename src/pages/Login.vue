//扫描二维码登陆
/**
 * 导入钱包界面
 */
<template>
<div class="page" v-bind:class="{hidebackground: showScanner}">
    <toolbar :title="$t(title)" :showbackicon="showbackicon">
      <v-btn icon style="visibility: hidden;" slot="left-tool">
          <v-icon class="back-icon"/>
        </v-btn>
      <div class="right" slot="right-tool">
        <span class="toolbar-ico" @click="scan">
          <v-icon class="font28" v-if="showScanner">&#xE5CD;</v-icon>
          <i v-else class="iconfont icon-erweima1 font28"></i>
        </span>
      </div>
    </toolbar>

    <q-r-scan 
      @finish="qrfinish" 
      @close="qrclose" 
      :validator="qrvalidator" 
      v-if="showScanner"></q-r-scan>

    <div class="content" v-if="!showScanner">
      
      <div>是否登陆网站：{{domain}}?</div>
      <v-btn block @click="logon">{{$t('OK')}}</v-btn>
    </div>
</div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import QRScan from '@/components/QRScan'
import SecretKeyInput from '@/components/SecretKeyInput'
import {importAccount,isValidSeed,fromMnemonic, validateMnemonic} from '@/api/account'
import { getMnemonicFromData } from '@/api/qr' 
import { mapState, mapActions} from 'vuex'
import { isEnglishMnemonic, isChineseMnemonic } from '../api/account';

const axios = require('axios');
import { signToBase64, verifyByBase64 } from '@/api/keypair'

export default {
  data(){
    return {
      title: 'Login',
      showbackicon: false,
      showScanner: true,
      url: null,

    }
  },
  computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
    }),
    domain(){
      if(!this.url)return;
      let key = '&origin_domain='
      let index = this.url.indexOf(key) + key.length
      key = '&signature='
      return decodeURIComponent(this.url.substring(index, this.url.indexOf(key)))
    }
   
  },
  mounted () {
  },
  methods: {
    ...mapActions({
    }),
    
    goback(){
      this.$router.back()
    },
    // inputSeed(value){
    //   this.setNewSeed({seed:value})
    // },
    scan(){
      //只能识别stargazer类似的格式数据
      if(this.showScanner){
        this.showScanner = false
        this.title = 'Login'
      }else{
        this.showScanner = true
        this.title = 'Title.Scan'
        this.scanSuccess = false
      }
    },
    qrvalidator(text){
      if(text.startsWith('web+stellar:login')){
        this.$toasted.show('---qrcode is right--')
        this.url = text;
        return true;
      }
      this.$toasted.error('-----qrtext valid false----')
      return false;
    },
    qrfinish(result){
      this.showScanner = false
      this.title = 'Login'
      //校验签名是否正确
      let key = '&signature='
      let text = this.url;  
      let index = text.indexOf(key)
      let plainText = text.substring(0,index)
      let signature = text.substring(index+key.length, text.length)
      let accountid = 'GDFETGX4ZOZUDOGMYHW2IN2WXWQLJ5V7VRJIDW5GCYMZ4X5O6ULV5GZI'//后续从stellar.toml中获取  
      let chk = verifyByBase64(accountid, plainText, signature)
      if(chk){
        this.$toasted.show(`checked true`)
      }
      this.$toasted.error(`checked fail.`)
      
    },
    qrclose(){
      //this.showScanner = false
      //this.title = 'Login'
    },
    logon(){
      //生成签名
      let cbkey = '&callback='
      let cbindex = this.url.indexOf(cbkey)
      let cb = this.url.substring(cbindex+cbkey.length, this.url.indexOf('&origin_domain='))
      cb = decodeURIComponent(cb)
      let path = this.url.substring(0, cbindex)
      path += '&accountid='+this.account.address
      let signature = signToBase64(this.accountData.seed, path)
      // path += '&signature' + encodeURIComponent(signature)
      this.$toasted.show('cb='+cb)
      try{
         axios.post(cb, {
          r: this.url.substring(this.url.indexOf('?r=')+3, cbindex),
          accountid: this.account.address,
          signature: encodeURIComponent(signature)
        })
        .then(response=>{
          this.$toasted.show('logon success')
          
        })
        .catch(err=>{
          console.error(err)
          this.$toasted.error('logon failed!'+err.message + ',' + err.response.data.error)
        })
        
      }catch(err){
        alert('发生错误：'+err.message)
      }
      

    }

  },
  components: {
    Toolbar,
    QRScan,
  }
}
</script>

<style lang="stylus" scoped>
@require '../stylus/color.styl'

</style>
