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
    <scroll :refresh="refresh">
    <div class="content">
      <card padding="0px 0px" class="">
        <div class="assets" slot="card-content" v-if="balances && balances.length>0">
          <v-layout class="myassets-li" row wrap v-swiper=2 @click.stop="toAsset(native)">
            <v-flex xs4 class="myassets-wrapper">
              <div class="myassets">
                <div class="myassets-name">{{native.code}}</div>
                <div class="myassets-issuer">{{native.issuer}}</div>
              </div>
            </v-flex>
            <v-flex xs8 class="myassets-wrapper">
              <div class="myassets-balance">
                 <span class="balance">{{native.balance}}</span>
                 <span class="label">{{$t('Total')}}</span>
              </div>
              <div class="myassets-reserve">
                <span class="balance">{{reserve}}</span>
                <span class="label">{{$t('Reserve')}}</span>
              </div>
            </v-flex>
          </v-layout>
          <div class="operate-box">
            <div class="send" @click.stop="send(native)">{{$t('Send')}}</div>
            <div class="receive" @click.stop="receive(native)">{{$t('Receive')}}</div>
          </div>
        </div>
      </card>

      <card padding="0px 0px" margin="20px 0px" class="infocard thirdassets">
        <div class="assets" slot="card-content">
          <div class="assets-row" v-for="item in assets" :key="item.issuer||item.code">
            <v-layout class="myassets-li third-li" row wrap v-swiper=3 @click.stop="toAsset(item)">
            <v-flex xs4 class="myassets-wrapper">
              <div class="myassets">
                <div class="myassets-name">{{item.code}}</div>
                <div class="myassets-issuer" v-if="assethosts[item.issuer]">{{assethosts[item.issuer] }}</div>
                 <div class="myassets-issuer" v-else>{{item.issuer | miniaddress}}</div>
              </div>
            </v-flex>
            <v-flex xs8 class="myassets-wrapper">
              <div class="myassets-balance third">
                 <span class="balance">{{item.balance > 0 ? item.balance.toFixed(7) : 0}}</span>
                 <span class="label">{{$t('Total')}}</span>
              </div>
            </v-flex>
          </v-layout>
          <div class="operate-box">
            <div class="del" @click.stop="del(item)">{{$t('Delete')}}</div>
            <div class="send"@click.stop="send(item)">{{$t('Send')}}</div>
            <div class="receive" @click.stop="receive(item)">{{$t('Receive')}}</div>
          </div>
          </div>
        </div>
      </card>
    </div>
    </scroll>

  <tab-bar/>
  
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
import Loading from '@/components/Loading'
import backbutton from '@/mixins/backbutton'
import loadaccount from '@/mixins/loadaccount'
import Scroll from '@/components/Scroll'
import TabBar from '@/components/TabBar'
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

    }
  },
  mixins: [backbutton, loadaccount],
  computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      islogin: state => state.accounts.accountData.seed ? true:false,
      assethosts: state => state.asset.assethosts,
      notfunding: state => state.account.account_not_funding
    }),
    ...mapGetters([
      'balances',
      'paymentsRecords',
      'reserve',
      'native'
    ]),
    assets(){
       if(!this.balances)return []
       let data = []
       this.balances.forEach((element) => {
        if(!isNativeAsset(element)){
          data.push(Object.assign({}, element))
        }
      })
      return data
    },
  
  },
  mounted(){
   this.$nextTick(()=>{
     setTimeout(()=>{
        if(this.notfunding){
          this.noticeText = this.$t('Error.AccountNotFund')
          this.notice = true
        }
     },3000)
   })
  },
  methods: {
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
</style>

