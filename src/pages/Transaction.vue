//交易记录
<template>
  <div class="page">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
      />
    <div class="content">
      <card class="title">
        <div class="title-content" slot="card-content">
          <div class="flag">{{$t(selected.flag)}}</div>
          <div :class="'amount' + (selected.isInbound ? ' add ':' minus ') ">
              <span class="inbound" v-if="selected.isInbound">+</span>
              <span class="inbound" v-else>-</span>
              <span class="amount">{{selected.amount}}</span>
              <span class="code">{{selected.asset.code}}</span>
          </div>
          <div class="address" @click="copy(account.address)">{{account.address | shortaddress}}</div>
        </div>
      </card>
      <h2 class="details-title">{{$t('Detail')}}</h2>
      <card class="details">
        <div class="card-content" slot="card-content">
          <div class="label">TX</div>
          <div class="value" @click="copy(transaction.id)">{{transaction.id  | shortaddress}}</div>
          <div class="label" v-if="!selected.isInbound">{{$t('To')}}</div>
          <div class="label" v-else>{{$t('From')}}</div>
          <div class="value" @click="copy(selected.counterparty)">{{selected.counterparty | shortaddress}}</div>
          <div class="label">{{$t('DateTime')}}</div>
          <div class="value">{{date}}</div>
          <div class="label">{{$t('Memo')}}</div>
          <div class="value" @click="copy(transaction.memo)">{{transaction.memo}}</div>
        </div>
      </card>
      <div style="flex: 1;"></div>
    <v-footer>        
      <v-layout row  wrap>
        <v-flex xs12>
          <v-btn class='primary'  block dark large @click="addContact">{{$t('AddContact')}}</v-btn>
        </v-flex>
      </v-layout>  
    </v-footer>
    </div>

    <!-- <div class="btn-group">
       <v-btn class="primary btn-send" @click.stop="addContact">{{$t('AddContact')}}</v-btn>
    </div> -->

  </div>
</template>

<script>
import Toolbar from '../components/Toolbar'
import Card from '../components/Card'
import { mapState, mapActions, mapGetters} from 'vuex'

export default {
  data(){
    return {
      title: 'History',
      showmenuicon: false,
      showbackicon: true,
      transaction:{}

    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      asset: state => state.asset.selected,
      selected: state => state.account.selectedPayment
    }),
    ...mapGetters([
      'balances',
      'paymentsRecords',
      'reserve',
      'payment'
    ]),
    date(){
      if(this.transaction && this.transaction.created_at){
        let d = new Date(this.transaction.created_at)
        return d.toLocaleString()
      }else{
        return ''
      }
    },
  
  },
  mounted(){
    this.payment.transaction()
      .then(data=>{
        console.log(data)
        this.transaction = data
      })
      .catch(err=>{
        console.error(err)
      })
  },
  methods: {
    ...mapActions({
    }),
    back(){
      this.$router.back()
    },
    addContact(){
      this.$router.push({name:'AddContact', params: {address: this.selected.counterparty}});
    },
    copy(value){
      if(cordova.plugins.clipboard){
        cordova.plugins.clipboard.copy(value)
        this.$toasted.show(this.$t('CopySuccess'))
      }
    }

   
  },
  components: {
    Toolbar,
    Card,
    
  }


}
</script>

<style lang="stylus" scoped>
@require '../stylus/color.styl'
.page
  background: $primarycolor.gray
  color: $primarycolor.font
.content
  padding: 8px 8px
  display flex
  flex-direction column
  min-height calc(100vh - 48px)
  .title
    .title-content
      padding: 20px 20px
      text-align: center
      .amount
        font-size: 24px
        padding-top: 5px
        padding-bottom: 5px
      .amount.add
        color: $primarycolor.green
      .amount.minus
        color: $primarycolor.red
      .address
        font-size: 16px
        color: $secondarycolor.font
  .details-title
    font-size: 18px
    margin-top: 20px
    padding-left: 14px
    margin-bottom: 0px
    padding-bottom: 5px
    color: $secondarycolor.font
  .details
    .card-content
      font-size: 16px
      padding: 14px 14px
      padding-bottom: 30px
      .label
        color: $secondarycolor.font
        padding-top: 8px
        padding-bottom: 2px
      .value
        word-break: break-all
  
.btn-group
  width: 100%
  margin-top: 20px
  padding-left: 8px
  padding-right: 8px
  .btn-send
    width: 100%
    height: 36px
    margin:0 0

.footer
  width: 100%;
  background: transparent;
</style>
