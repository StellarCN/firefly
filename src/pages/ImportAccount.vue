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
      <div class="tabs pt-1 pb-1">
        <span :class="'tab ma-1 pa-1 ' + ( importFlag===0 ? 'active':'' )" @click="changeImportFlag(0)">{{$t('importByMnemonic')}}</span>
        <span :class="'tab ma-1 pa-1 ' + ( importFlag===1 ? 'active':'' )" @click="changeImportFlag(1)">{{$t('importBySeed')}}</span>
      </div>
      <div v-if="importFlag===1 ">
        <secret-key-input :enablePaste="true" :seed="scanSeed" ref="secretkeyRef"></secret-key-input>
      </div>
      <div v-if="importFlag === 0">
        <v-text-field dark
            :label="$t('mnemonic')"
            v-model="mnemonic"
            required
            multi-line
            clearable
            class="seed-input"
            @input="inputMnemonic"
            rows=3
            ></v-text-field>
        <!--显示语言，用户可以选择-->
        <div class="lang-tabs pt-1 pb-1">
          <span :class="'tab pa-1 ma-1' + ( lang ==='english' ? ' active':'' )" @click="changeLang(english.lang)">{{english.label}}</span>
          <span :class="'tab pa-1 ma-1' + ( lang ==='chinese_simplified' ? ' active':'' )" @click="changeLang(chinese_simplified.lang)">{{chinese_simplified.label}}</span>
          <span :class="'tab pa-1 ma-1' + ( lang ==='chinese_traditional' ? ' active':'' )" @click="changeLang(chinese_traditional.lang)">{{chinese_traditional.label}}</span>
        </div>
        <!--根据mnemonic生成的密钥，用户可以点击确定用哪个-->
        <div class="seeds" v-if="genSeed">
          <span class="mt-2 mb-2 seed-span">{{genSeed}}</span>
        </div>
      </div>
    </div>
    <div class="footer" v-if="!showScanner">
      <v-layout row wrap>
        <v-flex xs6 @click="goback">
          <span>{{$t('Return')}}</span>
        </v-flex>
        <v-flex xs6 @click="nextStep">
          <span :class="nextStepClass">{{$t('NextStep')}}</span>
        </v-flex>
       </v-layout>  
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
import { EN, ZH_CN,ZH_HK } from '@/locales/index'
import { isEnglishMnemonic, isChineseMnemonic } from '../api/account';
export default {
  data(){
    return {
      title: 'ImportAccount',
      showbackicon: false,
      showScanner: false,
      scanSeed: null,
      scanSuccess: false,
      error:null,
      mnemonic: null,
      mIndex: 0,
      lang: 'english',//助记词的语言版本
      importFlag: 0,//0是助记词导入，1是密钥导入
      english: {key: EN.key, label: EN.label, lang: 'english'},
      chinese_simplified: {key: ZH_CN.key, label: ZH_CN.label, lang: 'chinese_simplified'},
      chinese_traditional: {key: ZH_HK.key, label: ZH_HK.label, lang: 'chinese_traditional'},
    }
  },
  computed:{
    ...mapState({
      seed: state => state.seed,
      locale: state => state.app.locale,
    }),
    nextStepClass(){
      // if(this.seed === null || typeof this.seed === 'undefined'){
      //   return 'btn-unavailable'
      // }
      return 'btn-available'
    },
    genSeed(){
      if(!this.mnemonic)return null;
      if(!validateMnemonic(this.mnemonic, this.lang))return null;
      return fromMnemonic(this.mnemonic, this.lang).getSecret(0);
    }
  },
  created(){
    this.setNewSeed({seed: null,extdata:{}, mnemonic: null, mIndex: 0})
    if(this.locale.key === EN.key){
      this.lang = this.english.lang
    }else if(this.locale.key === ZH_CN.key){
      this.lang = this.chinese_simplified.lang
    }else if(this.locale.key === ZH_CN.key){
      this.lang = this.chinese_traditional.lang
    }else{
      this.lang = this.english.lang
    }
  },
  mounted () {
  },
  methods: {
    ...mapActions({
      setNewSeed: 'setNewSeed'
    }),
    changeImportFlag(flag){
      this.importFlag = flag
      if(flag === 0){
        this.mnemonic = null
        this.mIndex  = 0
      }else{
        this.$nextTick(()=>{
          this.$refs.secretkeyRef.reset()
        })
      }
    },
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
        this.title = 'ImportAccount'
      }else{
        this.showScanner = true
        this.title = 'Title.Scan'
        this.scanSuccess = false
      }
    },
    qrvalidator(text){
      let result = importAccount(text)
      if(result.status){
        this.scanSeed = result.seed
        this.scanSuccess = true
        this.importFlag = 1 //切换成密钥导入部分
        try{
          this.setNewSeed({seed:result.seed,extdata:result.data})
          // this.$refs.secretkeyRef.inputText(this.scanSeed)
          this.setSeedToInput()
        }catch(err){
          console.error(err)
        }
        return true
      }

      result = getMnemonicFromData(text,this.lang)
      if(result.status){
        this.importFlag = 0
        this.mnemonic = result.mnemonic
        this.mIndex = 0
        this.scanSeed = null
        return true
      }
      this.scanSuccess = false
      return false;
    },
    qrfinish(result){
      this.showScanner = false
      this.title = 'ImportAccount'
      try{
        this.$nextTick(()=>{
          if(this.importFlag === 1){
            this.setSeedToInput()
          }
        })
      }catch(err){
        console.error(err)
      }
      //this.secretkey = result
    },
    qrclose(){
      this.showScanner = false
      this.title = 'ImportAccount'
    },
    nextStep(){
      if(this.importFlag === 0){
        if(validateMnemonic(this.mnemonic, this.lang)){
          this.setNewSeed({seed: this.genSeed, mnemonic: this.mnemonic, mIndex: this.mIndex})
          this.$router.push({name: 'CreateAccount'})
          return
        }
        this.$toasted.error(this.$t('Error.SeedWrong'))
        return
      }else if(this.importFlag === 1){
        let seed = this.scanSuccess ? this.scanSeed : this.$refs.secretkeyRef.getSeed()
        if(!isValidSeed(seed)){
          this.$toasted.error(this.$t('Error.NotValidSeed'))
          return
        }
        this.setNewSeed({seed})
        this.$router.push({name: 'CreateAccount'})
      }
 
    },
    setSeedToInput(){
      this.$refs.secretkeyRef.inputText(this.scanSeed)
    },
    changeLang(lang){
      this.lang = lang
    },
    inputMnemonic(mnemonic){
      if(isEnglishMnemonic(mnemonic)){
        this.lang = 'english'
        return;
      }
      if(isChineseMnemonic(mnemonic)){
        this.lang = 'chinese_simplified'
        return;
      }
    }

  },
  components: {
    Toolbar,
    QRScan,
    SecretKeyInput,
  }
}
</script>

