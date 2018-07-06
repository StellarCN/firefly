<template>
  <div class="page" dark v-bind:class="{hidebackground: scannerView}">
   <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      ref="toolbar"
      :shadow=false
      >
      <i class="material-icons" slot="right-tool" 
        @click="closeQRScanner"
        v-if="scannerView">&#xE5CD;</i>
   </toolbar> 
      
    <div class="menu-wrapper" v-if="!scannerView">
      <ul class="menu-ul">
        <li :class="'menu-li ' + (active==='deposit'?'active':'')" @click="switchMenu('deposit')">{{$t('DW.Deposit')}}</li>
        <li :class="'menu-li ' + (active==='withdraw'? 'active':'')" @click="switchMenu('withdraw')">{{$t('DW.Withdraw')}}</li>
      </ul>
    </div>

    <div class="content">
      <div class="pa-2">
        <div class="card-content" slot="card-content">
          <v-select
              v-bind:items="assets"
              v-model="selectedasset"
              :label="$t('Asset')"
              class="selectasset"
              item-value="id"
              item-text="code"
              dark
              :return-object="assetChoseReturnObject"
              @change="changeAsset"
               v-show="!scannerView"
            >
            <template slot="selection" slot-scope="data">
              <span class="asset-select-code show">{{data.item.code}}</span>
              <span class="asset-select-issuer show" v-if="assethosts[data.item.issuer]">{{assethosts[data.item.issuer]}}</span>
              <span class="asset-select-issuer show" v-else-if="assethosts[data.item.code]">{{assethosts[data.item.code]}}</span>
              <span class="asset-select-issuer show" v-else>{{data.item.issuer|miniaddress}}</span>

            </template>
            <template slot="item" slot-scope="data">
              <span class="asset-select-code">{{data.item.code}}</span>
              <span class="asset-select-issuer show" v-if="assethosts[data.item.issuer]">{{assethosts[data.item.issuer]}}</span>
              <span class="asset-select-issuer show" v-else-if="assethosts[data.item.code]">{{assethosts[data.item.code]}}</span>
              <span class="asset-select-issuer show" v-else>{{data.item.issuer|miniaddress}}</span>
            </template>
          </v-select>

          <div class="dwinfo" v-if="active==='deposit'">
            <div></div>
            <div class="deposit_error" v-if="error">
              <div v-if="error_msg">{{error_msg}}</div>
              <div v-else>{{$t('DW.Error.NoDepositServiceDesc')}}</div>
            </div>
            <div class="data" v-else>

              <div v-if="standardDepositData">
                <div class="label">{{$t('DW.DepositInfo')}}</div>
                <div v-if="Array.isArray(standardDepositData.how)">
                  <div class="deposit_info" v-for="(value,index) in standardDepositData.how" @click="copy(value)" :key="index">{{value}}</div>
                </div>
                <div class="deposit_info" @click="copy(standardDepositData.how)" v-else>{{standardDepositData.how}}</div>
                <div class="extra_info" v-if="standardDepositData.eta!= undefined">{{$t('DW.DepositInfo.eta',[standardDepositData.eta])}}</div>
                <div class="extra_info" v-if="standardDepositData.min_amount!=undefined">{{$t('DW.DepositInfo.min', [standardDepositData.min_amount])}}{{selectedasset.code}}</div>
                <div class="extra_info" v-if="standardDepositData.max_amount!=undefined">{{$t('DW.DepositInfo.max', [standardDepositData.max_amount])}}{{selectedasset.code}}</div>
                <div class="extra_info" v-if="standardDepositData.fee_fixed!=undefined">{{$t('DW.DepositInfo.feefixed', [standardDepositData.fee_fixed])}}{{selectedasset.code}}</div>
                <div class="extra_info" v-if="standardDepositData.fee_percent!=undefined">{{$t('DW.DepositInfo.feepercent', [standardDepositData.fee_percent])}}</div>
                <div v-if="Array.isArray(standardDepositData.extra_info)">
                  <div class="extra_info" v-for="(value,index) in standardDepositData.extra_info" :key="index" :id="index">{{value}}</div>
                </div>
                <div v-else>
                  <div class="extra_info">{{standardDepositData.extra_info}}</div>
                </div>
              </div>
 
              <div v-else>
                <div class="label" v-if="depositData.deposit_info">{{$t('DW.DepositInfo')}}</div>
                <div class="deposit_info" @click="copy(depositData.deposit_info)">{{depositData.deposit_info}}</div>
                <div class="extra_info">{{depositData.extra_info}}</div>
                <div class="extra_info">{{depositData.extra_info_cn}}</div>
              </div>

            </div>
          </div>

          <div class="dwinfo" v-if="active==='withdraw'">
            <withdraw-standard v-if="selectedasset && assetAccounts[selectedasset.issuer]"
              :homedomain="assetAccounts[selectedasset.issuer].home_domain"
              :asset="selectedasset"
              @showScanner="showScanner"
              @closeScanner="closeScanner"
              ref="withdraw"
            ></withdraw-standard>
            
          </div>

         
        </div>

      </div>

      <card margin="20px 0px" padding="10px 10px" class="withdraw_form_card" v-if="working">
        <div class="working" slot="card-content">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
      </card>

      <card margin="20px 0px" padding="0 0" class="withdraw_form_card"  v-if="!scannerView">
        <div class="working fundinginfo" slot="card-content">
          {{$t('FundingInfo')}}
        </div>
      </card>



    </div>
