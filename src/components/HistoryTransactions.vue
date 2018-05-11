<template>
  <div>
    <scroll :refresh="onRefresh">
      <div class="content">
            <v-layout  v-for="item in transactions" :key="item.id">
              <v-flex xs5 class="itemtime">{{item.created_at}}</v-flex>
              <v-flex xs3 class="itemstyleo">{{getTransactionsMiniAddress(item.source_account)}}</v-flex>
              <v-flex xs2 class="itemstylet">{{getTransactionsMiniAddress(item.memo)}}</v-flex>
              <v-flex xs2 class="itemstyleth">{{item.memo_type}}</v-flex>
            </v-layout>
            <v-flex xs12 class="loadmorestyle">
                <v-layout xs12>
                    <v-flex @click="loadmore" xs12>{{$t("LoadMore")}}</v-flex>
                </v-layout>
            </v-flex>
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
  import { transactionsPage,transactionDetail } from '@/api/transactions'
  export default {
    data() {
      return {
        transactions:[],
        transactionsInstance:null

      }
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
      // history() {
      //     let data = []
      //     var test= transactionsPage(this.account.address)
      //     .then(response=>{
      //         console.log(response)
      //         console.log(response.records)
      //         response.records.forEach((ele) => {
      //             data.push(ele)
      //         });
      //     }).catch((err,response)=>{
      //         console.error(err)
      //     })
      //     console.log(data)
      //     return data
      // },

    },
    mounted() {
      this.getTransactionsData()
    },
    methods: {
      ...mapActions([
        'getAccountInfo',
        'getTransactionsPage',
        'selectPayment',
        'cleanAccount'
      ]),
      load() {
        let address = this.account.address
        return Promise.all([this.getAccountInfo(this.account.address)])
      },
      onRefresh: function () {
        console.log('-----on refresh---------')
        return this.load()
      },
      toTranscation(item) {
        this.selectPayment(item)
        this.$router.push({name: 'Transaction'})
      },
      getTransactionsData(){
        console.log('------------get')
        if(this.transactionsInstance){
            this.transactionsInstance.next().then(response=>{
                console.log('----------transactions instance --')
                console.log(response)
                this.transactions = this.transactions.concat(response.records)
                this.transactionsInstance = response
            }).catch(err=>{
                console.error(err)
            })
        }else{
            transactionsPage(this.account.address).then(response=>{
                this.transactionsInstance = response
                this.transactions = this.transactions.concat(response.records)
            }).catch(err=>{
                console.error(err)
            })
        }
      },
      loadmore(){
        this.getTransactionsData()
      },
      getTransactionsMiniAddress(address){
          return accountapi.miniAddress(address)
      }
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
.content
  font-size:10px
  background:$secondarycolor.gray
  border-radius:5px
  padding-left:3px
.itemtime
  color:$primarycolor.red
.itemstyleo
  color:$primarycolor.font
.itemstylet
  color:$primarycolor.green
.itemstyleth
  color:$primarycolor.green

.loadmorestyle
    text-align:center
</style>
