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
          <v-icon v-if="showScanner">&#xE5CD;</v-icon>
          <i v-else class="iconfont icon-erweima1"></i>
        </span>
      </div>
    </toolbar>

    <q-r-scan 
      @finish="qrfinish" 
      @close="qrclose" 
      :validator="qrvalidator" 
      v-if="showScanner"></q-r-scan>

    <div class="content" v-if="!showScanner">
      <div>
        <v-text-field
              dark
              :label="$t('SecretKey')"
              :value="seed"
              @input="inputSeed"
              required
              multi-line
              rows=2
            >
            </v-text-field>  
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
import Toolbar from '../components/Toolbar'
import QRScan from '../components/QRScan'
import {importAccount,isValidSeed} from '../api/account'
import { mapState, mapActions} from 'vuex'
export default {
  data(){
    return {
      title: 'ImportAccount',
      showbackicon: false,
      showScanner: false,
      error:null,
    }
  },
  computed:{
    ...mapState({
      seed: state => state.seed
    }),
    nextStepClass(){
      if(this.seed === null || typeof this.seed === 'undefined'){
        return 'btn-unavailable'
      }
      return 'btn-available'
    }
  },
  created(){
    this.setNewSeed({seed: null,extdata:{}})
  },
  methods: {
    ...mapActions({
      setNewSeed: 'setNewSeed'
    }),
    goback(){
      this.$router.back()
    },
    inputSeed(value){
      this.setNewSeed({seed:value})
    },
    scan(){
      //只能识别stargazer类似的格式数据
      if(this.showScanner){
        this.showScanner = false
        this.title = 'ImportAccount'
      }else{
        this.showScanner = true
        this.title = 'Title.Scan'
      }
    },
    qrvalidator(text){
      console.log(`validate ---- qrscanner --- text -- ${text}`)
      let result = importAccount(text)
      if(result.status){
        this.setNewSeed({seed:result.seed,extdata:result.data})
        return true
      }
      return false;
    },
    qrfinish(result){
      console.log(` qrscanner --- finish -- ${result}`)
      this.showScanner = false
      this.title = 'ImportAccount'
      //this.secretkey = result
    },
    qrclose(){
      this.showScanner = false
      this.title = 'ImportAccount'
    },
    nextStep(){
      if(this.seed === null || typeof this.seed === 'undefined'){
        return
      }
      if(!isValidSeed(this.seed)){
        this.$toasted.error(this.$t('Error.NotValidSeed'))
        return
      }
      this.$router.push('/createaccount')
    }

  },
  components: {
    Toolbar,
    QRScan
  }
}
</script>

<style lang="stylus" scoped>
@require '../stylus/color.styl'
.content
  position:fixed
  top: 48px
  left: 0
  right: 0
  bottom: 0
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
  position: absolute
  bottom: 0
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
</style>