<!--   
    <tab-bar /> -->

   <bottom-notice :show.sync="notice" :text="noticeText">    </bottom-notice>

   <un-fund-notice v-if="accountNotFundDlg" @close="closeAccountNotFoundDlg">></un-fund-notice>
  
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import BottomNotice from '@/components/BottomNotice'
import { mapState, mapActions, mapGetters} from 'vuex'
import { queryDeposit,queryStandardDeposite } from '@/api/deposit'
import { getAssetWithdrawUrl,submitQuote } from '@/api/withdraw'
import { resolveByFedAddress, federation, resolveByFedDomain} from '@/api/federation'
import { send } from '@/api/account'
import { isNativeAsset } from '@/api/assets'
import WithdrawInput from '@/components/WithdrawInput'
import WithdrawStandard from '@/components/WithdrawStandard'
import TabBar from '@/components/TabBar'
import  defaultsDeep  from 'lodash/defaultsDeep'
import { NO_FUNDINS } from '@/api/gateways'
import UnFundNotice from '@/components/UnFundNotice'

export default {
  data(){
    return {
      title: 'DW.DepositAndWithdraw',
      active: 'deposit',
      working: false,
      selectedasset:{},
      assetChoseReturnObject: true,
      depositData:{},//充值
      standardDepositData:undefined,//标准的充值协议数据
      withdrawData:{},//提现
      error:null,
      error_msg: null,
      withdrawErr: false,//true或false
      active_withdraw_fed:null,
      withdrawFields:[],
      withdrawAccountId:"",
      showmenuicon: true,
      showbackicon: true,
      noticeText: '',  
      notice: false,
      withdrawurl: '',//提现的数据提交地址
      scannerView: false,
      accountNotFundDlg: false,
    }
  },
  computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      assetAccounts: state => state.asset.assets,
      assethosts: state => state.asset.assethosts,
      islogin: state => state.accounts.accountData.seed ? true:false,
      notfunding: state => state.account.account_not_funding
    }),
    ...mapGetters([
      'balances',
    ]),
    assets(){
       if(!this.balances)return []
       let data = []
       this.balances.forEach((element) => {
        let id = element.code+"-"+element.issuer
        if( !isNativeAsset(element) && NO_FUNDINS.indexOf(id) < 0 ){
          data.push(defaultsDeep({id}, element))
        }
      })
      return data
    },

  
  },
  mounted(){
    if(!this.islogin){
      this.$refs.toolbar.showPasswordLogin()
    }
    if(this.selectedasset.code){
      this.changeAsset(this.selectedasset)
    }
    setTimeout(()=>{
      if(this.notfunding){
        this.noticeText = this.$t('Error.AccountNotFund')
        this.notice = true
      }
    },3000)
  },
  methods: {
    ...mapActions({
      getAssetsAccount:'assetsAccount'
    }),
    copy(value){
      if(cordova.plugins.clipboard){
        cordova.plugins.clipboard.copy(value)
        this.$toasted.show(this.$t('CopySuccess'))
      }
    },
    back(){
      this.$router.push({name: 'Main'})
    },
    switchMenu(action){
      this.active = action
      if(this.selectedasset.code){
        this.changeAsset(this.selectedasset)
      }

    },
    changeAsset(item){
      this.working = true;
      this.error = null;
      this.depositData ={};
      this.standardDepositData = undefined;
      this.withdrawData = {};
      let info = this.assetAccounts[item.issuer]
      //根据home_dome查询数据
      if(info){
        if(this.active === 'deposit'){
          this.getDeposit(info.home_domain,item)
        }else{
          this.working = false
          this.$nextTick(()=>{
            if(this.$refs.withdraw){
              this.$refs.withdraw.resetStep()
            }
          })
         // this.getWithdraw(info.home_domain,item)
        }
      }else{
        this.getAssetsAccount(item.issuer)
          .then(data=>{
             if(this.active === 'deposit'){
                this.getDeposit(this.assetAccounts[item.issuer].home_domain,item)
              }else{
               // this.getWithdraw(this.assetAccounts[item.issuer].home_domain,item)
                this.working = false
                this.$nextTick(()=>{
                  if(this.$refs.withdraw){
                    this.$refs.withdraw.resetStep()
                  }
                })


              }
          })
          .catch(err=>{
              console.error(err)
              this.error = err
              this.$toasted.error(err)
              this.working = false
          })
      }

    },
    getDeposit(home_domain,asset){
      console.log('------asset ---')
      console.log(asset)
      //先按照标准协议去查询，然后再按照自定义的协议去查询 
      //let address = 'GCZEFX6VA7F57BCZ3YINU55ZBJ2ST6CCHZTFIDIW2C5QAIL4FOUVB6LZ'
      let address = this.account.address
      queryStandardDeposite(home_domain, asset.code, address)
        .then(response=>{
          let data = response.data
          if(data.error){
            throw new Error(data.error)
          }
          this.standardDepositData = data;
          this.working = false;
        }).catch(err=>{
          if(err.response && err.response.status === 501){
            this.error = err
            this.working = false
            this.error_msg = err.response.data.error
            return
          }
          console.log('not standard deposit service');
          queryDeposit(home_domain,asset, address)
            .then(response=>{
            console.log('-------------query deposit data------')
            let data = response.data
            if(data){
              this.depositData = data
            }else{
              this.error = this.$t('DW.Error.NoDepositService')
              this.$toasted.error(this.$t('DW.Error.NoDepositService'))
            }
            this.working = false
          })
          .catch(err=>{
            console.error(err)
            this.error = err
            this.$toasted.error(this.$t('DW.Error.NoDepositService'))
            this.working = false
          })
        })
        
    },
    getWithdraw(home_domain,asset){
      console.log(`---------get withdraw info ------`)
      console.log(home_domain)
      console.log(asset)
      getAssetWithdrawUrl(asset.code,asset.issuer)
        .then(data=>{
          this.withdrawErr = false
          console.log('-----getasset withdraw data ')
          console.log(data)
          this.withdrawData = data
          this.choseWithdrawService(0)
          //this.working = false
        })
        .catch(err=>{
          console.error(err)
          this.withdrawErr = true
          this.working = false
        })

    },
    choseWithdrawService(index){
      this.withdrawFields = []
      let services = this.withdrawData.services||[]
      let service = services[index]
      if(!service)return
      this.active_withdraw_fed  = service.federation_address
      //请求相应的信息
      let addressParts = this.active_withdraw_fed.split('*');
      let [,domain] = addressParts;
      federation(domain).then(
        data =>{
          console.log(data)
          this.withdrawurl = data['FEDERATION_SERVER']
          resolveByFedDomain(this.withdrawurl, domain, this.active_withdraw_fed)
            .then(data=>{
              this.withdrawErr = false
              console.log(`------------`)
              console.log(data)
              let extdata = data.extra_fields
              if(extdata){
                this.withdrawErr = false
                this.withdrawFields = extdata
                this.withdrawAccountId  = data.account_id
              }else{
                this.withdrawErr = false
              }
              this.working = false
            })
            .catch(err=>{
              console.error(err)
              this.withdrawErr = true
              this.working = false
            })// end of resolveByFedDomain
        }
      )
      .catch(err=>{
        console.error(err)
        this.withdrawErr = true
        this.working = false
        this.$toasted.error(err)
      })

    },
    withdrawDesc(item){
      console.log('desc----')
      console.log(item)
      let data = []
      for(var p in item){
        console.log(p)
        let i = p.indexOf('description')
        if(i>=0){
          data.push(item[p])
        }
      }
      console.log(data)
      return data
    },
    showScanner(){
      this.scannerView = true
      console.log('------------------show scanner------------')
      this.$store.commit('HIDE_TABBAR')
    },
    closeScanner(){
      this.scannerView = false
      this.$store.commit('SHOW_TABBAR')
    },
    closeQRScanner(){
      this.$refs.withdraw.doCloseQRScanner()
      this.$store.commit('SHOW_TABBAR')
    },
    closeAccountNotFoundDlg(){
      this.accountNotFundDlg = false
    },


   
  },
  components: {
    Toolbar,
    Card,
    BottomNotice,
    WithdrawInput,
    WithdrawStandard,
    TabBar,
    UnFundNotice,
  }
}
</script>


