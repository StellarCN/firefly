/**
 * 
 */
<template>
  <div class="page">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      ref="toolbar"
      >
      <!-- <v-btn icon slot='left-tool' @click="toThirdApps">
        <i class="material-icons">apps</i>
      </v-btn> -->
      <v-btn icon @click="showAccounts" slot="left-tool">
          <i class="material-icons font28">menu</i>
      </v-btn>

      <v-btn icon slot='right-tool' @click="toAddAsset">
        <i class="material-icons font28">&#xE145;</i>
      </v-btn>
      <span slot="switch_password">{{$t('Account.Password')}}</span>
    </toolbar>
    <accounts-nav :show="showaccountsview" @close="closeView"/>
     <!--=======================================================-->
<div class="accountandtotalasset">
  <scroll :refresh="reload">
    <div class="accountnameaddress"><!-- 试着改动的地方wdp-->
      <div class="flex-row">
        <div class="flex2 textcenter">
            <div class="avatar-wrapper">
                <span class="avatar-back" @click="toNameCard"><i class="iconfont icon-erweima avatar"></i></span>
            </div>
        </div>
        <div class="flex4">
            <div class="title">{{account.name}}</div>
            <div class="address">{{account.address | shortaddress}}</div>
        </div>
      </div>
    </div>
    <div id="TotalSum" class="myassets_totalSum" >
      <span class="myassets_TotalSumWord" >{{$t('TotalAssets')}}≈</span>
      <span>{{TotalSum.toFixed(7)}}</span><!-- 要改成资产数组数据的累加的和-->
      <span>XCN</span>
    </div>
  </scroll>
</div>

    <div class="flex-row">
      <div class="flex2">&nbsp;</div>
      <div class="flex1">
        <v-btn depressed flat color="primary" @click="hiddenMyAssets">
          <span class="no-upper">{{is_Flag === 'filter_zero'? $t('ShowZeroAsset'): $t('HideZeroAsset')}}</span>
        </v-btn>
      </div>
      <div class="flex1">
         <v-menu offset-y>
          <v-btn depressed flat color="primary" slot="activator">
            <span class="no-upper">{{$t(selectedSortItem.label)}}</span>
          </v-btn>
          <v-list>
            <v-list-tile v-for="item in sortItems" :key="item.key">
              <v-list-tile-title @click="chgSortItem(item)">{{ $t(item.label) }}</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu> 
      </div>
    </div>

    <scroll :refresh="refresh">
   
   <div class="content assets-xcontent"> 
      <card padding="0px 0px" margin="0px 0px" class="myassets_infocard_thirdassets full-width">
        <div class="assets full-width" slot="card-content">
          <div class="assets-row" v-for="(item,index) in assets" :key="item.issuer+item.code" 
              v-touch="{
                left: () => selectedItem = index,
                right: () => selectedItem = null
              }"
            >
            <v-layout class="myassets-li third-li" row wrap v-swiper=2.2 @click.stop="toAsset(item)">
              <v-flex xs2 class="myassets-wrapper">
                <div class="icon-wrapper">
                  <i :class="'iconfont ' + assetIcon(item.code,item.issuer)"></i>
                </div>
              </v-flex>
            <v-flex xs3 class="myassets-wrapper">
              <div class="myassets">
                <div class="myassets-name">{{item.code}}</div>
                <div class="myassets-issuer" v-if="item.home_domain">{{item.home_domain}}</div>
                <div class="myassets-issuer" v-else-if="assethosts[item.issuer]">{{assethosts[item.issuer] }}</div>
                <div class="myassets-issuer" v-else>{{item.issuer | miniaddress}}</div>
              </div>
            </v-flex>
            <v-flex xs7 class="myassets-wrapper">
              <div class="myassets-balance third">
                 <span class="balance">{{item.balanceStr}}</span>
                 <span class="label">{{$t('Total')}}</span> 
                 <br/>
                  <span v-if="item.total >=0">≈{{item.total > 0 ? item.total : 0}}&nbsp;XCN</span>
              </div>
            </v-flex>
          </v-layout>
          <div class="myassets-operate-box">
            <div class="del" @click.stop="del(item)">{{$t('Delete')}}</div>
            <div class="send" @click.stop="send(item)">{{$t('Send')}}</div>
            <div class="receive" @click.stop="receive(item)">{{$t('Receive')}}</div>
          </div>
          </div>
        </div>
      </card>
    </div>
  </scroll>

<!--   
  <tab-bar />
   -->
  
   <bottom-notice :show.sync="notice" :text="noticeText"></bottom-notice>

  <!-- <bottom-notice :show.sync="accountNotFundDlg" @update:show="closeAccountNotFoundDlg">
    <div slot>
      <div @click="toHelp">{{$t('Error.AccountNotFund')}}<v-icon color="primary">help</v-icon></div>
      <div @click="toKYC"><span class="underline">{{$t('kyc_active')}}</span></div>
      
    </div>
  </bottom-notice> --><!--v-if="accountNotFundDlg"-->
  <un-fund-notice  v-if="accountNotFundDlg" @close="closeAccountNotFoundDlg">></un-fund-notice>
  

   <loading :show="working" :loading="working" :success="delok" :fail='delerror' />
   <password-sheet v-if="needpwd" @cancel="cancelpwd" @ok="checkpwd" />
  </div>

