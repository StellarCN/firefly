/*
 * 加载账户信息mixins
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-01-31 09:07:34 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-06-11 13:56:58
 * @License MIT 
 */
import { mapState,mapActions,mapGetters } from 'vuex'
import {  ACCOUNT_IS_FUNDING,  ACCOUNT_NOT_FUNDING} from '@/store/modules/AccountStore'
import  defaultsDeep  from 'lodash/defaultsDeep'
const FETCH_ACCOUNT_INTERVAL = 180000;
export default {
  
  data(){
    return {
      accountNotFundDlg: false,
      _intervalFetchAccount: null,//请求账户数据的
    }
  },

  computed: {
    ...mapState({
      account: state => state.accounts.selectedAccount
    }),
  },
  beforeMount () {
    if (this.account.address) {
      this.fetchData()
      this.setupFetchAccountInterval()
    }
  },
  beforeDestroy(){
    if(this._intervalFetchAccount!== null){
      clearInterval(this._intervalFetchAccount)
      this._intervalFetchAccount = null
    }
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
      'updateAccount'
    ]),

    setupFetchAccountInterval(){
      this._intervalFetchAccount = setInterval(this.fetchData, FETCH_ACCOUNT_INTERVAL)
    },

    fetchData() {
      if (this.account.address) {
        this.load()
          .then(data => {
            this.updateFederationAndInflationInfo()
            this.$store.commit(ACCOUNT_IS_FUNDING)
          })
          .catch(err => {
            console.log("errorhere");
            //this.cleanAccount()
            console.log(err.message)
            let msg = err.message
            if (msg && 'Network Error' === msg) {
              this.$toasted.error(this.$t('Account.NetworkError'))
              return
            }
            console.error(err)
            if (err.data && err.data.status === 404) {
              // this.noticeText = this.$t('Error.AccountNotFund')
              this.$store.commit(ACCOUNT_NOT_FUNDING)
              // this.notice = true
              //查看激活？？
              this.accountNotFundDlg = true

              
              
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
    updateFederationAndInflationInfo() {
      // update home_domain and inflation_destination from horizon.
      console.log("updateFederationAndInflationInfo")
      console.log(this.accountData)
      if (this.account.federationAddress !== this.accountData.inflation_destination || this.account.inflationAddress !== this.accountData.home_domain) {
        let data = defaultsDeep({}, this.account, {
          federationAddress: this.accountData.home_domain,
          inflationAddress: this.accountData.inflation_destination
        })
        let params = {
          index: this.selectedAccountIndex,
          account: data
        }
        console.log(params)
        this.updateAccount(params)
          .then(data => {
            console.log("success")
          })
          .catch(err => {
            console.log("failed")
            console.error(err)
          })
      }
    },
    closeAccountNotFoundDlg(){
      this.accountNotFundDlg = false
    },
    load() {
      //this.cleanAccount()
      let address = this.account.address
      // let process = [this.getAccountInfo(address),this.getPayments(address)]
      //console.log(process)
      return Promise.all([this.getAccountInfo(this.account.address)]) //,this.getPayments(this.account.address)])
    }
  },


}
