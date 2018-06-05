<template>
    <div>
        <scroll :refresh="onRefresh">
            <div class="templatestyle">
                <v-flex xs12 v-for="item in effectsData" :key="item.id+item.paging_token" >
                    <v-flex xs12 v-if="item.type=='account_credited'" class="content_style">
                        <v-layout>
                            <v-flex xs7 class="itemtype_account_credited">{{$t("AccountCredited")}}</v-flex>
                            <v-flex xs5 class="itemstylef_account_credited" v-if="item.tx!=undefined&&item.tx.length!=0" >TX:{{getEffectsDataMiniAddress(item.tx)}}</v-flex>
                        </v-layout>
                        <v-layout>
                            <v-flex xs7 class="itemtime_account_credited" >{{getlocaltime(item.time)}}</v-flex>
                            <v-flex xs5 class="itemstyleth_account_credited">{{$t("AssetCode")}}：{{item.asset_type==="native"?"XLM":item.asset_type}}</v-flex>
                        </v-layout>
                        <v-layout>
                            <v-flex xs7 class="itemstyleo_account_credited">{{$t("SourceAccount")}}:{{getEffectsDataMiniAddress(item.account)}}</v-flex>
                            <v-flex xs5 class="itemstylet_account_credited">{{$t("Amount")}}：+{{item.amount}}</v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.type=='trade'" xs12 class="content_style">
                        <v-layout xs12>
                            <v-flex xs7 class="itemtype_trade">{{$t("Trade")}}</v-flex>
                            <v-flex xs5 class="itemstylef_trade" v-if="item.tx!=undefined&&item.tx.length!=0">Tx:{{getEffectsDataMiniAddress(item.tx)}}</v-flex>
                        </v-layout>
                        <v-layout xs12>
                            <v-flex xs6 class="itemtime_trade">{{item.time}}</v-flex>
                        </v-layout>
                        <v-layout xs12>
                                <v-flex xs5 class="itemstyleo_trade">+{{item.bought_amount}}{{item.bought_asset_code}}</v-flex>
                                <v-flex xs1 class="itemstylet_trade">/</v-flex>    
                                <v-flex xs6 class="itemstyleth_trade" >-{{item.sold_amount}}{{item.sold_asset_type==="native"?"XLM":item.sold_asset_type}}</v-flex>    
                        </v-layout>
                          <v-layout>
                        </v-layout>                             
                    </v-flex>
                    <v-flex v-if="item.type=='trustline_created'" xs12 class="content_style">
                        <v-layout xs12>
                            <v-flex xs7 class="itemtype_trustline_c">{{$t("CreateTrustLine")}}</v-flex>
                            <v-flex xs5 class="itemstylef_trustline_c" v-if="item.tx!=undefined&&item.tx.length!=0">TX:{{getEffectsDataMiniAddress(item.tx)}}</v-flex>
                        </v-layout>
                        <v-layout>
                            <v-flex xs7 class="itemtime_trustline_c">{{getlocaltime(item.time,item.tx)}}</v-flex>
                            <v-flex xs5 class="itemstyleth_trustline_c">{{$t("AssetCode")}}：{{item.asset_code}}</v-flex>
                        </v-layout>
                        <v-layout>
                            <v-flex xs12 class="itemstylet_trustline_c">{{$t("AssetIssuer")}}:&nbsp;{{getEffectsDataMiniAddress(item.asset_issuer)}}</v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.type=='trustline_removed'" xs12 class="content_style">
                        <v-layout xs12>
                            <v-flex xs7 class="itemtype_trustline_r">{{$t("RemoveTrustLine")}}</v-flex>
                            <v-flex xs5 class="itemstylef_trustline_r" v-if="item.tx!=undefined&&item.tx.length!=0">TX:{{getEffectsDataMiniAddress(item.tx)}}</v-flex>
                        </v-layout>
                        <v-layout xs12>
                            <v-flex xs7 class="itemtime_trustline_r">{{getlocaltime(item.time,item.tx)}}</v-flex>
                            <v-flex xs5 class="itemstyleth_trustline_r">{{$t("AssetCode")}}：{{item.asset_code}}</v-flex> 
                        </v-layout>
                        <v-layout>
                            <v-flex xs12 class="itemstylet_trustline_r">{{$t("AssetIssuer")}}:{{getEffectsDataMiniAddress(item.asset_issuer)}}</v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.type=='account_debited'" xs12 class="content_style">
                        <v-layout xs12>
                            <v-flex xs7 class="itemtype_account_debited">{{$t("AccountDebited")}}</v-flex>
                            <v-flex xs5 class="itemstylef_account_debited" v-if="item.tx!=undefined&&item.tx.length!=0">TX:{{getEffectsDataMiniAddress(item.tx)}}</v-flex>
                        </v-layout>
                        <v-layout>
                            <v-flex xs7 class="itemtime_account_debited">{{getlocaltime(item.time)}}</v-flex>
                            <v-flex xs5 class="itemstyleth_account_debited">{{$t("AssetCode")}}：{{item.asset_type==="native"?"XLM":item.asset_type}}</v-flex>
                        </v-layout>
                        <v-layout>
                            <v-flex xs7 class="itemstyleo_account_debited">{{$t("SourceAccount")}}：{{getEffectsDataMiniAddress(item.account)}}</v-flex>
                            <v-flex xs5 class="itemstylet_account_debited">{{$t("Amount")}}：-{{item.amount}}</v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.type=='signer_updated'" xs12 class="content_style">
                        <v-layout xs12>
                            <v-flex xs6 class="itemtype">{{$t("SignerUpdated")}}</v-flex>
                            <v-flex xs6 class="itemtx_signer_updated" v-if="item.tx!=undefined&&item.tx.length!=0"> {{item.tx}}</v-flex>
                        </v-layout>
                        <v-layout>
                            <v-flex xs12 class="itemtime">{{getlocaltime(item.time)}}</v-flex>
                        </v-layout>
                        <v-layout xs12>
                            <v-flex xs5 class="itemstyleo">{{getEffectsDataMiniAddress(item.account)}}</v-flex>
                            <v-flex xs5 class="itemstylet">{{item.weight}}</v-flex>
                            <v-flex xs2 class="itemstyleth">{{item.type_i}}</v-flex>
                        </v-layout>
                          <v-layout>
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.type=='signer_created'" xs12 class="content_style">
                        <v-layout xs12>
                            <v-flex xs7 class="itemtype_signer_created">{{$t("SignerCreated")}}</v-flex>
                            <v-flex xs5 class="itemstyleo_signer_created" v-if="item.tx!=undefined&&item.tx.length!=0">Tx:{{getEffectsDataMiniAddress(item.tx)}}</v-flex>
                        </v-layout>
                        <v-layout xs12>
                            <v-flex xs12 class="itemtime_signer_created">{{getlocaltime(item.time)}}</v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.type=='account_home_domain_updated'" xs12 class="content_style">
                        <v-layout xs12>
                            <v-flex xs7 class="itemtype_ahdu">{{$t("AccountHomeDomainUpdated")}}</v-flex>
                            <v-flex xs5 class="itemstyleo_ahdu" v-if="item.tx!=undefined&&item.tx.length!=0">TX:{{getEffectsDataMiniAddress(item.tx)}}</v-flex>
                        </v-layout>
                        <v-layout>
                            <v-flex xs12 class="itemtime_ahdu">{{getlocaltime(item.time)}}</v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.type=='account_inflation_destination_updated'" xs12 class="content_style">
                        <v-layout xs12>
                            <v-flex xs7 class="itemtype_aidu">{{$t("AccountInflationDestinationUpdated")}}</v-flex>
                            <v-flex xs5 class="itemstyleo_aidu" v-if="item.tx!=undefined&&item.tx.length!=0">TX:{{getEffectsDataMiniAddress(item.tx)}}</v-flex>
                        </v-layout>
                        <v-layout>
                            <v-flex xs12 class="itemtime_aidu">{{getlocaltime(item.time)}}</v-flex>
                        </v-layout>
                          <v-layout>
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.type=='account_created'" xs12 class="content_style">
                        <v-layout xs12>
                            <v-flex xs7 class="itemtype_account_created">{{$t("AccountCreated")}}</v-flex>
                            <v-flex xs5 class="itemstyleo_account_created" v-if="item.tx!=undefined&&item.tx.length!=0">TX:{{getEffectsDataMiniAddress(item.tx)}}</v-flex>
                        </v-layout>
                        <v-layout xs12>
                            <v-flex xs12 class="itemtime_account_created">{{getlocaltime(item.time)}}</v-flex>
                        </v-layout>
                    </v-flex>
                </v-flex>
                    <v-flex xs12 class="loadmorestyle">
                        <v-layout xs12>
                            <v-flex v-if="this.loading_flag" xs12>{{"loading..."}}</v-flex>
                            <v-flex v-else-if="this.loadmore_isflag" @click="loadmore" xs12>{{$t("LoadMore")}}</v-flex>
                            <v-flex v-else xs12>{{$t("NoMoreData")}}</v-flex>
                        </v-layout>
                    </v-flex>
            </div>
        
        </scroll>
    </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import {mapState, mapActions, mapGetters} from 'vuex'
