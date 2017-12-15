/**
 * 账户管理
 */
<template>
  <div class="page">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
      >
       <!-- <div class="right" slot="right-tool" @click="toAccount">
        <i class="material-icons">&#xE145;</i>
      </div> -->
      <v-btn icon slot='right-tool' @click="toAccount">
        <i class="material-icons">&#xE145;</i>
      </v-btn>

    </toolbar>
    <div class="content">
      <card padding="10px 10px" class="mycard">
        <div class="card-content" slot="card-content">
          <div class="account-row"  v-for="(item,index) in accounts" :key="index" @click.stop="info(item)">
            
            <v-layout class="account-wrapper" row wrap v-swiper=1 >
              <v-flex xs2>
                <div class="avatar">
                  <i class="iconfont icon-erweima"></i>
                </div>
              </v-flex>
              <v-flex xs4 class="name">
                {{item.name}}
              </v-flex>
              <v-flex xs4 class="address">
                <span class="label">{{item.address | miniaddress}}</span>
              </v-flex>
              <v-flex xs2 class="icons">
                <i class="material-icons"  v-if="item.address === account.address">&#xE876;</i>
              </v-flex>
            </v-layout>

            <div class="operate-box">
              <div class="del" @click.stop="del(item,index)">{{$t('Delete')}}</div>
            </div>
            
          </div>
        </div>
      </card>
    </div>
    <loading :show="working" :loading="working" :success="delok" :fail='delerror' />

     <div class="pwdSheetWrapper"v-if="showPwdSheet">
        <v-bottom-sheet  v-model="showPwdSheet"  dark>
          <div class="sheet-content">
            <div class="sheet-input">
              <v-text-field
                    name="password"
                    :label="$t('Account.Password')"
                    v-model="inpassword"
                    :append-icon="pwdvisible ? 'visibility' : 'visibility_off'"
                    :append-icon-cb="() => (pwdvisible = !pwdvisible)"
                    :type="pwdvisible ? 'text':'password'"
                    required dark
                  ></v-text-field>
            </div>
            <div  class="sheet-btns">
              <div class="sheet-btn" @click="canclePwdInput">{{$t('Button.Cancel')}}</div>
              <div class="sheet-btn" @click="okPwdInput">{{$t('Button.OK')}}</div>
            </div>
          </div>
        </v-bottom-sheet>
      </div>

  </div>
</template>

