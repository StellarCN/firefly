// 发送资产界面
<template>
  <div class="send-asset-wrapper">
    
    <!-- 显示支付界面 -->
    <div class="confirm-wrapper" v-if="step === 0">
      <div class="confirm-blank"></div>
      <div  class="confirm-dlg">
      <v-bottom-sheet v-model="showSendDlg" persistent dark>
        <div class="menu-head">
          <div class="menu-row">
            <div class=" menu-row-1">
              <v-icon class="avatar iconfont icon-erweima" color="primary"></v-icon>
            </div>
          </div>
          <div class="menu-row menu-row-2">
            <div class="name">{{account.name}}</div>
            <div class="address">{{account.address | shortaddress}}</div>
          </div>
          <div style="clear:both"></div>
        </div>
        
        <div class="confirm-content">
          <div class="confirm-title">
            <span v-if="appname">{{$t('Third.SendTo',[appname])}}</span>
            <span v-else>{{$t('Third.SendTo',[target])}}</span>
          </div>
          <div class="confirm-amount">{{Number(Number(amount).toFixed(7))}}&nbsp;&nbsp;{{asset_code}}</div>
          <div class="confirm-title" v-if="memo">
            <span>{{$t('Memo')}}</span>
            <span v-if="memo_type">({{memo_type}})</span>
          </div>
          <div class="confirm-memo" v-if="memo">{{memo}}</div>
          <div class="confirm-title">{{$t('ChooseAsset')}}</div>
          <div class="confirm-assets">
            <swiper :options="swiperOpt"  ref="swiperRef">
              <swiper-slide v-for="(item,index) in assets" :key="index">
                <div :class="'asset-card textcenter ' + (choosed.code === item.code && choosed.issuer === item.issuer ? ' active' : ' ')">
                  <div class="asset-icon">
                    <i :class="'iconfont ' + assetIcon(item.code,item.issuer)"></i>
                  </div>
                  <div class="asset-code">{{item.code}}</div>
                  <div class="asset-issuer" v-if="assethosts[item.issuer]">{{assethosts[item.issuer] }}</div>
                  <div class="asset-issuer" v-else>{{item.issuer | miniaddress}}</div>
                  <div class="asset-amount">{{item.amount}}</div>
              </div>
              </swiper-slide>
            </swiper>
            
          </div>
        </div>

        <div class="confirm-btns flex-row textcenter">
          <div class="confirm-btn flex1" @click="exit">{{$t('Button.Cancel')}}</div>
          <div class="confirm-btn flex1" @click="showPwdDlg">{{$t('Button.OK')}}</div>
        </div>
      </v-bottom-sheet>
      </div>
    </div>

    <!--显示密码输入界面-->
    <v-bottom-sheet persistent v-model="showPwdSheet" v-if="showPwdSheet" dark>
      <div class="sheet-content">
        <div class="sheet-title">
          
        </div>
        <div class="sheet-title">
          <div class="label">{{$t('Account.AccountName')}}</div>
          <div class="value">{{account.name}}</div>
        </div>
        <div class="sheet-input">
          <v-text-field
                name="password"
                :label="$t('Account.Password')"
                v-model="password"
                :append-icon="pwdvisible ? 'visibility' : 'visibility_off'"
                :append-icon-cb="() => (pwdvisible = !pwdvisible)"
                :type="pwdvisible ? 'text':'password'"
                required dark
              ></v-text-field>
        </div>
        <div  class="sheet-btns">
          <div class="sheet-btn" @click="exit">{{$t('Button.Cancel')}}</div>
          <div class="sheet-btn" @click="doPayment">{{$t('payment')}}</div>
        </div>
      </div>
    </v-bottom-sheet>


  </div>  
</template>

<script>
import { mapState, mapActions, mapGetters} from 'vuex'
import Card from '@/components/Card'
import Loading from '@/components/Loading'
import  defaultsDeep  from 'lodash/defaultsDeep'
import { shortAddress } from '@/api/account'
import { COINS_ICON, FF_ICON, DEFAULT_ICON, WORD_ICON} from '@/api/gateways'
import { pathAssets } from '@/api/path'
import { isNativeAsset } from '@/api/assets'
import { swiper, swiperSlide } from 'vue-awesome-swiper'

