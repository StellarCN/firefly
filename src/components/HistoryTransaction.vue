<template>
  <div>
    <scroll :refresh="onRefresh">
      <div class="content">
        <card padding="10px 10px" class="infocard">
          <div class="history" slot="card-content">
            <v-layout class="history-li" row wrap v-for="item in history" :key="item.id" @click.stop="toTranscation(item)">
              <v-flex xs4 class="history-wrapper">
                <div class="history">
                  <div class="history-flag">{{$t(item.flag)}}</div>
                  <div class="history-time">{{item.date}}</div>
                </div>
              </v-flex>
              <v-flex xs8 class="history-wrapper">
                <div v-if="item.isInbound!=null && item.isInbound!=undefined"
                     :class="'history-amount' + (item.isInbound ? ' add ':' minus ') ">
                  <span class="inbound" v-if="item.isInbound">+</span>
                  <span class="inbound" v-else>-</span>
                  <span class="amount">{{item.amount}}</span>
                  <span class="code">{{item.asset.code}}</span>
                </div>
              </v-flex>
            </v-layout>
          </div>
        </card>
      </div>
    </scroll>
  </div>
</template>

<script>
  import Toolbar from '@/components/Toolbar'
  import {mapState, mapActions, mapGetters} from 'vuex'
  import Card from '@/components/Card'
  import * as accountapi from '@/api/account'
  import {getAddressByAccountId} from '@/api/federation'
  import Scroll from '@/components/Scroll'
  import {listenPaymentStream, closePaymentStream, getPaymentStream, convertRecords} from '@/api/payments'

  export default {
    data() {
      return {}
    },
    computed: {
      ...mapState({
        account: state => state.accounts.selectedAccount,
        accountData: state => state.account.data,
        assethosts: state => state.asset.assethosts,
        selectedAccountIndex: state => state.accounts.selected,
      }),
      ...mapGetters([
        'balances',
        'paymentsRecords'
      ]),
      history() {
        let data = []
        if (!this.paymentsRecords) {
          return data;
        }
        this.paymentsRecords.forEach((ele) => {
          if (ele.type === 'payment' || ele.type === 'path_payment') {
            if (ele.isInbound) {
              ele.flag = 'Receive'
            } else {
              ele.flag = 'Send'
            }
          } else {
            ele.flag = ele.type
          }
          data.push(ele)
        });
        return data
      }

    },
    mounted() {
      if (this.account.address) {
        this.fetchData()
      }
    },
    beforeDestroy() {
      closePaymentStream()
    },
    methods: {
      ...mapActions([
        'getAccountInfo',
        'getTransactionsPage',
        'selectPayment',
        'cleanAccount'
      ]),

      fetchData() {
        if (this.account.address) {
          this.load()
            .then()
            .catch(err => {
              console.log("errorhere");
              // this.cleanAccount()
              console.log(err.message)
              let msg = err.message
              if (msg && 'Network Error' === msg) {
                this.$toasted.error(this.$t('Account.NetworkError'))
                return
              }
              console.error(err)
              if (err.data && err.data.status === 404) {
                this.noticeText = this.$t('Error.AccountNotFund')
                this.notice = true
              }
              // this.snackbarText = this.$t('Error.AccountNotFund')
              // this.snackbarColor = 'primary'
              // this.snackbar = true
              // this.$toasted.error(this.$t('Error.AccountNotFund'))
              // this.$toasted.error(this.$t('Error.GetAccountInfoError'))
            })
          // 处理stream
          // listenPaymentStream(this.account.address, this.onPaymentStream)
        }
      },
      load() {
        //this.cleanAccount()
        let address = this.account.address
        // let process = [this.getAccountInfo(address),this.getPayments(address)]
        //console.log(process)
        return Promise.all([this.getAccountInfo(this.account.address)])//,this.getPayments(this.account.address)])
      },
      onRefresh: function () {
        console.log('-----on refresh---------')
        return this.load()
      },
      toTranscation(item) {
        this.selectPayment(item)
        this.$router.push({name: 'Transaction'})
      },
    },
    components: {
      Toolbar,
      Card,
      Scroll,
    }
  }
</script>


<style lang="stylus" scoped>
  @require '~@/stylus/color.styl'
.infocard
  text-algin: center
  background: $secondarycolor.gray
   
  .history-li
    padding-top: 5px
    padding-bottom: 5px
    font-size: 16px

  .history-amount
    text-align: right

  .history-amount.add
    color: $primarycolor.green

  .history-amount.minus
    color: $primarycolor.red
</style>
