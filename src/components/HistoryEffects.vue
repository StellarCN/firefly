<template>
    <div>
        <scroll :refresh="onRefresh">
            <div class="templatestyle">
                <v-flex xs12 v-for="item in effectsData" :key="item.id" >
                    <v-flex xs12 v-if="item.type=='account_credited'" >
                        <v-layout xs12>
                            <v-flex xs4 class="itemtype">{{item.type}}</v-flex>
                            <v-flex xs3 class="itemstyleo">{{getEffectsDataMiniAddress(item.account)}}</v-flex>
                            <v-flex xs3 class="itemstylet">{{item.amount}}</v-flex>
                            <v-flex xs2 class="itemstyleth">xlm</v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.type=='trade'" xs12>
                        <v-layout xs12>
                            <v-flex xs4 class="itemtype">{{item.type}}</v-flex>
                            <v-flex xs3 class="itemstyleo">{{getEffectsDataMiniAddress(item.account)}}</v-flex>
                            <v-flex xs3 class="itemstylet">{{item.bought_amount}}</v-flex>
                            <v-flex xs2 class="itemstyleth">{{item.bought_asset_code}}</v-flex>
                        </v-layout>                             
                    </v-flex>
                    <v-flex v-if="item.type=='trustline_created'" xs12>
                          <v-layout xs12>
                            <v-flex xs4 class="itemtype">{{item.type}}</v-flex>
                            <v-flex xs3 class="itemstyleo">{{getEffectsDataMiniAddress(item.account)}}</v-flex>
                            <v-flex xs3 class="itemstylet">{{getEffectsDataMiniAddress(item.asset_issuer)}}</v-flex>
                            <v-flex xs2 class="itemstyleth">{{item.asset_code}}</v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.type=='trustline_removed'" xs12>
                        <v-layout xs12>
                            <v-flex xs4 class="itemtype">{{item.type}}</v-flex>
                            <v-flex xs3 class="itemstyleo">{{getEffectsDataMiniAddress(item.account)}}</v-flex>
                            <v-flex xs3 class="itemstylet">{{getEffectsDataMiniAddress(item.asset_issuer)}}</v-flex>
                            <v-flex xs2 class="itemstyleth">{{item.asset_code}}</v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.type=='account_debited'" xs12>
                        <v-layout xs12>
                            <v-flex xs4 class="itemtype">{{item.type}}</v-flex>
                            <v-flex xs3 class="itemstyleo">{{getEffectsDataMiniAddress(item.account)}}</v-flex>
                            <v-flex xs3 class="itemstylet">{{item.amount}}</v-flex>
                            <v-flex xs2 class="itemstyleth">{{item.asset_type}}</v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.type=='signer_updated'" xs12>
                        <v-layout xs12>
                            <v-flex xs4 class="itemtype">{{item.type}}</v-flex>
                            <v-flex xs3 class="itemstyleo">{{getEffectsDataMiniAddress(item.account)}}</v-flex>
                            <v-flex xs3 class="itemstylet">{{item.weight}}</v-flex>
                            <v-flex xs2 class="itemstyleth">{{item.type_i}}</v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.type=='signer_created'" xs12>
                        <v-layout xs12>
                            <v-flex xs4 class="itemtype">{{item.type}}</v-flex>
                            <v-flex xs3 class="itemstyleo">{{getEffectsDataMiniAddress(item.account)}}</v-flex> 
                            <v-flex xs3 class="itemstylet">{{item.key}}</v-flex>
                            <v-flex xs2 class="itemstyleth">{{item.weight}}</v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.type=='account_home_domain_updated'" xs12>
                        <v-layout xs12>
                            <v-flex xs4 class="itemtype">{{getEffectsDataMiniAddress(item.type)}}</v-flex>
                            <v-flex xs3 class="itemstyleo">{{getEffectsDataMiniAddress(item.account)}}</v-flex>
                            <v-flex xs3 class="itemstylet">{{item.home_domain}}</v-flex>
                            <v-flex xs2 class="itemstyleth">{{item.home_domain}}</v-flex>
                        </v-layout>
                    </v-flex>
                </v-flex>
                    <v-flex xs12 class="loadmorestyle">
                        <v-layout xs12>
                            <v-flex @click="loadmore" xs12>{{$t("LoadMore")}}</v-flex>
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
import {listenPaymentStream, closePaymentStream, getPaymentStream, convertRecords} from '@/api/payments'
import { fetchEffects } from '@/api/effects'
export default {
    data () {
        return {
            effectsData:[],
            effectsInstance: null,
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
                  this.effectsData = this.effectsData.concat(response.records)
                  this.effectsInstance = response
              }).catch(err=>{
                  console.error(err)
              })
          }else{
              fetchEffects(this.account.address).then(response=>{
                  this.effectsInstance = response
                  this.effectsData = this.effectsData.concat(response.records)
              }).catch(err=>{
                  console.error(err)
              })
          }
      },
      loadmore(){
        this.getEffectsData()
      },
      getEffectsDataMiniAddress(address){
          return accountapi.miniAddress(address)
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
    background:$secondarycolor.gray
    border-radius:5px
    padding-left:5px
.itemtype
    color:$primarycolor.red
.itemstyleo
    color:$primarycolor.font
.itemstylet
    color:$primarycolor.green
.itemstyleth
    color:$primarycolor.green


.loadmorestyle
    text-align:center
</style>

