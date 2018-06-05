/**
 * 主界面
 */
<template>
  <div class="page">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      />
    <scroll :refresh="onRefresh">
    <div class="content" >
      <card padding="10px 10px" class="infocard">
        <div class="title" slot="card-content">
          <div class="avatar-wrapper">
            <span class="avatar-back" @click="toNameCard"><i class="iconfont icon-erweima avatar"></i></span>
          </div>
          <h2 class="name">{{account.name}}</h2>
          <div class="address">{{account.address | shortaddress}}</div>
          <div class="assets">
            <v-layout class="myassets-li" row wrap v-for="item in balances" :key="item.issuer||item.name" @click.stop="toAsset(item)">
              <v-flex xs4 class="myassets-wrapper">
                <div class="myassets">
                  <div class="myassets-name">{{item.code}}</div>
                  <div class="myassets-issuer" v-if="assethosts[item.issuer]">{{assethosts[item.issuer]}}</div>
                  <div class="myassets-issuer" v-else-if="assethosts[item.code]">{{assethosts[item.code]}}</div>
                  <div class="myassets-issuer" v-else>{{item.issuer | miniaddress}}</div>
                </div>
              </v-flex>
              <v-flex xs6 class="myassets-wrapper">
                <div class="myassets-balance">
                    {{item.balance > 0 ? item.balance.toFixed(7): item.balance}}
                </div>
              </v-flex>
              <v-flex xs2 class="myassets-wrapper">
                <div class="myassets-total">
                    {{$t('Total')}}
                  </div>
              </v-flex>
            </v-layout>
          </div>
        </div>
        
      </card>

      <h4 class="subtitle">{{$t('History')}}</h4>
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
    <v-snackbar
      :timeout="5000"
      bottom
      vertical
      v-model="snackbar"
      :color = 'snackbarColor'
    >
      {{ snackbarText }}
      <v-btn outline dark small @click.native="snackbar = false">{{$t('Close')}}</v-btn>
    </v-snackbar>
   </scroll>
   <bottom-notice :show.sync="notice" :text="noticeText">    </bottom-notice>
  </div>
</template>

<script>
import Toolbar from '../components/Toolbar'
import { mapState, mapActions, mapGetters } from 'vuex'
import Card from '../components/Card'
import BottomNotice from '@/components/BottomNotice'
import * as accountapi from '../api/account'
import { getAddressByAccountId } from '../api/federation'
import Scroll from '../components/Scroll'
import { ACCOUNT_IS_FUNDING,ACCOUNT_NOT_FUNDING } from '@/store/modules/AccountStore'

