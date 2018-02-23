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
    <div class="content">
      <card padding="0px 0px" class="infocard">
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
          <div class="assets-row" v-for="item in assets" :key="item.code">
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
                 <span class="balance">{{Number(item.balance.toFixed(7))}}</span>
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

   <bottom-notice :show.sync="notice" :text="noticeText">    </bottom-notice>
   <loading :show="working" :loading="working" :success="delok" :fail='delerror' />
   <password-sheet v-if="needpwd" @cancel="cancelpwd" @ok="checkpwd" />
  </div>
</template>

<script>
import Toolbar from '../components/Toolbar'
import { mapState, mapActions, mapGetters} from 'vuex'
import Card from '../components/Card'
import BottomNotice from '@/components/BottomNotice'
import  { miniAddress } from '@/api/account'
import Loading from '@/components/Loading'
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
  computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      islogin: state => state.accounts.accountData.seed ? true:false,
      assethosts: state => state.asset.assethosts,
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
        if(element.code != 'XLM'){
          data.push(Object.assign({}, element))
        }
      })
      return data
    },
  
  },
  mounted(){
   this.$nextTick(()=>{
     setTimeout(()=>{
        if(!this.balances.length){
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
      this.$router.push(`/assets/add`)
    },
    toAsset(item){
      this.selectAsset(item)
      this.$router.push(`/asset`)
    },
    // 发送资产
    send(item){
      if(!this.islogin){
        this.$toasted.error(this.$t('Error.NoPassword'))
        this.$refs.toolbar.showPasswordLogin()
        return
      }
      this.selectAsset(item)
      this.$router.push(`/sendasset`)
    },
    // 接收资产
    receive(item){
      this.selectAsset(item)
      this.$router.push(`/receiveasset`)
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
   
  },
  components: {
    Toolbar,
    BottomNotice,
    Card,
    'loading': Loading,
  }
}
</script>


<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.page
  background: $primarycolor.gray
.content
  color: $primarycolor.font
  font-size: 16px
  padding: 10px 10px
.right
  .material-icons
    font-size: 24px
.assets
.assets-row
  overflow: hidden
  position: relative
  .myassets-li
    position: relative
    z-index: 2
    padding: 5px 5px
    background: $secondarycolor.gray
    width: 100%
    .myassets-wrapper
      .myassets
        .myassets-name
          font-size: 16px
        .myassets-issuer
          color: $secondarycolor.font
          font-size: 14px
      .myassets-balance
        text-align: right
        color: $secondarycolor.font
        .balance
          color: $primarycolor.green
          font-size: 16px
          padding-right: 10px
      .myassets-reserve
        text-align: right  
        color: $secondarycolor.font
        .balance
          padding-right: 10px
.myassets-balance.third
  height: 100%
  padding-top: 10px
.assets-row
  border-bottom: 1px solid $secondarycolor.font
.assets-row:last-child
  border-bottom: 0px
.operate-box 
  position: absolute
  z-index: 1
  height: 100%
  right: 0
  top: 0
  display: flex
  .send
  .receive
  .del
    display: flex
    justify-content: center
    align-items: center
    background-color: $secondarycolor.green
    color: $primarycolor.font
    padding: 0 12px
  .receive
    border-left: 1px solid $secondarycolor.gray
  .del
    background-color: $secondarycolor.red
    border-right: 1px solid $secondarycolor.gray

</style>

