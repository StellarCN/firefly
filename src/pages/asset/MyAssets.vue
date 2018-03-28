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
      <!-- <div class="right" slot="right-tool" @click="toAddAsset">
        <i class="material-icons">&#xE145;</i>
      </div> -->
      <v-btn icon slot='right-tool' @click="toAddAsset">
        <i class="material-icons">&#xE145;</i>
      </v-btn>
      <span slot="switch_password">{{$t('Account.Password')}}</span>
    </toolbar>
     <!--=======================================================-->
<div class="accountandtotalasset">
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
    </div>
    <div class="myassets_sort">
        <!-- <input  type="button" value="隐藏资产" class="myassets_sort_hidden" v-on:click="hiddenMyAssets(item)"/>  -->
        <input  type="button" :value="is_Flag === 'filter_zero'? $t('ShowZeroAsset'): $t('HideZeroAsset')" class="myassets_sort_hidden" @click="hiddenMyAssets"/> 
        <select  v-model="sort_flag" class="myassets_sort_select" >
          <option class="myassets_sort_byValue" value="none" >{{$t('DefaultSort')}}</option>
          <option class="myassets_sort_byValue" value="name">{{$t('SortByName')}}</option>
          <option class="myassets_sort_byValue" value="balance">{{$t('SortByAsset')}}</option>
        </select>
        
    </div>
    <scroll :refresh="refresh">
   
   <div class="content"> 
   
      

      <card padding="0px 0px" margin="0px 0px" class="myassets_infocard_thirdassets full-width">
        <div class="assets full-width" slot="card-content">
          <div class="assets-row" v-for="(item,index) in assets" :key="item.issuer+item.code" 
              v-touch="{
                left: () => selectedItem = index,
                right: () => selectedItem = null
              }"
            >
            <v-layout :class="'myassets-li third-li ' + ( selectedItem === index ? 'selected':'' )" row wrap @click.stop="toAsset(item)">
              <v-flex xs2 class="myassets-wrapper">
                <div class="icon-wrapper">
                  <i :class="'iconfont ' + assetIcon(item.code,item.issuer)"></i>
                </div>
              </v-flex>
            <v-flex xs4 class="myassets-wrapper">
              <div class="myassets">
                <div class="myassets-name">{{item.code}}</div>
                <div class="myassets-issuer" v-if="assethosts[item.issuer]">{{assethosts[item.issuer] }}</div>
                 <div class="myassets-issuer" v-else>{{item.issuer | miniaddress}}</div>
              </div>
            </v-flex>
            <v-flex xs6 class="myassets-wrapper">
              <div class="myassets-balance third">
                 <span class="balance">{{item.balance > 0 ? item.balance.toFixed(7) : 0}}</span>
                 <span class="label">{{$t('Total')}}</span> 
                 <br/>
                  <span>≈{{myassetstoxcn(item.balance)> 0 ? myassetstoxcn(item.balance).toFixed(7) : 0}}&nbsp;&nbsp;XCN</span>
              </div>
            </v-flex>
          </v-layout>
          <div class="myassets-operate-box">
            <div class="del" @click.stop="del(item)">{{$t('Delete')}}</div>
            <div class="send"@click.stop="send(item)">{{$t('Send')}}</div>
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
  
   <bottom-notice :show.sync="notice" :text="noticeText">    </bottom-notice>
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
//import { Decimal } from 'decimal.js'

//过滤0资产
const FLAG_FILTER_ZERO = "filter_zero";
//不过滤资产
const FLAG_DEFAULT = "none";
//按名称排序
const SORT_NAME = "name";
const SORT_BANLANCE = "balance";
const SORT_DEFAULT = "none";

export default {
  data(){
    return {
      title: 'Title.MyAssets',
      showbackicon: false,
      showmenuicon: true,
      noticeText: '',  
      notice: false,

      working:false,
      delok: false,
      delerror: false,

      needpwd: false,
      is_Flag: FLAG_DEFAULT,
      sort_flag: SORT_DEFAULT,
      price:[],

      selectedItem: null,
    }
  },
  mixins: [backbutton, loadaccount],
  computed:{
 /**
     * 尝试修改的资产总和
     */
    TotalSum: function() {
      let data = 0;
      for (var i = 0; i < this.balances.length; i++) {
        //  data=data+this.balances[i].balance
        // console.log(this.price);
        for (var j = 0; j < this.price.length; j++) {
        // for (var j = 0; j < this.price.length; j++) {
          if (
            this.price[j].code === this.balances[i].code &&
            this.price[j].issuer === this.balances[i].issuer
          ) {
            data =
              Number(this.price[j].price)*this.balances[i].balance + data;
          }
        }
      }
      return data;
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
        if (this.sort_flag === SORT_DEFAULT) {
          return data;
        }
      return data.sort((item1, item2) => {
        if (this.sort_flag === SORT_NAME) {
          return item1.code > item2.code ? 1 : -1;
        } else if (this.sort_flag === SORT_BANLANCE) {
          return item2.balance - item1.balance;
        }
      });


    }
  },
  watch: {
    sort_flag(){
      this.selectedItem = null
    }
  },
  mounted() {
    // axios promise
    getAssetPrice(this.balances)
      .then(response => {
        this.price = response.data;
      })
      .catch(err => {});
    this.$nextTick(() => {
      setTimeout(() => {
        if (this.notfunding) {
          this.noticeText = this.$t("Error.AccountNotFund");
          this.notice = true;
        }
      }, 3000);
    });
  },
  methods: {
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
      //TODO，发送授权金额为0
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
      this.load()
    },
    assetIcon(code,issuer){
      return COINS_ICON[code] || WORD_ICON[code.substring(0,1)] || DEFAULT_ICON
    }
   
  },
  components: {
    Toolbar,
    BottomNotice,
    Card,
    Scroll,
    TabBar,
    'loading': Loading,
  }
}

</script>


<style lang="stylus" scoped>
@require '~@/stylus/asset.styl'
@require '~@/stylus/settings.styl'
</style>