</template>

<script>
import Toolbar from '@/components/Toolbar'
import { mapState, mapActions, mapGetters} from 'vuex'
import Card from '@/components/Card'
import BottomNotice from '@/components/BottomNotice'
import  { miniAddress } from '@/api/account'
import { isNativeAsset } from '@/api/assets'
import { COINS_ICON, FF_ICON, DEFAULT_ICON, WORD_ICON} from '@/api/gateways'
import Loading from '@/components/Loading'
import backbutton from '@/mixins/backbutton'
import loadaccount from '@/mixins/loadaccount'
import Scroll from '@/components/Scroll'
import TabBar from '@/components/TabBar'
import  defaultsDeep  from 'lodash/defaultsDeep'
import { getAssetPrice } from '@/api/fchain'
import { Decimal } from 'decimal.js'
import throttle from 'lodash/throttle'
import AccountsNav from '@/components/AccountsNav'
import {SET_PRICE_BY_API} from '@/store/modules/AppSettingStore'
//过滤0资产
const FLAG_FILTER_ZERO = "filter_zero";
//不过滤资产
const FLAG_DEFAULT = "none";
//按名称排序
const SORT_NAME = "name";
const SORT_BANLANCE = "balance";
const SORT_DEFAULT = "none";
import UnFundNotice from '@/components/UnFundNotice'