export default {
  data(){
    return {
      title: 'Title.MyWallet',
      showbackicon: false,
      showmenuicon: true,
      noticeText: '',  
      notice: false,
      snackbarText: '',
      snackbar: false,
      snackbarColor: 'info',
    }
  },
  computed:{
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
    history(){
      let data = []
      if(!this.paymentsRecords){
        return data;
      }
      this.paymentsRecords.forEach((ele) => {
       if(ele.type==='payment' || ele.type === 'path_payment'){
         if(ele.isInbound){
           ele.flag = 'Receive'
         }else{
           ele.flag = 'Send'
         }
       }else{
         ele.flag = ele.type
       }
       data.push(ele)
      });
      return data
    }
  
  },
  mounted(){
    //getAddressByAccountId()
    document.removeEventListener("backbutton", this.onBackKeyDown, false); 
    document.addEventListener("backbutton", this.onBackKeyDown, false); 
    if(this.account.address){
      this.fetchData()
    }
    this.$watch('account.address',()=>{
      console.log('account address updated...')
      this.fetchData()
    })
  },
  beforeDestroy(){
    window.clearInterval(this.intervalID);
    document.removeEventListener("backbutton", this.onBackKeyDown, false);
    document.removeEventListener("backbutton", this.exitApp, false); 
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

    fetchData() {
      if (this.account.address) {
        this.load()
          .then(data => {
            this.updateFederationAndInflationInfo()
            this.$store.commit(ACCOUNT_IS_FUNDING)
          })
          .catch(err => {
            console.log("errorhere");
            this.cleanAccount()
            console.log(err.message)
            let msg = err.message
            if (msg && 'Network Error' === msg) {
              this.$toasted.error(this.$t('Account.NetworkError'))
              return
            }
            console.error(err)
            if (err.data && err.data.status === 404) {
              this.noticeText = this.$t('Error.AccountNotFund')
              this.$store.commit(ACCOUNT_NOT_FUNDING)
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
    updateFederationAndInflationInfo() {
      // update home_domain and inflation_destination from horizon.
      console.log("updateFederationAndInflationInfo")
      console.log(this.accountData)
      if (this.account.federationAddress !== this.accountData.inflation_destination || this.account.inflationAddress !== this.accountData.home_domain) {
        let data = Object.assign({}, this.account, {
          federationAddress: this.accountData.home_domain,
          inflationAddress: this.accountData.inflation_destination
        })
        let params = {index: this.selectedAccountIndex, account: data}
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
    load(){
      //this.cleanAccount()
      let address = this.account.address
     // let process = [this.getAccountInfo(address),this.getPayments(address)]
      //console.log(process)
      return Promise.all([this.getAccountInfo(this.account.address)])//,this.getPayments(this.account.address)])
    },
    onRefresh: function() {
      console.log('-----on refresh---------')
      return this.load()
    },
    onBackKeyDown() {  
        this.$toasted.show(this.$t('App.ClickOneMoreTimeExit'));  
        document.removeEventListener("backbutton", this.onBackKeyDown, false); // 注销返回键  
        document.addEventListener("backbutton", this.exitApp, false);//绑定退出事件  
        // 3秒后重新注册  
        this.intervalID = window.setInterval(() => {  
            document.removeEventListener("backbutton", this.exitApp, false); // 注销返回键  
            document.addEventListener("backbutton", this.onBackKeyDown, false); // 返回键  
            window.clearInterval(this.intervalID);  
        }, 3000);  
    }  ,
    exitApp(){  
        navigator.app.exitApp();  
    },  
    toNameCard(){
      this.$router.push({name:'AccountNameCard'})
    },
    toAsset(item){
      this.selectAsset(item)
      this.$router.push({name:'Asset'})
    },
    toTranscation(item){
      this.selectPayment(item)
      this.$router.push({name:'Transaction'})
    },

  },
  components: {
    Toolbar,
    Card,
    BottomNotice,
    Scroll,
  }
}
</script>


<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
  .infocard
    text-algin: center
    .title
      padding-top: 20px
      .avatar-wrapper
        text-align: center
        .avatar-back
          background: $primarycolor.gray
          height: 70px
          line-height: 70px
          display: inline-block
          width: 70px
          border-radius: 70px
          .avatar
            font-size: 38px
            color: $primarycolor.green
.name
  margin-top: 15px
  font-size: 20px
  text-align: center
  margin-bottom: 2px
.address
  text-align: center
  font-size: 16px
  color: $secondarycolor.font
  margin-bottom: 15px

.myassets-li
  padding-top: 10px
  padding-bottom: 10px
  /*border-bottom: 1px solid $secondarycolor.font*/
.myassets-li:last-child
  border-bottom: 0px;
.myassets
  .myassets-name
    font-size: 16px
  .myassets-issuer
    font-size: 14px
    color: $secondarycolor.font
.myassets-balance
  height: 100%
  line-height: 100%
  text-align: right
  padding-right: 5px
  vertical-align: middle
  font-size: 18px
  padding-top: 5%
  color: $primarycolor.green
.myassets-total
  font-size: 14px
  color: $secondarycolor.font
  display: inline-table
  height: 100%
  line-height:100%
  width: 100%
  padding-top: 20%
  text-align: right
  vertical-align: middle
.subtitle
  padding-left: 10px
  padding-top: 10px
  padding-bottom: 5px
  margin-bottom: 0px
  color: $secondarycolor.font
  font-size: 16px
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
