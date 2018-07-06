// XDR签名信息确认
<template>
  <div class="sign-xdr-wrapper">
    
    <!-- 显示确认签名界面 -->
    <div class="confirm-wrapper">
      <div class="confirm-blank"></div>
      <div  class="confirm-dlg">
      <v-bottom-sheet v-model="showDlg" persistent dark>
        <div class="sign-xdr-content">
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
            <div class="dlg-title text-center">
              <span>{{$t('Sign')}}({{appname}})</span>
            </div>

            <div class="tx-opt-msg pl-3">
              {{message}} <span class="confirm-memo">({{tx.operations.length}})</span>
            </div>

            <!---解析operation-->
            <div class="tx-opt-content" v-if="tx">
              <!--手续费，序列号，有效时间，备注，业务操作数-->
              <div>
                <span class="confirm-title">{{$t('DW.Fee')}}</span>
                <span class="confirm-memo">{{fee}}</span>
              </div>

              <div class="tx-opts">
                <div class="flex-row tx-opt-item" v-for="(opt,index) in tx.operations" :key="index">
                  <div class="flex1 textcenter">{{index+1}}</div>
                  <div class="flex6" v-if="opt.type === 'payment'">
                    <span class="pa-1 tx-opt-item-type textcenter">{{$t(opt.type)}}</span>
                    <span class="pa-1">{{opt.amount}}{{opt.asset.code}}</span>
                    <span class="pa-1">{{$t('DestinationAddress')}}:{{opt.destination | miniaddress}}</span>
                  </div>
                  <div class="flex6" v-if="opt.type === 'allowTrust'">
                    <span class="pa-1 tx-opt-item-type">{{$t(opt.type)}}</span>
                    <span class="pa-1">{{opt.assetCode}}</span>
                  </div>
                  <div class="flex6" v-if="opt.type === 'changeTrust'">
                    <span class="pa-1 tx-opt-item-type">{{$t(opt.type)}}</span>
                    <span class="pa-1">{{opt.line.code}}({{opt.line.issuer | miniaddress}})</span>
                    <span class="pa-1">{{$t('limit')}}:{{opt.limit}}</span>
                  </div>
                </div>
              </div>

            </div>
            <div class="tx-opt-content" v-if="err">
              {{$t(err)}}
            </div>
            
          </div>

          <div class="confirm-btns flex-row textcenter">
            <div class="confirm-btn flex1" @click="exit">{{$t('Button.Cancel')}}</div>
            <div class="confirm-btn flex1" @click="doSign">{{$t('Button.OK')}}</div>
          </div>
        </div>
      </v-bottom-sheet>
      </div>
    </div>

  </div>  
</template>

<script>
import { mapState, mapActions, mapGetters} from 'vuex'
import Card from '@/components/Card'
import Loading from '@/components/Loading'
import  defaultsDeep  from 'lodash/defaultsDeep'
import { shortAddress,canSend,sendByPathPayment, send } from '@/api/account'
import { isNativeAsset } from '@/api/assets'
import { readAccountData } from '@/api/storage'
import { xdrFromTransactionEnvelope } from '@/api/xdr'
import { signDecoratedByTx } from '@/api/keypair'
import { Decimal } from 'decimal.js'

export default {
  data(){
    return {
      showDlg: true,//显示界面
      tx: null,
      err: null
    }
  },
  props: {
    appname: {
      type: String
    },
    message: {
      type: String,
      required: true
    },
    xdr: {
      type: String,
      required: true
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
    ...mapGetters(["balances", "reserve", "native", "base_fee",'base_reserve']),
    fee(){
      if(this.tx){
        return new Decimal(this.tx.fee/10000000).toFixed(7) + 'XLM'
      }
      return null
    },
    time(){

    }
  },
  beforeMount () {
    //alert('-------xxxxxxxx----' + this.xdr)
    this.tx = xdrFromTransactionEnvelope(this.xdr)
    if(this.tx === null){
      //alert('x-----xxx---error---tx=null')
      this.err = 'Error.NoTxToSign'
    }
  },
  methods: {
    ...mapActions({
      trust: 'trust',
      sendAsset: 'sendAsset',
      sendPathPayment: 'sendPathPayment',
      getAccountInfo: 'getAccountInfo',
    }),
    exit(){
      this.showDlg = false
      this.tx = null
      this.err = null
      this.$emit('exit')
    },
    doSign(){
      if(this.tx === null){
        this.$toasted.error(this.$t(this.err))
        return
      }
      // alert('before-signdx--')
      let data = signDecoratedByTx(this.accountData.seed, this.tx)
      // alert('after --signxdr--' + data)
      this.$emit('success',data)

    }
  },
  components: {
    Card,
    Loading,
  }
}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/trade.styl'
.confirm-wrapper
  position: fixed
  bottom: 0
  // bottom: constant(safe-area-inset-bottom)
  // bottom: env(safe-area-inset-bottom)
  right: 0
  left: 0
  top: 0
  // top: constant(safe-area-inset-top)
  // top: env(safe-area-inset-top)
  z-index: 9
.confirm-blank
  background: $primarycolor.gray
  opacity: .8
  position: fixed
  bottom: 11rem
  bottom: calc(11rem+constant(safe-area-inset-bottom))
  bottom: calc(11rem+env(safe-area-inset-bottom))
  right: 0
  left: 0
  top: 0
  top: constant(safe-area-inset-top)
  top: env(safe-area-inset-top)
  z-index: 9
.confirm-dlg
  background: $secondarycolor.gray
  height: 11rem
  height: calc(11rem+constant(safe-area-inset-bottom))
  height: calc(11rem+env(safe-area-inset-bottom))
  position: fixed
  bottom: 0
  padding: 0
  padding-bottom: constant(safe-area-inset-bottom)
  paddingbottom: env(safe-area-inset-bottom)
  right: 0
  left: 0
  opacity: 1
.dlg-title
  color: $primarycolor.green
  text-align: center
  font-size: 16px
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
  .disable-btn
    color: $secondarycolor.font
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

.tx-opts
  height: 3rem
  overflow-y: auto
.tx-opt-item
  color: $secondarycolor.font
.sign-xdr-content
  background: $secondarycolor.gray
  padding-top: 8px
  padding-bottom: 8px
  padding-bottom: calc(8px + constant(safe-area-inset-bottom))
  padding-bottom: calc(8px + env(safe-area-inset-bottom))
</style>

