/**
 * SEP-0006标识下的
  第1步，如果当前资产为空，数据为0，则无法填写，提示错误信息(在外层处理)
  第2步，用户填写接收地址和备注信息、选择提现类型(bank_account和crypto)，确定后提交到相应的地址${fed_server}/federation中
  第3步，如果返回的是error，则提示相应的错误信息
        如果返回的是正确结果，则提示构造表单，由用户填写提现金额，自动计算相应的费用及实际到账金额
  第4步，用户确认填写内容正确后，直接调用发送功能，并弹出提示窗口，等待发送结果正确或失败

 */
<template>
<div class="withdraw_wrapper" v-bind:class="{hidebackground: showScanner}">
  <loading :show="onsend" :loading="sending" :success="sendsuccess" :fail='sendfail' 
    :title="loadingTitle" :msg="loadingMsg" :closeable="sendfail" @close="hiddenLoadingView"
    />

  <!--第1步-->
  <div class="wcard-content" v-if="step === 1 && !showScanner">
      <div class="field_select" >
        <div class="label">{{$t('DW.Withdraw.ForwardType')}}</div>
       <v-select
            v-bind:items="forwardTypes"
            name="forward_type"      
            class="field_select"
            v-model="forward_type"
            @change="changeForwardType($event)"
            dark
            >
            <template slot="selection" slot-scope="data">
              <span class="field_select_code show">{{$t(data.item)}}</span>
            </template>
            <template slot="item" slot-scope="data">
              <span class="field_select_code">{{$t(data.item)}}</span>
            </template>
          </v-select>
      </div>
     
      <div class="field_select" >
        <div class="label" @click="switchScanner">{{$t('DestinationAddress')}}
          <span class="ml-2 title2">({{$t('Title.Scan')}})</span></div>
        <v-text-field class="field_input"  name="dest" 
          v-model="dest"
          dark
          append-icon="bookmark"
          :append-icon-cb="()=>{showbook=true}"
          ></v-text-field>
      </div>

      <div class="field_select" >
        <div class="label">{{$t('Memo')}}</div>
        <v-text-field class="field_input"  name="dest" 
          v-model="dest_extra"
          dark
          ></v-text-field>
      </div>
      <div class="field_btn">
        <v-btn :loading="working"  class="error btn_ok btn_ok1" @click.stop="submitStep1">{{$t('Button.OK')}}</v-btn>
      </div>
  </div>

  <!--第2步的界面-->
    <div class="wcard-content" v-if="step === 2 && step2data  && !showScanner">    
      <div class="field_select" v-if="step2data.eta!= null && typeof step2data.eta!='undefined'">
        <div class="hint">{{$t('DW.Withdraw.eta',[step2data.eta])}}</div>
      </div>
      <div class="field_select" v-if="step2data.min_amount!= null && typeof step2data.min_amount!='undefined'">
        <div class="hint">{{$t('DW.Withdraw.min_amount',[step2data.min_amount])}}{{asset.code}}</div>
      </div>
      <div class="field_select" v-if="step2data.max_amount!= null && typeof step2data.max_amount!='undefined'">
        <div class="hint">{{$t('DW.Withdraw.max_amount',[step2data.max_amount])}}{{asset.code}}</div>
      </div>
      <div class="field_select" v-if="step2data.fee_fixed!= null && typeof step2data.fee_fixed!='undefined'">
        <div class="hint">{{$t('DW.Withdraw.feefixed',[step2data.fee_fixed])}}{{asset.code}}</div>
      </div>
      <div class="field_select" v-if="step2data.fee_percent!= null && typeof step2data.fee_percent!='undefined'">
        <div class="hint">{{$t('DW.Withdraw.feepercent',[step2data.fee_percent])}}</div>
      </div>
      <div class="field_select" v-if="step2data.extra_info!= null && typeof step2data.extra_info!='undefined'">
        <div class="hint">{{$t('DW.Withdraw.extra_info',[step2data.extra_info])}}</div>
      </div>

      <div class="field_select" >
        <div class="label">{{$t('Amount')}}</div>
        <v-text-field  name="amount" 
          v-model="amount"
          @input="chgAmount"
          type="number"
          dark
          :suffix="asset.code"
          ></v-text-field>
        <v-slider v-model="num"  hide-details 
          class="amount-slider"
          dark
          max=100 step=10 ticks
          append-icon='keyboard_tab'  v-bind:style="'width: 100% !important'"
          :append-icon-cb = 'toMax'
          @input="changeNum"
          ></v-slider>
      </div>

      <div class="field_select" >
        <div class="label">{{$t('DW.Fee')}}</div>
        <v-text-field class="field_input input-group--focused"  name="fee" 
          :value="fee"
          :disabled="true"
          :suffix="asset.code"
          dark
          ></v-text-field>
      </div>
      <div class="field_select" >
        <div class="label">{{$t('DW.Receive')}}</div>
        <v-text-field class="field_input input-group--focused"  name="receive" 
          :value="receive"
          :disabled="true"
          :suffix="asset.code"
          dark
          ></v-text-field>
      </div>
      <div class="field_btn">
        <v-btn :loading="working" :disabled="btn_disabled" class="error btn_ok btn_ok1" @click.stop="submitStep2">{{$t('Button.OK')}}</v-btn>
      </div>
    </div>

    <!--第3步，用户确认界面-->
    <div class="confirm-wrapper"  v-if="step === 3  && !showScanner">
      <div class="confirm-blank"></div>
      <div  class="confirm-dlg">
      <v-bottom-sheet v-model="confirmSheetView" persistent dark >
        <div class="confirm-title">{{$t('Trade.Confirm')}}{{$t('Send')}}</div>
        <div class="confirm-content">
          <div class="confirm-row flex-row">
            <span class="label flex1">{{$t('DestinationAddress')}}</span>
            <span class="value flex4"> {{step2data.account_id | shortaddress}}</span>
          </div>

          <div class="confirm-row flex-row">
            <span class="label flex1">{{$t('Send')}}</span>
            <div class="flex4"> 
              <span class="value">{{amount === null ? 0: amount}}</span><span class="code pl-1">{{asset.code}}</span>
            </div>
            
          </div>
          <div class="confirm-row flex-row">
            <span class="label flex1">{{$t('DW.Fee')}}</span>
            <div class="flex4"> 
               <span class="value">{{fee||0}}</span><span class="code pl-1">{{asset.code}}</span>
            </div>
          </div>
          <div class="confirm-row flex-row">
            <span class="label flex1">{{$t('DW.Receive')}}</span>
            <div class="flex4"> 
               <span class="value">{{receive||0}}</span><span class="code pl-1">{{asset.code}}</span>
            </div>
          </div>
        </div>
        <div class="confirm-btns textcenter" v-if="working">
          <v-progress-circular indeterminate color="error"></v-progress-circular>
        </div>
        <div class="confirm-btns flex-row textcenter" v-else>
          <div class="confirm-btn flex1" @click="send">{{$t('Button.OK')}}</div>
          <div class="confirm-btn flex1" @click="()=>{ step = 2; confirmSheetView=false;}">{{$t('Button.Cancel')}}</div>
        </div>
      </v-bottom-sheet>
      </div>
    </div>

  
  <contact-book v-if="showbook  && !showScanner" :data="bookdata" :close="()=>{showbook=false}" :ok="afterBookChose"/>
  
   <q-r-scan
      @finish="qrfinish"
      @close="qrclose"
      :validator="qrvalidator"
      ref="qrscanner"
      v-if="showScanner"></q-r-scan>


