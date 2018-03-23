/**
 * 提现表格界面
 */
<template>
<div class="withdraw_wrapper">
  <loading :show="onsend" :loading="sending" :success="sendsuccess" :fail='sendfail' 
    :title="loadingTitle" :msg="loadingMsg" :closeable="sendfail" @close="hiddenLoadingView"
    />
  <div class="withdraw_form" v-if="!senddata">

    <div class="withdraw_fld" v-for="(field,index) in fields" :key="index">

      <!--label-->
      <div class="field_label" v-if="field.type==='label'">
        <div class="label">{{field.label}}</div>
        <div class="hint">{{field.hint}}</div>
      </div>
      <div class="field_select" v-if="field.type==='select'">
        <div class="label">{{field.label}}</div>
        <div class="hint">{{field.hint}}</div>
        <v-select
            v-bind:items="field.options"
            :name="field.name"      
            class="field_select"
            item-value="value"
            item-text="label"
            :required="field.required"
            @change="changeValue(field.name,$event)"
            dark
            :return-object="selectReturnObject"
            >
            <template slot="selection" slot-scope="data">
              <span class="field_select_code show">{{data.item.label}}</span>
            </template>
            <template slot="item" slot-scope="data">
              <span class="field_select_code">{{data.item.label}}</span>
            </template>
          </v-select>
      </div>

      <div class="field_text" v-if="field.type==='text'">
        <div class="label">{{field.label}}</div>
        <div class="hint">{{field.hint}}</div>
        <v-text-field
              class="field_input"
              :name="field.name"
              :id="field.name"
              v-model="values[field.name]"
              :required="field.required"
              dark
              @input="textInput(field.name,$event)"
            ></v-text-field>
            <div class="floaticon" @click.stop="showbookView(field.name)">
              <i class="material-icons">bookmark</i>
            </div>

      </div>
      
    </div>

    <div class="amount-wrapper"v-if="showAmount">
      <div class="label">{{$t('Amount')}}</div>
      <v-text-field
            class="field_input"
            name="amount"
            v-model="amount"
            required
            dark
            type="number"
          ></v-text-field>
      <!-- <v-slider v-model="num" 
                class="amount-slider"
                color="red"
                dark
                :max="balance"
              ></v-slider> -->
    </div>

      <div class="field_btn" v-if="showAmount">
        <v-btn :loading="working" class="error btn_ok" @click.stop="submitWithdrawQuote">{{$t('Button.OK')}}</v-btn>
      </div>
  </div>

  <!--要发送的数据-->
  <div class="senddata_wrapper" v-else>
    <div class="senddata_amount">
      
      <span class="amount">{{sendasset.amount}}</span>
      <span class="code">{{sendasset.code}}</span> 

    </div>
    <div class="senddata_btn">
       <v-btn class="error btn_send" @click.stop="send">{{$t('Send')}}</v-btn>
    </div>
  </div>

  <contact-book v-show="showbook" :data="bookdata" :close="()=>{showbook=false}" :ok="afterBookChose"/>
     

