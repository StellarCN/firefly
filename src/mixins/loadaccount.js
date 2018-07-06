/*
 * 加载账户信息mixins
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-01-31 09:07:34 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-07-05 17:54:51
 * @License MIT 
 */
import { mapState,mapActions,mapGetters } from 'vuex'
import {  ACCOUNT_IS_FUNDING,  ACCOUNT_NOT_FUNDING} from '@/store/modules/AccountStore'
import  defaultsDeep  from 'lodash/defaultsDeep'
const FETCH_ACCOUNT_INTERVAL = 180000;
import { initStreams } from '@/streams'
import { CLEAN_ACCOUNT } from '@/store/modules/AccountStore'

export default {
  
  data(){
    return {
      accountNotFundDlg: false,
      _intervalFetchAccount: null,//请求账户数据的
      inflation_unset: false,//是否未设置通胀池
      inflationUnSetDlg: false,
    }
  },

  computed: {
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountDetails: state => state.account.data
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
            
            //检查当前用户是否设置了通胀池
            if(!this.accountDetails.inflation_destination){
              this.inflation_unset = true
              this.inflationUnSetDlg = true
            }

            // try{
            //   initStreams(this.account.address)
            // }catch(err){
            //   console.error(err)
            // }


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
              //请理账户数据
              this.$store.commit(CLEAN_ACCOUNT)
              console.log('---after clean account---')


              
              
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
      if (this.account.inflationAddress !== this.accountDetails.inflation_destination 
        || this.account.federationAddress !== this.accountDetails.home_domain) {
        let data = defaultsDeep({}, this.account, {
          federationAddress: this.accountDetails.home_domain,
          inflationAddress: this.accountDetails.inflation_destination
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
    closeInflationUnSetDlg(){

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
