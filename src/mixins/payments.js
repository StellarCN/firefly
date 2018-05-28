/**
 * 获取payments的数据
 */ 
import { mapState,mapActions,mapGetters } from 'vuex'
import  defaultsDeep  from 'lodash/defaultsDeep'
import { fetchPayments } from '@/api/payments'

export default {
  

  computed: {
    ...mapState({
      account: state => state.accounts.selectedAccount
    }),
    ...mapGetters([
      'balances',
      'paymentsRecords',
      'reserve',
    ]),
  },
  beforeMount () {
    this.fetchPaymensData()
  },
  methods: {
    ...mapActions([
      'getAccountInfo',
      'showLoading',
      'hidenLoading',
      'getTransactionsPage',
      'getPayments',
      'selectAsset',
      'selectPayment',
      'cleanAccount',
      'paymentSteamData',
      'updateAccount',
      'loadmorePayments'
    ]),
    fetchPaymensData(){
      this.getPayments(this.account.address)
        .then(data=>{
          console.log('---get payments already-')
        })
        .catch(err=>{
          console.error(err)
        })
    },

    loadmorePaymentsData(){
      this.loadmorePayments(this.account.address)
        .then(data=>{
          console.log('after load more payments')
        })
        .catch(err=>{
          console.error(err)
        })
    }


    
  }




}