</div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { getAssetWithdrawUrl,submitQuote } from '../api/withdraw'
import Loading from './Loading'
import ContactBook from '@/components/ContactBook'
import { xdrMsg,getXdrResultCode } from '@/api/xdr'
import  defaultsDeep  from 'lodash/defaultsDeep'
export default {
  data(){
    return {
      selectReturnObject: true,
      working: false,//是否正在处理
      values:{},
      num:null,
      amount: null,
      senddata:null,//要发送的信息

      onsend: false,//是否显示发送
      sending: false,//发送中
      sendsuccess: false,//发送成功
      sendfail: false,//发送失败
      loadingTitle: null,
      loadingMsg: null,
      
      showbook: false,
      bookkey: null,
      bookdata: ['myaddress']


    }
  },

  props: {
    fields:{
      type: Array,
      required: true
    },
    federation: {
      type: String,
      required: true
    },
    withdrawurl: {
      type: String,
      required: true
    },
    asset: {
      type: Object,
      required: true
    },
    accountId: {
      type: String,
      required: true
    },

  },
  watch:{
    fields(){
      this.working = false
      this.values = {}
      this.senddata = null
    },
    num(val){
      this.amount  = val
    }
  },
  computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
    }),
    ...mapGetters(['balances']),
    balance(){
      let data = null
      this.balances.forEach(ele=>{
        if(ele.code === this.asset.code){
          data = ele.balance
        }
      })
      return data//100;//data
    },
    sendasset(){
      if(!this.senddata)return {}
      let data = this.senddata.send
      console.log(data)
      if(data && data.length > 0){
        let result = null
        for(var i=0,n=data.length;i<n;i++){
          let ele = data[i]

          if(ele.code === this.asset.code && ele.issuer === this.asset.issuer){
            result = ele
            break
          }
        }
        return result
      }
      return {}
    },
    showAmount(){
      for(let x in this.fields){
        if (this.fields[x].required === true){
          return true
        }
      }
      return false

    }

  },

  methods: {
    ...mapActions({
      sendAsset: 'sendAsset',
    }),
    changeValue(name,data){
      this.values[name] = data.value
    },
    textInput(name,value){
      console.log(value)
       this.values[name] = value

    },

    //提交表单数据到服务器,如果成功后则会显示成
    submitWithdrawQuote(){
      //校验是否有值
      for(var field in this.fields){
        if(field.required && !this.values[field.name]){
          this.$toasted.error(this.$t('Error.PleaseCompleteForm'))
          return
        }
      }
      let data = defaultsDeep({}, this.values, {
          address: this.account.address,
          account_id: this.accountId,
          asset_code: this.asset.code,
          asset_issuer: this.asset.issuer,
          amount: this.amount

          })
      console.log('-----before submit quote-----')
      console.log(data)
      submitQuote(this.withdrawurl, data)
        .then(response=>{
          console.log('--------submit ---quote------')
          console.log(response)
          this.senddata = response.data

        })
        .catch(err=>{
          this.$toasted.error(this.$t('Error.SubmitQuoteFail'))
          console.log(err.response)
          if(err.response && err.response.data && err.response.data.detail){
            this.$toasted.error(err.response.data.detail)
          }
        })
    },

    send(){
      let seed = this.accountData.seed
      if(!seed){
        this.$toasted.error(this.$t('Error.NoPassword'))
        return
      }
      this.working = true

      let params = {
        seed,
        address: this.account.address,
        target: this.senddata.account_id,
        asset: {code: this.sendasset.code, issuer: this.sendasset.issuer},
        amount: this.sendasset.amount,
        memo_type: this.senddata.memo_type,
        memo_value: this.senddata.memo
      }
      this.onsend = true
      this.sending = true
      this.sendAsset(params)
        .then(response=>{
          this.sending = false
          this.sendsuccess = true
          this.sendfail = false
          this.working = false
          this.values = {}
          this.amount = null
          this.num = 0
          this.senddata = null
          this.loadingTitle = this.$t('SendAssetSuccess')
          this.hideLoading()
        })
        .catch(err=>{
          console.error(err)
          this.sending = false
          this.sendsuccess = false
          this.sendfail = true
          this.loadingTitle = this.$t('Error.SendAssetFail')
          let msg = getXdrResultCode(err)
          setTimeout(()=>{
            if(msg){
              this.loadingMsg = this.$t(msg)
            }else{
              this.loadingMsg = this.$t(err.message)
            }
          },1000)

        })
      
    },

    hideLoading(){
      setTimeout(()=>{
          this.hiddenLoadingView()
        },3000)
    },

    showbookView(name){
      this.bookkey = name
      this.showbook = true
      
    },
    afterBookChose(type,data){
      this.showbook = false
      this.values[this.bookkey] = data.address
      this.bookkey = null
    },
    hiddenLoadingView(){
      this.onsend = false
      this.sendfail = false
      this.sendsuccess = false
      this.loadingTitle = null
      this.loadingMsg = null
    }

  },
  
  components:{
    Loading,
    ContactBook,
  }
  


}
</script>

<style lang="stylus" scoped>
@require '../stylus/color.styl'
.withdraw_form
  font-size: 16px
.field_select
.field_input
  padding-top: 2px
.field_btn
  .btn_ok
    padding: 0px 0px
    margin: 0px 0px
    width: 100%
.senddata_wrapper
  .senddata_amount
    font-size: 32px
    padding-top: 5px
    padding-bottom: 5px
    border-bottom: 1px dashed  $secondarycolor.font
    text-align: center
    color: $primarycolor.red
  .senddata_btn
    padding-top: 15px
    padding-bottom: 5px
    .btn_send
      padding: 0px 0px
      margin: 5px 0px
      width: 100%
.floaticon
  position: absolute
  right: 25px
  margin-top: -55px
  color: $secondarycolor.font
</style>