</div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { queryWithdrawInfo } from '../api/withdraw'
import Loading from './Loading'
import ContactBook from '@/components/ContactBook'
import Card from './Card'
import { xdrMsg,getXdrResultCode } from '@/api/xdr'
import  defaultsDeep  from 'lodash/defaultsDeep'
import { Decimal } from 'decimal.js'
import QRScan from '@/components/QRScan'
export default {
  data(){
    return {

      step: 1,//第1步或第2步

      //第1步的参数
      forwardTypes: ['bank_account','crypto'],
      forward_type: 'crypto',
      dest: null,
      dest_extra: null,

      //第2步的参数 
      step2data: null,
      num:null,//数量百分比
      amount: null,//提交的数量
      showbook: false,
      showScanner: false,


      working: false,//是否正在处理

      onsend: false,//是否显示发送
      sending: false,//发送中
      sendsuccess: false,//发送成功
      sendfail: false,//发送失败
      loadingTitle: null,
      loadingMsg: null,
      
      bookdata: ['myaddress'],

      confirmSheetView: false,

      rejustify: false,


    }
  },

  props: {
    homedomain: {
      type: String,
      required: true
    },
    asset: {
      type: Object,
      required: true
    },

  },
  watch:{

  },
  computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
    }),
    ...mapGetters(['balances']),
    balance(){
      let data = this.balances.filter(ele => {
        return ele.code === this.asset.code && ele.issuer === this.asset.issuer
      })
      return data.length>0 ? Number(data[0].balance):0;
      // return 3.4764716
    },
    //费用
    fee(){
      if(this.amount!= null && this.amount > 0){
        return new Decimal(this.amount)
          .times(this.step2data.fee_percent||1)
          .add(this.step2data.fee_fixed||0).toNumber().toFixed(7)
      }
      return null
    },
    //实际到账
    receive(){
      if(this.amount!=null && this.amount > 0){
        return new Decimal(this.amount).minus(this.fee||0).toNumber().toFixed(7)
      }
      return null
    },
    min_amount(){
      if(this.step === 2 && this.step2data ) return this.step2data.min_amount
      return null
    },
    max_amount(){
      if(this.step === 2 && this.step2data ) return this.step2data.max_amount
      return null
    },
    btn_disabled(){
      if( this.amount > 0 && this.amount >= this.min_amount){
        if(this.max_amount > 0){
          if(this.amount <= this.max_amount)return false
          return true
        }
        return false
      }
      return true
    }
  },
  methods: {
    ...mapActions({
      sendAsset: 'sendAsset',
    }),
    changeForwardType(event){
      let data = event.value
      //TODO
    },
    // 提交第1步
    submitStep1(){
      if(this.working)return
      this.working = true
      queryWithdrawInfo(this.homedomain, this.asset.code, this.account.address, this.forward_type, this.dest, this.dest_extra)
        .then(response=>{
          this.working = false
          this.step = 2
          this.step2data = response.data
        })
        .catch(err=>{
          this.working = false
          console.log('----------------------error---')
          console.log(err)
          console.log(err.response)
          if(err.response && err.response.data && err.response.data.error){
            this.$toasted.error(err.response.data.error)
            return
          }
          if(err.response && err.response.statusText){
            this.$toasted.error(err.response.statusText)
            return
          }
          this.$toasted.error(err.message)
        })
    },
    //发送只能每10秒请求一次
    send(){
      let seed = this.accountData.seed
      if(!seed){
        this.$toasted.error(this.$t('Error.NoPassword'))
        return
      }
      if(!this.step2data){
        this.$toasted.error(this.$t('Error.GetDataError'))
        return
      }
      if(this.receive === null)return
      if(Number(this.receive) <=0)return
      if(this.working)return
      this.working = true
      let params = {
        seed,
        address: this.account.address,
        target: this.step2data.account_id,
        asset: this.asset,
        amount: this.amount,
        memo_type: this.step2data.memo_type,
        memo_value: this.step2data.memo
      }
      this.onsend = true
      this.sending = true
      this.sendAsset(params)
        .then(response=>{
          this.sending = false
          this.sendsuccess = true
          this.sendfail = false
          this.working = false
          this.amount = null
          this.num = 0
          this.step2data = null
          this.step = 1
          this.loadingTitle = this.$t('SendAssetSuccess')
          this.hideLoading()
          this.confirmSheetView = false
        })
        .catch(err=>{
          console.error(err)
          this.sending = false
          this.sendsuccess = false
          this.sendfail = true
          this.loadingTitle = this.$t('Error.SendAssetFail')
          this.confirmSheetView = false
          this.step = 2
          let msg = getXdrResultCode(err)
          if(msg){
            this.loadingMsg = this.$t(msg)
          }else{
            this.loadingMsg = this.$t(err.message)
          }

        })
      
    },

    hideLoading(){
      setTimeout(()=>{
          this.hiddenLoadingView()
        },3000)
    },

    afterBookChose(type,data){
      this.showbook = false
      this.dest = data.address
    },
    hiddenLoadingView(){
      this.onsend = false
      this.sending = false
      this.sendfail = false
      this.sendsuccess = false
      this.loadingTitle = null
      this.loadingMsg = null
      this.working = false
    },
    //修改数量时
    chgAmount(val){
      if(this.rejustify)return
      this.rejustify = true
      if(val === null || val === '')val = 0
      //1. 数量不能大于最大值
      let nval = new Decimal(val)
      if(nval.lessThan(this.balance)){
        this.$nextTick(()=>{
          let str = nval.toFixed(7)
          if(!str.endsWith("0")){
            this.amount = str
          }
          this.num = new Decimal(this.amount||0).times(100).div(this.balance).toNumber()
          // console.log(`amount:${this.amount},num:${this.num}`)
          this.$nextTick(()=>{
            this.rejustify = false
          })
        });
      }else{
        this.$nextTick(()=>{
          this.amount = this.balance
          if(Number(this.amount) === 0){
            this.num = 0
          }else{
            this.num = 100
          }
          this.$nextTick(()=>{
            this.rejustify = false
          })
        });

      }
    },
    changeNum(val){
      if(this.rejustify)return;
      this.rejustify = true;
      console.log('--------change value------' + val)
      if(this.balance<=0){
        this.$nextTick(()=>{
          this.num = 0
          this.$nextTick(()=>{
            this.rejustify = false
          })
        })
      }else{
        this.$nextTick(()=>{
          this.amount = Number(new Decimal(this.balance).times(val).div(100).toFixed(7));
          this.$nextTick(()=>{
            this.rejustify = false
          })
        })
      }
    },
    toMax(){
      // if(this.amount === null || this.amount <= 0){
      //   this.num = 0
      //   return
      // }
      if(this.rejustify)return;
      this.rejustify = true;
      this.num = 100
      this.amount = this.balance
      this.$nextTick(()=>{
        this.rejustify = false
      })
    },
    submitStep2(){
      if(this.amount === null || typeof this.amount === 'undefined' || this.amount <= 0){
        this.$toasted.error(this.$t('Error.AmountIsRequired'))
        return
      }
      this.step = 3
      this.confirmSheetView = true
    },
    resetStep(){
      this.step = 1
    },
    switchScanner(){
      this.showScanner = !this.showScanner
      if(this.showScanner){
        this.$emit('showScanner')
      }
    },
    qrvalidator(text){
      if(!text)return false
      return true;
    },
    qrfinish(result){
      this.showScanner = false
      this.dest = result
      this.$emit('closeScanner')
      //this.secretkey = result
    },
    qrclose(){
      this.showScanner = false
      this.$emit('closeScanner')
    },
    doCloseQRScanner(){
      this.$refs.qrscanner.closeQRScanner()
    }

  },
  
  components:{
    Loading,
    ContactBook,
    Card,
    QRScan,
  }
  


}
</script>