import Card from '@/components/Card'
import * as accountapi from '@/api/account'
import {getAddressByAccountId} from '@/api/federation'
import Scroll from '@/components/Scroll'
import { fetchEffects } from '@/api/effects'
export default {
    data () {
        return {
            effectsData:[],
            effectsInstance: null,
            loadmore_count:0,
            loadmore_isflag:true,
            dataObj:[],
            loading_flag:true
        }
    },
    mounted(){
        this.getEffectsData()
    },
    computed: {
        ...mapState({
            account: state => state.accounts.selectedAccount,
            accountData: state => state.account.data,
            assethosts: state => state.asset.assethosts,
            selectedAccountIndex: state => state.accounts.selected,
                 }),
        ...mapGetters([
            'balances',
                ]),
    },
    methods: {
      ...mapActions([
        'getAccountInfo',
        'getTransactionsPage',
        'selectPayment',
        'cleanAccount'
      ]),
      load() {
        let address = this.account.address
        return Promise.all([this.getAccountInfo(this.account.address)])
      },
      onRefresh: function () {
        console.log('-----on refresh---------')
        return this.load()
      },
      toTranscation(item) {
        this.selectPayment(item)
        this.$router.push({name: 'Transaction'})
      },
      getEffectsData(){
          console.log('------------get')
          if(this.effectsInstance){
              this.effectsInstance.next().then(response=>{
                  console.log('----------effect instance --')
                  console.log(response)
                  this.loadmore_count= this.effectsData.length
                  this.effectsData = this.effectsData.concat(response.records)
                  this.effectsData = this.effectsData.map(item=> Object.assign({time: '',tx: ''},item))
                  this.effectsInstance = response
                  console.log(this.effectsData.length)
                  if(this.loadmore_count == this.effectsData.length){
                      this.loadmore_isflag = false
                  }
                   console.log(this.effectsData)
                   console.log("1")
                    this.effectsData.forEach((item)=>{
                    item.operation().then((response)=>{
                    console.log(item)
                    console.log(response.created_at)
                    item.time = response.created_at
                    item.tx = response.transaction_hash
                    console.log(item)
                    })
                    })
              }).catch(err=>{
                  console.error(err)
              })
          }else{
              fetchEffects(this.account.address).then(response=>{
                  this.effectsInstance = response
                this.effectsData = this.effectsData.concat(response.records)
                this.effectsData = this.effectsData.map(item=> Object.assign({time: '',tx: ''},item))
                // console.log(this.effectsData)
                console.log("2")
                  this.effectsData.forEach((item)=>{
                  item.operation().then((response)=>{
                  console.log(item)
                //   console.log(response.created_at)
                  console.log(response)
                  item.time = response.created_at
                  item.tx = response.transaction_hash
                //   console.log(item)
                //   console.log(this.dataObj)
                  let tempObj = {}
                  tempObj.id  = item.id
                  tempObj.time =response.created_at
                //   console.log(tempObj)
                console.log('------------------' + item.id)
                console.log(item)
                console.log(this.effectsData)
                  this.dataObj.push(tempObj)
                  })
                  })
                  this.loading_flag = false
              }).catch(err=>{
                  console.error(err)
              })
          }
           setTimeout(() => {
               // this.settimearray()
            console.log(this.effectsData)
        }, 5000);
      },
      loadmore(){
        this.getEffectsData()
      },
      getEffectsDataMiniAddress(address){
          return accountapi.miniAddress(address)
      },
      getlocaltime(itemtime,itemtx){
          if(itemtime.length!=0){
                var date = new Date(itemtime)
                let tempdate   = date.toLocaleDateString().replace(/\//g,"-")
                // console.log(tempdate+" "+date.toLocaleTimeString())
                return tempdate+" "+date.toLocaleTimeString()
          }else{
                return ''
          }
      }

    },
    components: {       
      Toolbar,
      Card,
      Scroll,
    }



}
</script>

<style lang="stylus" scoped>
  @require '~@/stylus/color.styl'
.templatestyle
    font-size:10px
    background:$primarycolor.gray
    border-radius:5px
    padding-left:3px
    padding-right:3px

.content_style
    background-color:$secondarycolor.gray
    border-radius:5px
    border-bottom:5px solid $primarycolor.gray

.itemtime
    color:$secondarycolor.font
    padding-left:5px
    font-size:16px
    padding-top:3px
.itemtype
    color:$primarycolor.green
    // padding-left:5px
    font-size:16px
    text-align:center
    padding-top:3px
.itemtx_signer_updated
    color:$secondarycolor.font
    text-align:left
    font-size:16px
.itemstyleo
    color:$secondarycolor.font
    font-size:16px
    padding-left:5px
    padding-bottom:3px
.itemstylet
    color:$secondarycolor.font
    font-size:16px
    text-align:center
    padding-bottom:3px
    word-break:break-all
.itemstyleth
    color:$secondarycolor.font
    font-size:16px
    text-align:center
    padding-bottom:3px


.itemtype_account_created
    font-size:16px
    color:$primarycolor.green
    padding-left:5px
.itemtime_account_created
    font-size:16px
    color:$secondarycolor.font
    padding-left:5px
.itemstyleo_account_created
    font-size:16px
    color:$secondarycolor.font
    text-align:left

.itemtime_trustline_c
    color:$secondarycolor.font
    padding-left:5px
    font-size:16px
    padding-top:3px
.itemtype_trustline_c
    color:$primarycolor.green
    padding-left:5px
    font-size:16px
    padding-top:3px
    // text-align:center
.itemstylet_trustline_c
    color:$secondarycolor.font
    padding-left:5px
    font-size:16px
    padding-top:3px
    word-break:break-all
    text-align:left
.itemstyleth_trustline_c
    color:$secondarycolor.font
    font-size:16px
    padding-top:3px
    text-align:left
.itemstylef_trustline_c
    color:$secondarycolor.font
    font-size:16px
    word-break:break-all
    text-align:left


.itemtime_trustline_r
    color:$secondarycolor.font
    padding-left:5px
    font-size:16px
    padding-top:3px
.itemtype_trustline_r
    color:$primarycolor.red
    padding-left:5px
    font-size:16px
    padding-top:3px
    // text-align:center
.itemstylet_trustline_r
    color:$secondarycolor.font
    padding-left:5px
    font-size:16px
    padding-top:3px
    word-break:break-all
    text-align:left
.itemstyleth_trustline_r
    color:$secondarycolor.font
    font-size:16px
    padding-top:3px
    text-align:left
.itemstylef_trustline_r
    font-size:16px
    color:$secondarycolor.font
    text-align:left

.itemtype_signer_created
    color:$primarycolor.green
    font-size:16px
    padding-left:5px
.itemtime_signer_created
    color:$secondarycolor.font
    font-size:16px
    padding-left:5px
.itemstyleo_signer_created
    color:$secondarycolor.font
    font-size:16px
    word-break:break-all
    text-align:left




.itemtime_account_debited
    color:$secondarycolor.font
    padding-left:5px
    font-size:16px
    padding-top:3px
.itemtype_account_debited
    color:$primarycolor.red
    padding-left:5px
    font-size:16px
    padding-top:3px
    // text-align:center
.itemstyleo_account_debited
    color:$secondarycolor.font
    font-size:16px
    padding-top:3px
    word-break:break-all
    text-align:left
    padding-left:5px
.itemstylet_account_debited
    color:$secondarycolor.font
    font-size:16px
    padding-top:3px
    word-break:break-all
    text-align:left

.itemstyleth_account_debited
    color:$secondarycolor.font
    font-size:16px
    padding-top:3px
    text-align:left
.itemstylef_account_debited
    font-size:16px
    color:$secondarycolor.font
    text-align:left




.itemtime_account_credited
    color:$secondarycolor.font
    padding-left:5px
    font-size:16px
    padding-top:3px
.itemtype_account_credited
    color:$primarycolor.green
    padding-left:5px
    font-size:16px
    padding-top:3px
    // text-align:center
.itemstyleo_account_credited
    color:$secondarycolor.font
    font-size:16px
    padding-top:3px
    word-break:break-all
    text-align:left
    padding-left:5px
.itemstylet_account_credited
    color:$secondarycolor.font
    // padding-left:5px
    font-size:16px
    padding-top:3px
    word-break:break-all
    text-align:left

.itemstyleth_account_credited
    color:$secondarycolor.font
    font-size:16px
    padding-top:3px
    text-align:left
.itemstylef_account_credited
    font-size:16px
    color:$secondarycolor.font
    // padding-left:5px
    text-align:left




.itemtime_trade
    color:$secondarycolor.font
    padding-left:5px
    font-size:16px
    padding-top:3px
    // text-align:right
.itemtype_trade
    color:$primarycolor.green
    padding-left:5px
    font-size:16px
    padding-top:3px
    text-align:left
.itemstyleo_trade
    color:$secondarycolor.font
    padding-left:5px
    font-size:16px
    padding-top:3px
    word-break:break-all
.itemstylet_trade
    color:$secondarycolor.font
    padding-left:5px
    font-size:16px
    padding-top:3px
    word-break:break-all
.itemstyleth_trade
    color:$secondarycolor.font
    padding-left:5px
    font-size:16px
    padding-top:3px
.itemstylef_trade
    color:$secondarycolor.font
    font-size:16px
    text-align:left


.red_itemtime
    color:$secondarycolor.font
    padding-left:5px
    font-size:16px
    padding-top:3px
.red_itemtype
    color:$primarycolor.red
    font-size:16px
    // padding-left:5px
    text-align:center
    padding-top:3px
.red_itemstyleo
    color:$secondarycolor.font
    font-size:16px
    padding-left:5px
    padding-bottom:3px
.red_itemstylet
    color:$secondarycolor.font
    font-size:16px
    text-align:center
    padding-bottom:3px
.red_itemstyleth
    color:$secondarycolor.font
    font-size:16px
    text-align:center
    padding-bottom:3px

.trade_styleo
    color:$primarycolor.green
    padding-left:5px
    font-size:16px
    text-align:right
    padding-bottom:3px
.trade_stylet
    color:$primarycolor.font
    font-size:16px
    text-align:center
    padding-bottom:3px
.trade_styleth
    color:$primarycolor.red
    font-size:16px
    text-align:left
    padding-bottom:3px

.itemtype_aidu
    font-size:16px
    color:$primarycolor.green
    padding-left:5px 
.itemtime_aidu
    font-size:16px
    color:$secondarycolor.font
    padding-left:5px
.itemstyleo_aidu
    font-size:16px
    color:$secondarycolor.font
    word-break:break-all
    text-align:left



.itemtype_ahdu
    font-size:16px
    color:$primarycolor.green
    padding-left:5px
.itemtime_ahdu
    font-size:16px
    color:$secondarycolor.font
    padding-left:5px
.itemstyleo_ahdu
    font-size:16px
    color:$secondarycolor.font
    word-break:break-all
    text-align:left






.loadmorestyle
    text-align:center
    font-size:16px

</style>