export default {
  data(){
    return {
      step: 0,//0是初始界面，1是输入密码界面，2是确认支付界面
      showSendDlg: true,//显示支付界面
      assets:[],//可以支付的资产，通过path payment计算出来
      showPwdSheet: false,
      password: null,
      pwdvisible: false,
      choosed: {},
      choosedIndex: 0,
      swiperOpt: {
        //notNextTick: true,
        slidesPerView: 3,
        spaceBetween: 50,
        centeredSlides: true,
        //slidesPerView: 'auto',
        touchRatio: 0.2,
        slideToClickedSlide: true
        
      }
      
    }
  },
  props: {
    appname: {
      type: String
    },
    destination: {
      type: String,
      required: true
    },
    asset_code: {
      type:String,
      required: true
    },
    asset_issuer: {
      type: String
    },
    amount: {
      type: Number,
      require: true
    },
    memo_type: {
      type: String
    },
    memo: {
      type: String
    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      islogin: state => (state.accounts.accountData.seed ? true : false),
      assethosts: state => state.asset.assethosts,
      notfunding: state => state.account.account_not_funding
    }),
    ...mapGetters(["balances", "reserve", "native"]),
    target(){
      let result = undefined
      if(this.appname){
        result = this.appname + '(' + shortAddress(this.destination) + ')'
      }else{
        result = shortAddress(this.destination)
      }
      return result
    },
    swiperInstance() {
      return this.$refs.swiperRef.swiper
    },
  },
  beforeMount () {
    //根据当前的数量，计算path payment
    pathAssets(this.account.address, this.destination, this.asset_code, this.asset_issuer, this.amount + '')
      .then(data => {
        let values = {}
        this.balances.map(item => {
          if(isNativeAsset(item)){
            return Object.assign({},item,{id: item.code})
          }
          return Object.assign({},item,{id: item.code + '-' + item.issuer })
        }).forEach(item => {
          values[item.id] = item
        })
        console.log('--values=---')
        console.log(values)
        console.log(data)
        this.assets = data.filter(item=> item.path.length ===0).map(item=>{
          if(item.source_asset_type === 'native'){
            return {id: 'XLM',code: 'XLM', issuer: 'stellar.org', amount: Number(item.source_amount), destination_amount: item.destination_amount}
          }else{
            return {code: item.source_asset_code, 
              issuer: item.source_asset_issuer, 
              amount: Number(item.source_amount), 
              destination_amount: item.destination_amount,
              id: item.source_asset_code + '-' + item.source_asset_issuer
            }
          }
        })
        if(this.assets.length > 0){
          this.choosed = this.assets[0]
          this.choosedIndex = 0
        }
        // .filter(item => {
        //   let val = values[item.id]
        //   return val && val.balance >= item.amount
        // })
      })
      .catch(err => {
        console.error(err)
      })
  },
  mounted () {
    //this.swiperInstance.controller.control = this.swiperContent
    //this.swiperContent.controller.control = this.swiperTop
    this.swiperInstance.on('slideChange', this.slideChange)
    this.swiperInstance.slideTo(this.choosedIndex,0,true)
  },
  methods: {
    slideChange(){
      this.choosedIndex = this.swiperInstance.activeIndex
      this.choosed = this.assets[this.choosedIndex]

    },
    assetIcon(code,issuer){
      return COINS_ICON[code] || WORD_ICON[code.substring(0,1)] || DEFAULT_ICON
    },
    showPwdDlg(){
      this.step = 1
      this.showSendDlg = false
      this.showPwdSheet = true
      this.password = null
      this.pwdvisible = false
    },
    resetState(){
      this.step = 0
      this.showSendDlg = true
      this.showPwdDlg = false
      this.password = null
      this.pwdvisible = false
    },
    doPayment(){
      //校验密码是否正确

      //执行支付

      //成功后，发出事件

    },
    exit(){
      this.resetState()
      this.$emit('exit')
    }
  },
  components: {
    Card,
    Loading,
    swiper,
    swiperSlide,
  }
}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/trade.styl'
.confirm-wrapper
  position: fixed
  bottom: 0
  right: 0
  left: 0
  top: 0
  z-index: 9
.confirm-blank
  background: $primarycolor.gray
  opacity: .8
  position: fixed
  bottom: 13rem
  right: 0
  left: 0
  top: 0
  z-index: 9
.confirm-dlg
  background: $secondarycolor.gray
  height: 13rem
  position: fixed
  bottom: 0
  right: 0
  left: 0
  opacity: 1
.confirm-title
  height: .8rem
  line-height: .8rem
  font-size: .4rem
  padding-left: .4rem
  color: $primarycolor.font
.confirm-amount
  color: $primarycolor.green
  text-align: center
  font-size: .5rem
.confirm-memo
  padding-left: .5rem
  color: $secondarycolor.font
.confirm-content
  font-size: 16px
  .confirm-row
    padding: 8px 8px
    .label
      color: $secondarycolor.font
    .value
      padding-left: 12px
      color: $primarycolor.green
.confirm-btns
  color: $primarycolor.green
  text-align: center
  font-size: 16px
  height: 42px
  line-height: 42px
.menu-head
  display: block
  padding: .6rem .3rem .3rem .3rem
  width: 100%
  .memo-row
    text-align: center
    width: 100%
  .menu-row-1
    display: block
    margin: auto auto
    width: 50px
    height: 50px
    line-height: 50px
    border-radius: 50px
    text-align: center
    vertical-align: middle
    background: $secondarycolor.gray
    .avatar
      font-size: 24px
      color: primary
  .menu-row-2
    padding: 5px 15px
    text-align:center
    .name
      font-size: 24px
      text-align: center
      overflow: hidden
      text-overflow:ellipsis
      white-space: nowrap
      color: $primarycolor.green
    .address
      font-size: 12px
      color: $secondarycolor.font
  


.sheet-content
  background: $secondarycolor.gray
  color: $primarycolor.font
  padding: 10px 10px
  word-wrap: break-word
  .sheet-title
    .title
      height: 40px
      line-height: 40px
      font-size: 32px
      text-align: center
      color: $primarycolor.green
      padding: 10px 10px
    .label
      color: $secondarycolor.font
    .value
      font-size: 16px
  .sheet-btns
    margin-top: 10px
    display: inline-block
    width: 100%
    .sheet-btn
      float: left
      width: 50%
      height: 40px
      line-height: 40px
      text-align: center
      font-size: 16px
      color: $primarycolor.green
.confirm-assets
  padding: .2rem .2rem
  .asset-card
    width: 3rem
    height: 3.2rem
    background: $secondarycolor.gray
    margin: .2rem .2rem
    padding: .2rem .2rem
    border-radius: .2rem
    .asset-icon
      .iconfont
        font-size: 1rem
        color: $primarycolor.green
    .asset-code
      color: $primarycolor.green
    .asset-issuer
      font-size: .2rem
      color: $secondarycolor.font
      overflow: hidden
      white-space: nowrap
      word-break: normal
    &.active
      border: 1px solid $primarycolor.green

</style>