<style lang="stylus" scoped>
@require '../stylus/color.styl'
.withdraw_wrapper
  height: 100%
  overflow-y: auto
.withdraw_form
  font-size: 16px
.field_select
.field_input
  padding-top: 2px

.btn_ok
  padding: 0px 0px
  margin: 0px 0px
  width: 100%!important

.hint
  color: $secondarycolor.font
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
  bottom: 320px
  bottom: calc(320px + constant(safe-area-inset-bottom))
  bottom: calc(320px + env(safe-area-inset-bottom))
  right: 0
  left: 0
  top: 0
  // top: constant(safe-area-inset-top)
  // top: env(safe-area-inset-top)
  z-index: 9
.confirm-dlg
  background: $secondarycolor.gray
  height: 320px
  height: calc(320px + constant(safe-area-inset-bottom))
  height: calc(320px + env(safe-area-inset-bottom))
  position: fixed
  bottom: 0
  right: 0
  left: 0
  opacity: 1
.confirm-title
  height: 46px
  line-height: 46px
  font-size: 18px
  color: $primarycolor.red
  text-align: center
.confirm-content
  padding-top: 24px
  padding-bottom: 24px
  font-size: 16px
  .confirm-row
    padding: 8px 8px
    .label
      color: $secondarycolor.font
    .value
      padding-left: 12px
      color: $primarycolor.red
      overflow: hidden
.confirm-btns
  color: $primarycolor.red
  text-align: center
  font-size: 16px
  height: 42px
  line-height: 42px
  margin: .2rem auto
.amount-slider
  padding-top: 0px
  padding-bottom: 0px
  padding-left: 0
  padding-right: 0
.title2
  color: $primarycolor.green
  font-size: 13px
</style>
