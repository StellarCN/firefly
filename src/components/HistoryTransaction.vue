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
                  <span class="code" v-if="item.asset">{{item.asset.code}}</span>
                </div>
              </v-flex>
            </v-layout>
          </div>
        </card>
        <div class="loadmore textcenter" v-if="history.length > 0">
          <v-progress-circular indeterminate color="primary" v-if="loadmore"></v-progress-circular>
          <span v-if="!loadmore && hasmore " @click="loadmoreData">{{$t('LoadMore')}}</span>
        </div>
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
  import paymentsMixin from '@/mixins/payments'
  import debounce from 'lodash/debounce'

  export default {
    data() {
      return {
        loadmore: false,
        hasmore: true,
      }
    },
    mixins: [paymentsMixin],
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
    methods: {
      ...mapActions([
        'getAccountInfo',
        'getTransactionsPage',
        'selectPayment',
        'cleanAccount'
      ]),
      onRefresh(){
        return this.getPayments(this.account.address)
      },

      loadmoreData:debounce(function(){
        this.loadmore = true
        let startLen = this.paymentsRecords.length
        console.log('------------moremore----')
        this.loadmorePayments(this.account.address)
          .then(data=>{
            this.loadmore = false
            let endLen = this.paymentsRecords.length
            if(startLen === endLen){
              this.hasmore = false
            }
          })
          .catch(err=>{
            console.error(err)
            this.loadmore = false
          })
          
      },300),

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
  .loadmore
    padding-top: .3rem
</style>