<style lang="stylus" scoped>
@require '../stylus/color.styl'
.page
  background: $primarycolor.gray
  color: $primarycolor.font
  padding-top: 0px
  // padding-top: constant(safe-area-inset-bottom)
  padding-bottom: 0px

  .content
    padding: 10px 10px
    padding-bottom: 40px

  .mytoolbar
    background: $primarycolor.green
    color: $primarycolor.font
    width: 100%
    height:56px
    line-height: 56px
    .back-icon
      float: left
      padding-left: 10px
      .material-icons
        font-size: 30px
        margin-top: 10px
    .mytitle
      width: 100%
      height:56px
      line-height: 56px
      text-align: center
      font-size: 20px
  .menu-wrapper
    background: $primarycolor.green
    height: 56px!important
    line-height: 56px!important
    margin-top: -1px!important
    .menu-ul
      width: 100%
      display: flex;
      justify-content: center;
      .menu-li
        float: left
        color: $primarycolor.font
        padding-left: 10px
        padding-right: 10px
        height: 55px
        line-height: 55px
        width: 42%
        text-align: center
        font-size: 20px
      .menu-li.active
        border-bottom: 2px solid $primarycolor.font
.selectasset
  color: $primarycolor.green
.asset-select-code
  font-size: 16px
.asset-select-issuer
  font-size: 12px
  padding-left: 10px
  padding-top: 1px
.dwinfo
  .data
    .label
      font-size: 16px
      color: $primarycolor.green
    .deposit_info
      font-size: 18px
      padding-top: 2px
      padding-bottom: 2px
      white-space: normal
      word-break: break-all
      word-wrap: break-word
    .extra_info
      color: $secondarycolor.font
  .noservice
    font-size: 16px
    color: $primarycolor.green
    padding-bottom: 2px
  .noservicedesc
    color: $secondarycolor.font
.working
  font-size: 16px
  text-align:center
  vertical-align: middle
  padding-top: 5px
  &.fundinginfo
    color: $secondarycolor.font
    text-align: left
  // .refreshimg
  //   display: block
  //   width: 200px
  //   height: 200px
  //   background: url(../assets/img/refresh-icon.png) no-repeat center center
  //   background-size: 60px 60px
  //   animation: rotate 2s infinite
  //   animation-timing-function: linear
  //   margin: auto auto

.hidebackground
  background: none
</style>