<script>
import Toolbar from '../../components/Toolbar'
import Card from '../../components/Card'
import Loading from '@/components/Loading'
import { mapState, mapActions} from 'vuex'
import {readAccountData} from '@/api/storage'
import { closeStreams, initStreams } from '@/streams'
export default {
  data(){
    return {
      title: 'ManageAccount',
      showbackicon: true,
      showmenuicon: false,

      working: false,
      delok: false,
      delerror: false,

      showPwdSheet: false,
      inpassword: null,
      pwdvisible: false,
      worktype: null,//取值，del
      workindex:null,
      workaccount: null,

    }
  },
  computed:{
    ...mapState({
      accounts: state => state.accounts.data,
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      app: state => state.app
    }),
  
  },
  mounted(){
    
  },
  methods: {
    ...mapActions({
      deleteAccount:'deleteAccount',
      cleanAccount: 'cleanAccount',
      changeAccountNoPassword: 'changeAccountNoPassword',
      getAccountInfo: 'getAccountInfo',
      getPayments: 'getPayments',

    }),
    back(){
      this.$router.back()
    },
    toAccount(){
      this.$router.push(`/wallet`)
    },
    info(account){
      this.$router.push({path: '/account/info', query: {address: account.address}});
    },
    del(account,index){
      this.workindex = index
      this.workaccount = account
      this.worktype = 'del'
      //要求输入密码才可以操作
      if(this.inpassword === null){
        this.showPwdSheet = true
        return
      }
      if(this.working)return
    },
    canclePwdInput(){
      this.showPwdSheet = false
      this.inpassword = null
    },
    okPwdInput(){
      if(this.inpassword ===  null)return
      this.working = true
      let selected = this.workaccount.address === this.account.address
      if('del' === this.worktype){
        readAccountData(this.workaccount.address,this.inpassword)
          .then(data=>{
            return this.deleteAccount({ index: this.workindex, account: this.workaccount})
          })
          .then(()=>{
            try{
              let doms = window.document.querySelectorAll('.account-wrapper')
                for(var i=0,n=doms.length;i<n;i++){
                  let element = doms[i]
                  element.style.transition = "0.3s"
                  element.style.marginLeft = 0 + "px"
                }
              }catch(error){
                console.error(error)
              }
            if(selected){
              this.cleanAccount()
            }
            this.$toasted.show(this.$t('Account.DeleteSuccess'))
            this.delok = true
            this.delerror = false
            this.inpassword = null
            this.showPwdSheet = false
            setTimeout(()=>{
              this.working = false
              if(this.accounts.length === 0){
                this.$router.push(`/wallet`)
              }else{
                //重新读取数据
                let address = this.account.address
                Promise.all([this.getAccountInfo(this.account.address)])//,this.getPayments(this.account.address)
                  .then(data=>{
                    //重新处理stream
                    try{
                      closeStreams()
                      initStreams(this.account.address)
                    }catch(err){
                      console.error(`stream error`)
                      console.error(err)
                    }
                  }).catch(err=>{
                    this.cleanAccount()
                    let msg = err.message
                    if(msg && 'Network Error' === msg){
                      this.$toasted.error(this.$t('Account.NetworkError'))
                      return
                    }
                  })
              }
            },1000)
          })
          .catch(err=>{
            this.showPwdSheet = false
            console.error(err)
            if(err === 'Error.PasswordWrong'){
              this.$toasted.error(this.$t('Error.PasswordWrong'))
            }else{
              this.$toasted.error(this.$t('Account.DeleteFailed'))
              this.inpassword = null
            }
            this.delok = true
            this.delerror = false
            setTimeout(()=>{
              this.working = false
            },1000)
          })

      }
      
      
        
    }
  },
  components: {
    Toolbar,
    Card,
    Loading,
  }
}
</script>


<style lang="stylus" scoped>
@require '../../stylus/color.styl'
.page
  background: $primarycolor.gray
  color: $primarycolor.font
  font-size: 16px
  .content
    padding: 10px 10px
.right
  .material-icons
    font-size: 36px
.card-content
  overflow: hidden
.account-row
  overflow: hidden
  position: relative
  border-bottom: 1px solid $secondarycolor.font
.account-row:last-child
  border-bottom: 0px
.account-wrapper
  position: relative
  z-index: 2
  height: 50px
  width: 100%
  padding-top: 5px
  padding-bottom: 5px
  background: $secondarycolor.gray
  .avatar
    width: 40px
    height: 40px
    background: $primarycolor.gray
    .iconfont
      color: $primarycolor.green
      font-size: 20px
  .name
    font-size: 16px
    height: 40px
    line-height: 40px
    padding-left: 10px
    text-overflow: clip
    word-break: break-all
  .address
    text-overflow: clip
    word-break: break-all
    .label
      height: 40px
      line-height: 40px
      width: 100%
      color: $secondarycolor.font
      text-align: right
      font-size: 16px
      padding-left: 5px
  .icons
    text-align: right
    color: $primarycolor.green
    font-size: 24px
    padding-top: 5px
    padding-right: 5px
.operate-box 
  position: absolute
  z-index: 1
  height: 100%
  right: 0
  top: 0
  display: flex
  .del
    display: flex
    justify-content: center
    align-items: center
    color: $primarycolor.font
    padding: 0 12px
    background-color: $secondarycolor.red
    border-right: 1px solid $secondarycolor.gray
.pwdSheetWrapper
  background: $secondarycolor.gray
  height: 140px
  position: fixed
  bottom: 0
  right: 0
  left: 0
.sheet-content
  padding: 10px 10px
.sheet-btns
  display: flex
  color: $primarycolor.green
  height: 50px
  line-height: 50px
  .sheet-btn
    flex: 1
    text-align: center
  
</style>

