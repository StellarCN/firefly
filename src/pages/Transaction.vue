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
          <div class="flag">{{$t(flag)}}</div>
          <div :class="'amount' + (isInbound ? ' add ':' minus ') ">
              <span class="inbound" v-if="isInbound">+</span>
              <span class="inbound" v-else>-</span>
              <span class="amount">{{amount}}</span>
              <span class="code">{{asset.code}}</span>
          </div>
          <div class="address" @click="copy(account.address)">{{account.address | shortaddress}}</div>
        </div>
      </card>
      <h2 class="details-title">{{$t('Detail')}}</h2>
      <card class="details">
        <div class="card-content" slot="card-content">
          <div class="label">TX</div>
          <div class="value" @click="copy(transaction.id)">{{transaction.id  | shortaddress}}</div>
          <div class="label" v-if="!isInbound && selected.counterparty">{{$t('To')}}</div>
          <div class="label" v-if="isInbound && selected.counterparty">{{$t('From')}}</div>
          <div class="value" @click="copy(selected.counterparty)" v-if="selected.counterparty">{{selected.counterparty | shortaddress}}<span v-if="this.contactName"> ({{$t('Transaction.ContactName')}}: {{this.contactName}})</span></div>
          <div class="label">{{$t('DateTime')}}</div>
          <div class="value">{{date}}</div>
          <div class="label">{{$t('Memo')}}</div>
          <div class="value" @click="copy(transaction.memo)">{{transaction.memo}}</div>
        </div>
      </card>
      <v-layout row  wrap>
        <v-flex xs12>
          <v-btn class='primary' block dark large @click="addContact" v-if="!this.contactName">{{$t('AddContact')}}</v-btn>
        </v-flex>
      </v-layout>
    </div>

    <!-- <div class="btn-group">
       <v-btn class="primary btn-send" @click.stop="addContact">{{$t('AddContact')}}</v-btn>
    </div> -->

  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import { mapState, mapActions, mapGetters} from 'vuex'
import { transactionDetail } from '@/api/transactions'

export default {
  data(){
    return {
      title: 'History',
      showmenuicon: false,
      showbackicon: true,

      tx_hash: null,
      flag: null,
      isInbound: null,
      asset: {},
      amount: null,

      transaction:{}
    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      selectedAsset: state => state.asset.selected,
      selected: state => state.account.selectedPayment || {},
      allcontacts: state => state.app.contacts
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
    contactName: function() {
      let address = this.selected.counterparty
      let contact = this.allcontacts.filter(contact => contact.address === address)
      return contact.length != 0 ? contact[0].name : ''
    }
  },
  mounted(){
    let tx = this.$route.params.tx
    if(tx){
      this.tx_hash = tx
      this.flag = this.$route.params.flag
      this.isInbound = this.$route.params.isInbound
      this.asset = this.$route.params.asset
      this.amount = this.$route.params.amount
    }else{
      this.tx_hash = this.payment.transaction_hash
      this.flag = this.selected.flag
      this.isInbound = this.selected.isInbound
      this.asset = this.selected.asset
      this.amount = this.selected.amount
    }
    this.fetchTransactionDetail()
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
    },
    fetchTransactionDetail() {
      transactionDetail(this.tx_hash)
        .then(data => this.transaction = data)
        .catch(err => console.log(err))
    }
  },
  components: {
    Toolbar,
    Card,
  }


}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
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
