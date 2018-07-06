// 发送资产
<template>
  <div class="page" v-bind:class="{hidebackground: showScanner}">
    <loading :show="onsend" :loading="sending" :success="sendsuccess" :fail='sendfail'
       :title="loadingTitle" :msg="loadingMsg" :closeable="sendfail" @close="hiddenLoadingView" />
    <toolbar :title="$t(title)"
      :showmenuicon="showmenuicon"
      :showbackicon="showbackicon"
      color="error"
      @goback="back"
      >
       <div class="right" slot="right-tool" v-if="!showContacts">
        <span class="toolbar-ico" @click="scan">
          <i class="material-icons font28" v-if="showScanner">&#xE5CD;</i>
          <i class="iconfont icon-erweima1 font28" v-else></i>
        </span>
      </div>
    </toolbar>

    <q-r-scan
      @finish="qrfinish"
      @close="qrclose"
      :validator="qrvalidator"
      v-if="showScanner"></q-r-scan>

    <div class="content" v-if="!showScanner && !showmemobook && !showContacts">
      <card>
       <div class="card-content" slot="card-content" v-if="!showContacts">
          <v-select
              v-bind:items="assets"
              v-model="selectedasset"
              :label="$t('Asset')"
              class="selectasset"
              item-value="id"
              item-text="code"
              required
              :color="'error'"
              :return-object="assetChoseReturnObject"
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
          <v-text-field
            name="amount"
            :label="$t('Amount')"
            v-model="amount"
            dark
            :color="'error'"
            :suffix="selectedasset.code"
            required
            type="text"
            :placeholder="( isNative(selectedasset) ? (''+(selectedasset.balance - reserve - 0.00001)): (''+selectedasset.balance) )|| '0'"
            @input="amountInput"

          ></v-text-field>
            <!-- <v-slider v-model="num"
                class="amount-slider"
                color="red"
                dark
                :max="asset.balance"
                @input="numInput"
                step=1
              ></v-slider> -->

          <v-text-field
            :label="$t('DestinationAddress')"
            append-icon="account_box"
            :append-icon-cb="contactsview"
            v-model="destination"
            class="selectasset"
            dark
            :color="'error'"
            required
            @input="destinationInput"
            hide-details
          ></v-text-field>

          <div class="real-dest">
            <span class="searching" v-if="fedSearching">{{$t('Working')}}</span>
            <span class="fedurl" v-else>{{realDestination}}</span>
          </div>
          <v-text-field
            v-if="iscontact"
            :label="$t('ContactAdd.name')"
            v-model="contactname"
            class="selectasset"
            dark
            disabled
            hide-details
          ></v-text-field>

          <v-layout row wrap style='height:65px'>
          <v-flex xs2 d-flex>
            <v-flex class="memoswitch">{{$t('Memo')}}</v-flex>
          </v-flex>
          <v-flex xs2 offset-xs8>
          <v-switch style="padding-left:25px;margin-top: 18px;"  v-model="memoswitch" dark error hide-details	color="error"/>
          </v-flex>
          </v-layout>
          <div v-if="memoswitch">
            <v-select v-bind:items="memotypes" v-model="memotype"
                      :label="$t('MemoType')" dark
                      v-on:input='onMemoTypeInput()'
                      :color="'error'"
            />
            <v-text-field
              name="memo"
              :label="$t('MemoContent')"
              v-model="memo"
              :color="'error'"
              dark
              type="text"
              append-icon="bookmark"
              :append-icon-cb="()=>{showmemobook=true}"
              :hint="$t('required')"
              required
              :disabled="this.memotype === null || this.memotype === 'None'"
            ></v-text-field>
          </div>
       </div>

      </card>
      
    <div style="flex: 1;"></div>
     <div class="btn-group" v-if="!showContacts">
        <!-- <v-btn class="error btn-send" @click.stop="send">{{$t('Send')}}</v-btn> -->
        <!-- wdp改动的地方 -->
        <v-btn class="error btn-send" @click.stop="change_is_sendconfim">{{$t('Send')}}</v-btn>
     </div>

    </div>

    <contact-book v-show="showContacts" :data="contactsdata" :close="()=>{showContacts=false}" :ok="selectContact"/>

    <contact-book v-show="showmemobook" :data="memobookdata" :close="()=>{showmemobook=false}" :ok="selectmemo"/>
      <div v-if="is_sendconfim" class="sendconfim_bottom_sheet">
        <v-bottom-sheet  v-model="is_sendconfim" dark>
            <v-container class="v_container">
              <v-layout>
                  <v-flex xs12>
                    <v-card-text class="sendconfimMsg">{{$t("DeterministicTransmission")}}</v-card-text>
                  </v-flex>
              </v-layout>
              <v-layout class="sendconfimAssetStyle"><!-- 资产 10.5 ETH(fchain.io)-->
                  <v-flex xs4>
                    <span class="sendconfimAsset">{{$t('Asset')}}</span>
                  </v-flex>
                  <v-flex xs8>
                    <span class="sendconfimAmount">{{amount}}</span>
                    <span class="sendconfimCode">{{selectedasset.code}}</span>
                    <span class="sendconfim_asset_domain">
                    <span v-if="assethosts[selectedasset.issuer]">({{assethosts[selectedasset.issuer]}})</span>
                    <span v-else-if="assethosts[selectedasset.code]">({{assethosts[selectedasset.code]}})</span>
                    <span class="asset-select-issuer show" v-else>({{selectedasset.issuer|miniaddress}})</span>
                    </span>
                  </v-flex>
              </v-layout>
              <v-layout class="sendconfimToStyle"><!--至 Ghv..3AE（小明） -->
                  <v-flex xs4>
                    <span class="sendconfim_To">{{$t("To")}}</span>
                  </v-flex>
                  <v-flex xs8>
                    <span v-if="destination!=null" class="sendconfim_asset_destination">{{destination|miniaddress}}</span>
                    <span v-else class="sendconfim_asset_destination">&nbsp;</span>
                    <span v-if="contactname!=null" class="sendconfimContactname">({{contactname|miniaddress}})</span>
                  </v-flex>
              </v-layout>
              <v-layout class="sendconfim_MemoAndType" v-if="this.memoswitch&&this.memotype!=null"><!--备注(text) goodluck -->
                  <v-flex xs4>
                    <span class="sendconfim_MemoTitle">{{$t('Memo')}}</span>
                    <span class="sendconfim_Memotype">({{memotype}})</span>
                  </v-flex>
                  <v-flex xs8>
                    <span v-if="this.memo!=null" class="sendconfim_Memo">{{memo|miniaddress}}</span>
                    <span v-else class="sendconfim_Memo">{{$t("Error.MemoIsRequired")}}</span>
                  </v-flex>
              </v-layout>
              <v-layout class="sendconfim_Btns"><!-- 确定 取消-->
                  <v-flex xs6>
                    <span @click.stop="send" class="sendconfimBtnOk">{{$t('Button.OK')}}</span>
                  </v-flex>
                  <v-flex xs6>
                    <span @click.stop="is_sendconfim=false" class="sendconfimBtnCancel">{{$t('Button.Cancel')}}</span>
                  </v-flex>
              </v-layout>
            </v-container>
        </v-bottom-sheet>
      </div>
  </div>