<style lang="stylus" scoped>
@require '../stylus/color.styl'
.content
  position:fixed
  top: 48px
  top: calc(48px +  constant(safe-area-inset-top))
  top: calc(48px +  env(safe-area-inset-top))
  left: 0
  right: 0
  bottom: 0
  bottom:  constant(safe-area-inset-bottom)
  bottom:  env(safe-area-inset-bottom)
  padding: 20px 20px
  background: $primarycolor.gray
.right
  .toolbar-ico
    .iconfont
      font-size: 24px
      color: $primarycolor.font
    .material-icons
      font-size: 24px
      color: $primarycolor.font
.footer
  position: fixed
  bottom: 0
  bottom: constant(safe-area-inset-bottom)
  bottom: env(safe-area-inset-bottom)
  left: 0
  right: 0
  z-index: 99
  background: $secondarycolor.gray
  height: 42px
  line-height: 42px
  font-size: 16px
  text-align: center
  color: $primarycolor.green
.btn-available
  color: $primarycolor.green
.btn-unavailable
  color: $secondarycolor.green
.hidebackground
  background:none
  background-color: transparent
.tabs
  color: $primarycolor.font
  .tab.active
    color: $primarycolor.green
.lang-tabs
  color: $primarycolor.font
  font-size: 14px
  .tab.active
    color: $primarycolor.green
.seed-span
  word-wrap:break-word
  color: $secondarycolor.font
</style>
