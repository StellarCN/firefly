/**
 * 创建账户页面
 */
<template>
<div class="page">
  <div class="create-account-page">
    <toolbar :title="$t(title)" :showbackicon="showbackicon">
      <v-btn icon style="visibility: hidden;" slot="left-tool">
          <v-icon class="back-icon"/>
        </v-btn>
    </toolbar>
    <div class="content">
      <v-text-field
              dark
              name="name"
              :label="$t('Account.AccountName')"
              v-model="name"
              required
              append-icon='cached'
              :append-icon-cb="this.chooseName"
            ></v-text-field>
      <v-text-field
              dark
              name="password"
              :label="$t('Account.Password')"
              v-model="password"
              :append-icon="pwdvisible ? 'visibility' : 'visibility_off'"
              :append-icon-cb="() => (pwdvisible = !pwdvisible)"
              :type="pwdvisible ? 'text':'password'"
              required
            ></v-text-field>
      <v-text-field
              dark
              :label="$t('Account.ConfirmPassword')"
              v-model="repassword"
              :append-icon="repwdvisible ? 'visibility' : 'visibility_off'"
              :append-icon-cb="() => (repwdvisible = !repwdvisible)"
              :type="repwdvisible? 'text': 'password'"
              required
            ></v-text-field>
      <div class="hint">{{$t('Account.CreateAccountHint')}}</div>
    </div>
    <div class="footer">
      <v-layout row wrap v-if="working">
        <v-flex xs12 class="text-center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </v-flex>
      </v-layout>
      <v-layout row wrap v-else>
        <v-flex xs6 @click="goback">
          <span>{{$t('Return')}}</span>
        </v-flex>
        <v-flex xs6 @click="nextStep">
          <span :class="nextStepClass">{{$t('NextStep')}}</span>
        </v-flex>
       </v-layout>  
    </div>
  </div>
</div>
</template>

<script>
import Toolbar from '../components/Toolbar'
import { mapState, mapActions} from 'vuex'
import { random,randomByMnemonic, fromMnemonic } from '../api/account'
import { RandomPlanetsCount, RandomColorsCount } from '../locales/index'
import { EN, ZH_CN,ZH_HK,ZH_TW } from '@/locales/index'
const TITLE = 'CreateAccount'
export default {
  data(){
    return {
      title: TITLE,
      showbackicon: false,
      name:null,
      password: null,
      repassword: null,
      pwdvisible: false,
      repwdvisible: false,
      working: false,
    }
  },
  computed:{
    ...mapState({
      seed: state => state.seed,
      isImportAccount: state => state.isImportAccount,
      isCreateAccount: state => state.isCreateAccount,
      locale: state => state.app.locale,
    }),
    nextStepClass(){
      if(this.name && this.password && this.repassword && this.password === this.repassword){
        return 'btn-available'
      }
      return 'btn-unavailable'
    }
  },
  mounted(){
    this.chooseName()
  },
  methods: {
    ...mapActions({
      setNewSeed: 'setNewSeed',
      setCreateAccountData: 'setCreateAccountData'
    }),
    chooseName(){
      let planetNum = Math.floor(Math.random()*(RandomPlanetsCount -1))
      let colorNum = Math.floor(Math.random()*(RandomColorsCount - 1))
      let colors = this.$t('Random.Colors').split("|")
      let planets = this.$t('Random.Planets').split("|")
      this.name =  colors[colorNum]+planets[planetNum]
    },
    goback(){
      this.$router.back()
    },
    nextStep(){
      if(this.working)return
      if(this.name && this.password && this.repassword && this.password === this.repassword){
        this.working = true
        this.setCreateAccountData({name:this.name,password:this.password})
        if(this.isCreateAccount){
          //创建账号
          // let seed = random()
          // this.setNewSeed(seed)
          let key = this.locale.key || 'zh_cn'
          let language = 'english'
          if(ZH_CN.key === key){
            language = 'chinese_simplified'
          }else if(ZH_HK.key === key || ZH_TW.key === key){
            language = 'chinese_traditional'
          }
          let mnemonic = randomByMnemonic(language)
          let wallet = fromMnemonic(mnemonic, language)
          let mIndex = 0
          let seed = wallet.getSecret(mIndex);
          console.log({seed, mnemonic, mIndex})
          this.setNewSeed({seed, mnemonic, mIndex})
        }
        this.$router.push({name:'CreateAccountReady'})
        this.working = false
      }
    },
  },
  components: {
    Toolbar
  }
}
</script>


<style lang="stylus" scoped>
@require '../stylus/color.styl'
.content
  position: fixed
  top: 48px
  top: calc(48px+ constant(safe-area-inset-top))
  top: calc(48px + env(safe-area-inset-top))
  left: 0
  right: 0
  bottom: 0
  bottom: constant(safe-area-inset-bottom)
  bottom: env(safe-area-inset-bottom)
  padding: 20px 20px
  background: $secondarycolor.gray
  border-radius:5px
  margin:5px 5px 50px 5px
.footer
  position:fixed
  bottom:0
  bottom: constant(safe-area-inset-bottom)
  bottom: env(safe-area-inset-bottom)
  left:0
  right:0
  z-index:99
  background:$primarycolor.gray
  height:42px
  line-height:42px
  font-size:16px
  text-align:center
  color:$primarycolor.green
.btn-available
  color:$primarycolor.green
.btn-unavailable
  color:$secondarycolor.green
.hint
  color:$primarycolor.green
  font-size: 14px
  
</style>