</template>

<script>
import QRScan from '@/components/QRScan'
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import Loading from '@/components/Loading'
import { mapState, mapActions, mapGetters} from 'vuex'
import * as accountapi from '@/api/account'
import  debounce  from 'lodash/debounce'
import { resolveByFedAddress } from '@/api/federation'
import ContactBook from '@/components/ContactBook'
import { xdrMsg,getXdrResultCode } from '@/api/xdr'
import { isNativeAsset } from '@/api/assets'

//TODO 校验输入数据不能超过最大值

export default {
  data(){
    return {
      title: 'Send',
      showmenuicon: false,
      showbackicon: true,
      showScanner: false,

      onsend: false,//是否显示发送
      sending: false,//发送中
      sendsuccess: false,//发送成功
      sendfail: false,

      showContacts: false,//是否显示通讯录地址
      contactsdata:['account','contact'],

      showmemobook: false,//是否显示myaddress

      memobookdata:['myaddress'],
      memoswitch: false, //show memo
      memotype:null,     // default memo type
      memo:null,         // default memo content
      memotypes:['None','Text','ID','Hash','Return'], //Memo types, if choose 'None', will clear data and close menu

      assetChoseReturnObject: true,
      selectedasset:{},

      destination:null,
      realDestination:null,//G开头的恒星地址，主要是为了如果输入联邦地址，可以支持查询对应的实际地址
      federationUrlResult:null,//如果destination是联邦地址，那么查询结果就是对应的值，结果为{stellar_address:'*',account_id:'G',memo_type:'',memo:''}
      fedSearching: false,

      amount:null,
      num:0,

      numStep: Number(0.0000001),

      iscontact: false,
      contactname: null,

      loadingTitle: null,
      loadingMsg: null,

      //wdp改动的地方3
      is_sendconfim:false,//是否显示发送确认的bottom-list

    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      //contacts: state=> [{name:'test',address:'GAR67PFI44VF6GPCLB5K7FHGT7WVKMS5434T4QHSKKPXUQ4YTST74ZVR'},{name:'test2',address:'GAR67PFI44VF6GPCLB5K7FHGT7WVKMS5434T4QHSKKPXUQ4YTST74ZVR'}],
      contacts: state => state.app.contacts,//accounts.accountData.contacts,
      asset: state => state.asset.selected,
      assethosts: state => state.asset.assethosts,
    }),
    ...mapGetters([
      'balances',
      'paymentsRecords',
      'reserve',
    ]),
    assets(){
      if(!this.balances)return []
      return this.balances.map(item=>{
        return Object.assign({id: item.code+"-"+item.issuer},item)
      })
    }

  },
  mounted(){
    this.selectedasset = Object.assign({id: this.asset.code+'-'+ this.asset.issuer}, this.asset)
    if (this.$route.params.destination) {
      console.log('set destination')
      this.destination = this.$route.params.destination
      if (this.$route.params.amount) {
        console.log('set amount')
        this.amount = this.$route.params.amount
      }
      if (this.$route.params.memo_type && this.$route.params.memo) {
        console.log('set memotype and memo')
        this.memoswitch = true
        this.memotype = this.$route.params.memo_type
        this.memo = this.$route.params.memo
      }
    }
  },
  created(){
    if(StatusBar){
      StatusBar.backgroundColorByHexString("#f35833");
      this.$store.commit('CHANGE_IOSSTATUSBAR_COLOR', 'error');
    }
  },
  beforeDestroy(){
    if(StatusBar){
      StatusBar.backgroundColorByHexString("#21ce90");
      this.$store.commit('CHANGE_IOSSTATUSBAR_COLOR', 'primary');
    }
  },
  methods: {
    ...mapActions({
      selectAsset:'selectAsset',
      delTrust:'delTrust',
      sendAsset: 'sendAsset',
      getAccountInfo: 'getAccountInfo',
    }),
    back(){
      this.$router.back()
    },
    onMemoTypeInput () {
      if(this.memotype === 'None'){
        this.memotype = null
        this.memo = ''
        this.memoswitch=false
      }
    },
    amountInput(value){
      console.log('amount input ' + value)
      this.num = Number(value)
      console.log('------------'+Number(value))
    },
    numInput(value){
      console.log('num input '+value)
      this.amount = ''+value
    },
    scan(){
      //只能识别stargazer类似的格式数据
      this.showScanner = !this.showScanner
    },
    qrvalidator(text){
      if(!text)return false
      if(typeof text === 'undefined')return false
      //1. 内容是否为地址
      let valide = accountapi.isValidateAddress(text)
      if(valide){
        this.destination = text
        return true
      }
      //2. 内容是否为接收二维码
      try {
        text = text.trim()
        let data = JSON.parse(text)
        if (data.stellar) {
          if (data.stellar.payment) {
            let payment = data.stellar.payment
            if (payment.asset) {
              this.selectedasset = payment.asset
            } else {
              this.selectedasset = {code: 'XLM'}
            }
            //根据当前资产选择
            if(this.selectedasset.code){
              let sn = isNativeAsset(this.selectedasset)
              let as = this.assets.filter(item=>{
                if(sn){
                  return isNativeAsset(item)
                }else{
                  return this.selectedasset.code === item.code && this.selectedasset.issuer === item.issuer
                }
              })
              if(as.length>0){
                this.selectedasset = as[0]
              }
            }
            this.destination = payment.destination
            this.amount = payment.amount
            let memo = payment.memo
            if (memo) {
              this.memotype = memo.type
              this.memo = memo.value
            }
            return true
          }
          if (data.stellar.account.id) {
            this.destination = data.stellar.account.id
            return true
          }
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },
    qrfinish(result){
      this.showScanner = false
      //this.secretkey = result
    },
    qrclose(){
      this.showScanner = false
    },
    //打开显示通讯录界面，让用户可以手动输入
    contactsview(){
      this.showContacts = true
    },
    selectContact(type,contact){//选中通讯录某条记录
      this.showContacts = false
      this.destination = contact.address
      if(contact.memotype || contact.memo){
        this.memoswitch = true
      }
      if(contact.memotype){
        this.memotype = contact.memotype
      }
      if(contact.memo){
        this.memo = contact.memo
      }
      this.iscontact = true
      this.contactname = contact.name

    },
    selectmemo(type,data){
      this.showmemobook = false
      this.memo = data.address
    },

    // 发送资产
    send(){
      let seed = this.accountData.seed
      if(!seed){
        this.$toasted.error(this.$t('Error.NoPassword'))
        return
      }
      if(!this.destination){
        this.$toasted.error(this.$t('Error.DestinationIsRequired'))
        return
      }
      if(this.amount === null || this.amount === 0 || this.amount === '' ){
        this.$toasted.error(this.$t('Error.AmountIsRequired'))
        return
      }
      if(this.memoswitch){
        if(!this.memotype || !this.memo){
          this.$toasted.error(this.$t('Error.MemoIsRequired'))
          return
        }
        if(!accountapi.isValidMemo(this.memotype, this.memo)) {
          this.$toasted.error(this.$t('Error.MemoIsInvalid'))
          return
        }
      }


      let dest = this.destination
      if(this.destination.indexOf("*")>0){
        dest = this.realDestination
      }
      let valide = accountapi.isValidateAddress(dest)
      if(!valide){
        this.$toasted.error(this.$t('Error.UnValidatedAddress'))
        return
      }

      let params = {
        seed,
        address: this.account.address,
        target: dest,
        asset: {code: this.selectedasset.code, issuer: this.selectedasset.issuer},
        amount: this.amount,
        memo_type:  this.memoswitch ? this.memotype : null,
        memo_value: this.memoswitch ? this.memo : null
      }
      console.log(params)
      this.onsend = true
      this.sending = true
      this.loadingTitle = null
      this.loadingMsg = null
      this.sendAsset(params)
        .then(response=>{
          this.sending = false
          this.sendsuccess = true
          this.realDestination = null
          this.loadingTitle = this.$t('SendAssetSuccess')
          try{
            this.getAccountInfo(this.account.address)
            setTimeout(()=>{
              this.onsend=false
              this.sendsuccess = false //
              //this.$router.back()
              this.cleanData()
              },3000)
          }catch(err){
            console.error(err)
          }
          
        })
        .catch(err=>{
          console.log(err)
          this.sending = false
          this.sendfail = true
          //this.realDestination = null
          this.loadingTitle = this.$t('Error.SendAssetFail')
          try{
            let msg = getXdrResultCode(err)
            if(msg){
              this.loadingMsg = this.$t(msg)
            }else{
              this.loadingMsg = this.$t(err.message)
            }
          }catch(err){
            console.error(err)
            this.loadingMsg = err.message
          }

        })

    },
    // hideLoading(){
    //   setTimeout(()=>{
    //       this.sendsuccess =false
    //       this.sending = false
    //       this.onsend = false
    //     },3000)
    // },


    //wdp改动的地方2
    change_is_sendconfim(){
      console.log("clicked")
      this.is_sendconfim=true
      console.log(this.contactname)
    },
    setDataByFed(data){
      this.fedSearching = false
      this.federationUrlResult = data
      this.realDestination = data.account_id
      if(data.memo_type){
        this.memotype = data.memo_type
      }
      if(data.memo){
        this.memo = data.memo
      }
    },

    destinationInput: debounce(function(val) {//必须是普通function，不能是箭头函数
      if(this.iscontact){
        this.iscontact = false
      }
        //根据当前用户的输入内容，请求联邦地址，获取对应的实际address，从而获取对应的实际账户地址（暂时不支持提现部分协议）
        if(val && val.indexOf('*') > 0){
          this.fedSearching = true
          resolveByFedAddress(val)
            .then(data=>{
             this.setDataByFed(data)
            })
            .catch(err=>{
              this.fedSearching = false
              this.$toasted.error(err)
            })
        }
        if(val && val.indexOf('*') === -1) {
          this.fedSearching = false
          this.realDestination = null
        }

      }, 2000),
    isNative(asset){
      return isNativeAsset(asset)
    },
    hiddenLoadingView(){
      this.onsend=false
      this.sendfail = false
      this.loadingTitle = null
      this.loadingMsg = null
    },
    cleanData(){
      this.memoswitch = false
      this.memotype = null
      this.memo = null
      this.amount = null
      this.num = 0
      this.destination = null
      this.realDestination = null
      this.federationUrlResult = null
      this.is_sendconfim = false
    
    }
  },
  components: {
    Toolbar,
    QRScan,
    Card,
    Loading,
    ContactBook,
  }


}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl'

.sendconfim_bottom_sheet
  background:$secondarycolor.gray
  height:400px
  height: calc(400px +  constant(safe-area-inset-bottom))
  height: calc(400px +  env(safe-area-inset-bottom))
  position:fixed
  right:0
  left:0
  bottom: 0
  padding-bottom: 0
  padding-bottom: constant(safe-area-inset-bottom)
  padding-bottom: env(safe-area-inset-bottom)
  opacity:1
.v_container
  padding:0px 0px
.sendconfimMsg
  background:$secondarycolor.gray
  font-size:20px
  color:$primarycolor.red
  text-align:center

.sendconfimAssetStyle
  background:$secondarycolor.gray
  padding-left:8px
  padding-bottom:10px
  border:none
.sendconfimAsset
  font-size:18px
  color:$secondarycolor.font
.sendconfimAmount
  font-size:18px
  color:$primarycolor.red
  word-break:break-all
.sendconfimCode
  font-size:16px
  color:$secondarycolor.font
.sendconfim_asset_domain
  text-overflow:ellipsis
  overflow:hidden
  font-size:16px
  color:$secondarycolor.font

.sendconfimToStyle
  background:$secondarycolor.gray
  padding-left:8px
  padding:10px 0px 10px 8px
  border:none
.sendconfim_To
  font-size:18px
  color:$secondarycolor.font
.sendconfim_asset_destination
  font-size:18px
  color:$primarycolor.font
.sendconfimContactname
  font-size:18px
  color:$primarycolor.font

.sendconfim_MemoAndType
  background:$secondarycolor.gray
  padding-left:8px
  padding-top:10px
  padding-bottom:10px
  border:none
.sendconfim_MemoTitle
  font-size:18px
  color:$secondarycolor.font
  padding-right:0px
.sendconfim_Memotype
  font-size:16px
  color:$secondarycolor.font
  padding-left:0px
  padding-right:0px
.sendconfim_Memo
  font-size:18px
  color:$primarycolor.font

.sendconfim_Btns
  background:$secondarycolor.gray
  padding:10px 0px 20px 0px
  border:none
.sendconfimBtnOk
  color:$primarycolor.red
  font-size:18px
  text-align:center
  padding-left:40%
.sendconfimBtnCancel
  color:$primarycolor.red
  font-size:18px
  text-align:center
  padding-left:30%
  

.content
  //top: 48px
  //bottom: 0
  //left: 0
  //right: 0
  background: $primarycolor.gray
  color: $primarycolor.font
  display flex
  flex-direction column
  //min-height calc(100vh - 48px)
.right
  .toolbar-ico
    .iconfont
      font-size: 24px
      color: $primarycolor.font
    .material-icons
      font-size: 24px
      color: $primarycolor.font
.card-content
  padding: 8px 8px
  .label
    font-size: 16px
    color: $secondarycolor.font
    padding-top: 5px
    padding-bottom: 5px
  .asset.label
    color: $primarycolor.green
  .value
    display: block
    font-size: 16px
    color: $primarycolor.font
    width: 100%
    white-space:normal
    word-wrap: break-word
    word-break: break-all
.selectasset
  color: $primarycolor.font
.asset-select-code
  font-size: 16px
.asset-select-issuer
  font-size: 14px
  padding-left: 10px
.amount-slider
  color: $primarycolor.red
  padding-right: 0px
  padding-top:0px
.btn-group
  margin-top: 20px
  .btn-send
    width: 100%
    height: 36px
    margin:0 0

.contacts-ul
  padding-left: 0px
  width: 100%
  .contacts-li
    padding-top: 5px
    padding-bottom: 2px
    border-bottom: 1px solid $secondarycolor.font
    width: 100%
    .name-address
      width: 100%
      display: inline-block
      .name
        font-size: 20px
        color: $primarycolor.green
        padding-left: 5px
        display: block
        float: left
        height: 30px
        line-height: 30px
        width: 40%
      .address
        color: $secondarycolor.font
        text-align: right
        padding-right: 10px
        height: 30px
        line-height: 30px
        display: block
        float: right
        width: 50%
  .contacts-li:last-child
    border-bottom: 0px
.real-dest
  font-size: 16px
  white-space:normal
  word-wrap: break-word
  word-break: break-all
  color: $secondarycolor.font

.memoswitch
  font-size:16px
  align-self center
  color  #f35833
.hidebackground
  background none



</style>