export default {
  data(){
    return {
      title: 'Title.MyAssets',
      showbackicon: false,
      showmenuicon: true,
      noticeText: '',  
      notice: false,

      showaccountsview: false,

      working:false,
      delok: false,
      delerror: false,

      needpwd: false,
      is_Flag: FLAG_DEFAULT,
      sort_flag: SORT_BANLANCE,
      price:[],

      _getPriceFn: null,

      selectedItem: null,

      sortItems: [{
          key: SORT_DEFAULT,
          label: 'DefaultSort'
        },{
          key: SORT_NAME,
          label: 'SortByName'
        },{
          key: SORT_BANLANCE,
          label: 'SortByAsset'
        }],
      selectedSortItem:{key: SORT_BANLANCE,
          label: 'SortByAsset'}
    }
  },
  mixins: [backbutton, loadaccount],
  computed:{
    ...mapState({
      priceState: state => state.app.price,
    }),
 /**
     * 尝试修改的资产总和
     */
    TotalSum() {
      let pricemap = this.prices
      let data = this.balances.map(item=>{
        let v = isNativeAsset(item) ? pricemap['XLM'] : pricemap[item.code + '-' + item.issuer]
        return v ? new Decimal(v.price || 0).times(item.balance) : new Decimal(0)
      })
      if(data.length === 0)return 0
      return data.reduce((t,i)=> t.add(i ? i : 0))
    },
    ...mapState({
      account: state => state.accounts.selectedAccount,
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      islogin: state => (state.accounts.accountData.seed ? true : false),
      assethosts: state => state.asset.assethosts,
      notfunding: state => state.account.account_not_funding
    }),
    ...mapGetters(["balances", "paymentsRecords", "reserve", "native"]),
    prices(){
      let obj = {}
      this.price.forEach(item=>{
        if(isNativeAsset(item)){
          obj[item.code] = Object.assign({}, item)
        }else{
          obj[item.code+'-'+item.issuer] = Object.assign({}, item)
        }
      })
      return obj;
    },
    assets() {
      if (!this.balances) return [];
      let data = this.balances
        .map(item => {
          return defaultsDeep({}, item, { price: 0 }); // new Decimal(item.balance).times(1).toFixed(7) })
        })
        .filter(item => {
          if (this.is_Flag === FLAG_FILTER_ZERO) {
            return item.balance > 0;
          } else {
            return true;
          }
        });
      //按照名称排序或者是按照资产排序,默认直接返回。
        if (this.sort_flag != SORT_DEFAULT) {        
          data = data.sort((item1, item2) => {
            if (this.sort_flag === SORT_NAME) {
              return item1.code > item2.code ? 1 : -1;
            } else if (this.sort_flag === SORT_BANLANCE) {
              return item2.balance - item1.balance;
            }
          });
        }
      //添加价格
      data.forEach(item=>{
        
        if(item.balance > 0){
          let key = item.code
          if(!isNativeAsset(item)) {
            key += '-' + item.issuer    
          }
          let p = this.prices[key]
          if(p){
            item.price = p.price
            item.home_domain = p.home_domain
            item.total = new Decimal(p.price || 0).times(Number(item.balance)).toFixed(7);
          }
        }else{
          item.total = 0
        }
      }) 
      return data.map(item=> {
          item.balanceStr = item.balance > 0 ? item.origin_balance: 0
          return item
      })
    }
  },
  watch: {
    sort_flag(){
      this.selectedItem = null
    },
    balances(){
      if(this.balances && this.balances.length>0 && this._getPriceFn){
        this._getPriceFn()
      }
    }
  },
  beforeMount () {
    this.price = this.priceState
  },
  mounted() {
    this._getPriceFn = throttle(()=>{
      //this.balances.filter(item=> Number(item.balance)>0
      if(this.balances && this.balances.length > 0){
        getAssetPrice(this.balances.map(item=> {
          return {code: item.code, issuer:item.issuer }
        }))
        .then(response => {
          this.price = response.data;
          this.$store.commit(SET_PRICE_BY_API, response.data)
        }).catch(err => {});
      }
     },60000)

    this.$nextTick(() => {
      
      // TODO 优化
      // setTimeout(() => {
      //   if (this.notfunding) {
      //     this.noticeText = this.$t("Error.AccountNotFund");
      //     this.notice = true;
      //   }
      // }, 3000);

    });
  },
  methods: {
    ...mapActions([
      'getAccountInfo',
      'cleanAccount',
      'updateAccount'
      ]),
    reload(){
      return this.getAccountInfo(this.account.address)
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
    /*
     *
     * 尝试修改的我不同的资产转换为xcn时的值
    */
    myassetstoxcn: function(mybalance) {
      let data = 0;
      for (var i = 0; i < this.balances.length; i++) {
        for (var j = 0; j < this.price.length; j++) {
          if (
            this.price[j].code === this.balances[i].code &&
            this.price[j].issuer === this.balances[i].issuer &&
            mybalance != 0
          ) {
            data = Number(this.price[j].price) * mybalance;
            return data;
          }
        }
      }
    },
    toNameCard() {
      this.$router.push({name: 'AccountNameCard'})
    },
    //隐藏资产---------------------------------------------------------------
    hiddenMyAssets() {
      this.is_Flag =
        this.is_Flag === FLAG_FILTER_ZERO ? FLAG_DEFAULT : FLAG_FILTER_ZERO;
      this.selectedItem = null
    },
    ...mapActions({
      selectAsset:'selectAsset',
      delTrust:'delTrust',
    }),
    toAddAsset(){
      //跳转到授权菜单
      this.$router.push({name:'AddAsset'})
    },
    toAsset(item){
      this.selectAsset(item)
      this.$router.push({name:'Asset'})
    },
    // 发送资产
    send(item){
      if(!this.islogin){
        this.$toasted.error(this.$t('Error.NoPassword'))
        this.$refs.toolbar.showPasswordLogin()
        return
      }
      this.selectAsset(item)
      this.$router.push({name: 'SendAsset'})
    },
    // 接收资产
    receive(item){
      this.selectAsset(item)
      this.$router.push({name: 'ReceiveAsset'})
    },
    // 删除授信
    del(item){
      if(!this.islogin){
        this.$toasted.error(this.$t('Error.NoPassword'))
        this.$refs.toolbar.showPasswordLogin()
        return
      }
      if(this.working)return
      if(Number(item.balance) > 0){
        this.$toasted.error(this.$t('Error.AssetNotZero'))
        return
      }
      this.working = true
      this.delTrust({
            seed: this.accountData.seed,
            address: this.account.address,
            code: item.code,
            issuer: item.issuer})
        .then(data=>{
          this.$toasted.show(this.$t('DeleteTrustSuccess'))
          this.delok = true
          this.delerror = false
          this.selectedItem = null
          setTimeout(()=>{
            this.working = false
          },1000)
           try{
              let doms = window.document.querySelectorAll('.myassets-li')
              for(var i=0,n=doms.length;i<n;i++){
                let element = doms[i]
                element.style.transition = "0.3s"
                element.style.marginLeft = 0 + "px"
              }
            }catch(error){
              console.error(error)
            }
        })
        .catch(err=>{
          this.$toasted.error(this.$t('Error.DeleteTrustError'))
          this.delok = false
          this.delerror = true
          setTimeout(()=>{
            this.working = false
          },1000)
        })
    },
    refresh(){
      return this.load()
    },
    assetIcon(code,issuer){
      return COINS_ICON[code] || WORD_ICON[code.substring(0,1)] || DEFAULT_ICON
    },
    chgSortItem(item){
      this.selectedSortItem = item;
      this.sort_flag = item.key; 
    },
    toThirdApps(){
      this.$router.push({name: 'Apps'})
    },
    toHelp(){
      // let t = new Date().getTime()
      let site = 'https://wallet.fchain.io/manual/#1'
      let title = this.$t('Menu.Help')
      this.$router.push({name: 'Help', params: { title, site }})
    },
    toKYC(){
      // let site = 'https://fchain.io/kyc/accounts/login/?next=/portal/'+'?'+Math.random()
      // let title = this.$t('kyc')
      this.$router.push({name: 'KYC'})
    },
    showAccounts(){
        this.showaccountsview = true
    },
    closeView(){
        this.showaccountsview = false
    },
   
  },
  components: {
    Toolbar,
    BottomNotice,
    Card,
    Scroll,
    TabBar,
    'loading': Loading,
    AccountsNav,
    UnFundNotice,
  }
}

</script>


<style lang="stylus" scoped>
@require '~@/stylus/asset.styl'
@require '~@/stylus/settings.styl'
</style>

